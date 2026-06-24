# Ico-XAI Architecture

## Core flows

1. User signs in on the web console with Google or Discord.
2. User installs the desktop runtime on Windows or macOS.
3. Desktop runtime creates a device identity and displays a pairing state.
4. Web console sends tasks to the paired desktop runtime.
5. Desktop runtime executes approved computer-control actions only.
6. Provider router selects the highest-priority active credential.
7. If a key is depleted, rate-limited, or disabled, the router marks it unavailable and retries with the next priority credential.

## Provider model

API-key providers and subscription-backed providers are separate credential kinds. ChatGPT subscription support should be implemented through an explicit desktop browser/session connector and a clear user consent screen, because it is not equivalent to a server-side API key.

## Security requirements

- Store API secrets encrypted at rest.
- Never send raw API keys to the browser after creation.
- Require per-device approval for keyboard and mouse control.
- Keep filesystem write permissions disabled until the user explicitly enables them.
- Record an audit trail for remote sessions and credential failover.
- Add a visible emergency stop button in both web and desktop apps before production use.

## Production services still needed

- OAuth provider configuration for Google and Discord
- Database-backed users, devices, sessions, credentials, and audit logs
- Secure secret storage such as OS keychain, KMS, or Vault
- Realtime transport between web and desktop runtime
- Computer-control executor implementation
- Usage metering and provider-specific error normalization
