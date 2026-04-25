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
} from "lucide-react";
import type { PlanResponse, Material, ProtocolStep } from "@/lib/labApi";

const fmtUsd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

export const PlanDashboard = ({ plan }: { plan: PlanResponse }) => {
  const [steps, setSteps] = useState<ProtocolStep[]>(plan.data.protocol_steps);
  const [materials, setMaterials] = useState<Material[]>(plan.data.materials_list);

  const totalCost = materials.reduce((s, m) => s + (Number(m.estimated_cost_usd) || 0), 0);
  const totalHours = steps.reduce((s, st) => s + (Number(st.duration_hours) || 0), 0);

  const updateStep = (idx: number, description: string) => {
    setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, description } : s)));
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

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Summary */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card-elevated rounded-2xl p-5">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-primary mb-2">
            <Beaker className="h-3.5 w-3.5" /> Executive Summary
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">{plan.data.executive_summary}</p>
        </div>
        <div className="card-elevated rounded-2xl p-5 border-l-2 border-l-accent">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-accent mb-2">
            <Target className="h-3.5 w-3.5" /> Validation Approach
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">{plan.data.validation_approach}</p>
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
          value={`${plan.data.timeline_weeks} weeks`}
          delta="end-to-end"
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
        <SectionTitle title="Protocol Steps" subtitle="Editable — refine descriptions before saving." />
        <div className="card-elevated rounded-2xl p-2">
          <Accordion type="multiple" defaultValue={["step-0"]} className="w-full">
            {steps.map((s, idx) => (
              <AccordionItem
                key={s.step_number}
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
                <AccordionContent className="pb-4">
                  <Textarea
                    value={s.description}
                    onChange={(e) => updateStep(idx, e.target.value)}
                    className="min-h-[110px] bg-background/40 border-border/70 text-sm leading-relaxed resize-y"
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Materials */}
      <section>
        <SectionTitle title="Materials List" subtitle="Edit any cell — totals recalculate live." />
        <div className="card-elevated rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="text-xs uppercase tracking-wider">Item</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Supplier</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Catalog #</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-right">Cost (USD)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((m, idx) => (
                <TableRow key={idx} className="border-border/40">
                  <TableCell>
                    <EditCell value={m.item_name} onChange={(v) => updateMaterial(idx, "item_name", v)} />
                  </TableCell>
                  <TableCell>
                    <EditCell value={m.supplier} onChange={(v) => updateMaterial(idx, "supplier", v)} />
                  </TableCell>
                  <TableCell>
                    <EditCell value={m.catalog_number} onChange={(v) => updateMaterial(idx, "catalog_number", v)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <EditCell
                      value={String(m.estimated_cost_usd)}
                      onChange={(v) => updateMaterial(idx, "estimated_cost_usd", v)}
                      type="number"
                      align="right"
                    />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="border-border/60 bg-secondary/40 hover:bg-secondary/40">
                <TableCell colSpan={3} className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                  Total
                </TableCell>
                <TableCell className="text-right font-semibold text-primary">{fmtUsd(totalCost)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Save */}
      <div className="flex justify-end pt-2">
        <Button
          size="lg"
          onClick={() =>
            toast.success("Corrections saved to Lab Database", {
              description: `${steps.length} steps · ${materials.length} materials · ${fmtUsd(totalCost)} budget`,
            })
          }
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-[0_0_24px_hsl(var(--primary)/0.35)] font-medium"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Corrections to Lab Database
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
}) => (
  <div className="card-elevated rounded-2xl p-5">
    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
      <span className="text-primary">{icon}</span>
      {label}
    </div>
    <div className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</div>
    <div className="mt-1 text-[11px] text-muted-foreground">{delta}</div>
  </div>
);

const EditCell = ({
  value,
  onChange,
  type = "text",
  align = "left",
}: {
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "number";
  align?: "left" | "right";
}) => (
  <Input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    type={type}
    className={`h-8 border-transparent bg-transparent hover:border-border focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 px-2 ${
      align === "right" ? "text-right tabular-nums" : ""
    }`}
  />
);
