# IELTS Writing Practice

AI 智能挖空的雅思写作背诵练习工具。

## ✨ 功能特点

- **AI 智能挖空** - 自动识别高分词汇、连接词、固定搭配进行挖空
- **实时反馈** - 输入时即时显示对错状态（绿色正确/红色错误/黄色部分匹配）
- **历史记录** - 保存完整挖空题目，下次直接练习无需重新生成
- **重新复习** - 检查答案后可用相同题目再次练习
- **保留格式** - 完整保留原文段落换行

## 🚀 使用方法

1. 配置 API（支持 OpenAI 兼容接口）
2. 粘贴雅思范文
3. 调整挖空比例（10%-80%）
4. 点击「AI 智能挖空」生成练习
5. 填写答案，实时查看反馈
6. 点击「检查答案」查看最终结果

## 🔧 API 配置

支持任何 OpenAI 兼容的 API 端点：

| 配置项 | 说明 |
|--------|------|
| API 端点 | 如 `https://api.openai.com/v1/chat/completions` |
| 模型 ID | 如 `gpt-4o-mini`、`claude-3-haiku` 等 |
| API Key | 你的 API 密钥 |

## 📱 本地运行

直接用浏览器打开 `index.html` 即可使用。

## 🎯 挖空策略

AI 会优先挖空以下内容：

1. 高分连接词（however, therefore, moreover...）
2. 学术词汇（significant, facilitate, mitigate...）
3. 固定搭配（play a crucial role, in terms of...）
4. 关键动词和形容词
5. 介词搭配

## 📝 License

MIT

