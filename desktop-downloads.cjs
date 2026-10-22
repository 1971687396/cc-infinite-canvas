const path = require("node:path");

function isCanvasDocumentUrl(value, appUrl) {
  try {
    const target = new URL(value);
    return target.origin === new URL(appUrl).origin && ["/", "/index.html"].includes(target.pathname);
  } catch {
    return false;
  }
}

function normalizeMediaDownloadUrl(value, appUrl) {
  const url = new URL(String(value || ""), appUrl);
  if (!String(value || "").trim()) throw new Error("文件地址为空");
  if (["http:", "https:"].includes(url.protocol) && !url.username && !url.password) {
    url.hash = "";
    return url.href;
  }
  if (url.protocol === "blob:" && url.origin === new URL(appUrl).origin) return url.href;
  if (url.protocol === "data:" && /^data:(?:image|video)\//iu.test(url.href)) return url.href;
  throw new Error("不支持的下载地址");
}

function protectCanvasNavigation(webContents, appUrl, openExternal) {
  const handler = (event, url) => {
    if (isCanvasDocumentUrl(url, appUrl)) return;
    event.preventDefault();
    if (/^https?:\/\//iu.test(url)) openExternal?.(url);
  };
  webContents.on("will-navigate", handler);
}

function createMediaDownloader({ webContents, downloadsDirectory, filenameForItem, startTimeoutMs = 120000 }) {
  const session = webContents.session;
  const pending = [];
  const active = new Set();
  let disposed = false;

  const onDownload = (_event, item, owner) => {
    if (owner !== webContents) return;
    const originalUrl = item.getURLChain?.()[0] || item.getURL();
    const index = pending.findIndex((request) => request.url === originalUrl);
    if (index < 0) return;
    const request = pending.splice(index, 1)[0];
    clearTimeout(request.timer);
    try {
      const mime = item.getMimeType();
      if (mime && !/^(?:image\/|video\/|application\/octet-stream)/iu.test(mime)) {
        throw new Error("下载地址返回的不是图片或视频，请检查链接是否已过期");
      }
      const filename = filenameForItem(request.filename, mime, item.getFilename());
      item.setSaveDialogOptions({ title: "保存图片或视频", defaultPath: path.join(downloadsDirectory, filename) });
      request.item = item;
      request.done = (_event, state) => {
        active.delete(request);
        if (state === "completed") request.resolve({ state, filename, path: item.getSavePath() });
        else if (state === "cancelled") request.resolve({ state });
        else request.reject(new Error("文件下载中断，请检查网络后重试"));
      };
      active.add(request);
      item.once("done", request.done);
    } catch (error) {
      item.cancel();
      request.reject(error);
    }
  };

  session.on("will-download", onDownload);
  webContents.once("destroyed", dispose);

  function dispose() {
    disposed = true;
    session.removeListener("will-download", onDownload);
    webContents.removeListener("destroyed", dispose);
    for (const request of [...pending, ...active]) {
      clearTimeout(request.timer);
      if (request.item) request.item.removeListener("done", request.done);
      request.resolve({ state: "cancelled" });
    }
    pending.length = 0;
    active.clear();
  }

  return {
    download(url, filename) {
      if (disposed) return Promise.reject(new Error("画布窗口已关闭"));
      return new Promise((resolve, reject) => {
        const request = { url, filename, resolve, reject };
        request.timer = setTimeout(() => {
          const index = pending.indexOf(request);
          if (index >= 0) pending.splice(index, 1);
          reject(new Error("下载连接建立超时，请检查网络后重试"));
        }, startTimeoutMs);
        pending.push(request);
        try {
          webContents.downloadURL(url);
        } catch (error) {
          const index = pending.indexOf(request);
          if (index >= 0) pending.splice(index, 1);
          clearTimeout(request.timer);
          reject(error);
        }
      });
    },
    dispose
  };
}

module.exports = { createMediaDownloader, isCanvasDocumentUrl, normalizeMediaDownloadUrl, protectCanvasNavigation };
