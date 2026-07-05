"use client";

import { Sparkles, FileText, Bot, Zap, Shield, Globe } from "lucide-react";

/**
 * Empty state shown when there are no messages yet.
 * Highlights the planned features and gives users example prompts.
 *
 * Cultural identity (Session 6):
 * - Uses Arabic geometric pattern as subtle background
 * - Inspiring Arabic microcopy (not just "no messages")
 * - Cultural accent on the hero icon (gold gradient)
 */
interface EmptyStateProps {
  onExampleClick: (prompt: string) => void;
}

const EXAMPLES = [
  "اشرح لي مفهوم RAG ببساطة",
  "ما هي أفضل طريقة لتقليل تكلفة API؟",
  "كيف أبدأ مع Next.js 16؟",
];

const FEATURES = [
  {
    icon: Zap,
    title: "ردود فورية",
    description: "استجابة متدفقة (streaming) لتجربة استخدام سلسة",
  },
  {
    icon: Globe,
    title: "دعم العربية و RTL",
    description: "تصميم أصيل يدعم اللغة العربية والاتجاه من اليمين لليسار",
  },
  {
    icon: FileText,
    title: "محادثة متعددة المستندات",
    description: "ارفع مستنداتك واسأل عنها — يسترجع السياق المناسب",
  },
  {
    icon: Shield,
    title: "جاهز للإنتاج",
    description: "إعداد احترافي مع متغيرات البيئة ومعالجة الأخطاء",
  },
];

export function EmptyState({ onExampleClick }: EmptyStateProps) {
  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-full px-4 py-12"
      style={{
        backgroundImage: "url(/patterns/arabic-geometric.svg)",
        backgroundRepeat: "repeat",
        backgroundSize: "240px",
        // Subtle: 3% opacity in light, 5% in dark (via color-current)
        backgroundColor: "hsl(var(--gold) / 0.03)",
      }}
    >
      <div className="relative z-10 flex flex-col items-center">
        {/* Hero icon with gold gradient accent */}
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl mb-6 shadow-lg"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--nile)), hsl(var(--gold)))",
          }}
        >
          <Sparkles className="h-8 w-8 text-white" />
        </div>

        <h1 className="heading-accent text-2xl md:text-3xl font-bold text-center mb-2">
          مرحبًا بك في RAG SaaS Starter
        </h1>
        <p className="text-muted-foreground text-center max-w-md mb-8 leading-relaxed">
          نموذج أولي جاهز للإنتاج لمساعد ذكاء اصطناعي يعتمد على RAG، بلمسة
          عربية أصيلة وردود متدفقة فورية.
        </p>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full mb-8">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-3 rounded-lg border bg-card/80 backdrop-blur-sm p-4 text-start shadow-sm"
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: "hsl(var(--gold) / 0.15)",
                  color: "hsl(var(--gold-dark))",
                }}
              >
                <feature.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{feature.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {feature.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Example prompts */}
        <div className="w-full max-w-2xl">
          <div className="text-xs font-medium text-muted-foreground mb-2 text-center">
            جرّب هذه الأمثلة:
          </div>
          <div className="flex flex-col gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                onClick={() => onExampleClick(example)}
                className="text-start rounded-lg border bg-card/80 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground transition-all p-3 text-sm shadow-sm hover:shadow-md hover:border-primary/30"
              >
                <Bot className="inline-block h-3.5 w-3.5 ms-1 text-primary" />
                <span className="ms-2">{example}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
