import { AlertTriangle, ExternalLink, BookOpen } from "lucide-react";
import type { QcResponse } from "@/lib/labApi";

export const QcPanel = ({ qc, question }: { qc: QcResponse; question: string }) => {
  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="rounded-xl border border-border/60 bg-card/50 px-4 py-3">
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-1">Hypothesis</div>
        <div className="text-sm text-foreground/95">{question}</div>
      </div>

      <div className="rounded-xl border border-warning/40 bg-warning/10 p-4 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div>
          <div className="font-medium text-foreground">
            Novelty signal: <span className="text-warning">{qc.data.novelty_signal}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            We surfaced prior art so you can refine your hypothesis or build on existing methods before committing bench time.
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-foreground/90">
          <BookOpen className="h-4 w-4 text-primary" />
          Relevant literature ({qc.data.references.length})
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {qc.data.references.map((ref) => (
            <a
              key={ref.url}
              href={ref.url}
              target="_blank"
              rel="noreferrer noopener"
              className="group card-elevated rounded-xl p-4 transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_hsl(196_95%_55%/0.18)]"
            >
              <div className="text-[11px] uppercase tracking-[0.18em] text-primary mb-2">{ref.source}</div>
              <div className="text-sm font-medium text-foreground leading-snug pr-6">{ref.title}</div>
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                Open reference <ExternalLink className="h-3 w-3" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
