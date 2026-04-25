import { Loader2 } from "lucide-react";

export const StageSpinner = ({ label }: { label: string }) => {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/70 px-4 py-3 backdrop-blur-sm animate-fade-in-up">
      <Loader2 className="h-4 w-4 text-primary animate-spin" />
      <span className="text-sm text-foreground/90">{label}</span>
      <span className="ml-auto flex gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
        <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-dot" style={{ animationDelay: "0.2s" }} />
        <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-dot" style={{ animationDelay: "0.4s" }} />
      </span>
    </div>
  );
};
