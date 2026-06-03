"use client";

import { Clock, CheckCircle2, Hammer, AlertCircle, X } from "lucide-react";

interface CategoryTabProps {
  filteredItems: any[];
  levels: Record<string, number[]>;
  builders: any[];
  labResearch: any;
  thLevel: number;
  showNotify: (msg: string, type?: "success" | "info" | "error") => void;
  getMaxLevelForTH: (item: any, th: number) => number;
  getUpgradeCostAndTime: (item: any, lvl: number, maxLvl: number) => any;
  getImageUrl: (name: string, lvl: number) => string;
  getLevelsArray: (name: string, item: any, th: number) => number[];
  startUpgrade: (item: any, instIndex: number) => void;
  cancelUpgrade: (type: "builder" | "lab", id: any) => void;
  finishUpgradeNow: (type: "builder" | "lab", id: any) => void;
  onSelectItem: (item: any, instIndex: number) => void;
}

export default function CategoryTab({
  filteredItems,
  levels,
  builders,
  labResearch,
  thLevel,
  showNotify,
  getMaxLevelForTH,
  getUpgradeCostAndTime,
  getImageUrl,
  getLevelsArray,
  startUpgrade,
  cancelUpgrade,
  finishUpgradeNow,
  onSelectItem,
}: CategoryTabProps) {

  // Helper formatting functions
  const formatRemainingNum = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val.toString();
  };

  const formatRemainingTime = (sec: number) => {
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);

    if (d > 30) {
      const mo = Math.floor(d / 30);
      const remD = d % 30;
      return `${mo}mo ${remD}d`;
    }
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="space-y-6">
      {filteredItems.map((item, idx) => {
        const itemLevels = getLevelsArray(item.name, item, thLevel);
        const maxLvl = getMaxLevelForTH(item, thLevel);
        const isLocked = maxLvl <= 0;
        
        // Calculate summaries for this building type
        let upgradesRemaining = 0;
        let totalCostRaw = 0;
        let totalTimeRaw = 0;
        
        itemLevels.forEach(currLvl => {
          if (!isLocked && currLvl < maxLvl) {
            upgradesRemaining += (maxLvl - currLvl);
            for (let l = currLvl; l < maxLvl; l++) {
              const { costRaw, timeRawSeconds } = getUpgradeCostAndTime(item, l, maxLvl);
              totalCostRaw += costRaw;
              totalTimeRaw += timeRawSeconds;
            }
          }
        });

        const remainingCostStr = formatRemainingNum(totalCostRaw);
        const remainingTimeStr = formatRemainingTime(totalTimeRaw);

        return (
          <div key={idx} className="bg-card border border-border/80 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row items-stretch transition-all hover:shadow-md animate-fade-in">
            
            {/* Left Header Box */}
            <div className="w-full md:w-56 bg-muted/20 border-b md:border-b-0 md:border-r border-border/50 p-5 flex flex-col justify-between items-center text-center shrink-0">
              <div className="flex flex-col items-center gap-2.5">
                <div className="w-20 h-20 bg-card rounded-2xl border border-border/60 flex items-center justify-center overflow-hidden shadow-inner shrink-0">
                  <img 
                    src={getImageUrl(item.name, itemLevels[0] || 1)} 
                    alt={item.name} 
                    className="w-16 h-16 object-contain drop-shadow"
                  />
                </div>
                <h3 className="font-bold text-base text-foreground leading-tight mt-1">{item.name}</h3>
                <span className="text-xs font-semibold bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full uppercase tracking-wider">{item.category}</span>
              </div>

              {/* Remaining Upgrades Box */}
              {!isLocked && upgradesRemaining > 0 && (
                <div className="mt-4 p-3 bg-card border border-border/60 rounded-2xl w-full text-xs font-bold text-muted-foreground text-left space-y-1.5 shadow-sm">
                  <div className="flex justify-between items-center text-foreground font-semibold">
                    <span>Upgrades Left:</span>
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-bold">{upgradesRemaining}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Cost:</span>
                    <span className="text-accent font-bold flex items-center gap-0.5 text-xs">
                      <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      {remainingCostStr}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Time:</span>
                    <span className="text-foreground font-bold flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-muted-foreground" /> {remainingTimeStr}</span>
                  </div>
                </div>
              )}

              {!isLocked && upgradesRemaining === 0 && (
                <div className="mt-4 p-2 bg-green-500/10 border border-green-500/20 text-green-600 rounded-xl text-xs font-bold uppercase tracking-widest w-full">
                  ✔ Fully Upgraded
                </div>
              )}
            </div>

            {/* Right Column: Building Instances Rows */}
            <div className="flex-1 divide-y divide-border/60 bg-card/10">
              {itemLevels.map((currLvl, instIdx) => {
                const isMaxed = currLvl >= maxLvl && !isLocked;
                const pct = isLocked ? 0 : Math.round((currLvl / maxLvl) * 100);

                const builderMatch = builders.find(b => b.itemName === item.name && b.instanceIndex === instIdx);
                const labMatch = labResearch?.itemName === item.name && labResearch.instanceIndex === instIdx ? labResearch : null;
                const isUpgrading = !!builderMatch || !!labMatch;
                const remainingSec = builderMatch?.timeRemainingSeconds ?? labMatch?.timeRemainingSeconds ?? 0;

                // Levels breakdown details
                const remainingLevels = [];
                let instTotalCost = 0;
                let instTotalTime = 0;
                for (let l = currLvl; l < maxLvl; l++) {
                  const detail = getUpgradeCostAndTime(item, l, maxLvl);
                  instTotalCost += detail.costRaw;
                  instTotalTime += detail.timeRawSeconds;
                  remainingLevels.push({
                    lvl: l + 1,
                    cost: detail.cost,
                    time: detail.time,
                  });
                }

                const instTotalCostStr = formatRemainingNum(instTotalCost);
                const instTotalTimeStr = formatRemainingTime(instTotalTime);

                return (
                  <div 
                    key={instIdx}
                    onClick={() => {
                      if (isLocked) {
                        showNotify(`${item.name} is locked. Upgrade Town Hall ${item.minTH} to unlock.`, "error");
                      } else {
                        onSelectItem(item, instIdx);
                      }
                    }}
                    className={`p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 hover:bg-muted/15 cursor-pointer transition-colors ${
                      isLocked ? "opacity-35 cursor-not-allowed" : ""
                    }`}
                  >
                    {/* Visual & Level Indicators */}
                    <div className="flex items-center justify-between w-full md:w-56 shrink-0 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-card rounded-xl border border-border/60 flex items-center justify-center shrink-0 shadow-sm">
                          <img 
                            src={getImageUrl(item.name, currLvl)} 
                            alt={item.name} 
                            className="w-10 h-10 object-contain drop-shadow-sm"
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-foreground flex items-center gap-1.5 leading-none">
                            <span>{item.name} #{instIdx + 1}</span>
                          </div>
                          <div className="text-xs text-muted-foreground font-medium mt-1">Lvl {currLvl} / {maxLvl}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-xs font-semibold text-foreground bg-muted/65 border border-border/40 px-2 py-0.5 rounded-lg shrink-0">
                          {currLvl}/{maxLvl}
                        </div>

                        {/* Mobile Action Button */}
                        <div className="shrink-0 flex items-center justify-center w-8 h-8 md:hidden">
                          {isLocked ? (
                            <span className="text-xs font-semibold text-red-500 uppercase tracking-widest leading-none">Locked</span>
                          ) : isMaxed ? (
                            <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 shadow-sm">
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                            </div>
                          ) : isUpgrading ? (
                            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm animate-spin-slow shrink-0">
                              <Hammer className="w-3.5 h-3.5 shrink-0" />
                            </div>
                          ) : (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                startUpgrade(item, instIdx);
                              }}
                              className="w-8 h-8 bg-primary hover:opacity-90 active:scale-95 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center transition-all text-xs shrink-0"
                              title={`Upgrade to Lvl ${currLvl + 1}`}
                            >
                              ↑
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Desktop Action Column */}
                    <div className="hidden md:flex shrink-0 items-center justify-center w-12 self-center">
                      {isLocked ? (
                        <span className="text-xs font-semibold text-red-500 uppercase tracking-widest leading-none">Locked</span>
                      ) : isMaxed ? (
                        <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 shadow-sm">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                        </div>
                      ) : isUpgrading ? (
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm animate-spin-slow shrink-0">
                          <Hammer className="w-3.5 h-3.5 shrink-0" />
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            startUpgrade(item, instIdx);
                          }}
                          className="w-8 h-8 bg-primary hover:opacity-90 active:scale-95 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center transition-all text-sm shrink-0"
                          title={`Upgrade to Lvl ${currLvl + 1}`}
                        >
                          ↑
                        </button>
                      )}
                    </div>

                    {/* Cost Grid per Level */}
                    <div className="flex-1 min-w-0 w-full">
                      {isLocked ? (
                        <div className="text-xs font-medium text-red-500/70">Requires Town Hall Level {item.minTH} to unlock.</div>
                      ) : isMaxed ? (
                        <div className="text-green-600 text-xs font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                          <span>Fully upgraded for this Town Hall level</span>
                        </div>
                      ) : isUpgrading ? (
                        <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                            <span className="text-primary flex items-center gap-1.5 font-mono uppercase text-[10px] xs:text-xs font-semibold">
                              <Clock className="w-3.5 h-3.5 animate-pulse" /> 
                              Upgrading: {Math.floor(remainingSec / 3600)}h {Math.floor((remainingSec % 3600) / 60)}m left
                            </span>
                            <div className="flex gap-1.5">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cancelUpgrade(builderMatch ? "builder" : "lab", builderMatch ? builderMatch.builderId : null);
                                }}
                                className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold text-[10px] uppercase tracking-wider rounded-lg border border-red-500/20 active:scale-95 transition-all"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  finishUpgradeNow(builderMatch ? "builder" : "lab", builderMatch ? builderMatch.builderId : null);
                                }}
                                className="px-2 py-1 bg-amber-500 hover:opacity-90 text-white font-semibold text-[10px] uppercase tracking-wider rounded-lg shadow-sm active:scale-95 transition-all"
                              >
                                Finish
                              </button>
                            </div>
                          </div>
                          <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${Math.round(((builderMatch?.timeTotalSeconds ?? labMatch?.timeTotalSeconds ?? 1) - remainingSec) / (builderMatch?.timeTotalSeconds ?? labMatch?.timeTotalSeconds ?? 1) * 100)}%` }} />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1.5 justify-start items-center">
                            {remainingLevels.map((rl, index) => (
                              <div key={index} className="text-[10px] md:text-xs font-medium text-muted-foreground flex items-center gap-1 bg-card border border-border/40 px-2 py-0.5 rounded-lg shadow-sm">
                                <span className="text-foreground font-semibold">Lvl {rl.lvl}:</span>
                                <span className="text-accent font-semibold flex items-center gap-0.5 text-[10px] md:text-xs">
                                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.resource === 'Dark Elixir' ? 'bg-dark-elixir' : item.resource.includes('Ore') ? 'bg-amber-400' : item.resource === 'Elixir' ? 'bg-pink-500' : 'bg-amber-500'}`} /> 
                                  {rl.cost}
                                </span>
                                <span className="flex items-center gap-0.5 text-muted-foreground"><Clock className="w-3.5 h-3.5" /> {rl.time}</span>
                              </div>
                            ))}
                          </div>

                          <div className="inline-flex flex-wrap items-center gap-1.5 md:gap-2 px-3 py-1 rounded-2xl bg-muted border border-border/40 text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wide max-w-full">
                            <span>{remainingLevels.length} Levels</span>
                            <span>•</span>
                            <span className="text-accent flex items-center gap-0.5 font-semibold">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              {instTotalCostStr}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-foreground"><Clock className="w-3.5 h-3.5 text-muted-foreground" /> {instTotalTimeStr}</span>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        );
      })}
    </div>
  );
}
