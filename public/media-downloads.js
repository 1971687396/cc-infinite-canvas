const mimeExtensions = {
  "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/svg+xml": "svg",
  "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm", "video/x-m4v": "m4v"
};

export function mediaDownloadFilename(suggested, contentType = "", receivedFilename = "") {
  let name = String(suggested || receivedFilename || "canvas-media").split(/[\\/]/u).at(-1)
    .replace(/[<>:"|?*\x00-\x1f]/gu, "_").replace(/^\.+|[. ]+$/gu, "").slice(0, 180) || "canvas-media";
  const extension = mimeExtensions[contentType.split(";")[0].trim().toLowerCase()];
  if (extension) name = `${name.replace(/\.[^.]+$/u, "")}.${extension}`;
  if (/^(?:con|prn|aux|nul|com\d|lpt\d)(?:\.|$)/iu.test(name)) name = `canvas-${name}`;
  return name;
}

export async function downloadCanvasMedia(media, fallbackFilename = "canvas-media") {
  if (!media?.url) throw new Error("文件地址为空");
  const filename = media.filename || fallbackFilename;
  if (globalThis.ccCanvasDesktop?.downloadMedia) {
    const result = await globalThis.ccCanvasDesktop.downloadMedia({ url: media.url, filename });
    if (result?.state === "failed") throw new Error(result.error || "下载失败");
    return result;
  }
  // A blob URL is same-origin, so the browser cannot turn a remote download into page navigation.
  const response = await fetch(media.url);
  if (!response.ok) throw new Error(`下载失败（HTTP ${response.status}）`);
  const blob = await response.blob();
  if (!blob.size) throw new Error("下载文件为空");
  if (/^(?:text\/html|application\/json)/iu.test(blob.type)) throw new Error("下载地址返回了错误页面，请重试");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = mediaDownloadFilename(filename, blob.type);
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  return { state: "started" };
}

export function createMediaDownloadButton(media, { fallbackFilename, onComplete, onError } = {}) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "下载";
  button.addEventListener("pointerdown", (event) => event.stopPropagation());
  button.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (button.disabled) return;
    button.disabled = true;
    button.textContent = "下载中…";
    try {
      const result = await downloadCanvasMedia(media, fallbackFilename);
      if (result?.state !== "cancelled") onComplete?.(result);
    } catch (error) {
      onError?.(error);
    } finally {
      button.disabled = false;
      button.textContent = "下载";
    }
  });
  return button;
}
