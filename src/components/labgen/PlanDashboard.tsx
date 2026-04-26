import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  Clock,
  DollarSign,
  CalendarRange,
  Save,
  Beaker,
  Target,
  Pencil,
  Eye,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  saveFeedback,
  type PlanResponse,
  type Material,
  type ProtocolStep,
} from "@/lib/labApi";

const fmtUsd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

interface Props {
  plan: PlanResponse;
  hypothesis: string;
  domain: string;
}

export const PlanDashboard = ({ plan, hypothesis, domain }: Props) => {
  const [reviewMode, setReviewMode] = useState(false);
  const [steps, setSteps] = useState<ProtocolStep[]>(plan.data.protocol_steps);
  const [materials, setMaterials] = useState<Material[]>(plan.data.materials_list);
  // Frontend-only quantity per material (defaults to 1). Folded into estimated_cost_usd on save.
  const [quantities, setQuantities] = useState<number[]>(
    () => plan.data.materials_list.map(() => 1)
  );
  const [summary, setSummary] = useState(plan.data.executive_summary);
  const [validation, setValidation] = useState(plan.data.validation_approach);
  const [timelineWeeks, setTimelineWeeks] = useState<number>(plan.data.timeline_weeks);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const lineTotal = (idx: number) =>
    (Number(materials[idx]?.estimated_cost_usd) || 0) * (Number(quantities[idx]) || 0);
  const totalCost = materials.reduce(
    (s, m, i) => s + (Number(m.estimated_cost_usd) || 0) * (Number(quantities[i]) || 0),
    0
  );
  const totalHours = steps.reduce((s, st) => s + (Number(st.duration_hours) || 0), 0);


  const updateStep = (idx: number, key: keyof ProtocolStep, value: string) => {
    setSteps((prev) =>
      prev.map((s, i) => {
        if (i !== idx) return s;
        if (key === "duration_hours") return { ...s, duration_hours: parseFloat(value) || 0 };
        if (key === "step_number") return { ...s, step_number: parseInt(value, 10) || s.step_number };
        return { ...s, [key]: value };
      })
    );
  };

  const removeStep = (idx: number) => {
    setSteps((prev) =>
      prev
        .filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, step_number: i + 1 }))
    );
    toast.success("Step removed");
  };

  const removeMaterial = (idx: number) => {
    setMaterials((prev) => prev.filter((_, i) => i !== idx));
    setQuantities((prev) => prev.filter((_, i) => i !== idx));
    toast.success("Material removed");
  };

  const updateQuantity = (idx: number, value: string) => {
    const n = Math.max(0, parseFloat(value) || 0);
    setQuantities((prev) => prev.map((q, i) => (i === idx ? n : q)));
  };

  const updateMaterial = (idx: number, key: keyof Material, value: string) => {
    setMaterials((prev) =>
      prev.map((m, i) => {
        if (i !== idx) return m;
        if (key === "estimated_cost_usd") return { ...m, estimated_cost_usd: parseFloat(value) || 0 };
        return { ...m, [key]: value };
      })
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await saveFeedback({
        original_hypothesis: hypothesis,
        domain,
        corrected_plan: {
          executive_summary: summary,
          protocol_steps: steps,
          materials_list: materials,
          total_budget_usd: totalCost,
          timeline_weeks: timelineWeeks,
          validation_approach: validation,
        },
        scientist_notes: notes,
      });
      if (res.status === "success") {
        toast.success("Feedback saved", { description: res.message });
      } else {
        toast.error("Save failed", { description: res.message });
      }
    } catch (err) {
      toast.error("Save failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Review-mode toggle */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/40 px-4 py-3">
        <div>
          <div className="text-sm font-medium text-foreground">
            {reviewMode ? "Expert Review Mode" : "Read-only Dashboard"}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {reviewMode
              ? "Edit any field below. Changes feed the lab memory loop on save."
              : "Toggle review mode to refine the AI-generated plan inline."}
          </div>
        </div>
        <Button
          variant={reviewMode ? "secondary" : "default"}
          size="sm"
          onClick={() => setReviewMode((v) => !v)}
          className={
            reviewMode
              ? ""
              : "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
          }
        >
          {reviewMode ? (
            <>
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              Exit Review
            </>
          ) : (
            <>
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              ✏️ Enter Expert Review Mode
            </>
          )}
        </Button>
      </div>

      {/* Summary */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card-elevated rounded-2xl p-5">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-primary mb-2">
            <Beaker className="h-3.5 w-3.5" /> Executive Summary
          </div>
          {reviewMode ? (
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="min-h-[110px] bg-background/40 border-border/70 text-sm leading-relaxed"
            />
          ) : (
            <p className="text-sm leading-relaxed text-foreground/90">{summary}</p>
          )}
        </div>
        <div className="card-elevated rounded-2xl p-5 border-l-2 border-l-accent">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-accent mb-2">
            <Target className="h-3.5 w-3.5" /> Validation Approach
          </div>
          {reviewMode ? (
            <Textarea
              value={validation}
              onChange={(e) => setValidation(e.target.value)}
              className="min-h-[110px] bg-background/40 border-border/70 text-sm leading-relaxed"
            />
          ) : (
            <p className="text-sm leading-relaxed text-foreground/90">{validation}</p>
          )}
        </div>
      </section>

      {/* Metrics */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<DollarSign className="h-4 w-4" />}
          label="Total Budget"
          value={fmtUsd(plan.data.total_budget_usd)}
          delta={`live: ${fmtUsd(totalCost)}`}
        />
        <MetricCard
          icon={<CalendarRange className="h-4 w-4" />}
          label="Timeline"
          value={`${timelineWeeks} weeks`}
          delta="end-to-end"
          editable={reviewMode}
          onEdit={(v) => setTimelineWeeks(parseFloat(v) || 0)}
          editValue={String(timelineWeeks)}
        />
        <MetricCard
          icon={<Clock className="h-4 w-4" />}
          label="Bench Hours"
          value={`${totalHours} h`}
          delta={`${steps.length} steps`}
        />
        <MetricCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Materials"
          value={`${materials.length}`}
          delta="line items"
        />
      </section>

      {/* Protocol */}
      <section>
        <SectionTitle
          title="Protocol Steps"
          subtitle={reviewMode ? "Editable — refine descriptions and durations." : "Read-only view."}
        />
        <div className="card-elevated rounded-2xl p-2">
          <Accordion type="multiple" defaultValue={["step-0"]} className="w-full">
            {steps.map((s, idx) => (
              <AccordionItem
                key={idx}
                value={`step-${idx}`}
                className="border-border/50 last:border-b-0 px-3"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="h-7 w-7 shrink-0 rounded-md bg-primary/15 text-primary text-xs font-semibold flex items-center justify-center border border-primary/30">
                      {s.step_number}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{s.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <Clock className="h-3 w-3" /> {s.duration_hours}h
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 space-y-3">
                  {reviewMode && (
                    <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Title
                        </label>
                        <Input
                          value={s.title}
                          onChange={(e) => updateStep(idx, "title", e.target.value)}
                          className="h-8 mt-1 bg-background/40 border-border/70 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Duration (h)
                        </label>
                        <Input
                          type="number"
                          value={s.duration_hours}
                          onChange={(e) => updateStep(idx, "duration_hours", e.target.value)}
                          className="h-8 mt-1 bg-background/40 border-border/70 text-sm"
                        />
                      </div>
                    </div>
                  )}
                  {reviewMode ? (
                    <Textarea
                      value={s.description}
                      onChange={(e) => updateStep(idx, "description", e.target.value)}
                      className="min-h-[110px] bg-background/40 border-border/70 text-sm leading-relaxed resize-y"
                    />
                  ) : (
                    <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                      {s.description}
                    </p>
                  )}
                  {reviewMode && (
                    <div className="flex justify-end pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStep(idx)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Remove step
                      </Button>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Materials */}
      <section>
        <SectionTitle
          title="Materials List"
          subtitle={reviewMode ? "Edit any cell — totals recalculate live." : "Read-only view."}
        />
        <div className="card-elevated rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="text-xs uppercase tracking-wider">Item</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Supplier</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Catalog #</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-right">Cost (USD)</TableHead>
                {reviewMode && <TableHead className="w-[60px]" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((m, idx) => (
                <TableRow key={idx} className="border-border/40">
                  <TableCell>
                    <ReadOrEditCell
                      editable={reviewMode}
                      value={m.item_name}
                      onChange={(v) => updateMaterial(idx, "item_name", v)}
                    />
                  </TableCell>
                  <TableCell>
                    <ReadOrEditCell
                      editable={reviewMode}
                      value={m.supplier}
                      onChange={(v) => updateMaterial(idx, "supplier", v)}
                    />
                  </TableCell>
                  <TableCell>
                    <ReadOrEditCell
                      editable={reviewMode}
                      value={m.catalog_number}
                      onChange={(v) => updateMaterial(idx, "catalog_number", v)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <ReadOrEditCell
                      editable={reviewMode}
                      value={String(m.estimated_cost_usd)}
                      onChange={(v) => updateMaterial(idx, "estimated_cost_usd", v)}
                      type="number"
                      align="right"
                    />
                  </TableCell>
                  {reviewMode && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMaterial(idx)}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        aria-label="Remove material"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              <TableRow className="border-border/60 bg-secondary/40 hover:bg-secondary/40">
                <TableCell colSpan={3} className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                  Total
                </TableCell>
                <TableCell className="text-right font-semibold text-primary">{fmtUsd(totalCost)}</TableCell>
                {reviewMode && <TableCell />}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Scientist's Notes — only in review mode */}
      {reviewMode && (
        <section className="card-elevated rounded-2xl p-5 border-l-2 border-l-primary animate-fade-in-up">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-primary mb-2">
            <Pencil className="h-3.5 w-3.5" /> Scientist's Notes
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Why did you make these changes? This guidance trains the lab memory loop.
          </p>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Local incubators require 15% concentration for optimal post-thaw viability."
            className="min-h-[110px] bg-background/40 border-border/70 text-sm leading-relaxed"
          />
        </section>
      )}

      {/* Save */}
      <div className="flex justify-end pt-2">
        <Button
          size="lg"
          disabled={saving || (reviewMode && !notes.trim())}
          onClick={handleSave}
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-[0_0_24px_hsl(var(--primary)/0.35)] font-medium"
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {reviewMode ? "Save & Update Lab Memory" : "Save to Lab Memory"}
        </Button>
      </div>
    </div>
  );
};

const SectionTitle = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mb-3 flex items-end justify-between">
    <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
    <span className="text-xs text-muted-foreground">{subtitle}</span>
  </div>
);

const MetricCard = ({
  icon,
  label,
  value,
  delta,
  editable,
  editValue,
  onEdit,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
  editable?: boolean;
  editValue?: string;
  onEdit?: (v: string) => void;
}) => (
  <div className="card-elevated rounded-2xl p-5">
    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
      <span className="text-primary">{icon}</span>
      {label}
    </div>
    {editable && onEdit ? (
      <Input
        type="number"
        value={editValue ?? ""}
        onChange={(e) => onEdit(e.target.value)}
        className="mt-2 h-9 bg-background/40 border-border/70 text-lg font-semibold"
      />
    ) : (
      <div className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</div>
    )}
    <div className="mt-1 text-[11px] text-muted-foreground">{delta}</div>
  </div>
);

const ReadOrEditCell = ({
  editable,
  value,
  onChange,
  type = "text",
  align = "left",
}: {
  editable: boolean;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "number";
  align?: "left" | "right";
}) => {
  if (!editable) {
    return (
      <div className={`px-2 py-1 text-sm ${align === "right" ? "text-right tabular-nums" : ""}`}>
        {value}
      </div>
    );
  }
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={type}
      className={`h-8 border-transparent bg-transparent hover:border-border focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 px-2 ${
        align === "right" ? "text-right tabular-nums" : ""
      }`}
    />
  );
};
