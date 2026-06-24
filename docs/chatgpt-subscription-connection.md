# ChatGPT Subscription Through Codex OAuth

Ico-XAI should support ChatGPT subscription-backed model access through OpenAI Codex OAuth, similar to OpenClaw.

## What this means

OpenAI Codex supports two OpenAI sign-in methods:

1. ChatGPT sign-in for subscription-backed Codex access
2. OpenAI API key sign-in for usage-based Platform billing

For ChatGPT sign-in, Codex opens a browser login flow and returns access credentials to the local Codex client. Active sessions can refresh automatically. The credentials must be treated like secrets.

OpenClaw uses this pattern by keeping the model route under the canonical `openai/*` provider, while auth profiles may point to either API-key credentials or ChatGPT/Codex OAuth credentials.

## Ico-XAI product architecture

Do not store a user's Codex OAuth refresh token in the Vercel web app.

Use this architecture instead:

1. Web app
   - Handles Google/Discord login.
   - Shows provider setup, credential priority, and connected device state.
   - Sends tasks to the paired desktop runtime.

2. Desktop runtime
   - Runs on the user's Windows/macOS computer.
   - Starts or guides `codex login` / `codex login --device-auth`.
   - Stores Codex credentials in the OS keychain or a protected local store.
   - Executes Codex-backed model calls and computer-control actions locally.

3. Credential router
   - Tries `openai-codex-oauth` first when it is priority 1.
   - Falls back to OpenAI API key or other provider keys when the subscription quota is unavailable, rate-limited, or disabled.

## Supported setup options

Browser login:

```powershell
codex login
```

Device-code login for headless or callback-hostile environments:

```powershell
codex login --device-auth
```

Business/Enterprise automation can use Codex access tokens when the workspace permits them:

```powershell
$env:CODEX_ACCESS_TOKEN="<token>"
codex exec "test prompt"
```

## Security rules

- Never ask for a ChatGPT password.
- Never scrape ChatGPT web sessions.
- Never copy `~/.codex/auth.json` into the web app.
- Never expose refresh tokens to browser JavaScript.
- Store local Codex credentials using OS keychain when possible.
- Show that subscription-backed Codex access can still have plan/weekly limits; do not advertise it as truly unlimited.

## References

- OpenAI Codex authentication: https://developers.openai.com/codex/auth
- OpenAI Codex access tokens: https://developers.openai.com/codex/enterprise/access-tokens
- OpenClaw OpenAI provider docs: https://github.com/openclaw/openclaw/blob/main/docs/providers/openai.md
- OpenClaw OAuth docs: https://github.com/openclaw/openclaw/blob/main/docs/concepts/oauth.md
