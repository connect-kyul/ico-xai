export type ProviderKind =
  | "openai-api"
  | "openai-chatgpt-subscription"
  | "anthropic"
  | "google"
  | "mistral"
  | "groq"
  | "openrouter"
  | "local";

export type ProviderCredential = {
  id: string;
  label: string;
  provider: ProviderKind;
  priority: number;
  status: "active" | "depleted" | "rate_limited" | "disabled";
  secretRef?: string;
  subscriptionRef?: string;
  lastFailureAt?: string;
};

export type AgentPermission =
  | "screen:view"
  | "keyboard:control"
  | "mouse:control"
  | "filesystem:read"
  | "filesystem:write"
  | "browser:control";

export type DesktopDevice = {
  id: string;
  name: string;
  platform: "windows" | "macos";
  status: "online" | "offline" | "awaiting_approval";
  permissions: AgentPermission[];
  pairedAt?: string;
};

export function selectCredential(
  credentials: ProviderCredential[],
  preferredProvider?: ProviderKind
): ProviderCredential | undefined {
  return credentials
    .filter((credential) => credential.status === "active")
    .filter((credential) => !preferredProvider || credential.provider === preferredProvider)
    .sort((a, b) => a.priority - b.priority)[0];
}

export function markCredentialFailure(
  credential: ProviderCredential,
  reason: "depleted" | "rate_limited" | "disabled",
  failedAt = new Date().toISOString()
): ProviderCredential {
  return {
    ...credential,
    status: reason,
    lastFailureAt: failedAt
  };
}

export const defaultPermissions: AgentPermission[] = [
  "screen:view",
  "keyboard:control",
  "mouse:control",
  "browser:control"
];
