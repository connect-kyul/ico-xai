# Ico-XAI

Ico-XAI is a starter implementation for a web-authenticated AI computer-control agent.

## What is included

- Web console with Google and Discord sign-in entry points
- Desktop runtime shell for Windows and macOS through Electron
- Provider/key routing model with priority fallback
- ChatGPT subscription option modeled separately from API keys
- Computer-control permission model and session pairing flow
- Modern product UI scaffold

## Run locally

```powershell
npm.cmd install
npm.cmd run dev
```

Desktop shell:

```powershell
npm.cmd run dev:desktop
```

## Product shape

Users connect a desktop runtime to their account, then control that machine from the web after login. AI providers are configured by the user. When multiple API keys exist, the orchestrator selects the lowest priority number first and fails over to the next usable key when the current key is depleted, rate-limited, or disabled.

OpenAI ChatGPT is modeled as a special subscription-backed option because it may require a browser/session-based flow rather than a raw API key.
