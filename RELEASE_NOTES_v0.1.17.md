# cc无限画布 v0.1.17

## 更新内容

- 新增 banana2 生图模型，对应云雾平台的 `gemini-3.1-flash-image-preview`。
- banana2 改用 Gemini Native `generateContent` 接口，支持原生 `inlineData` 图片结果解析。
- banana2 的比例与尺寸拆分设置，分别映射到 `imageConfig.aspectRatio` 与 `imageConfig.imageSize`。
- 设置中新增 banana2 专用 Key；未填写时继续使用平台总 Key。
- 优化 banana2 图生图参考图请求，画布参考图会作为 Gemini Native 图片输入发送。
- 修复同一批返回中相同图片被重复创建为两张画布图片的问题，新增内容 hash 去重。

## 修复

- 修复部分模型返回图片时因接口格式差异导致识别失败的问题。
- 修复生成结果去重只按 URL 或文件名判断时不够稳定的问题。
