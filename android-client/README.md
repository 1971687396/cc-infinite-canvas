# cc创作助手 Android

桌面版 `cc无限画布` 的轻量移动客户端，保留自定义中转站、聊天和生图能力。

## 功能

- 分别配置聊天模型与生图模型的 Base URL、接口、模型和 Key。
- 支持 OpenAI Chat Completions 兼容对话接口。
- 支持 OpenAI Images 同步接口和 `/v1/media/generate` 异步任务接口。
- 聊天模型可调用 `generate_image` 工具，生成结束后继续回复结果。
- 对话历史保存在设备本地，API Key 通过 Android Keystore 加密保存。
- 生图完成后发送应用内反馈和 Android 本地通知。

## CLI 说明

Windows 版 Dreamina/Grok CLI 不能直接运行在 Android APK 内。移动版预留桌面桥接方向：由电脑上的 cc无限画布持有 CLI 登录状态，手机通过带令牌的局域网接口调用。当前版本不复制或读取桌面 OAuth 凭据。

## 开发

```powershell
npm install
npm test
npm run android:package
```

`android:package` 默认使用 `D:\AndroidToolchain` 下的 JDK、Android SDK 和 Gradle 缓存；也可以通过 `JAVA_HOME`、`ANDROID_HOME`、`GRADLE_USER_HOME` 覆盖。调试 APK 输出到 `outputs/cc-creative-mobile-<version>-debug.apk`。
