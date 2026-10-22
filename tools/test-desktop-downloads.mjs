import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { EventEmitter, once } from "node:events";
import { readFile, rm } from "node:fs/promises";
import { mkdirSync, mkdtempSync } from "node:fs";
import { createRequire } from "node:module";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mediaDownloadFilename } from "../public/media-downloads.js";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appRoot = path.resolve(process.env.CC_CANVAS_DESKTOP_TEST_ROOT || root);
const { createMediaDownloader, isCanvasDocumentUrl, normalizeMediaDownloadUrl, protectCanvasNavigation } = require(path.join(appRoot, "desktop-downloads.cjs"));
const appUrl = "http://127.0.0.1:3000";

if (!process.versions.electron) {
  assert.equal(mediaDownloadFilename("角色", "image/png"), "角色.png");
  assert.equal(mediaDownloadFilename("C:\\old\\image.jpg", "image/webp"), "image.webp");
  assert.equal(mediaDownloadFilename("CON", "image/png"), "canvas-CON.png");
  assert.equal(normalizeMediaDownloadUrl("/project-cache/test/outputs/image.png", appUrl), `${appUrl}/project-cache/test/outputs/image.png`);
  assert.equal(isCanvasDocumentUrl(`${appUrl}/?project=test`, appUrl), true);
  assert.equal(isCanvasDocumentUrl(`${appUrl}/project-cache/test/image.png`, appUrl), false);
  assert.equal(isCanvasDocumentUrl("https://cdn.example/image.png", appUrl), false);
  for (const url of ["file:///C:/private.txt", "javascript:alert(1)", "blob:https://other.example/123"]) {
    assert.throws(() => normalizeMediaDownloadUrl(url, appUrl));
  }

  const contents = new EventEmitter();
  contents.session = new EventEmitter();
  contents.downloadURL = () => {};
  const manager = createMediaDownloader({ webContents: contents, downloadsDirectory: "C:/Downloads", filenameForItem: mediaDownloadFilename });
  const url = "https://cdn.example/shared.png";
  const first = manager.download(url, "first");
  const second = manager.download(url, "second");
  const item = () => Object.assign(new EventEmitter(), {
    getURL: () => url, getURLChain: () => [url], getMimeType: () => "image/png", getFilename: () => "upstream.png",
    getSavePath: () => "saved.png", setSaveDialogOptions(options) { this.options = options; }, cancel() {}
  });
  const one = item();
  contents.session.emit("will-download", {}, one, contents);
  const two = item();
  contents.session.emit("will-download", {}, two, contents);
  assert.match(one.options.defaultPath, /first\.png$/u);
  assert.match(two.options.defaultPath, /second\.png$/u);
  two.emit("done", {}, "cancelled");
  one.emit("done", {}, "completed");
  assert.equal((await first).state, "completed");
  assert.equal((await second).state, "cancelled");
  const abandoned = manager.download(url, "third");
  manager.dispose();
  assert.equal((await abandoned).state, "cancelled");
  assert.equal(contents.session.listenerCount("will-download"), 0);

  const env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;
  const child = spawn(require("electron"), [fileURLToPath(import.meta.url)], { cwd: root, env, windowsHide: true, stdio: "inherit" });
  const [code] = await once(child, "exit");
  process.exitCode = code ?? 1;
} else {
  // Let Electron finish evaluating its ESM entry point before waiting for app.ready.
  void runElectronTest().catch((error) => {
    console.error(error);
    require("electron").app.exit(1);
  });
}

async function runElectronTest() {
  const { app, BrowserWindow, ipcMain } = require("electron");
  mkdirSync(path.join(root, "cache"), { recursive: true });
  const fixture = mkdtempSync(path.join(root, "cache", "desktop-download-test-"));
  mkdirSync(path.join(fixture, "user-data"));
  app.setPath("userData", path.join(fixture, "user-data"));
  app.disableHardwareAcceleration();
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2n0sAAAAASUVORK5CYII=", "base64");
  let window;
  let manager;
  const savedPaths = [];
  const mediaServer = http.createServer((req, res) => {
    if (req.url === "/redirect") { res.writeHead(302, { Location: "/inline.png" }); return res.end(); }
    if (req.url === "/expired") { res.writeHead(200, { "Content-Type": "text/html" }); return res.end("expired link"); }
    // A different origin, no CORS headers, and inline disposition reproduce the old navigation bug.
    res.writeHead(200, { "Content-Type": "image/png", "Content-Disposition": "inline", "Content-Length": png.length });
    res.end(png);
  });
  const canvasServer = http.createServer(async (req, res) => {
    if (req.url === "/media-downloads.js") {
      res.writeHead(200, { "Content-Type": "text/javascript" });
      return res.end(await readFile(path.join(appRoot, "public", "media-downloads.js")));
    }
    const origin = `http://127.0.0.1:${mediaServer.address().port}`;
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`<body><script type="module">
      import {createMediaDownloadButton} from '/media-downloads.js';
      window.results={};
      for (const [id, endpoint] of [['remote','inline.png'],['redirect','redirect'],['expired','expired']]) {
        const button=createMediaDownloadButton({url:${JSON.stringify(origin)}+'/'+endpoint,filename:id}, {
          onComplete:result=>window.results[id]=result,
          onError:error=>window.results[id]={error:error.message}
        });
        button.id=id; document.body.append(button);
      }
      window.downloadTestReady=true;
    </script></body>`);
  });
  try {
    await app.whenReady();
    mediaServer.listen(0, "127.0.0.1");
    await once(mediaServer, "listening");
    canvasServer.listen(0, "127.0.0.1");
    await once(canvasServer, "listening");
    const origin = `http://127.0.0.1:${canvasServer.address().port}`;
    window = new BrowserWindow({ show: false, webPreferences: { preload: path.join(appRoot, "electron-preload.cjs"), contextIsolation: true, nodeIntegration: false, sandbox: false } });
    window.webContents.session.on("will-download", (_event, item) => {
      if (!item.getMimeType().startsWith("image/")) return;
      const filename = path.join(fixture, `download-${savedPaths.length}.png`);
      savedPaths.push(filename);
      item.setSavePath(filename); // Test-only: never open a save dialog or touch the user's Downloads folder.
    });
    manager = createMediaDownloader({ webContents: window.webContents, downloadsDirectory: fixture, filenameForItem: mediaDownloadFilename, startTimeoutMs: 10000 });
    protectCanvasNavigation(window.webContents, origin);
    ipcMain.handle("canvas:download-media", async (_event, payload) => {
      try { return await manager.download(normalizeMediaDownloadUrl(payload.url, origin), payload.filename); }
      catch (error) { return { state: "failed", error: error.message }; }
    });
    await window.loadURL(origin);
    await waitForRenderer("window.downloadTestReady");
    for (const id of ["remote", "redirect"]) {
      await window.webContents.executeJavaScript(`document.getElementById('${id}').click()`);
      const result = await waitForRenderer(`window.results['${id}']`);
      assert.equal(result.state, "completed", JSON.stringify(result));
      assert.equal(window.webContents.getURL(), `${origin}/`);
      assert.deepEqual(await readFile(result.path), png);
    }
    await window.webContents.executeJavaScript("document.getElementById('expired').click()");
    const failed = await waitForRenderer("window.results.expired");
    assert.match(failed.error, /不是图片或视频/u);
    assert.equal(window.webContents.getURL(), `${origin}/`);
    await window.webContents.executeJavaScript(`location.href='http://127.0.0.1:${mediaServer.address().port}/inline.png'`);
    await new Promise((resolve) => setTimeout(resolve, 150));
    assert.equal(window.webContents.getURL(), `${origin}/`);
    console.log("Desktop downloads passed: native save, cross-origin inline image, redirect, error response, concurrent requests, cancellation, and canvas navigation guard.");

    async function waitForRenderer(expression) {
      const deadline = Date.now() + 12000;
      while (Date.now() < deadline) {
        const value = await window.webContents.executeJavaScript(expression);
        if (value) return value;
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
      throw new Error(`Renderer test timed out: ${expression}`);
    }
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    manager?.dispose();
    window?.destroy();
    mediaServer.closeAllConnections();
    canvasServer.closeAllConnections();
    await Promise.all([new Promise((resolve) => mediaServer.close(resolve)), new Promise((resolve) => canvasServer.close(resolve))]);
    assert.ok(fixture.startsWith(path.join(root, "cache", "desktop-download-test-")));
    await rm(fixture, { recursive: true, force: true });
    app.exit(process.exitCode || 0);
  }
}
