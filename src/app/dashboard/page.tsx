"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  HelpCircle,
  AlertCircle,
  Search,
  X,
  Zap,
  Upload,
  RefreshCw
} from "lucide-react";


import { useTheme } from "../providers";
import {
  ITEM_TEMPLATES,
  getMaxLevelForTH,
  getUpgradeCostAndTime,
  getImageUrl,
  getInstanceCount,
  ItemTemplate,
  parseVillageJson
} from "@/components/trackerData";

// Centralized React Query Hooks
import {
  usePlayerTags,
  usePlayerDetails,
  useRegisterTag,
  useSyncPlayerTag,
  useStartUpgrade,
  useCompleteUpgrade,
  useCancelUpgrade,
  useBoostTimers,
  useImportJson,
  useUpdatePlayerLevels
} from "@/hooks/useClashQuery";

// Modular Dashboard Components
import Header from "@/components/dashboard/Header";
import { LeftAdGutter, RightAdGutter } from "@/components/dashboard/Sidebar";
import OverviewTab from "@/components/dashboard/OverviewTab";
import CategoryTab from "@/components/dashboard/CategoryTab";
import { UpgradeModal, SyncModal, JsonModal, PreviewModal } from "@/components/dashboard/Modals";

export default function DashboardPage() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  // Core Navigation State
  const [currentVillage, setCurrentVillage] = useState<"home" | "builder">("home");
  const [activeTab, setActiveTab] = useState<string>("Defenses");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  // Modals & Selected items state
  const [selectedItem, setSelectedItem] = useState<ItemTemplate | null>(null);
  const [selectedInstanceIndex, setSelectedInstanceIndex] = useState<number>(0);
  const [isLevelEditOpen, setIsLevelEditOpen] = useState<boolean>(false);
  const [isApiSyncOpen, setIsApiSyncOpen] = useState<boolean>(false);
  const [isJsonUploadOpen, setIsJsonUploadOpen] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  // API Ingestion Sync Step state
  const [syncStep, setSyncStep] = useState<string>("");
  const [apiSyncing, setApiSyncing] = useState<boolean>(false);

  // JSON Preview state — staged comparison before saving to DB
  const [pendingParsedVillage, setPendingParsedVillage] = useState<any>(null);
  const [previewComparisonList, setPreviewComparisonList] = useState<any[]>([]);

  // Local state for smooth UI ticking (synchronizes from React Query details cache)
  const [activeTag, setActiveTag] = useState<string>("");
  const [tempTagInput, setTempTagInput] = useState<string>("");
  const [thLevel, setThLevel] = useState<number>(16);
  const [levels, setLevels] = useState<Record<string, number[]>>({});
  const [builders, setBuilders] = useState<any[]>([]);
  const [labResearch, setLabResearch] = useState<any | null>(null);

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ----------------------------------------
  // Session / Authentication Guard
  // ----------------------------------------
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("voltclash_access_token");
      if (!token) {
        router.push("/login");
      }
    }
  }, [router]);

  // ----------------------------------------
  // React Queries / Mutations
  // ----------------------------------------
  const playerTagsQuery = usePlayerTags();
  const playerDetailsQuery = usePlayerDetails(activeTag || null);

  const registerTagMutation = useRegisterTag();
  const syncPlayerTagMutation = useSyncPlayerTag();
  const startUpgradeMutation = useStartUpgrade();
  const completeUpgradeMutation = useCompleteUpgrade(activeTag);
  const cancelUpgradeMutation = useCancelUpgrade(activeTag);
  const boostTimersMutation = useBoostTimers(activeTag);
  const importJsonMutation = useImportJson();
  const updatePlayerLevelsMutation = useUpdatePlayerLevels();

  // Load first active player tag
  useEffect(() => {
    if (playerTagsQuery.data && playerTagsQuery.data.length > 0) {
      const savedTag = localStorage.getItem("voltclash_active_tag") || playerTagsQuery.data[0].player_tag;
      localStorage.setItem("voltclash_active_tag", savedTag);
      setActiveTag(savedTag);
      setTempTagInput(savedTag);
    } else if (playerTagsQuery.isSuccess && playerTagsQuery.data.length === 0) {
      // Redirect to add-village page instead of opening modal
      router.push("/dashboard/add-village");
    }
  }, [playerTagsQuery.data, playerTagsQuery.isSuccess]);

  // Sync React Query cache into local layout states
  useEffect(() => {
    if (playerDetailsQuery.data) {
      const details = playerDetailsQuery.data;
      setThLevel(details.townhall_level || 16);

      const mappedLevels: Record<string, number[]> = {};
      ITEM_TEMPLATES.forEach((item) => {
        const count = getInstanceCount(item, details.townhall_level || 16);
        mappedLevels[item.name] = Array(count).fill(1);
      });

      details.buildings?.forEach((b: any) => {
        if (mappedLevels[b.name]) mappedLevels[b.name] = mappedLevels[b.name].map(() => b.level);
      });
      details.troops?.forEach((t: any) => {
        if (mappedLevels[t.name]) mappedLevels[t.name] = mappedLevels[t.name].map(() => t.level);
      });
      details.heroes?.forEach((h: any) => {
        if (mappedLevels[h.name]) mappedLevels[h.name] = mappedLevels[h.name].map(() => h.level);
      });

      const activeUpgrades: any[] = [];
      let activeLabUpgrade: any | null = null;

      details.upgrades?.forEach((u: any) => {
        const item = ITEM_TEMPLATES.find((i) => i.name === u.item_name);
        if (!item) return;

        const startLvl = u.current_level;
        const endLvl = u.target_level;
        const timeTotal = Math.round((new Date(u.end_time).getTime() - new Date(u.start_time).getTime()) / 1000);
        const timeRemaining = Math.max(0, Math.round((new Date(u.end_time).getTime() - Date.now()) / 1000));

        if (item.category === "Troops" || item.category === "Spells") {
          activeLabUpgrade = {
            itemName: u.item_name,
            category: item.category,
            startLvl,
            endLvl,
            timeTotalSeconds: timeTotal,
            timeRemainingSeconds: timeRemaining,
            resource: item.resource,
            costRaw: 0,
            instanceIndex: 0,
          };
        } else {
          activeUpgrades.push({
            builderId: u.builder_slot,
            itemName: u.item_name,
            category: item.category,
            startLvl,
            endLvl,
            timeTotalSeconds: timeTotal,
            timeRemainingSeconds: timeRemaining,
            resource: item.resource,
            costRaw: 0,
            instanceIndex: 0,
          });
        }
      });

      setLevels(mappedLevels);
      setBuilders(activeUpgrades);
      setLabResearch(activeLabUpgrade);
    }
  }, [playerDetailsQuery.data]);

  // ----------------------------------------
  // Local Countdown Timer Tick UX
  // ----------------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      if (builders.length === 0 && !labResearch) return;

      let currentBuilders = [...builders];
      let currentLab = labResearch ? { ...labResearch } : null;
      let stateChanged = false;

      if (currentBuilders.length > 0) {
        currentBuilders = currentBuilders.map((b) => {
          if (b.timeRemainingSeconds > 1) {
            return { ...b, timeRemainingSeconds: b.timeRemainingSeconds - 1 };
          }
          stateChanged = true;
          return null;
        }).filter((b): b is any => b !== null);
      }

      if (currentLab) {
        if (currentLab.timeRemainingSeconds > 1) {
          currentLab.timeRemainingSeconds -= 1;
        } else {
          stateChanged = true;
          currentLab = null;
        }
      }

      if (stateChanged || currentBuilders.length !== builders.length) {
        setBuilders(currentBuilders);
        setLabResearch(currentLab);
        if (activeTag) playerDetailsQuery.refetch();
      } else {
        setBuilders(currentBuilders);
        setLabResearch(currentLab);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [builders, labResearch, activeTag]);

  // ----------------------------------------
  // Helper Handlers & Utilities
  // ----------------------------------------
  const showNotify = (message: string, type: "success" | "info" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const getLevelsArray = (itemName: string, item: ItemTemplate, th: number): number[] => {
    const rawValue = levels[itemName];
    const count = getInstanceCount(item, th);
    if (Array.isArray(rawValue)) {
      if (rawValue.length === count) return rawValue;
      if (rawValue.length < count) {
        const fillVal = rawValue[0] || 0;
        return [...rawValue, ...Array(count - rawValue.length).fill(fillVal)];
      }
      return rawValue.slice(0, count);
    }
    const maxLvl = getMaxLevelForTH(item, th);
    const singleVal = maxLvl > 0 ? Math.max(1, Math.round(maxLvl * 0.75)) : 0;
    return Array(count).fill(singleVal);
  };

  const isInstanceUpgrading = (itemName: string, idx: number) => {
    const builderMatch = builders.find((b) => b.itemName === itemName && b.instanceIndex === idx);
    const labMatch = labResearch?.itemName === itemName && labResearch.instanceIndex === idx;
    return !!builderMatch || !!labMatch;
  };

  const maxBuilders = currentVillage === "builder" ? 2 : 6;

  // Sign out
  const handleSignOut = () => {
    localStorage.removeItem("voltclash_access_token");
    localStorage.removeItem("voltclash_user");
    localStorage.removeItem("voltclash_active_tag");
    router.push("/login");
  };

  // ----------------------------------------
  // API Actions
  // ----------------------------------------

  // Register tag & run sync
  const handleApiSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempTagInput) return;

    setApiSyncing(true);
    setSyncStep("Registering tag on VoltClash backend...");

    try {
      await registerTagMutation.mutateAsync(tempTagInput);
      setSyncStep("Ingesting player levels, troops, and hero logs from Clash API...");
      await syncPlayerTagMutation.mutateAsync(tempTagInput);

      localStorage.setItem("voltclash_active_tag", tempTagInput);
      setActiveTag(tempTagInput);
      setIsApiSyncOpen(false);
      showNotify(`API Sync Completed! Successfully imported Tag ${tempTagInput}.`, "success");
    } catch (err: any) {
      showNotify(err.response?.data?.message || err.message || "API Synchronization failed", "error");
    } finally {
      setApiSyncing(false);
    }
  };

  // Upload backup village profile — parse on frontend, show preview before saving
  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const rawJson = JSON.parse(content);

        // Parse on frontend using ID mapping
        const parsed = parseVillageJson(rawJson);

        // Determine the active tag: use parsed tag if present, or fall back to activeTag
        const targetTag = parsed.playerTag || activeTag;
        if (!targetTag) {
          showNotify("JSON file has no playerTag / tag field. Please add it and try again.", "error");
          return;
        }

        // Build comparison list vs. current cached levels
        const comparisonList: any[] = [];

        const addComparison = (
          items: { name: string; level: number; category: string }[],
          type: string
        ) => {
          // Deduplicate by name (take highest level per name)
          const deduped = new Map<string, { name: string; level: number; category: string }>();
          for (const item of items) {
            const existing = deduped.get(item.name);
            if (!existing || item.level > existing.level) deduped.set(item.name, item);
          }
          deduped.forEach((item) => {
            const template = ITEM_TEMPLATES.find((t) => t.name === item.name);
            const beforeLevel = levels[item.name]?.[0] ?? 1;
            comparisonList.push({
              name: item.name,
              category: template?.category || type,
              beforeLevel,
              afterLevel: item.level,
            });
          });
        };

        addComparison(parsed.buildings, "Building");
        addComparison([...parsed.troops, ...parsed.spells], "Lab");
        addComparison(parsed.heroes, "Hero");

        setPendingParsedVillage({ parsed, targetTag });
        setPreviewComparisonList(comparisonList);
        setIsJsonUploadOpen(false);
        setIsPreviewOpen(true);
      } catch (err: any) {
        showNotify(err.message || "Error parsing backup JSON", "error");
      }
    };
    reader.readAsText(file);
  };

  // Confirm import — save pre-mapped data to backend
  const handleConfirmImport = async () => {
    if (!pendingParsedVillage) return;
    const { parsed, targetTag } = pendingParsedVillage;

    try {
      // Ensure the player account exists (create via import if new tag)
      let resolvedTag = targetTag;
      if (!playerTagsQuery.data?.find((a: any) => a.player_tag === targetTag)) {
        // Import to create the player account record
        const data = await importJsonMutation.mutateAsync({
          playerTag: targetTag,
          name: parsed.name || "Imported Village",
          townHallLevel: parsed.townHallLevel,
          buildings: parsed.buildings.map((b: { name: any; level: any; village: any; }) => ({ name: b.name, level: b.level, village: b.village })),
          troops: [...parsed.troops, ...parsed.spells].map((t) => ({ name: t.name, level: t.level, village: t.village })),
          heroes: parsed.heroes.map((h: { name: any; level: any; village: any; }) => ({ name: h.name, level: h.level, village: h.village })),
        });
        resolvedTag = data.player_tag || targetTag;
      } else {
        // Account already exists — just update levels
        await updatePlayerLevelsMutation.mutateAsync({
          playerTag: targetTag,
          buildings: parsed.buildings.map((b: { name: any; level: any; village: any; }) => ({ name: b.name, level: b.level, village: b.village })),
          troops: [...parsed.troops, ...parsed.spells].map((t) => ({ name: t.name, level: t.level, village: t.village })),
          heroes: parsed.heroes.map((h: { name: any; level: any; village: any; }) => ({ name: h.name, level: h.level, village: h.village })),
        });
      }

      localStorage.setItem("voltclash_active_tag", resolvedTag);
      setActiveTag(resolvedTag);
      setTempTagInput(resolvedTag);
      setIsPreviewOpen(false);
      setPendingParsedVillage(null);
      showNotify("Village import confirmed and saved to database!", "success");
    } catch (err: any) {
      showNotify(err.response?.data?.message || err.message || "Import failed", "error");
    }
  };

  // Download backup
  const exportTrackerJson = () => {
    const backupData = {
      backupDate: new Date().toISOString(),
      thLevel,
      levels,
      builders,
      labResearch
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `voltclash_backup_th${thLevel}_tag_${activeTag || "village"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotify("Dashboard configuration exported successfully!", "success");
  };

  // Assign upgrade slot
  const startUpgrade = async (item: ItemTemplate, instanceIndex: number = 0) => {
    const itemLevels = getLevelsArray(item.name, item, thLevel);
    const currentLvl = itemLevels[instanceIndex] || 0;
    const maxLvl = getMaxLevelForTH(item, thLevel);

    if (currentLvl >= maxLvl) {
      showNotify(`${item.name} is already at its maximum level for Town Hall ${thLevel}!`, "error");
      return;
    }

    try {
      const data = await startUpgradeMutation.mutateAsync({
        playerTag: activeTag,
        itemName: item.name,
        currentLevel: currentLvl
      });
      showNotify(`Builder Slot #${data.builder_slot} assigned to upgrade ${item.name}!`, "success");
      setIsLevelEditOpen(false);
      setSelectedItem(null);
    } catch (err: any) {
      showNotify(err.response?.data?.message || err.message || "Failed to assign builder slot", "error");
    }
  };

  // Speed boosts
  const applyBuilderPotionBoost = async () => {
    try {
      await boostTimersMutation.mutateAsync();
      showNotify("Builder potion boost successfully applied to active slots!", "success");
    } catch (err: any) {
      showNotify(err.response?.data?.message || err.message || "Failed to trigger speeds boost", "error");
    }
  };

  // Finish upgrade instantly
  const finishUpgradeNow = async (type: "builder" | "lab", builderIdOrName: any) => {
    let upgradeId = "";
    try {
      if (type === "builder") {
        const match = playerDetailsQuery.data?.upgrades?.find((u: any) => u.builder_slot === builderIdOrName && u.status === 'ACTIVE');
        if (match) upgradeId = match.id;
      } else {
        const match = playerDetailsQuery.data?.upgrades?.find((u: any) => u.item_name === labResearch?.itemName && u.status === 'ACTIVE');
        if (match) upgradeId = match.id;
      }

      if (!upgradeId) {
        showNotify("Could not resolve active upgrade ID on server", "error");
        return;
      }

      await completeUpgradeMutation.mutateAsync(upgradeId);
      showNotify("Upgrade manually completed successfully!", "success");
    } catch (err: any) {
      showNotify(err.response?.data?.message || err.message || "Failed to finalize upgrade", "error");
    }
  };

  // Cancel upgrade
  const cancelUpgrade = async (type: "builder" | "lab", builderIdOrName: any) => {
    let upgradeId = "";
    try {
      if (type === "builder") {
        const match = playerDetailsQuery.data?.upgrades?.find((u: any) => u.builder_slot === builderIdOrName && u.status === 'ACTIVE');
        if (match) upgradeId = match.id;
      } else {
        const match = playerDetailsQuery.data?.upgrades?.find((u: any) => u.item_name === labResearch?.itemName && u.status === 'ACTIVE');
        if (match) upgradeId = match.id;
      }

      if (!upgradeId) {
        showNotify("Could not resolve active upgrade ID on server", "error");
        return;
      }

      await cancelUpgradeMutation.mutateAsync(upgradeId);
      showNotify("Upgrade canceled successfully!", "info");
    } catch (err: any) {
      showNotify(err.response?.data?.message || err.message || "Failed to cancel upgrade", "error");
    }
  };

  // Direct level adjustments (simulation fallback)
  const handleDirectLevelChange = (newLvl: number, instanceIndex: number = 0) => {
    if (!selectedItem) return;
    const itemLevels = getLevelsArray(selectedItem.name, selectedItem, thLevel);
    const currentItemLevels = [...itemLevels];
    currentItemLevels[instanceIndex] = newLvl;

    const currentLevels = { ...levels, [selectedItem.name]: currentItemLevels };
    setLevels(currentLevels);
    showNotify(`${selectedItem.name} #${instanceIndex + 1} level set to ${newLvl}!`, "info");
    setIsLevelEditOpen(false);
    setSelectedItem(null);
  };

  // ----------------------------------------
  // Aggregated Visual Analytics
  // ----------------------------------------
  const getProgressStats = () => {
    const stats = {
      overall: 0,
      defenses: { pct: 0, current: 0, max: 0 },
      army: { pct: 0, current: 0, max: 0 },
      resources: { pct: 0, current: 0, max: 0 },
      laboratory: { pct: 0, current: 0, max: 0 },
      heroes: { pct: 0, current: 0, max: 0 },
      walls: { pct: 78.5, current: 78.5, max: 100 }
    };

    let totalCurrent = 0;
    let totalMax = 0;

    ITEM_TEMPLATES.forEach((item) => {
      const maxLvl = getMaxLevelForTH(item, thLevel);
      if (maxLvl <= 0) return;

      const itemLevels = getLevelsArray(item.name, item, thLevel);
      const currSum = itemLevels.reduce((a, b) => a + b, 0);
      const maxSum = maxLvl * itemLevels.length;

      totalCurrent += currSum;
      totalMax += maxSum;

      if (item.category === "Defenses" || item.category === "Traps") {
        stats.defenses.current += currSum;
        stats.defenses.max += maxSum;
      } else if (item.category === "Army") {
        stats.army.current += currSum;
        stats.army.max += maxSum;
      } else if (item.category === "Resources") {
        stats.resources.current += currSum;
        stats.resources.max += maxSum;
      } else if (item.category === "Troops" || item.category === "Spells") {
        stats.laboratory.current += currSum;
        stats.laboratory.max += maxSum;
      } else if (item.category === "Heroes" || item.category === "Pets" || item.category === "Equipment") {
        stats.heroes.current += currSum;
        stats.heroes.max += maxSum;
      }
    });

    stats.overall = totalMax > 0 ? Math.round((totalCurrent / totalMax) * 1000) / 10 : 0;
    const calculatePct = (cat: { current: number; max: number }) => cat.max > 0 ? Math.round((cat.current / cat.max) * 1000) / 10 : 0;

    stats.defenses.pct = calculatePct(stats.defenses);
    stats.army.pct = calculatePct(stats.army);
    stats.resources.pct = calculatePct(stats.resources);
    stats.laboratory.pct = calculatePct(stats.laboratory);
    stats.heroes.pct = calculatePct(stats.heroes);

    return stats;
  };

  const getSuggestions = () => {
    const candidates = ITEM_TEMPLATES.map((item) => {
      const itemLevels = getLevelsArray(item.name, item, thLevel);
      const maxLvl = getMaxLevelForTH(item, thLevel);
      if (maxLvl <= 0) return null;

      const minLvlInstance = Math.min(...itemLevels);
      if (minLvlInstance >= maxLvl) return null;

      const instIndex = itemLevels.indexOf(minLvlInstance);
      if (isInstanceUpgrading(item.name, instIndex)) return null;

      const upgradeInfo = getUpgradeCostAndTime(item, minLvlInstance, maxLvl);

      let weight = 1;
      if (item.category === "Army" || item.category === "Heroes") weight = 3;
      else if (item.category === "Defenses" && ["Monolith", "Scattershot", "Eagle Artillery", "Ricochet Cannon", "Multi-Archer Tower"].includes(item.name)) weight = 2.5;
      else if (item.category === "Resources") weight = 1.5;

      return {
        item,
        currentLvl: minLvlInstance,
        maxLvl,
        cost: upgradeInfo.cost,
        time: upgradeInfo.time,
        timeRawSeconds: upgradeInfo.timeRawSeconds,
        costRaw: upgradeInfo.costRaw,
        weight,
        instanceIndex: instIndex
      };
    }).filter((c): c is any => c !== null);

    return candidates
      .sort((a, b) => {
        if (b.weight !== a.weight) return b.weight - a.weight;
        if (a.costRaw !== b.costRaw) return a.costRaw - b.costRaw;
        return a.timeRawSeconds - b.timeRawSeconds;
      })
      .slice(0, 3);
  };

  const getResourcesNeeded = () => {
    let gold = 0;
    let elixir = 0;
    let darkElixir = 0;
    let shinyOre = 0;
    let totalUpgradeSeconds = 0;

    ITEM_TEMPLATES.forEach((item) => {
      const maxLvl = getMaxLevelForTH(item, thLevel);
      if (maxLvl <= 0) return;

      const itemLevels = getLevelsArray(item.name, item, thLevel);
      itemLevels.forEach((currLvl) => {
        for (let l = currLvl; l < maxLvl; l++) {
          const { costRaw, timeRawSeconds } = getUpgradeCostAndTime(item, l, maxLvl);
          if (item.resource === "Gold") gold += costRaw;
          else if (item.resource === "Elixir") elixir += costRaw;
          else if (item.resource === "Dark Elixir") darkElixir += costRaw;
          else if (item.resource.includes("Ore")) shinyOre += costRaw;

          if (item.category !== "Equipment") {
            totalUpgradeSeconds += timeRawSeconds;
          }
        }
      });
    });

    const formatNum = (val: number) => {
      if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B`;
      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
      return val.toString();
    };

    const formatTimeDuration = (sec: number) => {
      const d = Math.floor(sec / 86400);
      const h = Math.floor((sec % 86400) / 3600);
      const m = Math.floor((sec % 3600) / 60);

      if (d > 30) {
        const mo = Math.floor(d / 30);
        const remD = d % 30;
        return `${mo}mo ${remD}d`;
      }
      if (d > 0) return `${d}d ${h}h`;
      return `${h}h ${m}m`;
    };

    return {
      gold: formatNum(gold),
      elixir: formatNum(elixir),
      darkElixir: formatNum(darkElixir),
      shinyOre: formatNum(shinyOre),
      timeStr: formatTimeDuration(totalUpgradeSeconds),
    };
  };

  const progressStats = getProgressStats();
  const suggestions = getSuggestions();
  const resourcesNeeded = getResourcesNeeded();

  // Count pending upgrades per category (items not at max level)
  const countPending = (categoryNames: string[]) => {
    return ITEM_TEMPLATES.filter(item => {
      if (!categoryNames.includes(item.category)) return false;
      const maxLvl = getMaxLevelForTH(item, thLevel);
      const lvlArray = getLevelsArray(item.name, item, thLevel);
      return lvlArray.some(lvl => lvl < maxLvl);
    }).length;
  };

  // Home village tab definitions (flat, no icons — like the reference image)
  const homeCategories = [
    { name: "Defenses",    filter: ["Defenses"],                      pending: countPending(["Defenses"]) },
    { name: "Traps",       filter: ["Traps"],                          pending: countPending(["Traps"]) },
    { name: "Army",        filter: ["Army"],                           pending: countPending(["Army"]) },
    { name: "Resources",   filter: ["Resources"],                      pending: countPending(["Resources"]) },
    { name: "Troops",      filter: ["Troops"],                         pending: countPending(["Troops"]) },
    { name: "Spells",      filter: ["Spells"],                         pending: countPending(["Spells"]) },
    { name: "Dark Troops", filter: ["Dark Troops"],                    pending: countPending(["Dark Troops"]) },
    { name: "Sieges",      filter: ["Sieges"],                         pending: countPending(["Sieges"]) },
    { name: "Heroes",      filter: ["Heroes"],                         pending: countPending(["Heroes"]) },
    { name: "Equipment",   filter: ["Equipment"],                      pending: countPending(["Equipment"]) },
    { name: "Pets",        filter: ["Pets"],                           pending: countPending(["Pets"]) },
    { name: "Walls",       filter: ["Walls"],                          pending: 0 },
    { name: "Lab",         filter: ["Troops", "Spells", "Dark Troops", "Sieges"], pending: countPending(["Troops", "Spells", "Dark Troops", "Sieges"]) },
  ];

  // Builder base tab definitions
  const builderCategories = [
    { name: "Defenses",  filter: ["Defenses"],  pending: countPending(["Defenses"]) },
    { name: "Gear Ups",  filter: ["GearUps"],   pending: 0 },
    { name: "Traps",     filter: ["Traps"],      pending: countPending(["Traps"]) },
    { name: "Army",      filter: ["Army"],       pending: countPending(["Army"]) },
    { name: "Resources", filter: ["Resources"],  pending: countPending(["Resources"]) },
    { name: "Heroes",    filter: ["Heroes"],     pending: countPending(["Heroes"]) },
    { name: "Walls",     filter: ["Walls"],      pending: 0 },
    { name: "Lab",       filter: ["Troops"],     pending: countPending(["Troops"]) },
  ];

  const categories = currentVillage === "builder" ? builderCategories : homeCategories;

  const getFilteredItems = () => {
    const tab = categories.find(c => c.name === activeTab);
    const filter = tab?.filter || [];
    return ITEM_TEMPLATES.filter((item) => {
      if (!filter.includes(item.category)) return false;
      if (currentVillage === "builder" && item.village !== "builder") return false;
      if (currentVillage === "home" && item.village === "builder") return false;
      if (searchQuery) return item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return true;
    });
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="ad-layout relative antialiased bg-background">
      {/* Alert Notifications */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl glass border border-primary/20 animate-fade-in">
          {notification.type === "success" && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
          {notification.type === "info" && <HelpCircle className="w-5 h-5 text-blue-500 shrink-0" />}
          {notification.type === "error" && <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />}
          <span className="text-sm font-bold text-foreground">{notification.message}</span>
        </div>
      )}

      {/* Ad sidebar Left */}
      <LeftAdGutter showNotify={showNotify} />

      {/* Main Workspace Scroll Area */}
      <div className="flex-1 flex flex-col bg-background max-w-[1400px] mx-auto border-x border-border shadow-2xl relative min-w-0">

        {/* Centralized Header */}
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          playerTag={activeTag}
          showNotify={showNotify}
          onOpenSync={() => setIsApiSyncOpen(true)}
          onOpenJsonUpload={() => setIsJsonUploadOpen(true)}
          onExportJson={exportTrackerJson}
          onSignOut={handleSignOut}
          playerAccounts={playerTagsQuery.data || []}
          onSwitchAccount={(tag) => {
            setActiveTag(tag);
            setTempTagInput(tag);
            localStorage.setItem("voltclash_active_tag", tag);
          }}
        />

        {/* Scrollable Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar">

          {!activeTag ? (
            <div className="max-w-2xl mx-auto py-16 text-center space-y-8 animate-fade-in">
              <div className="relative inline-flex items-center justify-center">
                {/* Glow ring */}
                <div className="absolute inset-0 bg-primary/25 blur-2xl rounded-full scale-150 animate-pulse" />
                <div className="w-24 h-24 bg-primary/10 border border-primary/25 rounded-3xl flex items-center justify-center text-primary shadow-lg shadow-primary/5 relative z-10 animate-bounce-slow">
                  <Zap className="w-12 h-12 fill-primary" />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-extrabold tracking-tight">Link Your Clash Village to Begin</h2>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
                  Connect your Clash of Clans player tag to automatically synchronize structural levels, active builder times, troop research, and view strategic time-to-max analytics.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                <button
                  onClick={() => router.push("/dashboard/add-village")}
                  className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-xl shadow-primary/20"
                >
                  <Upload className="w-5 h-5" /> Import Village JSON
                </button>
                <button
                  onClick={() => setIsApiSyncOpen(true)}
                  className="w-full sm:w-auto px-8 py-4 bg-muted border border-border text-foreground font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-muted/80 hover:scale-105 transition-all"
                >
                  <RefreshCw className="w-5 h-5" /> Connect via API Tag
                </button>
              </div>

              <div className="pt-8 border-t border-border/40 max-w-lg mx-auto">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-4">WHAT YOU UNLOCK</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-muted-foreground">
                  <div className="space-y-1">
                    <span className="text-foreground text-sm">👷‍♂️</span>
                    <h4 className="font-bold text-foreground">Builder Tracking</h4>
                    <p className="text-[10px] leading-normal font-medium">Auto-tick active slots second-by-second.</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-foreground text-sm">🧪</span>
                    <h4 className="font-bold text-foreground">Lab Planning</h4>
                    <p className="text-[10px] leading-normal font-medium">Optimize laboratory spell & troop levels.</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-foreground text-sm">📊</span>
                    <h4 className="font-bold text-foreground">Time Analytics</h4>
                    <p className="text-[10px] leading-normal font-medium">Real-time charts of resources-to-max.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* ── TH Overview card always visible above tabs ── */}
              <OverviewTab
                thLevel={thLevel}
                builders={builders}
                labResearch={labResearch}
                maxBuilders={maxBuilders}
                progressStats={progressStats}
                suggestions={suggestions}
                resourcesNeeded={resourcesNeeded}
                onStartTHUpgrade={() => {
                  if (thLevel < 16) {
                    setThLevel(thLevel + 1);
                    showNotify(`Town Hall upgraded locally to Level ${thLevel + 1}! Run tag sync to save to database.`, "info");
                  } else {
                    showNotify("Town Hall 16 is the maximum level in this version!", "success");
                  }
                }}
                onStartUpgrade={startUpgrade}
                onCancelUpgrade={cancelUpgrade}
                onFinishUpgrade={finishUpgradeNow}
                onMassUpgradeStructures={() => {
                  const updatedLevels = { ...levels };
                  ITEM_TEMPLATES.forEach((item) => {
                    const maxLvl = getMaxLevelForTH(item, thLevel);
                    const count = getInstanceCount(item, thLevel);
                    updatedLevels[item.name] = Array(count).fill(maxLvl);
                  });
                  setLevels(updatedLevels);
                  showNotify(`All structures maxed for Town Hall ${thLevel} inside local memory!`, "success");
                }}
                onMassUpgradeWalls={() => showNotify(`All walls maxed for Town Hall ${thLevel}!`, "success")}
                onOpenSync={() => setIsApiSyncOpen(true)}
                onOpenJsonUpload={() => router.push("/dashboard/add-village")}
                showNotify={showNotify}
                getImageUrl={getImageUrl}
                onBoostTimers={applyBuilderPotionBoost}
              />

              {/* ── Builder Base toggle button ── */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    const next = currentVillage === "home" ? "builder" : "home";
                    setCurrentVillage(next);
                    setActiveTab(next === "builder" ? "Defenses" : "Defenses");
                    setSearchQuery("");
                  }}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all active:scale-95 flex items-center gap-2 shadow-sm ${
                    currentVillage === "builder"
                      ? "bg-blue-600 border-blue-500/40 text-white shadow-blue-600/15 hover:bg-blue-700"
                      : "bg-card border-border text-foreground hover:bg-muted"
                  }`}
                >
                  <span>🏗️</span>
                  {currentVillage === "builder" ? "Switch to Home Village" : "Switch to Builder Base"}
                </button>
                {currentVillage === "builder" && (
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
                    Builder Base
                  </span>
                )}
              </div>

              {/* ── Flat pill tab bar + search ── */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                  {categories.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => { setActiveTab(c.name); setSearchQuery(""); }}
                      className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg whitespace-nowrap text-xs font-bold transition-all border shrink-0 ${
                        activeTab === c.name
                          ? "bg-blue-600 text-white border-blue-500/30 shadow-sm shadow-blue-600/20"
                          : c.pending > 0
                          ? "bg-amber-400/15 text-amber-700 dark:text-amber-300 border-amber-400/30 hover:bg-amber-400/25"
                          : "bg-muted text-muted-foreground border-border hover:bg-muted/80 hover:text-foreground"
                      }`}
                    >
                      <span>{c.name}</span>
                      {c.pending > 0 && (
                        <span className={`text-[10px] font-black leading-none ${
                          activeTab === c.name ? "text-white/90" : "text-amber-600 dark:text-amber-400"
                        }`}>
                          ↑({c.pending})
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Search within active tab */}
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${activeTab}…`}
                    className="w-full bg-muted/50 border border-border rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* ── Category content ── */}
              <CategoryTab
                filteredItems={filteredItems}
                levels={levels}
                builders={builders}
                labResearch={labResearch}
                thLevel={thLevel}
                showNotify={showNotify}
                getMaxLevelForTH={getMaxLevelForTH}
                getUpgradeCostAndTime={getUpgradeCostAndTime}
                getImageUrl={getImageUrl}
                getLevelsArray={getLevelsArray}
                startUpgrade={startUpgrade}
                cancelUpgrade={cancelUpgrade}
                finishUpgradeNow={finishUpgradeNow}
                onSelectItem={(item, instIdx) => {
                  setSelectedItem(item);
                  setSelectedInstanceIndex(instIdx);
                  setIsLevelEditOpen(true);
                }}
              />
            </>
          )}
        </main>
      </div>

      {/* Ad sidebar Right */}
      <RightAdGutter showNotify={showNotify} />

      {/* Upgrade Details & Levels Modifier Slider Dialog */}
      <UpgradeModal
        isOpen={isLevelEditOpen}
        item={selectedItem}
        instanceIndex={selectedInstanceIndex}
        thLevel={thLevel}
        getLevelsArray={getLevelsArray}
        getMaxLevelForTH={getMaxLevelForTH}
        getUpgradeCostAndTime={getUpgradeCostAndTime}
        getImageUrl={getImageUrl}
        onClose={() => {
          setIsLevelEditOpen(false);
          setSelectedItem(null);
        }}
        onDirectLevelChange={handleDirectLevelChange}
        onStartUpgrade={startUpgrade}
      />

      {/* Tag Sync Dialog */}
      <SyncModal
        isOpen={isApiSyncOpen}
        playerTag={tempTagInput}
        setPlayerTag={setTempTagInput}
        apiSyncing={apiSyncing}
        syncStep={syncStep}
        onClose={() => setIsApiSyncOpen(false)}
        onSubmit={handleApiSync}
      />

      {/* JSON backup Ingest Dialog */}
      <JsonModal
        isOpen={isJsonUploadOpen}
        fileInputRef={fileInputRef}
        onClose={() => setIsJsonUploadOpen(false)}
        onUpload={handleJsonUpload}
      />

      {/* JSON Import Preview & Confirm Dialog */}
      <PreviewModal
        isOpen={isPreviewOpen}
        comparisonList={previewComparisonList}
        onClose={() => {
          setIsPreviewOpen(false);
          setPendingParsedVillage(null);
        }}
        onConfirm={handleConfirmImport}
        getImageUrl={getImageUrl}
      />
    </div>
  );
}
