"use client";

import { X, RefreshCw, Upload, Clock, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui";

// ==========================================
// 1. UpgradeModal Component
// ==========================================
interface UpgradeModalProps {
  isOpen: boolean;
  item: any;
  instanceIndex: number;
  thLevel: number;
  getLevelsArray: (name: string, item: any, th: number) => number[];
  getMaxLevelForTH: (item: any, th: number) => number;
  getUpgradeCostAndTime: (item: any, lvl: number, maxLvl: number) => any;
  getImageUrl: (name: string, lvl: number) => string;
  onClose: () => void;
  onDirectLevelChange: (lvl: number, idx: number) => void;
  onStartUpgrade: (item: any, idx: number) => void;
}

export function UpgradeModal({
  isOpen,
  item,
  instanceIndex,
  thLevel,
  getLevelsArray,
  getMaxLevelForTH,
  getUpgradeCostAndTime,
  getImageUrl,
  onClose,
  onDirectLevelChange,
  onStartUpgrade,
}: UpgradeModalProps) {
  if (!isOpen || !item) return null;

  const itemLevels = getLevelsArray(item.name, item, thLevel);
  const currentLvl = itemLevels[instanceIndex] || 0;
  const maxLvl = getMaxLevelForTH(item, thLevel);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-card rounded-3xl border border-border p-6 shadow-2xl space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex gap-4 items-center border-b border-border/50 pb-4">
          <div className="w-16 h-16 bg-muted rounded-2xl border border-border flex items-center justify-center overflow-hidden shrink-0">
            <img
              src={getImageUrl(item.name, currentLvl)}
              alt={item.name}
              className="w-14 h-14 object-contain drop-shadow-md"
            />
          </div>
          <div>
            <span className="text-xs font-bold bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full uppercase tracking-wider">
              {item.category}
            </span>
            <h3 className="font-bold text-lg text-foreground mt-1">{item.name} #{instanceIndex + 1}</h3>
          </div>
        </div>

        {/* Level Selector Slider */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm font-bold text-foreground">
            <span>Set Direct Level</span>
            <span className="px-3 py-1 bg-muted border border-border rounded-xl text-primary font-mono text-xs font-bold">
              Level {currentLvl} / {maxLvl}
            </span>
          </div>
          <input
            type="range"
            min={maxLvl === 0 ? 0 : 1}
            max={maxLvl}
            value={currentLvl}
            onChange={(e) => onDirectLevelChange(parseInt(e.target.value), instanceIndex)}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            disabled={maxLvl === 0}
          />
          <p className="text-xs text-muted-foreground font-bold leading-normal">
            Adjusting the slider will update this specific building instance level instantly without builder consumption.
          </p>
        </div>

        {/* Upgrade Details */}
        {currentLvl < maxLvl && (
          <div className="p-4 bg-muted/40 rounded-2xl border border-border/60 space-y-4">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="font-bold text-muted-foreground">Next Level Upgrade Details:</span>
              <span className="text-xs font-bold text-primary">Lvl {currentLvl} → {currentLvl + 1}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs font-bold">
              <div className="p-3 bg-card border border-border/50 rounded-xl space-y-1">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">UPGRADE COST</span>
                <span className="text-sm font-bold text-accent flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${item.resource === 'Dark Elixir' ? 'bg-dark-elixir' : item.resource.includes('Ore') ? 'bg-amber-400' : item.resource === 'Elixir' ? 'bg-pink-500' : 'bg-amber-500'}`} />
                  {getUpgradeCostAndTime(item, currentLvl, maxLvl).cost}
                </span>
              </div>
              <div className="p-3 bg-card border border-border/50 rounded-xl space-y-1">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">UPGRADE TIME</span>
                <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  {getUpgradeCostAndTime(item, currentLvl, maxLvl).time}
                </span>
              </div>
            </div>

            <button
              onClick={() => onStartUpgrade(item, instanceIndex)}
              className="w-full py-3 bg-primary hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              {item.category === "Equipment" ? "Upgrade Instantly" : "Assign Virtual Builder & Start"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 2. SyncModal Component
// ==========================================
interface SyncModalProps {
  isOpen: boolean;
  playerTag: string;
  setPlayerTag: (tag: string) => void;
  apiSyncing: boolean;
  syncStep: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function SyncModal({
  isOpen,
  playerTag,
  setPlayerTag,
  apiSyncing,
  syncStep,
  onClose,
  onSubmit,
}: SyncModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-card rounded-3xl border border-border p-6 shadow-2xl relative space-y-5">
        <button
          onClick={() => !apiSyncing && onClose()}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          disabled={apiSyncing}
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary animate-spin-slow" /> Sync Village with Supercell API
          </h3>
          <p className="text-xs text-muted-foreground leading-normal mt-1.5 font-semibold">
            Connecting directly to Supercell servers fetches your exact hero, pet, spell, and troop levels.
          </p>
          <div className="mt-3.5 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2.5 text-[10px] text-amber-600 dark:text-amber-400 font-bold leading-normal">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              Note: The official Supercell API does not provide building levels. Connecting a tag will seed default defenses. 
              For the most accurate representation of your actual building levels, please use the **Import JSON Backup** option instead.
            </span>
          </div>
        </div>

        {apiSyncing ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-foreground font-semibold animate-pulse">{syncStep}</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Enter Player Tag"
              value={playerTag}
              onChange={(e) => setPlayerTag(e.target.value.toUpperCase())}
              placeholder="e.g. #88RVP0C0G"
              required
            />
            <button
              type="submit"
              className="w-full py-3 bg-primary hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" /> Start Synchronization
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 3. JsonModal Component
// ==========================================
interface JsonModalProps {
  isOpen: boolean;
  fileInputRef: any;
  onClose: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function JsonModal({
  isOpen,
  fileInputRef,
  onClose,
  onUpload,
}: JsonModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-card rounded-3xl border border-border p-6 shadow-2xl relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" /> Upload JSON Village Backup
          </h3>
          <p className="text-xs text-muted-foreground leading-normal mt-1.5 font-semibold">
            Select your previously exported VoltClash `.json` backup file or standard game client dump file to compare and restore your levels.
          </p>
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-2xl p-8 text-center cursor-pointer space-y-3 bg-muted/20"
        >
          <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
          <div className="text-xs font-bold text-foreground">Drag and drop file here, or click to browse</div>
          <p className="text-xs text-muted-foreground font-bold">Supports standard backup and game client formats</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={onUpload}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. PreviewModal Component
// ==========================================
interface PreviewModalProps {
  isOpen: boolean;
  comparisonList: any[];
  onClose: () => void;
  onConfirm: () => void;
  getImageUrl: (name: string, lvl: number) => string;
}

export function PreviewModal({
  isOpen,
  comparisonList,
  onClose,
  onConfirm,
  getImageUrl,
}: PreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-card rounded-3xl border border-border p-6 shadow-2xl relative space-y-6 flex flex-col max-h-[85vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
            <Upload className="w-5 h-5 text-green-500" /> Confirm Village Import Preview
          </h3>
          <p className="text-xs text-muted-foreground leading-normal mt-1.5 font-semibold">
            Please review the level upgrades that will be written to the database. Items below will replace your current tracking profile levels.
          </p>
        </div>

        {/* Comparison list scroll area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar min-h-[200px] max-h-[50vh]">
          {comparisonList.length === 0 ? (
            <div className="text-center py-12 space-y-2 border border-dashed border-border rounded-2xl bg-muted/10">
              <span className="text-xl">✅</span>
              <h4 className="text-xs font-bold text-foreground">No Level Changes Detected</h4>
              <p className="text-[10px] text-muted-foreground font-semibold leading-normal max-w-xs mx-auto">
                All building and troop levels in this backup exactly match your active local dashboard tracking profiles!
              </p>
            </div>
          ) : (
            comparisonList.map((item, index) => {
              const levelIncreased = item.afterLevel > item.beforeLevel;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-muted/25 hover:bg-muted/40 transition-colors gap-4"
                >
                  {/* Left: Structure Image & Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-card rounded-xl border border-border/80 flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src={getImageUrl(item.name, item.afterLevel)}
                        alt={item.name}
                        className="w-8 h-8 object-contain drop-shadow"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-foreground truncate">{item.name}</div>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mt-0.5 leading-none">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Center: Level Changes badging */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-card border border-border rounded-lg font-mono text-[10px] font-bold text-muted-foreground">
                        Lvl {item.beforeLevel}
                      </span>
                      <span className="text-xs font-bold text-muted-foreground leading-none">➔</span>
                      <span className={`px-2 py-0.5 border rounded-lg font-mono text-[10px] font-bold ${levelIncreased ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-muted border-border text-foreground'}`}>
                        Lvl {item.afterLevel}
                      </span>
                    </div>
                    
                    {/* Count changes badging if arrays differ in size */}
                    {item.beforeCount !== item.afterCount && (
                      <span className="px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-lg text-[9px] font-bold font-mono">
                        {item.beforeCount} → {item.afterCount} qty
                      </span>
                    )}
                  </div>

                  {/* Right: upgrade upward status pill */}
                  <div className="shrink-0 text-right">
                    {levelIncreased ? (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-500 rounded-full text-[9px] font-bold uppercase tracking-wider">
                        ▲ +{item.afterLevel - item.beforeLevel}
                      </span>
                    ) : item.afterLevel < item.beforeLevel ? (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full text-[9px] font-bold uppercase tracking-wider">
                        ▼ -{item.beforeLevel - item.afterLevel}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 bg-muted border border-border text-muted-foreground rounded-full text-[9px] font-bold uppercase tracking-wider">
                        Same
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t border-border/60 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-muted hover:bg-muted/80 text-foreground font-bold text-xs rounded-xl transition-all"
          >
            Cancel Import
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-green-600/15 border border-green-500/20 transition-all"
          >
            Confirm & Save to Server
          </button>
        </div>
      </div>
    </div>
  );
}
