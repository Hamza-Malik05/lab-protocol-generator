import { FlaskConical } from "lucide-react";

export const Header = () => {
  return (
    <header className="border-b border-border/60 backdrop-blur-xl bg-background/40 sticky top-0 z-40">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-ring">
              <FlaskConical className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
          </div>
          <div className="leading-tight">
            <div className="font-semibold tracking-tight text-foreground">Fulcrum LabGen</div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Powered by Fulcrum Science
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-success pulse-dot" />
          Lab engine online
        </div>
      </div>
    </header>
  );
};
