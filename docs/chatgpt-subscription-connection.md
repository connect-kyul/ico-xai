# ChatGPT Subscription Connection

Ico-XAI supports two OpenAI-related paths:

1. OpenAI API key
   - Used by the devnetworking.com web app to call OpenAI models directly.
   - API usage is billed and managed separately from ChatGPT subscriptions.

2. ChatGPT App via Apps SDK/MCP
   - Used when a ChatGPT Plus/Pro/Business user wants to use Ico-XAI inside ChatGPT.
   - This is the official path for connecting an external app experience to ChatGPT.
   - The app exposes MCP tools and optional UI widgets to ChatGPT.

ChatGPT subscriptions are not exposed as a third-party OAuth credential that an external web app can exchange for model API quota. Do not build a flow that asks for ChatGPT passwords, scrapes ChatGPT web sessions, or claims to consume a user's ChatGPT subscription from devnetworking.com.

Useful OpenAI references:

- Apps SDK: https://developers.openai.com/apps-sdk
- Apps SDK authentication: https://developers.openai.com/apps-sdk/build/auth
- ChatGPT and API billing separation: https://help.openai.com/en/articles/9039756-managing-billing-settings-on-chatgpt-web-and-platform
- Moving ChatGPT subscription to API: https://help.openai.com/en/articles/8156019-how-can-i-move-my-chatgpt-subscription-to-the-api

Recommended next implementation step:

- Add an `apps/chatgpt-mcp` package that exposes Ico-XAI tools over MCP.
- Reuse the existing web visualization components as Apps SDK widgets where useful.
- Keep devnetworking.com login on Google/Discord and keep model calls there API-key based.
