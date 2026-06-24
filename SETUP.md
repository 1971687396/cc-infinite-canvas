# 本地启动

桌面版直接运行 `YunwuCanvasDesktop.cmd`。它会自动使用随机空闲端口，不依赖下面的 `PORT` 配置。

以下步骤用于网页版：

1. 在项目根目录创建 `.env.local`。
2. 填入 Yunwu API 配置：

```ini
YUNWU_API_KEY=你的 Yunwu API Key
YUNWU_BASE_URL=https://yunwu.ai
YUNWU_IMAGE_ENDPOINT=/v1/images/generations
YUNWU_EDIT_ENDPOINT=/v1/images/edits
YUNWU_DEFAULT_MODEL=gpt-image-2
PORT=3000
```

3. 启动服务：

```bash
npm start
```

4. 打开 `http://localhost:3000`。通过 `YunwuCanvas.cmd` 启动时，如果配置端口已被占用，启动器会自动改用其他空闲端口。

`.env.local` 已在 `.gitignore` 里，不会被 Git 跟踪。

画布工程会自动保存到 `cache/canvases/<画布ID>/project.json`，生成图片、视频和拖入素材会保存在同一画布目录下的 `outputs/` 与 `assets/`。

如需使用即梦模型，可以先在应用“设置”里点击“安装即梦 CLI”，安装后点击“登录即梦”，最后点击“测试连接”检查状态。Windows 会由应用直接下载官方 CLI 到 `%USERPROFILE%\bin`，不需要用户安装 Git Bash 或 WSL。

其他系统或兜底场景，也可以在终端中手动执行安装命令：

```bash
curl -s https://jimeng.jianying.com/cli | bash
```

安装后运行 `dreamina login` 完成 OAuth 登录，再回到应用设置页点击“测试连接”。
