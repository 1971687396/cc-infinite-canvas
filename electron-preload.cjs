const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ccCanvasDesktop", {
  showChatGpt(payload) {
    ipcRenderer.send("chatgpt:show", payload);
  },
  hideChatGpt() {
    ipcRenderer.send("chatgpt:hide");
  },
  reloadChatGpt() {
    ipcRenderer.send("chatgpt:reload");
  },
  openExternal(url) {
    ipcRenderer.send("open-external", url);
  },
  onOpenSettings(handler) {
    if (typeof handler !== "function") return () => {};
    const listener = (_event, payload) => handler(payload || {});
    ipcRenderer.on("canvas:open-settings", listener);
    return () => ipcRenderer.removeListener("canvas:open-settings", listener);
  }
});
