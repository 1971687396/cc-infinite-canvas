# Yunwu Image Canvas

一个本地运行的无限画布生图工具：画布用于摆放、配置、并行生成、比较和整理结果。每个图片节点都有自己的提示词、尺寸、模型、接口参数和生成按钮，可以同时启动多个节点并行出图。

## Yunwu 图像接口

来自 Yunwu Apifox 文档：

- 创建图像：`POST /v1/images/generations`
- 编辑图像：`POST /v1/images/edits`
- Base URL：`https://yunwu.ai`
- 鉴权：`Authorization: Bearer <YOUR_API_KEY>`
- 默认模型：`gpt-image-2`
- 可在节点模型字段中填写 `grok-image-image` 或文档示例里的 `grok-3-image`，两者都会使用设置里的 Grok 专用 Key

创建图像请求体为 JSON，关键字段：

```json
{
  "model": "gpt-image-2",
  "prompt": "A childrens book drawing...",
  "n": 1,
  "size": "1024x1024",
  "quality": "low",
  "format": "jpeg"
}
```

编辑图像请求体为 `multipart/form-data`，关键字段：

- `image`：必填，可上传多张图片
- `prompt`：必填
- `mask`：可选 PNG 蒙版
- `model`：默认 `gpt-image-2`
- `n`：1 到 10
- `size`：节点会按当前模型显示对应尺寸，切换模型时会自动替换为该模型支持的尺寸
- `quality`：`low`、`medium`、`high`、`auto`

## 画布

- 顶部“添加生图节点”会创建统一图片节点，节点内可切换创建/编辑模式，并可选择 `gpt-image-2`、`grok-3-image` 或 `grok-image-image`
- 选择 Grok 模型时会自动使用 Grok 专用 Key、Grok 默认参数和 Grok 尺寸列表；选择 `gpt-image-2` 时使用 GPT 专用 Key 或平台总 Key，并切回 GPT 尺寸列表
- 提示词、模型、尺寸、质量、格式、接口路径、Base URL 和额外 JSON 参数都在每个节点内部编辑
- 顶部“检查更新”会读取 GitHub Releases，比较当前版本和最新版本，并优先下载 Release 附件中的 `.exe`
- 每个节点可以单独生成，顶部“生成全部”会并行启动所有可运行节点
- 生成结果会自动拆成独立图片节点，以原始像素尺寸放在画布上
- 图片节点默认以 50% 尺寸显示，选中后可以用右下角手柄自由缩放，也可以在工具条里输入缩放百分比
- 选中图片后会在图片下方显示来源提示词，并可一键复用提示词创建新的生图节点
- 本地图片可以直接拖入画布，会写入本地缓存并生成独立图片节点
- 编辑节点支持使用已选中的画布图片，或点击画布图片，快速设为图生图参考图
- 右下角小地图会显示画布内容和当前视口，点击或拖动可以快速定位
- 顶部“设置”可以修改 Yunwu 平台总 Key、模型专用 Key、Base URL、默认模型和生图/编辑接口路径，保存后写入本地 `.env.local`
- 顶部可以给当前画布命名、从下拉框切换已有画布；点击“新建画布”或按 `Ctrl+N` 会创建新的空画布，点击“保存画布”或按 `Ctrl+S` 会保存当前画布
- 框选多个节点后，底部会出现选区工具条，可统一设置选中图片节点的显示缩放比例
- 顶部“添加标注”会创建可输入文字的标注节点，用来记录想法、版本备注或排版说明
- 生成结果会保留在对应节点里，适合按主题整理多轮结果
- 结果图片支持打开和下载，节点支持复制和删除
- 画布支持平移、滚轮缩放、复位视图、清空画布；按住空格拖动画布时会临时忽略节点选择
- 选中节点后可以按 `Delete` 或 `Backspace` 删除，按 `Ctrl+Z` 撤销最近一次画布改动

## 本地缓存

- 画布会自动保存到 `缓存目录/canvases/<画布ID>/project.json`
- 每个画布的生成结果和本地拖入图片会分别保存到该画布目录下的 `outputs/` 和 `assets/`
- 文件缓存位置可以在“设置”里修改，也可以通过 `.env.local` 的 `CC_CANVAS_CACHE_DIR` 设置
- 启动服务后重新打开页面，会优先恢复上次打开的画布
- 浏览器 `localStorage` 仍作为即时备份；每个画布会使用独立的本地备份键
- `.env.local`、`cache/`、`outputs/` 都已加入 `.gitignore`

## 配置

可以在页面顶部“设置”里填写并保存，也可以手动创建 `.env.local`，按下面的键名填写：

```ini
YUNWU_API_KEY=你的 Yunwu API Key
YUNWU_BASE_URL=https://yunwu.ai
YUNWU_IMAGE_ENDPOINT=/v1/images/generations
YUNWU_EDIT_ENDPOINT=/v1/images/edits
YUNWU_DEFAULT_MODEL=gpt-image-2
YUNWU_MODEL_KEY_GPT_IMAGE_2=
YUNWU_MODEL_KEY_GROK_IMAGE_IMAGE=
CC_CANVAS_CACHE_DIR=D:\ccCanvasCache
CC_CANVAS_UPDATE_REPO=1971687396/cc-infinite-canvas
PORT=3000
```

## 版本更新

应用当前版本来自 `package.json`，默认检查 `1971687396/cc-infinite-canvas` 的 GitHub Releases。发布新版本时：

- 更新 `package.json` 的 `version`
- 创建对应 tag，例如 `v0.1.1`
- 在 GitHub Release 中上传新的 `YunwuImageCanvasSetup.exe`
- 用户点击“检查更新”后会看到最新版本并可下载安装包

模型专用 Key 优先级高于平台总 Key；如果某个模型没有填写专用 Key，就会自动回退使用 `YUNWU_API_KEY`。

其他可用 Base URL：`https://yunwu.zeabur.app`、`https://api.apiplus.org`、`https://api3.wlai.vip`、`https://api.zhongzhuan.chat`。

## 运行

桌面版直接双击 `YunwuCanvasDesktop.cmd`。桌面端会在 Electron 进程内启动服务并自动选择空闲端口，不依赖 `3000`，也不需要单独打开或保持浏览器页面。

网页版可以使用：

```bash
npm start
```

打开 `http://localhost:3000`。

也可以直接双击 `YunwuCanvas.cmd`。启动器会读取 `.env.local` 里的 `PORT`；如果该端口已被占用，会自动选择其他空闲端口并打开浏览器。

## 打包安装

```bash
npm run build:installer
```

安装程序会输出到 `dist/YunwuImageCanvasSetup.exe`。安装时可以自定义安装位置和文件缓存位置，二者都不允许选择磁盘根目录。如果目标电脑没有 Node.js 18+，安装器会联网从 Node.js 官方源下载并安装最新 LTS 版。安装完成后会创建启动快捷方式和卸载程序；卸载时可以选择是否同时删除文件缓存。打包时会排除 `.env.local`、`cache/`、`outputs/` 和 `node_modules/`，不会把本地密钥或工程缓存打进安装包。

## 返回兼容

后端会识别常见图片返回字段：

- URL：`url`、`image_url`、`imageUrl`、`uri`
- Base64：`b64_json`、`base64`、`image_base64`、`imageBase64`、`image`
- 字符串内容：会从 `choices[].message.content` 等文本中提取图片 URL 或 data URL

Base64 图片会保存到本地 `outputs/`，页面会展示并提供下载。
