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
  }
});
