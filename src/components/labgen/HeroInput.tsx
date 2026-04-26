import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Sparkles } from "lucide-react";

interface Props {
  onSubmit: (question: string, domain: string) => void;
}

const EXAMPLES = [
  "Can we improve solar cell efficiency by testing alternative perovskite compositions?",
  "Validate a reproducible LNP formulation pipeline for mRNA delivery.",
  "Screen kinase inhibitors against a panel of resistant cancer cell lines.",
];

// 👇 Add or edit available domains here. These are the only options the user can pick.
export const DOMAINS = [
  "Immunology",
  "Cell Biology",
  "Materials Science",
  "Oncology",
  "Neuroscience",
] as const;

export const HeroInput = ({ onSubmit }: Props) => {
  const [value, setValue] = useState("");
  const [domain, setDomain] = useState<string>("");

  return (
    <section className="container py-16 md:py-24 animate-fade-in-up">
      <div className="max-w-3xl mx-auto text-center space-y-4 mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Operationally realistic experiment design
        </div>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
          From <span className="gradient-text">Hypothesis</span> to
          <br />
          Runnable Experiment.
        </h1>
        <p className="text-muted-foreground text-base md:text-lg">
          Powered by Fulcrum Science — literature QC, full protocols, materials, budget and timeline in one pass.
        </p>
      </div>

      <div className="max-w-3xl mx-auto card-elevated rounded-2xl p-2 md:p-3">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter your scientific question (e.g., 'Can we improve solar cell efficiency by testing alternative materials?')"
          className="min-h-[160px] resize-none border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
        />
        <div className="flex flex-col gap-3 p-3 border-t border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:w-20">
              Domain
            </label>
            <Input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g., Immunology"
              className="h-9 bg-background/40 border-border/70 text-sm flex-1"
            />
            <div className="flex flex-wrap gap-1.5">
              {DOMAIN_SUGGESTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDomain(d)}
                  className="text-[11px] px-2 py-1 rounded-full border border-border/80 text-muted-foreground hover:text-foreground hover:border-primary/60 transition-colors"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setValue(ex)}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-border/80 text-muted-foreground hover:text-foreground hover:border-primary/60 transition-colors"
                >
                  {ex.length > 42 ? ex.slice(0, 42) + "…" : ex}
                </button>
              ))}
            </div>
            <Button
              size="lg"
              disabled={!value.trim()}
              onClick={() => onSubmit(value.trim(), domain.trim() || "General Science")}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-[0_0_24px_hsl(var(--primary)/0.35)] font-medium"
            >
              Run Literature QC & Generate
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
