"use client";

import { 
  LayoutDashboard, 
  Shield, 
  Swords, 
  Pickaxe, 
  FlaskConical, 
  Flame, 
  Bell, 
  Sparkles, 
  Trophy, 
  Hammer, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  RefreshCw,
  Upload
} from "lucide-react";



interface OverviewTabProps {
  thLevel: number;
  builders: any[];
  labResearch: any;
  maxBuilders: number;
  progressStats: any;
  suggestions: any[];
  resourcesNeeded: any;
  onStartTHUpgrade: () => void;
  onStartUpgrade: (item: any, instIndex: number) => void;
  onCancelUpgrade: (type: "builder" | "lab", id: any) => void;
  onFinishUpgrade: (type: "builder" | "lab", id: any) => void;
  onMassUpgradeStructures: () => void;
  onMassUpgradeWalls: () => void;
  onOpenSync: () => void;
  onOpenJsonUpload: () => void;
  showNotify: (msg: string, type?: "success" | "info" | "error") => void;
  getImageUrl: (name: string, lvl: number) => string;
  onBoostTimers: () => void;
}

export default function OverviewTab({
  thLevel,
  builders,
  labResearch,
  maxBuilders,
  progressStats,
  suggestions,
  resourcesNeeded,
  onStartTHUpgrade,
  onStartUpgrade,
  onCancelUpgrade,
  onFinishUpgrade,
  onMassUpgradeStructures,
  onMassUpgradeWalls,
  onOpenSync,
  onOpenJsonUpload,
  showNotify,
  getImageUrl,
  onBoostTimers,
}: OverviewTabProps) {

  return (
    <div className="space-y-8">
      {/* Town Hall & Level Status Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Horizontal Town Hall Card */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-card border border-border grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch animate-fade-in shadow-lg">
          
          {/* Col 1: Current Status */}
          <fieldset className="border border-border/60 rounded-2xl p-5 relative bg-card/45 shadow-inner flex flex-col justify-between gap-6 pb-6 lg:pb-5 lg:pr-6">
            <legend className="px-3 py-0.5 text-xs font-bold text-blue-500 uppercase tracking-widest bg-background border border-border/60 rounded-full shadow-sm">
              Current Village Status
            </legend>

            <div className="flex gap-4 items-center">
              <div className="relative group w-24 h-24 rounded-2xl bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm cursor-pointer" onClick={onOpenSync}>
                <img
                  src={getImageUrl("Town Hall", thLevel)}
                  alt={`Town Hall ${thLevel}`}
                  className="w-20 h-20 object-contain drop-shadow-lg transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold uppercase tracking-wider text-center">
                  <span>Change</span>
                </div>
              </div>
              
              <div className="flex-1 space-y-1">
                <h2 className="font-bold text-2xl text-foreground leading-tight">Town Hall {thLevel}</h2>
                <div className="text-sm font-bold text-muted-foreground flex items-center gap-1.5">
                  <span>Day: 12</span>
                  <span className="text-green-500 font-bold">✔</span>
                  <span className="text-xs font-semibold bg-muted border border-border px-1.5 py-0.5 rounded cursor-help hover:bg-muted/80 text-foreground" title="Upgrades active since last backup sync">i</span>
                </div>
                <div className="text-sm font-bold text-muted-foreground flex items-center gap-1.5">
                  <span>Completion:</span>
                  <span className="text-xs font-semibold bg-muted border border-border px-1.5 py-0.5 rounded cursor-help hover:bg-muted/80 text-foreground" title="Overall structural and laboratory completion status based on levels maxed.">i</span>
                </div>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5 font-bold text-sm">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  <span>Structures</span>
                  <span className="text-foreground font-bold">{Math.round((progressStats.defenses.pct + progressStats.army.pct + progressStats.resources.pct) / 3)}%</span>
                </div>
                <div className="w-full bg-muted border border-border rounded-xl h-5 overflow-hidden relative shrink-0 shadow-sm">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${Math.round((progressStats.defenses.pct + progressStats.army.pct + progressStats.resources.pct) / 3)}%` }} />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  <span>Lab</span>
                  <span className="text-foreground font-bold">{progressStats.laboratory.pct}%</span>
                </div>
                <div className="w-full bg-muted border border-border rounded-xl h-5 overflow-hidden relative shrink-0 shadow-sm">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progressStats.laboratory.pct}%` }} />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  <span>Heroes</span>
                  <span className="text-foreground font-bold">{progressStats.heroes.pct}%</span>
                </div>
                <div className="w-full bg-muted border border-border rounded-xl h-5 overflow-hidden relative shrink-0 shadow-sm">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progressStats.heroes.pct}%` }} />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  <span>Equipment</span>
                  <span className="text-foreground font-bold">{Math.min(100, Math.round(progressStats.heroes.pct * 1.1))}%</span>
                </div>
                <div className="w-full bg-muted border border-border rounded-xl h-5 overflow-hidden relative shrink-0 shadow-sm">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.round(progressStats.heroes.pct * 1.1))}%` }} />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  <span>Pets</span>
                  <span className="text-foreground font-bold">{Math.max(0, Math.round(progressStats.heroes.pct * 0.9))}%</span>
                </div>
                <div className="w-full bg-muted border border-border rounded-xl h-5 overflow-hidden relative shrink-0 shadow-sm">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${Math.max(0, Math.round(progressStats.heroes.pct * 0.9))}%` }} />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  <span>Walls</span>
                  <span className="text-foreground font-bold">{progressStats.walls.pct}%</span>
                </div>
                <div className="w-full bg-muted border border-border rounded-xl h-5 overflow-hidden relative shrink-0 shadow-sm">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progressStats.walls.pct}%` }} />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-border/60 w-full">
              <button
                onClick={onOpenSync}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-600/10 transition-all border border-blue-500/20"
              >
                <RefreshCw className="w-4 h-4 shrink-0" /> API
              </button>
              <button
                onClick={onOpenJsonUpload}
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md shadow-green-600/10 transition-all border border-green-500/20"
              >
                <Upload className="w-4 h-4 shrink-0" /> Upload
              </button>
            </div>
          </fieldset>

          {/* Col 2: Next TH Upgrade */}
          <fieldset className="border border-border/60 rounded-2xl p-5 relative bg-card/45 shadow-inner flex flex-col justify-between gap-4 pb-6 lg:pb-5 lg:px-6">
            <legend className="px-3 py-0.5 text-xs font-bold text-amber-500 uppercase tracking-widest bg-background border border-border/60 rounded-full shadow-sm">
              Next Town Hall Upgrade
            </legend>
            
            <div className="relative border border-border/60 rounded-2xl p-4 flex flex-col justify-between h-full bg-card/45">
              <div className="flex gap-4 items-center mb-4">
                <div className="w-20 h-20 bg-card border border-border rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  <img
                    src={getImageUrl("Town Hall", thLevel < 16 ? thLevel + 1 : 16)}
                    alt={`Town Hall ${thLevel < 16 ? thLevel + 1 : 16}`}
                    className="w-18 h-18 object-contain drop-shadow"
                  />
                </div>
                
                <div className="flex-1 font-bold text-xs space-y-1">
                  <div className="text-foreground text-lg font-bold leading-tight">TH {thLevel < 16 ? thLevel + 1 : "17 (Preview)"}</div>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground">
                    <span>Cost:</span>
                    <span className="text-accent font-semibold flex items-center gap-1 text-sm bg-accent/5 px-2 py-0.5 rounded-lg border border-accent/10">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                      {thLevel < 16 ? `${thLevel}M` : "16M"}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-muted-foreground flex items-center gap-1">
                    <span>Duration:</span>
                    <span className="text-foreground font-bold bg-muted border border-border/50 px-2 py-0.5 rounded-lg">{thLevel < 16 ? `${thLevel}d` : "10d"}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={onStartTHUpgrade}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm rounded-xl uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 mt-auto border border-blue-500/20"
              >
                ↑ Start TH Upgrade
              </button>
            </div>
          </fieldset>

          {/* Col 3: Controls & Boosts */}
          <fieldset className="border border-border/60 rounded-2xl p-5 relative bg-card/45 shadow-inner flex flex-col justify-between gap-4 lg:pl-6">
            <legend className="px-3 py-0.5 text-xs font-bold text-green-500 uppercase tracking-widest bg-background border border-border/60 rounded-full shadow-sm">
              Progression & Boosts
            </legend>
            
            <div className="relative border border-border/60 rounded-2xl p-4 bg-card/45 shadow-sm space-y-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                Mass Update Controls
              </span>
              <div className="grid grid-cols-2 gap-2.5 text-xs font-bold uppercase tracking-wider">
                <button
                  onClick={onMassUpgradeStructures}
                  className="py-2.5 px-3 bg-green-600 hover:bg-green-700 active:scale-95 text-white rounded-xl text-center shadow-sm border border-green-500/25 flex items-center justify-center gap-1.5 transition-all text-xs font-bold"
                >
                  Structures
                </button>
                <button
                  onClick={onMassUpgradeWalls}
                  className="py-2.5 px-3 bg-slate-600 hover:bg-slate-700 active:scale-95 text-white rounded-xl text-center border border-slate-500/25 shadow-sm flex items-center justify-center gap-1.5 transition-all text-xs font-bold"
                >
                  Walls
                </button>
              </div>
            </div>

            <div className="relative border border-border/60 rounded-2xl p-4 bg-card/45 shadow-sm flex flex-col justify-between space-y-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                Active Village Boosts
              </span>
              
              <div className="grid grid-cols-3 gap-1.5 text-[10px] xs:text-xs font-semibold uppercase tracking-wider">
                <button
                  onClick={onBoostTimers}
                  className="py-2 px-1 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-xl flex flex-col items-center justify-center gap-0.5 text-center shadow-sm transition-all border border-blue-400/20 font-medium"
                >
                  <span>Builder</span>
                  <span className="font-semibold">Potion</span>
                </button>
                <button
                  onClick={() => showNotify("Research Potion applied! Lab speed increased by 24x for 1 hour.", "info")}
                  className="py-2 px-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl flex flex-col items-center justify-center gap-0.5 text-center shadow-sm transition-all border border-amber-400/20 font-medium"
                >
                  <span>Research</span>
                  <span className="font-semibold">Potion</span>
                </button>
                <button
                  onClick={() => showNotify("Pet Potion applied! Pets speed increased by 24x for 1 hour.", "info")}
                  className="py-2 px-1 bg-green-500 hover:bg-green-600 active:scale-95 text-white rounded-xl flex flex-col items-center justify-center gap-0.5 text-center shadow-sm transition-all border border-green-400/20 font-medium"
                >
                  <span>Pet</span>
                  <span className="font-semibold">Potion</span>
                </button>
              </div>
              
              <div className="flex items-center justify-between border-t border-border/30 pt-2 text-xs">
                <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <span>Status:</span>
                  <span className="flex items-center gap-1 text-foreground font-semibold">👷‍♂️ Active</span>
                  <span className="flex items-center gap-1 text-foreground font-semibold">🧪 0%</span>
                </div>
              </div>
            </div>
          </fieldset>

        </div>

        {/* Sub-Village Status Board */}
        <div className="lg:col-span-4 grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 p-3 bg-muted/30 border border-border/60 rounded-3xl text-xs font-semibold items-center shadow-sm animate-fade-in">
          {[
            { name: "Lab Assistant", status: "Now", action: "Assign", onAction: () => showNotify("Assigned Lab Assistant to research slot!", "success") },
            { name: "Builder's App.", status: "Locked", action: "Unlock", isLocked: true, onAction: () => showNotify("Unlocked Builder's Apprentice slot!", "success") },
            { name: "Alchemist", status: "Locked", action: "Unlock", isLocked: true, onAction: () => showNotify("Unlocked Alchemist slot!", "success") },
            { name: "Daily Star Bonus", status: "Now", action: "Reset", hasSettings: true, onAction: () => showNotify("Reset daily star bonus status.", "info") },
            { name: "Daily Capital Gold", status: "Now", action: "Reset", hasSettings: true, onAction: () => showNotify("Reset daily capital gold status.", "info") }
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-2.5 p-3 bg-card rounded-2xl border border-border/40 shadow-sm w-full min-w-0">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-muted-foreground uppercase leading-none font-medium tracking-wider truncate">{item.name}</span>
                <span className={`mt-1.5 text-xs font-semibold ${item.isLocked ? "text-red-500" : "text-foreground"}`}>
                  {item.isLocked ? "🔒 Locked" : item.status}
                </span>
              </div>
              <div className="flex gap-1 shrink-0 items-center">
                <button
                  onClick={item.onAction}
                  className={`px-3 py-1.5 text-[10px] font-semibold rounded-xl uppercase shadow-sm shrink-0 active:scale-95 transition-all ${
                    item.action === "Reset"
                      ? "bg-muted border border-border/60 text-foreground hover:bg-muted/80"
                      : "bg-blue-600 hover:bg-blue-700 text-white border border-blue-500/20"
                  }`}
                >
                  {item.action}
                </button>
                {item.hasSettings && (
                  <button
                    onClick={() => showNotify(`${item.name} custom configuration options open.`, "info")}
                    className="p-1.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 shadow-sm active:scale-95 transition-all text-[10px]"
                  >
                    🔧
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Builder Board & Laboratory Active Slots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Builders */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-card border border-border flex flex-col justify-between animate-fade-in shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -z-10" />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2 text-sm text-foreground">
                <Hammer className="w-5 h-5 text-primary shrink-0" /> Active Village Builders
              </h3>
              <span className="text-xs font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 shrink-0">
                {builders.length} / {maxBuilders} BUSY
              </span>
            </div>

            {builders.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">ALL BUILDERS IDLE</p>
                <p className="text-xs text-muted-foreground leading-normal max-w-md mx-auto">Your builders are resting. Assign defense structures, army camps, resources, or heroes to start upgrades.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 custom-scrollbar max-h-56 overflow-y-auto pr-1">
                {builders.map((b) => {
                  const pct = Math.round(((b.timeTotalSeconds - b.timeRemainingSeconds) / b.timeTotalSeconds) * 100);
                  const timeStr = `${Math.floor(b.timeRemainingSeconds / 3600)}h ${Math.floor((b.timeRemainingSeconds % 3600) / 60)}m`;
                  return (
                    <div key={b.builderId} className="p-3.5 bg-muted/40 rounded-2xl border border-border/60 text-xs space-y-2.5 group relative hover:border-primary/25 transition-all shadow-sm">
                      <div className="flex items-center justify-between font-semibold text-foreground">
                        <span className="truncate max-w-[130px]">{b.itemName} Lvl {b.endLvl} {b.instanceIndex !== undefined && `(#${b.instanceIndex + 1})`}</span>
                        <span className="font-mono text-primary font-bold">{timeStr}</span>
                      </div>
                      <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between items-center pt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onCancelUpgrade("builder", b.builderId)}
                          className="text-red-500 hover:text-red-600 font-semibold text-xs uppercase tracking-wider"
                        >
                          Cancel Upgrade
                        </button>
                        <button
                          onClick={() => onFinishUpgrade("builder", b.builderId)}
                          className="text-accent hover:text-amber-600 font-semibold text-xs uppercase tracking-wider flex items-center gap-1"
                        >
                          Finish Now
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Laboratory Active Slot */}
        <div className="p-6 rounded-3xl bg-card border border-border flex flex-col justify-between animate-fade-in shadow-sm relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2 text-sm text-foreground">
                <FlaskConical className="w-5 h-5 text-purple-500 shrink-0" /> Laboratory Research
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-500 font-bold uppercase">
                {labResearch ? "Busy" : "Idle"}
              </span>
            </div>

            {labResearch ? (
              <div className="p-4 bg-purple-500/5 rounded-2xl border border-purple-500/15 text-xs space-y-3 group hover:border-purple-500/25 transition-all">
                <div className="flex items-center justify-between font-semibold text-foreground">
                  <span className="truncate max-w-[130px] text-purple-500">{labResearch.itemName} Lvl {labResearch.endLvl}</span>
                  <span className="font-mono text-purple-500 font-bold">
                    {Math.floor(labResearch.timeRemainingSeconds / 3600)}h {Math.floor((labResearch.timeRemainingSeconds % 3600) / 60)}m
                  </span>
                </div>
                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${Math.round(((labResearch.timeTotalSeconds - labResearch.timeRemainingSeconds) / labResearch.timeTotalSeconds) * 100)}%` }} />
                </div>
                <div className="flex justify-between items-center pt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onCancelUpgrade("lab", null)}
                    className="text-red-500 hover:text-red-600 font-semibold text-xs uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => onFinishUpgrade("lab", null)}
                    className="text-purple-500 hover:text-purple-600 font-semibold text-xs uppercase tracking-wider"
                  >
                    Finish Instantly
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">LAB RESEARCH IDLE</p>
                <p className="text-xs text-muted-foreground leading-normal">Assign troop or spell research under the Laboratory tab to start.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Overview Core Tab Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        
        {/* Left Suggestions & Remaining Resources */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Strategic Suggestions */}
          <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-primary" /> AI Strategic Upgrade Suggestions</h3>
            <p className="text-xs text-muted-foreground leading-normal">
              Based on your current building levels, we recommend upgrading these items next to maximize offense power and core defense capabilities.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {suggestions.length === 0 ? (
                <div className="col-span-3 text-center py-6 text-xs text-muted-foreground font-bold">
                  🎉 Your village is fully maxed for Town Hall Level {thLevel}!
                </div>
              ) : (
                suggestions.map((s, idx) => (
                  <div key={idx} className="p-4 bg-muted/40 border border-border/60 rounded-2xl flex flex-col justify-between gap-4 hover:border-primary/20 transition-all group relative">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                        <img
                          src={getImageUrl(s.item.name, s.currentLvl)}
                          alt={s.item.name}
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-xs text-foreground truncate group-hover:text-primary transition-colors">{s.item.name}</h4>
                        <span className="text-xs text-muted-foreground font-bold">Lvl {s.currentLvl} → {s.currentLvl + 1}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-muted-foreground flex justify-between">
                        <span>Cost:</span>
                        <span className="text-accent flex items-center gap-0.5 font-bold">
                          <div className={`w-1.5 h-1.5 rounded-full ${s.item.resource === 'Dark Elixir' ? 'bg-dark-elixir' : s.item.resource.includes('Ore') ? 'bg-amber-400' : s.item.resource === 'Elixir' ? 'bg-pink-500' : 'bg-amber-500'}`} />
                          {s.cost}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-muted-foreground flex justify-between">
                        <span>Time:</span>
                        <span className="text-foreground font-bold flex items-center gap-1"><Clock className="w-3 h-3 text-muted-foreground" /> {s.time}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => onStartUpgrade(s.item, s.instanceIndex)}
                      className="w-full py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all"
                    >
                      Upgrade
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Resources Needed to Max */}
          <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider flex items-center gap-1.5"><Trophy className="w-4 h-4 text-accent" /> Total Resources Remaining to Max TH {thLevel}</h3>
            <p className="text-xs text-muted-foreground leading-normal">
              The total cost, time, and builder time required to upgrade all buildings, traps, troops, spells, and heroes to their maximum level caps.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-xs font-bold">
              <div className="p-3 bg-muted/40 border border-border/50 rounded-2xl space-y-1 flex flex-col justify-between">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">GOLD NEEDED</span>
                <span className="text-sm text-amber-500 font-bold flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  {resourcesNeeded.gold}
                </span>
              </div>

              <div className="p-3 bg-muted/40 border border-border/50 rounded-2xl space-y-1 flex flex-col justify-between">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">ELIXIR NEEDED</span>
                <span className="text-sm text-pink-500 font-bold flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                  {resourcesNeeded.elixir}
                </span>
              </div>

              <div className="p-3 bg-muted/40 border border-border/50 rounded-2xl space-y-1 flex flex-col justify-between">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">DARK ELIXIR</span>
                <span className="text-sm text-slate-800 dark:text-slate-100 font-bold flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700" />
                  {resourcesNeeded.darkElixir}
                </span>
              </div>

              <div className="p-3 bg-muted/40 border border-border/50 rounded-2xl space-y-1 flex flex-col justify-between">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">TOTAL LABOR TIME</span>
                <span className="text-sm text-foreground font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {resourcesNeeded.timeStr}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Category Completion grids */}
        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-5">
          <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Category Completion Grids</h3>
          
          <div className="space-y-4">
            {[
              { name: "Defenses & Traps", pct: progressStats.defenses.pct, color: "bg-blue-500" },
              { name: "Army & Camps", pct: progressStats.army.pct, color: "bg-pink-500" },
              { name: "Resource Buildings", pct: progressStats.resources.pct, color: "bg-amber-500" },
              { name: "Laboratory Spells & Troops", pct: progressStats.laboratory.pct, color: "bg-purple-500" },
              { name: "Heroes, Equipment & Pets", pct: progressStats.heroes.pct, color: "bg-orange-500" }
            ].map((stat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between font-bold text-xs uppercase text-muted-foreground tracking-wider leading-none">
                  <span>{stat.name}</span>
                  <span className="text-foreground">{stat.pct}%</span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border border-border/30">
                  <div className={`h-full ${stat.color}`} style={{ width: `${stat.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-muted/30 border border-border/60 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground leading-normal font-semibold">
              To begin assigning upgrades, click on any tab above (e.g. Defenses) and assign virtual builders directly to the individual building instances.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
