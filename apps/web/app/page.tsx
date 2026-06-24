"use client";

import { useMemo, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import JSZip from "jszip";
import {
  Archive,
  Bot,
  Check,
  ChevronDown,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileCode2,
  KeyRound,
  Loader2,
  LogOut,
  MessageSquareText,
  Send,
  Sparkles,
  Utensils
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type Purpose = "coding" | "daily";

type DailyVisualizationSchema =
  | {
      type: "nutrition";
      title: string;
      summary: string;
      warning?: string;
      contextChip?: string;
      metrics: Array<{
        label: string;
        value: number;
        unit: "%";
        tone: "danger" | "info" | "success" | "warning";
      }>;
      insight: string;
      cards: Array<{
        title: string;
        body: string;
      }>;
      meta: string;
    }
  | {
      type: "generic";
      title: string;
      summary: string;
      sections: Array<{
        title: string;
        body: string;
      }>;
      meta: string;
    };

const dailyVisualizationPrompt = `일상모드 응답 지침:
1. 먼저 사용자의 요청이 표, 막대, 비교 카드, 타임라인, 영양성분, 일정, 비용, 건강/습관 요약 등으로 시각화 가능한지 판단한다.
2. 시각화 가능하면 자연어만 쓰지 말고 JSON schema를 함께 반환한다.
3. schema.type은 nutrition, comparison, timeline, checklist, generic 중 하나를 사용한다.
4. 각 수치에는 label, value, unit, tone을 넣는다.
5. 민감하거나 확실하지 않은 정보는 warning 또는 caveat에 넣는다.`;

const codeFiles = [
  {
    name: "agent-router.ts",
    language: "TypeScript",
    added: 120,
    removed: 50,
    content: `type KeyStatus = "active" | "depleted" | "limited";

export function selectUsableKey(keys: ApiKey[]) {
  return keys
    .filter((key) => key.status === "active")
    .sort((a, b) => a.priority - b.priority)[0];
}

export async function runWithFallback(keys: ApiKey[], task: Task) {
  for (const key of keys.sort((a, b) => a.priority - b.priority)) {
    try {
      return await task.run(key);
    } catch (error) {
      await markKeyUnavailable(key, error);
    }
  }
}`
  },
  {
    name: "daily-visualization-schema.ts",
    language: "TypeScript",
    added: 86,
    removed: 8,
    content: `export type DailyVisualizationSchema =
  | NutritionVisualization
  | ComparisonVisualization
  | TimelineVisualization
  | ChecklistVisualization
  | GenericVisualization;

export function shouldRenderVisualization(schema: unknown) {
  return isValidDailyVisualizationSchema(schema);
}`
  }
];

const nutritionVisualization: DailyVisualizationSchema = {
  type: "nutrition",
  title: "오레오의 영양성분은 다음과 같아요.",
  summary: "AI가 응답 전에 시각화 가능성을 판단했고, nutrition schema를 반환했기 때문에 전용 UI로 렌더링합니다.",
  warning: "지방과 당류가 높은 편이라 섭취량을 조절하는 것이 좋아요.",
  contextChip: "새벽",
  metrics: [
    { label: "지방", value: 60, unit: "%", tone: "danger" },
    { label: "탄수화물", value: 20, unit: "%", tone: "info" },
    { label: "단백질", value: 10, unit: "%", tone: "success" }
  ],
  insight: "새벽에 오레오를 드신다면 혈당 스파이크가 올 확률이 높기 때문에 추천하지 않아요.",
  cards: [
    { title: "영양 정보", body: "지방 비율이 높아 한 번에 많은 양을 먹는 것은 피하는 편이 좋아요." },
    { title: "수면 루틴", body: "취침 직전 당류 섭취는 수면 질을 낮출 수 있어요." },
    { title: "대체 제안", body: "단백질 또는 식이섬유가 더 높은 간식과 비교해볼 수 있어요." }
  ],
  meta: "OpenAI API Key | daily schema | 18.20tok/s | 2s"
};

const toneClassNames = {
  danger: "bg-rose-500 shadow-[0_0_24px_rgba(244,63,94,0.35)]",
  info: "bg-sky-400",
  success: "bg-green-400 shadow-[0_0_24px_rgba(74,222,128,0.25)]",
  warning: "bg-orange-400"
};

function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/light.png"
        alt="Ico-XAI"
        className={compact ? "h-10 w-10 object-contain" : "h-12 w-12 object-contain"}
      />
      <div className="grid">
        <strong>Ico-XAI</strong>
        {!compact ? <span className="text-xs text-muted-foreground">AI computer agent</span> : null}
      </div>
    </div>
  );
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function DailyVisualizationRenderer({ schema }: { schema: DailyVisualizationSchema }) {
  if (schema.type === "generic") {
    return (
      <Card className="border-border bg-[#1b2128] shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl">{schema.title}</CardTitle>
          <CardDescription className="mt-3 text-base">{schema.summary}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {schema.sections.map((section) => (
            <div className="rounded-lg border border-border bg-white/5 p-4" key={section.title}>
              <strong>{section.title}</strong>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{section.body}</p>
            </div>
          ))}
          <p className="text-sm text-muted-foreground/50">{schema.meta}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-[#1b2128] shadow-2xl">
      <CardHeader>
        <CardTitle className="text-3xl">{schema.title}</CardTitle>
        <CardDescription className="mt-3 text-base">{schema.summary}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {schema.warning ? (
          <div className="flex items-center gap-3 text-xl text-orange-400">
            <span className="h-0 w-0 border-x-[15px] border-b-[26px] border-x-transparent border-b-orange-400" />
            {schema.warning}
          </div>
        ) : null}

        <div className="grid gap-5 md:grid-cols-[3fr_1.1fr_0.7fr]">
          {schema.metrics.map((metric) => (
            <div key={metric.label}>
              <div className={`h-9 rounded-full ${toneClassNames[metric.tone]}`} style={{ width: `${metric.value}%` }} />
              <span className="mt-2 block text-lg text-muted-foreground">
                {metric.label} {metric.value}
                {metric.unit}
              </span>
            </div>
          ))}
        </div>

        {schema.contextChip ? (
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-600 px-5 py-3 text-lg">
            {schema.contextChip}
            <ChevronDown className="h-4 w-4" />
          </div>
        ) : null}

        <p className="max-w-3xl text-lg leading-8 text-slate-200">{schema.insight}</p>
        <Separator />
        <div className="grid gap-3 md:grid-cols-3">
          {schema.cards.map((card) => (
            <div className="grid gap-2 rounded-lg border border-border bg-white/5 p-4" key={card.title}>
              <Utensils className="h-5 w-5 text-blue-300" />
              <strong>{card.title}</strong>
              <span className="text-sm leading-6 text-muted-foreground">{card.body}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground/50">{schema.meta}</p>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [purpose, setPurpose] = useState<Purpose>("coding");
  const [dailyTokenUnlocked, setDailyTokenUnlocked] = useState(false);
  const [codexOAuthReady, setCodexOAuthReady] = useState(false);
  const activeTokenPolicy =
    purpose === "coding" ? "토큰 한도 최대 사용" : dailyTokenUnlocked ? "일상모드 토큰 제한 해제" : "일상모드 토큰 절약";

  const prompt = useMemo(() => {
    return purpose === "coding" ? "코드 알려줘" : "오레오 영양성분";
  }, [purpose]);

  function downloadCodeFile(file: (typeof codeFiles)[number]) {
    downloadBlob(file.name, new Blob([file.content], { type: "text/plain;charset=utf-8" }));
  }

  async function downloadZip() {
    const zip = new JSZip();
    codeFiles.forEach((file) => zip.file(file.name, file.content));
    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob("ico-xai-code-blocks.zip", blob);
  }

  async function copyCodexLoginCommand(command: string) {
    await navigator.clipboard.writeText(command);
  }

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <section className="grid min-h-screen place-items-center px-4 py-20">
          <div className="fixed left-6 top-6">
            <LogoMark />
          </div>
          <Card className="w-full max-w-md border-border/80 bg-card/95 shadow-2xl">
            <CardHeader className="gap-3">
              <Badge className="w-fit" variant="secondary">Production auth</Badge>
              <CardTitle className="text-4xl">로그인</CardTitle>
              <CardDescription className="text-base leading-7">
                Google 또는 Discord OAuth로 접속하고, 로그인 후 API 키 또는 OpenAI Codex OAuth를 설정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button className="h-12" onClick={() => signIn("discord", { callbackUrl: "/" })}>
                <MessageSquareText className="h-4 w-4" />
                Discord로 계속하기
              </Button>
              <Button className="h-12" variant="secondary" onClick={() => signIn("google", { callbackUrl: "/" })}>
                <Sparkles className="h-4 w-4" />
                Google로 계속하기
              </Button>
              <Separator className="my-2" />
              <p className="text-sm leading-6 text-muted-foreground">
                배포 환경에 NEXTAUTH와 OAuth 환경변수를 넣으면 실제 로그인이 동작합니다.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    );
  }

  if (!onboardingComplete) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <section className="grid min-h-screen place-items-center px-4 py-20">
          <Card className="w-full max-w-3xl border-border/80 bg-card/95 shadow-2xl">
            <CardHeader className="gap-3">
              <div className="flex items-center justify-between gap-4">
                <Badge className="w-fit" variant="secondary">Onboarding</Badge>
                <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut className="h-4 w-4" />
                  로그아웃
                </Button>
              </div>
              <CardTitle className="text-4xl">AI 사용 환경 설정</CardTitle>
              <CardDescription className="text-base leading-7">
                {session.user?.name ?? "사용자"}님, API 제공사와 키를 등록하세요. ChatGPT 구독자는 OpenClaw처럼 Codex OAuth도 선택할 수 있어요.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="provider">API 키 제공사</Label>
                <Select defaultValue="openai-api">
                  <SelectTrigger id="provider" className="h-11">
                    <SelectValue placeholder="제공사 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai-api">OpenAI API</SelectItem>
                    <SelectItem value="openai-codex-oauth">OpenAI Codex OAuth</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="google">Google Gemini</SelectItem>
                    <SelectItem value="mistral">Mistral</SelectItem>
                    <SelectItem value="openrouter">OpenRouter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="apiKey">API 키</Label>
                <Input id="apiKey" className="h-11" type="password" placeholder="sk-... 또는 provider key" />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="name">사용자 이름</Label>
                <Input id="name" className="h-11" defaultValue={session.user?.name ?? "Ico Maker"} />
              </div>
              <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/30 p-4 md:col-span-2 md:flex-row md:items-center md:justify-between">
                <div className="grid gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong>OpenAI Codex OAuth</strong>
                    <Badge variant={codexOAuthReady ? "default" : "secondary"}>
                      {codexOAuthReady ? "연결 준비됨" : "OpenClaw 방식"}
                    </Badge>
                  </div>
                  <span className="text-sm leading-6 text-muted-foreground">
                    ChatGPT Plus/Pro 구독 권한을 Codex 런타임으로 쓰는 방식입니다. 토큰은 Vercel 서버가 아니라 사용자의 로컬/데스크톱 런타임에 저장합니다.
                  </span>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <KeyRound className="h-4 w-4" />
                      연결 방식 보기
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>OpenClaw처럼 Codex OAuth로 연결</DialogTitle>
                      <DialogDescription>
                        Codex는 ChatGPT 로그인과 API 키 로그인을 모두 지원합니다. ChatGPT로 로그인하면 Codex 사용량은
                        ChatGPT 워크스페이스 권한과 구독/플랜 한도를 따릅니다.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3">
                      <div className="rounded-lg border border-border bg-muted/30 p-4">
                        <strong>권장 구조</strong>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          devnetworking.com은 계정/기기/채팅 UI를 담당하고, Windows/macOS 데스크톱 런타임이 Codex OAuth
                          토큰을 OS 키체인 또는 로컬 보안 저장소에 보관한 뒤 모델 호출을 수행합니다.
                        </p>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/30 p-4">
                        <strong>로컬 로그인 명령</strong>
                        <div className="mt-3 grid gap-2">
                          {["codex login", "codex login --device-auth"].map((command) => (
                            <div className="flex items-center justify-between gap-3 rounded-md bg-background px-3 py-2" key={command}>
                              <code className="text-sm">{command}</code>
                              <Button variant="ghost" size="sm" onClick={() => copyCodexLoginCommand(command)}>
                                <Copy className="h-4 w-4" />
                                복사
                              </Button>
                            </div>
                          ))}
                        </div>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                          헤드리스/원격 환경에서는 device code 방식이 안정적입니다. Business/Enterprise는 Codex access token도
                          사용할 수 있습니다.
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button asChild variant="outline">
                        <a href="https://developers.openai.com/codex" target="_blank" rel="noreferrer">
                          Codex 문서
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <DialogClose asChild>
                        <Button onClick={() => setCodexOAuthReady(true)}>
                          Codex OAuth로 진행
                          <Check className="h-4 w-4" />
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <Button className="h-11 md:col-span-2" onClick={() => setOnboardingComplete(true)}>
                설정 완료
                <Check className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen grid-cols-1 bg-background text-foreground lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="hidden border-r border-border bg-background/80 p-6 lg:block">
        <LogoMark compact />
        <Button className="mt-7 w-full" variant="secondary">
          <MessageSquareText className="h-4 w-4" />새 채팅
        </Button>
        <div className="mt-5 grid gap-2">
          {["API 라우터 코드", "오레오 영양성분", "맥 앱 권한 플로우", "구독 OAuth 설계"].map((item, index) => (
            <button
              className={`rounded-md px-3 py-3 text-left text-sm transition-colors ${
                index === 0 ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
      </aside>

      <section className="grid min-w-0 grid-rows-[auto_1fr_auto]">
        <header className="sticky top-0 z-10 flex flex-col gap-3 border-b border-border bg-background/85 p-4 backdrop-blur xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Tabs value={purpose} onValueChange={(value) => setPurpose(value as Purpose)}>
              <TabsList>
                <TabsTrigger value="coding">
                  <Code2 className="h-4 w-4" />
                  코딩 목적
                </TabsTrigger>
                <TabsTrigger value="daily">
                  <Utensils className="h-4 w-4" />
                  일상 목적
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {purpose === "daily" ? (
              <div className="flex items-center gap-3 rounded-md border border-border bg-muted/30 px-3 py-2">
                <Switch checked={dailyTokenUnlocked} onCheckedChange={setDailyTokenUnlocked} id="daily-token-unlock" />
                <Label htmlFor="daily-token-unlock" className="text-sm">
                  토큰 제한 해제
                </Label>
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{activeTokenPolicy}</Badge>
            <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut className="h-4 w-4" />
              로그아웃
            </Button>
          </div>
        </header>

        <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-8">
          <div className="ml-auto w-fit max-w-[80%] rounded-full bg-muted px-8 py-5 text-2xl">{prompt}</div>
          <article className="mt-12 grid gap-6 md:grid-cols-[56px_minmax(0,1fr)]">
            <div className="grid h-12 w-12 rotate-12 place-items-center">
              <img src="/light.png" alt="Ico-XAI assistant" className="h-14 w-14 object-contain" />
            </div>

            {purpose === "coding" ? (
              <Card className="border-border bg-[#1b2128] shadow-2xl">
                <CardHeader className="gap-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <CardTitle className="text-3xl">다음은 요청하신 코드예요.</CardTitle>
                      <CardDescription className="mt-3 text-base">
                        코딩 목적은 토큰을 넉넉히 사용하고, 코드 결과물을 파일로 바로 받을 수 있게 구성합니다.
                      </CardDescription>
                    </div>
                    <Button variant="secondary" onClick={downloadZip}>
                      모든 코드 zip 내려받기
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-5">
                  {codeFiles.map((file) => (
                    <div className="overflow-hidden rounded-lg bg-slate-800" key={file.name}>
                      <div className="flex flex-col gap-3 bg-slate-600 px-5 py-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-2">
                          <strong>{file.language}</strong>
                          <span className="text-green-400">+{file.added}</span>
                          <span className="text-rose-400">-{file.removed}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => downloadCodeFile(file)}>
                          <FileCode2 className="h-4 w-4" />
                          {file.name}
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                      <pre className="overflow-x-auto p-6 text-sm leading-6 text-slate-100 md:text-base">
                        <code>{file.content}</code>
                      </pre>
                    </div>
                  ))}
                  <p className="text-sm text-muted-foreground/50">OpenAI Subscription | gpt-5.5 | 48.09tok/s | 4s</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                <Card className="border-border bg-muted/20">
                  <CardHeader>
                    <CardTitle className="text-lg">AI 시각화 프롬프트 계약</CardTitle>
                    <CardDescription className="whitespace-pre-line text-sm leading-6">
                      {dailyVisualizationPrompt}
                    </CardDescription>
                  </CardHeader>
                </Card>
                <DailyVisualizationRenderer schema={nutritionVisualization} />
              </div>
            )}
          </article>
        </div>

        <footer className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-t border-border bg-background/90 p-4">
          <Textarea className="min-h-12 resize-none" value={prompt} readOnly />
          <Button size="icon" aria-label="send">
            <Send className="h-4 w-4" />
          </Button>
        </footer>
      </section>
    </main>
  );
}
