import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/labgen/Header";
import { HeroInput } from "@/components/labgen/HeroInput";
import { StageSpinner } from "@/components/labgen/StageSpinner";
import { QcPanel } from "@/components/labgen/QcPanel";
import { PlanDashboard } from "@/components/labgen/PlanDashboard";
import {
  fetchLiteratureQc,
  fetchExperimentPlan,
  pingBackend,
  type QcResponse,
  type PlanResponse,
} from "@/lib/labApi";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

type View = "input" | "qc" | "plan";

const Index = () => {
  const [view, setView] = useState<View>("input");
  const [question, setQuestion] = useState("");
  const [domain, setDomain] = useState("General Science");
  const [qc, setQc] = useState<QcResponse | null>(null);
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [loadingQc, setLoadingQc] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const runIdRef = useRef(0);

  const handleSubmit = async (q: string, d: string) => {
    const runId = ++runIdRef.current;
    setQuestion(q);
    setDomain(d);
    setQc(null);
    setPlan(null);
    setView("qc");
    setLoadingQc(true);

    try {
      const qcResult = await fetchLiteratureQc(q, d);
      if (runId !== runIdRef.current) return;
      setQc(qcResult);
      setLoadingQc(false);
      setLoadingPlan(true);

      const planResult = await fetchExperimentPlan(q, d);
      if (runId !== runIdRef.current) return;
      setPlan(planResult);
      setLoadingPlan(false);
      setView("plan");
    } catch (err) {
      if (runId !== runIdRef.current) return;
      console.error("LabGen request failed:", err);
      setLoadingQc(false);
      setLoadingPlan(false);
      toast.error("Backend request failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const reset = () => {
    runIdRef.current++;
    setView("input");
    setQc(null);
    setPlan(null);
    setQuestion("");
    setLoadingQc(false);
    setLoadingPlan(false);
  };

  useEffect(() => {
    document.title = "Fulcrum LabGen — From Hypothesis to Runnable Experiment";
  }, []);

  // Pre-warm the backend Render instance ("caffeine drip")
  useEffect(() => {
    pingBackend()
      .then((data) => console.log("Backend warmed up:", data))
      .catch((err) => console.warn("Waking up backend…", err));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {view === "input" && <HeroInput onSubmit={handleSubmit} />}

        {view !== "input" && (
          <div className="container py-10 max-w-5xl space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {view === "qc" ? "Step 1 · Literature QC" : "Operational Plan"}
                </div>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1">
                  {view === "plan" ? "Experiment Dashboard" : "Checking the field…"}
                </h1>
              </div>
              <Button variant="outline" size="sm" onClick={reset} className="border-border/70">
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                New hypothesis
              </Button>
            </div>

            {/* QC stage */}
            {loadingQc && <StageSpinner label="Checking protocol repositories…" />}
            {qc && <QcPanel qc={qc} question={question} />}

            {/* Plan stage */}
            {loadingPlan && (
              <StageSpinner label="Generating full operational plan based on findings…" />
            )}
            {plan && view === "plan" && (
              <PlanDashboard plan={plan} hypothesis={question} domain={domain} />
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-border/60 mt-16">
        <div className="container py-6 text-xs text-muted-foreground flex items-center justify-between">
          <span>© Fulcrum Science · LabGen v0.1</span>
          <span>Mock data engine · async-ready</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
