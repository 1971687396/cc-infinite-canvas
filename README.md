# Yunwu Image Canvas

一个本地运行的无限画布生图工具：画布用于摆放、配置、并行生成、比较和整理结果。每个图片节点都有自己的提示词、尺寸、模型、接口参数和生成按钮，可以同时启动多个节点并行出图。

## Yunwu 图像接口

来自 Yunwu Apifox 文档：

- 创建图像：`POST /v1/images/generations`
- 编辑图像：`POST /v1/images/edits`
- Base URL：`https://yunwu.ai`
- 鉴权：`Authorization: Bearer <YOUR_API_KEY>`
- 默认模型：`gpt-image-2`
- 可在节点模型字段中填写 `grok-imagine-image` 或文档示例里的 `grok-3-image`，两者都会使用设置里的 Grok 专用 Key

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

- 顶部“添加生图节点”会创建统一图片节点，节点内可切换创建/编辑模式，并可选择 GPT、Grok、Grsai 或 Dreamina（即梦）模型
- 选择 Grok 模型时会自动使用 Grok 专用 Key、Grok 默认参数和 Grok 尺寸列表；选择 `gpt-image-2` 时使用 GPT 专用 Key 或平台总 Key，并切回 GPT 尺寸列表
- 提示词、模型、尺寸、质量、格式、接口路径、Base URL 和额外 JSON 参数都在每个节点内部编辑
- 顶部“检查更新”会读取 GitHub Releases，比较当前版本和最新版本，并优先下载 Release 附件中的 `.exe`
- 每个节点可以单独生成，顶部“生成全部”会并行启动所有可运行节点
- 生成结果会自动拆成独立图片节点，以原始像素尺寸放在画布上
- 图片节点默认以 50% 尺寸显示，选中后可以用右下角手柄自由缩放，也可以在工具条里输入缩放百分比
- 选中图片后会在图片下方显示来源提示词，并可一键复用提示词创建新的生图节点
- 本地图片可以直接拖入画布，会写入本地缓存并生成独立图片节点
- 本地视频可以直接拖入画布，会写入本地缓存并生成可播放、可缩放的独立视频节点
- 编辑节点支持使用已选中的画布图片，或点击画布图片，快速设为图生图参考图
- 右下角小地图会显示画布内容和当前视口，点击或拖动可以快速定位
- 顶部“设置”可以修改 Yunwu 平台总 Key、模型专用 Key、Base URL、默认模型和生图/编辑接口路径，保存后写入本地 `.env.local`
- 顶部可以给当前画布命名、从下拉框切换已有画布；点击“新建画布”或按 `Ctrl+N` 会创建新的空画布，点击“保存画布”或按 `Ctrl+S` 会保存当前画布
- 框选多个节点后，底部会出现选区工具条，可统一设置选中图片节点的显示缩放比例
- 顶部“添加标注”会创建可输入文字的标注节点，用来记录想法、版本备注或排版说明
- 顶部“画布助手”支持导入画布图片和 Skill，并可在面板中切换 `gpt-5.5`、`gemini-3.5-flash`、`claude-opus-4-8`、`doubao-seed-2-1-turbo-260628`、`grok-4.3`、`deepseek-v4-pro` 等文本模型；图片会先进入待发送区，配合文字要求一起发送，回复过程中可以点击“停止”中断；项目内置的 `skills/` 会随应用加载，用户也可以自行导入本地 Skill，通过 `Skills` 按钮弹出选择页逐个启用、停用和搜索，用户上传的 Skill 可删除
- 生成结果会保留在对应节点里，适合按主题整理多轮结果
- 结果图片支持打开和下载，节点支持复制和删除
- 画布支持平移、滚轮缩放、复位视图、清空画布；按住空格拖动画布时会临时忽略节点选择
- 选中节点后可以按 `Delete` 或 `Backspace` 删除，按 `Ctrl+Z` 撤销最近一次画布改动

## Dreamina（即梦）CLI

Dreamina 模型通过本机官方 CLI 调用，不使用 API Key。可以在应用“设置”里直接点击“安装即梦 CLI”和“登录即梦”。Windows 会由应用直接下载官方 `dreamina_cli_windows_amd64.exe` 到 `%USERPROFILE%\bin`，不依赖 PowerShell、Git Bash 或 WSL。其他系统也可以手动执行安装命令：

```bash
curl -s https://jimeng.jianying.com/cli | bash
```

安装后的命令名为 `dreamina`。应用会优先读取 `DREAMINA_CLI_PATH`，Windows 下也会自动检查 `%USERPROFILE%\bin\dreamina.exe`。

- 设置页会显示 CLI 安装状态、OAuth 登录状态、版本和剩余积分，并提供安装、登录、测试连接按钮
- Windows 登录按钮使用系统自带 `cmd.exe` 打开 `dreamina login`，避免 PowerShell 执行策略或环境限制
- 文生图可选择 Dreamina 3.0 至 5.0；图生图使用 4.0 及以上版本
- 节点会按模型和模式自动切换 1K/2K/4K 与支持的画面比例
- 图生图支持最多 10 张画布或本地参考图片
- 顶部“添加即梦视频”会创建独立视频节点，可选择 Seedance 2.0 系列模型、比例、时长和清晰度
- 即梦视频节点支持最多 9 张画布或本地参考图片；未选择参考图时会使用文生视频
- 异步任务完成后，CLI 会把结果直接下载到当前画布的 `outputs/` 目录并自动创建图片节点
- `extraParams` 中可以填写非负整数 `session`，用于选择 Dreamina 会话

## 本地缓存

- 画布会自动保存到 `缓存目录/canvases/<画布ID>/project.json`
- 每个画布的生成结果和本地拖入图片、视频会分别保存到该画布目录下的 `outputs/` 和 `assets/`
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
YUNWU_CHAT_ENDPOINT=/v1/chat/completions
YUNWU_DEFAULT_MODEL=gpt-image-2
YUNWU_ASSISTANT_MODEL=gpt-5.5
YUNWU_MODEL_KEY_GPT_IMAGE_2=
YUNWU_MODEL_KEY_GROK_IMAGE_IMAGE=
YUNWU_MODEL_KEY_GPT_5_5=
YUNWU_MODEL_KEY_GEMINI_3_5_FLASH=
YUNWU_MODEL_KEY_CLAUDE_OPUS_4_8=
YUNWU_MODEL_KEY_DOUBAO_SEED_2_1_TURBO_260628=
YUNWU_MODEL_KEY_GROK_4_3=
YUNWU_MODEL_KEY_DEEPSEEK_V4_PRO=
CC_CANVAS_CACHE_DIR=D:\ccCanvasCache
CC_CANVAS_UPDATE_REPO=1971687396/cc-infinite-canvas
DREAMINA_CLI_PATH=C:\Users\你的用户名\bin\dreamina.exe
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
