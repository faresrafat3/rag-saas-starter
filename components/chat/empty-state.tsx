"use client";

import { Sparkles, FileText, Bot, Zap, Shield, Globe } from "lucide-react";

/**
 * Empty state shown when there are no messages yet.
 * Highlights the planned features and gives users example prompts.
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
    description: "تصميم افتراضي يدعم اللغة العربية والاتجاه من اليمين لليسار",
  },
  {
    icon: FileText,
    title: "محادثة متعددة المستندات",
    description: "ارفع مستنداتك واسأل عنها — قريبًا في الجلسة 5",
  },
  {
    icon: Shield,
    title: "جاهز للإنتاج",
    description: "إعداد احترافي مع متغيرات البيئة ومعالجة الأخطاء",
  },
];

export function EmptyState({ onExampleClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-6">
        <Sparkles className="h-8 w-8" />
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
        مرحبًا بك في RAG SaaS Starter
      </h1>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        نموذج أولي جاهز للإنتاج لمساعد ذكاء اصطناعي يعتمد على RAG، مع دعم
        العربية والردود المتدفقة.
      </p>

      {/* Features grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full mb-8">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="flex items-start gap-3 rounded-lg border bg-card p-4 text-start"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
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
              className="text-start rounded-lg border bg-card hover:bg-accent hover:text-accent-foreground transition-colors p-3 text-sm"
            >
              <Bot className="inline-block h-3.5 w-3.5 ms-1 text-muted-foreground" />
              <span className="ms-2">{example}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
