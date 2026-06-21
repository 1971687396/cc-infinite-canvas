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

画布工程会自动保存到 `cache/project.json`，生成图片会保存在 `outputs/`。
