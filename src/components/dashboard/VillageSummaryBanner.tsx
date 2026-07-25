"use client";

import { Hammer, FlaskConical, SwitchCamera, Zap } from "lucide-react";
import { Tooltip } from "@/components/ui";

interface VillageSummaryBannerProps {
  thLevel: number;
  currentVillage: "home" | "builder";
  setCurrentVillage: (village: "home" | "builder") => void;
  builders: any[];
  maxBuilders: number;
  labResearch: any;
  getImageUrl: (name: string, lvl: number) => string;
  onCancelUpgrade: (type: "builder" | "lab", id: any) => void;
  onFinishUpgrade: (type: "builder" | "lab", id: any) => void;
}

export default function VillageSummaryBanner({
  thLevel,
  currentVillage,
  setCurrentVillage,
  builders,
  maxBuilders,
  labResearch,
  getImageUrl,
  onCancelUpgrade,
  onFinishUpgrade,
}: VillageSummaryBannerProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-stretch justify-between bg-card/60 backdrop-blur-md border border-border/60 rounded-3xl p-4 shadow-sm animate-fade-in relative overflow-hidden z-10">
      
      {/* Glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl -z-10" />

      {/* Left: Village Status Toggle */}
      <div className="flex items-center gap-4 shrink-0 bg-muted/40 p-2.5 rounded-2xl border border-border/50">
        <div className="w-14 h-14 bg-card border border-border rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative">
          <img
            src={getImageUrl("Town Hall", thLevel)}
            alt={`Town Hall ${thLevel}`}
            className="w-12 h-12 object-contain drop-shadow"
          />
        </div>
        
        <div className="flex flex-col justify-center">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
            {currentVillage === "home" ? "Home Village" : "Builder Base"}
          </span>
          <h2 className="font-bold text-base text-foreground leading-tight flex items-center gap-1.5 mt-1">
            TH {thLevel}
            {currentVillage === "builder" && (
              <span className="text-[9px] font-bold text-blue-500 uppercase bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">
                BB
              </span>
            )}
          </h2>
          <button
            onClick={() => setCurrentVillage(currentVillage === "home" ? "builder" : "home")}
            className={`mt-1.5 px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-all active:scale-95 flex items-center gap-1.5 shadow-sm border w-fit ${
              currentVillage === "builder"
                ? "bg-blue-600 text-white border-blue-500/40 hover:bg-blue-700"
                : "bg-background text-foreground border-border hover:bg-muted"
            }`}
          >
            <SwitchCamera className="w-3 h-3" />
            Switch
          </button>
        </div>
      </div>

      {/* Right: Active Workers (Horizontal Scroll) */}
      <div className="flex-1 flex items-center gap-3 overflow-x-auto custom-scrollbar pb-1 pr-2 min-w-0">
        
        {/* Builders */}
        {builders.map((b) => {
          const pct = Math.max(0, Math.min(100, Math.round(((b.timeTotalSeconds - b.timeRemainingSeconds) / b.timeTotalSeconds) * 100)));
          const timeStr = `${Math.floor(b.timeRemainingSeconds / 3600)}h ${Math.floor((b.timeRemainingSeconds % 3600) / 60)}m`;
          
          return (
            <div key={b.builderId} className="w-48 shrink-0 p-2.5 bg-muted/40 rounded-xl border border-border/60 group relative hover:border-primary/30 transition-all flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className="text-foreground truncate max-w-[90px]" title={`${b.itemName} Lvl ${b.endLvl}`}>
                  {b.itemName} Lvl {b.endLvl}
                </span>
                <span className="font-mono text-primary font-bold">{timeStr}</span>
              </div>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden shrink-0">
                <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 bg-background/95 backdrop-blur-sm rounded-xl px-2">
                <button
                  onClick={() => onCancelUpgrade("builder", b.builderId)}
                  className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onFinishUpgrade("builder", b.builderId)}
                  className="text-[10px] font-bold text-accent hover:text-amber-500 uppercase flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" /> Finish
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty Builders padding */}
        {Array.from({ length: Math.max(0, maxBuilders - builders.length) }).map((_, idx) => (
          <div key={`empty-builder-${idx}`} className="w-48 shrink-0 p-2.5 bg-card border border-border/40 border-dashed rounded-xl flex items-center gap-2 text-muted-foreground/50">
            <Hammer className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Idle Builder</span>
          </div>
        ))}

        {/* Divider */}
        <div className="w-px h-10 bg-border shrink-0 mx-1" />

        {/* Laboratory */}
        {labResearch ? (
          <div className="w-48 shrink-0 p-2.5 bg-purple-500/5 rounded-xl border border-purple-500/20 group relative hover:border-purple-500/40 transition-all flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span className="text-purple-500 truncate max-w-[90px]" title={`${labResearch.itemName} Lvl ${labResearch.endLvl}`}>
                {labResearch.itemName} Lvl {labResearch.endLvl}
              </span>
              <span className="font-mono text-purple-500 font-bold">
                {Math.floor(labResearch.timeRemainingSeconds / 3600)}h {Math.floor((labResearch.timeRemainingSeconds % 3600) / 60)}m
              </span>
            </div>
            <div className="w-full h-1.5 bg-border rounded-full overflow-hidden shrink-0">
              <div 
                className="h-full bg-purple-500 transition-all duration-1000" 
                style={{ width: `${Math.round(((labResearch.timeTotalSeconds - labResearch.timeRemainingSeconds) / labResearch.timeTotalSeconds) * 100)}%` }} 
              />
            </div>
            <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 bg-background/95 backdrop-blur-sm rounded-xl px-2 border border-purple-500/30">
              <button
                onClick={() => onCancelUpgrade("lab", null)}
                className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase"
              >
                Cancel
              </button>
              <button
                onClick={() => onFinishUpgrade("lab", null)}
                className="text-[10px] font-bold text-purple-500 hover:text-purple-600 uppercase flex items-center gap-1"
              >
                <Zap className="w-3 h-3" /> Finish
              </button>
            </div>
          </div>
        ) : (
          <div className="w-48 shrink-0 p-2.5 bg-card border border-border/40 border-dashed rounded-xl flex items-center gap-2 text-muted-foreground/50">
            <FlaskConical className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Idle Lab</span>
          </div>
        )}

      </div>
    </div>
  );
}
