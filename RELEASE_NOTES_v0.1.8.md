# cc infinite canvas v0.1.8

## 新增

- 新增独立“即梦视频”节点，可调用 Dreamina CLI 的 Seedance 2.0 系列视频模型。
- 即梦视频节点支持文生视频，也支持最多 9 张画布图片或本地图片作为参考图。
- 视频生成完成后会自动创建可播放、可下载、可自由缩放的视频节点。
- 支持将本地 `mp4`、`mov`、`webm`、`m4v` 视频直接拖入画布，视频会写入当前画布缓存目录。

## 优化

- 选区缩放现在同时支持图片节点和视频节点。
- 软件更新下载增加进度显示，避免下载中无反馈。
- 即梦 CLI 安装和登录按钮增加状态反馈；Windows 安装不再依赖 PowerShell、Git Bash 或 WSL。

## 验证

- 已通过 `node --check public\app.js`。
- 已通过 `node --check server.js`。
- 已通过本地 `/api/cache-assets` 视频缓存 smoke test。
- 已通过本地 `/api/generate` 即梦视频路由 smoke test，未触发真实生成。
