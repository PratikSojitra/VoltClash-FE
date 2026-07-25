"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Hammer,
  HelpCircle,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import {
  ITEM_TEMPLATES,
  getMaxLevelForTH,
  getUpgradeCostAndTime,
  getImageUrl,
  ItemTemplate
} from "@/components/trackerData";
import {
  usePlayerPlans,
  useAddPlan,
  useDeletePlan,
  useUpdatePlanPriority
} from "@/hooks/useClashQuery";

interface PlannerTabProps {
  playerTag: string;
  thLevel: number;
  currentVillage: "home" | "builder";
  showNotify: (msg: string, type?: "success" | "info" | "error") => void;
}

export default function PlannerTab({
  playerTag,
  thLevel,
  currentVillage,
  showNotify
}: PlannerTabProps) {
  // Query for player plans
  const plansQuery = usePlayerPlans(playerTag);

  // Mutations
  const addPlanMutation = useAddPlan(playerTag);
  const deletePlanMutation = useDeletePlan(playerTag);
  const updatePriorityMutation = useUpdatePlanPriority(playerTag);

  // Form State
  const [selectedItemName, setSelectedItemName] = useState<string>("");
  const [fromLevel, setFromLevel] = useState<number>(1);
  const [toLevel, setToLevel] = useState<number>(2);

  // Filter templates for current village
  const villageTemplates = ITEM_TEMPLATES.filter((item) => {
    if (currentVillage === "builder") {
      return item.village === "builder";
    } else {
      return item.village !== "builder";
    }
  });

  const selectedTemplate = villageTemplates.find((t) => t.name === selectedItemName);

  // Set default form values when template changes
  useEffect(() => {
    if (selectedTemplate) {
      const maxLvl = getMaxLevelForTH(selectedTemplate, thLevel);
      setFromLevel(1);
      setToLevel(maxLvl > 1 ? 2 : 1);
    }
  }, [selectedItemName, selectedTemplate, thLevel]);

  // Handle plan submission
  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemName || !selectedTemplate) {
      showNotify("Please select an item to plan.", "error");
      return;
    }

    const maxLvl = getMaxLevelForTH(selectedTemplate, thLevel);
    if (toLevel > maxLvl) {
      showNotify(`Target level cannot exceed maximum level of ${maxLvl} for your Hall level.`, "error");
      return;
    }
    if (fromLevel >= toLevel) {
      showNotify("Target level must be higher than current level.", "error");
      return;
    }

    try {
      await addPlanMutation.mutateAsync({
        playerTag,
        itemName: selectedItemName,
        fromLevel,
        toLevel,
        priority: (plansQuery.data?.length || 0) + 1,
      });
      showNotify(`Successfully added ${selectedItemName} upgrade plan!`, "success");
      setSelectedItemName("");
    } catch (err: any) {
      showNotify(err.response?.data?.message || err.message || "Failed to add plan", "error");
    }
  };

  // Handle delete
  const handleDeletePlan = async (id: string, name: string) => {
    try {
      await deletePlanMutation.mutateAsync(id);
      showNotify(`Removed ${name} from your planner queue.`, "info");
    } catch (err: any) {
      showNotify(err.message || "Failed to delete plan", "error");
    }
  };

  // Handle priority change
  const handleMovePriority = async (index: number, direction: "up" | "down") => {
    const plans = [...(plansQuery.data || [])].sort((a, b) => a.priority - b.priority);
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= plans.length) return;

    const currentPlan = plans[index];
    const targetPlan = plans[targetIndex];

    try {
      // Swap priorities
      await updatePriorityMutation.mutateAsync({ id: currentPlan.id, priority: targetPlan.priority });
      await updatePriorityMutation.mutateAsync({ id: targetPlan.id, priority: currentPlan.priority });
      showNotify("Queue priority updated.", "success");
    } catch (err: any) {
      showNotify(err.message || "Failed to update priority", "error");
    }
  };

  // Calculate Cumulative Resource Costs & Build Durations
  const getPlanTotals = () => {
    let gold = 0;
    let elixir = 0;
    let darkElixir = 0;
    let buildTimeSeconds = 0;

    plansQuery.data?.forEach((plan: any) => {
      const template = ITEM_TEMPLATES.find((t) => t.name === plan.item_name);
      if (!template) return;

      const isBuilder = template.village === "builder";
      const maxLvl = getMaxLevelForTH(template, thLevel);

      for (let lvl = plan.from_level; lvl < plan.to_level; lvl++) {
        const { costRaw, timeRawSeconds } = getUpgradeCostAndTime(template, lvl, maxLvl);
        
        if (isBuilder) {
          if (template.resource === "Gold") gold += costRaw;
          else if (template.resource === "Elixir") elixir += costRaw;
        } else {
          if (template.resource === "Gold") gold += costRaw;
          else if (template.resource === "Elixir") elixir += costRaw;
          else if (template.resource === "Dark Elixir") darkElixir += costRaw;
        }
        buildTimeSeconds += timeRawSeconds;
      }
    });

    const formatNum = (val: number) => {
      if (val >= 1000000) return `${(val / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
      if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
      return val.toString();
    };

    const formatTimeDuration = (sec: number) => {
      const d = Math.floor(sec / 86400);
      const h = Math.floor((sec % 86400) / 3600);
      const m = Math.floor((sec % 3600) / 60);

      if (d > 0) return `${d}d ${h}h`;
      if (h > 0) return `${h}h ${m}m`;
      return `${m}m`;
    };

    return {
      gold: formatNum(gold),
      elixir: formatNum(elixir),
      darkElixir: formatNum(darkElixir),
      timeStr: formatTimeDuration(buildTimeSeconds),
    };
  };

  const totals = getPlanTotals();
  const sortedPlans = [...(plansQuery.data || [])].sort((a, b) => a.priority - b.priority);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Left Columns: Plans Queue */}
      <div className="lg:col-span-2 space-y-6">
        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-primary" /> Upgrade Queue
            </h3>
            <span className="text-xs font-bold bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {sortedPlans.length} Planned
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-normal">
            Queue and sequence future defense structures, laboratory spells, troops, or hero upgrades. Adjust their ordering priority to calculate pathing costs.
          </p>

          {sortedPlans.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border/60 rounded-2xl">
              <Hammer className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Queue is empty</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">Use the panel on the right to start building your upgrade plan.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60 border border-border/60 rounded-2xl overflow-hidden bg-card/30">
              {sortedPlans.map((plan: any, idx: number) => {
                const template = ITEM_TEMPLATES.find((t) => t.name === plan.item_name);
                const isFirst = idx === 0;
                const isLast = idx === sortedPlans.length - 1;

                return (
                  <div
                    key={plan.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-card rounded-xl border border-border flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          src={getImageUrl(plan.item_name, plan.from_level, currentVillage)}
                          alt={plan.item_name}
                          className="w-8 h-8 object-contain drop-shadow-sm"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-foreground truncate">
                          {plan.item_name}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-bold uppercase">
                          Lvl {plan.from_level} → {plan.to_level}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Priority Adjusters */}
                      <button
                        onClick={() => handleMovePriority(idx, "up")}
                        disabled={isFirst}
                        className={`p-1.5 rounded-lg border border-border bg-card hover:bg-muted transition-colors ${
                          isFirst ? "opacity-35 cursor-not-allowed" : ""
                        }`}
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5 text-foreground" />
                      </button>
                      <button
                        onClick={() => handleMovePriority(idx, "down")}
                        disabled={isLast}
                        className={`p-1.5 rounded-lg border border-border bg-card hover:bg-muted transition-colors ${
                          isLast ? "opacity-35 cursor-not-allowed" : ""
                        }`}
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5 text-foreground" />
                      </button>

                      {/* Trash Delete */}
                      <button
                        onClick={() => handleDeletePlan(plan.id, plan.item_name)}
                        className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 transition-colors"
                        title="Remove Plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Calculations & Form */}
      <div className="space-y-6">
        {/* Add Plan Form */}
        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-primary" /> Queue Upgrade Plan
          </h3>

          <form onSubmit={handleAddPlan} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Select Upgrade Item</label>
              <select
                value={selectedItemName}
                onChange={(e) => setSelectedItemName(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              >
                <option value="">-- Choose Item --</option>
                {villageTemplates.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name} ({t.category})
                  </option>
                ))}
              </select>
            </div>

            {selectedTemplate && (
              <div className="grid grid-cols-2 gap-3.5 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">From Level</label>
                  <select
                    value={fromLevel}
                    onChange={(e) => setFromLevel(parseInt(e.target.value))}
                    className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  >
                    {Array.from(
                      { length: getMaxLevelForTH(selectedTemplate, thLevel) },
                      (_, i) => i + 1
                    ).map((lvl) => (
                      <option key={lvl} value={lvl}>
                        Level {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">To Level</label>
                  <select
                    value={toLevel}
                    onChange={(e) => setToLevel(parseInt(e.target.value))}
                    className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  >
                    {Array.from(
                      { length: getMaxLevelForTH(selectedTemplate, thLevel) },
                      (_, i) => i + 1
                    )
                      .filter((lvl) => lvl > fromLevel)
                      .map((lvl) => (
                        <option key={lvl} value={lvl}>
                          Level {lvl}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedItemName}
              className="w-full py-2.5 bg-primary text-primary-foreground hover:opacity-90 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add To Queue
            </button>
          </form>
        </div>

        {/* Calculation Box */}
        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" /> Planned Cumulative Cost
          </h3>
          <p className="text-xs text-muted-foreground leading-normal">
            The total resource values and laboratory/builder time required to complete the queued upgrade actions.
          </p>

          <div className="grid grid-cols-2 gap-3.5 text-xs font-bold pt-2">
            <div className="p-3 bg-muted/40 border border-border/50 rounded-2xl space-y-1 flex flex-col justify-between">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                {currentVillage === "builder" ? "BUILDER GOLD" : "GOLD"}
              </span>
              <span className="text-sm text-amber-500 font-bold flex items-center gap-1.5">
                <img
                  src={currentVillage === "builder" ? "/images/Builder Gold.png" : "/images/Gold.png"}
                  alt="Gold"
                  className="w-4 h-4 object-contain"
                />
                {totals.gold}
              </span>
            </div>

            <div className="p-3 bg-muted/40 border border-border/50 rounded-2xl space-y-1 flex flex-col justify-between">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                {currentVillage === "builder" ? "BUILDER ELIXIR" : "ELIXIR"}
              </span>
              <span className="text-sm text-pink-500 font-bold flex items-center gap-1.5">
                <img
                  src={currentVillage === "builder" ? "/images/Builder Elixir.png" : "/images/Elixir.png"}
                  alt="Elixir"
                  className="w-4 h-4 object-contain"
                />
                {totals.elixir}
              </span>
            </div>

            {currentVillage !== "builder" && (
              <div className="p-3 bg-muted/40 border border-border/50 rounded-2xl space-y-1 flex flex-col justify-between">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  DARK ELIXIR
                </span>
                <span className="text-sm text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1.5">
                  <img
                    src="/images/Dark Elixir.png"
                    alt="Dark Elixir"
                    className="w-4 h-4 object-contain"
                  />
                  {totals.darkElixir}
                </span>
              </div>
            )}

            <div className="p-3 bg-muted/40 border border-border/50 rounded-2xl space-y-1 flex flex-col justify-between">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                TOTAL BUILD TIME
              </span>
              <span className="text-sm text-foreground font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-muted-foreground" />
                {totals.timeStr}
              </span>
            </div>
          </div>

          <div className="p-4 bg-muted/30 border border-border/60 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-primary shrink-0" />
            <p className="text-[10px] text-muted-foreground leading-normal font-semibold">
              Planned upgrades calculation assumes continuous build schedules and does not account for active builder boosts or potion multipliers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
