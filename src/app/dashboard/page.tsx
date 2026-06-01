"use client";

import { 
  Zap, 
  LayoutDashboard, 
  Users, 
  Settings, 
  Bell, 
  Search, 
  Clock, 
  Hammer, 
  TrendingUp, 
  Plus,
  RefreshCw,
  LogOut,
  ChevronRight,
  Shield,
  Swords,
  Pickaxe,
  FlaskConical,
  Trophy,
  Filter,
  Moon,
  Sun,
  Flame,
  CheckCircle2,
  Trash2,
  Sparkles,
  ArrowUpRight,
  Upload,
  Download,
  AlertCircle,
  HelpCircle,
  X
} from "lucide-react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "../providers";
import { 
  ITEM_TEMPLATES, 
  getMaxLevelForTH, 
  getUpgradeCostAndTime, 
  getImageUrl, 
  getInstanceCount,
  ItemTemplate 
} from "@/components/trackerData";

// Type definitions for tracking state
interface BuilderUpgrade {
  builderId: number;
  itemName: string;
  category: string;
  startLvl: number;
  endLvl: number;
  timeTotalSeconds: number;
  timeRemainingSeconds: number;
  resource: string;
  costRaw: number;
  instanceIndex?: number;
}

interface LabUpgrade {
  itemName: string;
  category: string;
  startLvl: number;
  endLvl: number;
  timeTotalSeconds: number;
  timeRemainingSeconds: number;
  resource: string;
  costRaw: number;
  instanceIndex?: number;
}

export default function DashboardPage() {
  const { theme, toggleTheme } = useTheme();
  
  // Dashboard Core State
  const [currentVillage, setCurrentVillage] = useState<"home" | "builder">("home");
  const [thLevel, setThLevel] = useState<number>(16);
  const [levels, setLevels] = useState<Record<string, number[]>>({});
  const [builders, setBuilders] = useState<BuilderUpgrade[]>([]);
  const [labResearch, setLabResearch] = useState<LabUpgrade | null>(null);
  const [activeTab, setActiveTab] = useState<string>("Overview");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);
  
  // Modals state
  const [selectedItem, setSelectedItem] = useState<ItemTemplate | null>(null);
  const [selectedInstanceIndex, setSelectedInstanceIndex] = useState<number>(0);
  const [isLevelEditOpen, setIsLevelEditOpen] = useState<boolean>(false);
  const [isApiSyncOpen, setIsApiSyncOpen] = useState<boolean>(false);
  const [isJsonUploadOpen, setIsJsonUploadOpen] = useState<boolean>(false);
  
  // API Sync State
  const [playerTag, setPlayerTag] = useState<string>("");
  const [apiSyncing, setApiSyncing] = useState<boolean>(false);
  const [syncStep, setSyncStep] = useState<string>("");
  
  // JSON Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Categories definition
  const categories = currentVillage === "builder" ? [
    { name: "Overview", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Defenses", icon: <Shield className="w-5 h-5" /> },
    { name: "Army", icon: <Swords className="w-5 h-5" /> },
    { name: "Resources", icon: <Pickaxe className="w-5 h-5" /> },
    { name: "Laboratory", icon: <FlaskConical className="w-5 h-5" /> },
    { name: "Heroes", icon: <Flame className="w-5 h-5" /> },
    { name: "Traps", icon: <Bell className="w-5 h-5" /> },
  ] : [
    { name: "Overview", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Defenses", icon: <Shield className="w-5 h-5" /> },
    { name: "Army", icon: <Swords className="w-5 h-5" /> },
    { name: "Resources", icon: <Pickaxe className="w-5 h-5" /> },
    { name: "Laboratory", icon: <FlaskConical className="w-5 h-5" /> },
    { name: "Heroes & Equipment", icon: <Flame className="w-5 h-5" /> },
    { name: "Pets", icon: <Sparkles className="w-5 h-5" /> },
    { name: "Traps", icon: <Bell className="w-5 h-5" /> },
  ];

  // Max builders limit
  const maxBuilders = currentVillage === "builder" ? 2 : 6;

  // Resource Icon Resolver
  const getResourceIcon = (resource: string, village: "home" | "builder") => {
    if (village === "builder") {
      if (resource === "Gold") return "/images/Builder Gold.png";
      if (resource === "Elixir") return "/images/Builder Elixir.png";
    } else {
      if (resource === "Gold") return "/images/Gold.png";
      if (resource === "Elixir") return "/images/Elixir.png";
      if (resource === "Dark Elixir") return "/images/Dark Elixir.png";
      if (resource === "Shiny Ore") return "/images/Shiny Ore.png";
      if (resource === "Glowy Ore") return "/images/Glowy Ore.png";
    }
    return "/images/Gold.png";
  };

  // Show a notification alert
  const showNotify = (message: string, type: "success" | "info" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Helper to normalize levels state as Record<string, number[]>
  const normalizeLevels = (raw: Record<string, any>, th: number, village: "home" | "builder" = "home"): Record<string, number[]> => {
    const normalized: Record<string, number[]> = {};
    ITEM_TEMPLATES.forEach(item => {
      const itemVillage = item.village || "home";
      if (itemVillage !== village) return; // Only process active village items

      const count = getInstanceCount(item, th);
      const rawVal = raw[item.name];
      if (Array.isArray(rawVal)) {
        if (rawVal.length === count) {
          normalized[item.name] = rawVal;
        } else if (rawVal.length < count) {
          const fill = rawVal[0] || 0;
          normalized[item.name] = [...rawVal, ...Array(count - rawVal.length).fill(fill)];
        } else {
          normalized[item.name] = rawVal.slice(0, count);
        }
      } else {
        const maxLvl = getMaxLevelForTH(item, th);
        const singleVal = typeof rawVal === 'number' ? rawVal : (maxLvl > 0 ? Math.max(1, Math.round(maxLvl * 0.75)) : 0);
        normalized[item.name] = Array(count).fill(singleVal);
      }
    });
    return normalized;
  };

  // Helper to retrieve safe levels array
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
    
    const singleVal = typeof rawValue === 'number' ? rawValue : (getMaxLevelForTH(item, th) > 0 ? Math.max(1, Math.round(getMaxLevelForTH(item, th) * 0.75)) : 0);
    return Array(count).fill(singleVal);
  };

  // Helper to check if specific instance is upgrading
  const isInstanceUpgrading = (itemName: string, idx: number) => {
    const builderMatch = builders.find(b => b.itemName === itemName && b.instanceIndex === idx);
    const labMatch = labResearch?.itemName === itemName && labResearch.instanceIndex === idx ? labResearch : null;
    return !!builderMatch || !!labMatch;
  };

  // 1. Initial State Load from LocalStorage
  useEffect(() => {
    const savedVillage = localStorage.getItem("voltclash_current_village") as "home" | "builder" | null;
    const activeVillage = savedVillage || "home";
    setCurrentVillage(activeVillage);

    if (activeVillage === "home") {
      const savedTh = localStorage.getItem("voltclash_th");
      const savedLevels = localStorage.getItem("voltclash_levels");
      const savedBuilders = localStorage.getItem("voltclash_builders");
      const savedLab = localStorage.getItem("voltclash_lab");

      const thVal = savedTh ? parseInt(savedTh) : 16;
      setThLevel(thVal);

      if (savedLevels) {
        const parsed = JSON.parse(savedLevels);
        const normalized = normalizeLevels(parsed, thVal, "home");
        setLevels(normalized);
      } else {
        // Create a nice starter profile based on TH16
        initializeDefaultProfile(thVal, "home");
      }

      if (savedBuilders) setBuilders(JSON.parse(savedBuilders));
      if (savedLab) setLabResearch(JSON.parse(savedLab));
    } else {
      const savedBh = localStorage.getItem("voltclash_bh");
      const savedLevels = localStorage.getItem("voltclash_builder_levels");
      const savedBuilders = localStorage.getItem("voltclash_builder_builders");
      const savedLab = localStorage.getItem("voltclash_builder_lab");

      const bhVal = savedBh ? parseInt(savedBh) : 10;
      setThLevel(bhVal);

      if (savedLevels) {
        const parsed = JSON.parse(savedLevels);
        const normalized = normalizeLevels(parsed, bhVal, "builder");
        setLevels(normalized);
      } else {
        initializeDefaultProfile(bhVal, "builder");
      }

      if (savedBuilders) setBuilders(JSON.parse(savedBuilders));
      if (savedLab) setLabResearch(JSON.parse(savedLab));
    }
  }, []);

  // 2. Initialize Default Levels
  const initializeDefaultProfile = (th: number, village: "home" | "builder" = "home") => {
    const defaultLevels: Record<string, number[]> = {};
    ITEM_TEMPLATES.forEach(item => {
      const itemVillage = item.village || "home";
      if (itemVillage !== village) return; // Only process active village items

      const maxLvl = getMaxLevelForTH(item, th);
      const count = getInstanceCount(item, th);
      const val = maxLvl <= 0 ? 0 : Math.max(1, Math.round(maxLvl * 0.75));
      defaultLevels[item.name] = Array(count).fill(val);
    });
    setLevels(defaultLevels);
    
    const levelsKey = village === "home" ? "voltclash_levels" : "voltclash_builder_levels";
    localStorage.setItem(levelsKey, JSON.stringify(defaultLevels));
  };

  // 3. Save State to LocalStorage on updates
  const saveState = (updatedLevels: Record<string, number[]>, updatedBuilders: BuilderUpgrade[], updatedLab: LabUpgrade | null) => {
    setLevels(updatedLevels);
    setBuilders(updatedBuilders);
    setLabResearch(updatedLab);
    
    if (currentVillage === "home") {
      localStorage.setItem("voltclash_levels", JSON.stringify(updatedLevels));
      localStorage.setItem("voltclash_builders", JSON.stringify(updatedBuilders));
      localStorage.setItem("voltclash_lab", JSON.stringify(updatedLab));
    } else {
      localStorage.setItem("voltclash_builder_levels", JSON.stringify(updatedLevels));
      localStorage.setItem("voltclash_builder_builders", JSON.stringify(updatedBuilders));
      localStorage.setItem("voltclash_builder_lab", JSON.stringify(updatedLab));
    }
  };

  const switchVillage = (target: "home" | "builder") => {
    if (target === currentVillage) return;

    // 1. Save CURRENT village state to its respective keys
    if (currentVillage === "home") {
      localStorage.setItem("voltclash_th", thLevel.toString());
      localStorage.setItem("voltclash_levels", JSON.stringify(levels));
      localStorage.setItem("voltclash_builders", JSON.stringify(builders));
      localStorage.setItem("voltclash_lab", JSON.stringify(labResearch));
    } else {
      localStorage.setItem("voltclash_bh", thLevel.toString());
      localStorage.setItem("voltclash_builder_levels", JSON.stringify(levels));
      localStorage.setItem("voltclash_builder_builders", JSON.stringify(builders));
      localStorage.setItem("voltclash_builder_lab", JSON.stringify(labResearch));
    }

    // 2. Load TARGET village state
    localStorage.setItem("voltclash_current_village", target);
    setCurrentVillage(target);

    if (target === "home") {
      const savedTh = localStorage.getItem("voltclash_th");
      const savedLevels = localStorage.getItem("voltclash_levels");
      const savedBuilders = localStorage.getItem("voltclash_builders");
      const savedLab = localStorage.getItem("voltclash_lab");

      const thVal = savedTh ? parseInt(savedTh) : 16;
      setThLevel(thVal);

      if (savedLevels) {
        setLevels(normalizeLevels(JSON.parse(savedLevels), thVal, "home"));
      } else {
        initializeDefaultProfile(thVal, "home");
      }
      setBuilders(savedBuilders ? JSON.parse(savedBuilders) : []);
      setLabResearch(savedLab ? JSON.parse(savedLab) : null);
    } else {
      const savedBh = localStorage.getItem("voltclash_bh");
      const savedLevels = localStorage.getItem("voltclash_builder_levels");
      const savedBuilders = localStorage.getItem("voltclash_builder_builders");
      const savedLab = localStorage.getItem("voltclash_builder_lab");

      const bhVal = savedBh ? parseInt(savedBh) : 10;
      setThLevel(bhVal);

      if (savedLevels) {
        setLevels(normalizeLevels(JSON.parse(savedLevels), bhVal, "builder"));
      } else {
        initializeDefaultProfile(bhVal, "builder");
      }
      setBuilders(savedBuilders ? JSON.parse(savedBuilders) : []);
      setLabResearch(savedLab ? JSON.parse(savedLab) : null);
    }

    // Reset active tab to Overview
    setActiveTab("Overview");
  };

  // 4. Timer ticking Interval (Runs every 1 second)
  useEffect(() => {
    const interval = setInterval(() => {
      let currentLevels = { ...levels };
      if (Object.keys(currentLevels).length === 0) return; // Safeguard empty initial states

      let stateChanged = false;
      let currentBuilders = [...builders];
      let currentLab = labResearch ? { ...labResearch } : null;

      // Tick builders
      if (currentBuilders.length > 0) {
        currentBuilders = currentBuilders.map(b => {
          if (b.timeRemainingSeconds > 1) {
            return { ...b, timeRemainingSeconds: b.timeRemainingSeconds - 1 };
          } else {
            // Builder Upgrade Finished!
            stateChanged = true;
            const currentItemLevels = [...(currentLevels[b.itemName] || [])];
            const idx = b.instanceIndex ?? 0;
            currentItemLevels[idx] = b.endLvl;
            currentLevels[b.itemName] = currentItemLevels;
            showNotify(`Upgrade Finished: ${b.itemName} #${idx + 1} is now Level ${b.endLvl}!`, "success");
            return null; // Remove this builder upgrade
          }
        }).filter((b): b is BuilderUpgrade => b !== null);
      }

      // Tick Lab slot
      if (currentLab) {
        if (currentLab.timeRemainingSeconds > 1) {
          currentLab.timeRemainingSeconds -= 1;
        } else {
          // Lab Research Finished!
          stateChanged = true;
          const currentItemLevels = [...(currentLevels[currentLab.itemName] || [])];
          currentItemLevels[0] = currentLab.endLvl;
          currentLevels[currentLab.itemName] = currentItemLevels;
          showNotify(`Research Finished: ${currentLab.itemName} is now Level ${currentLab.endLvl}!`, "success");
          currentLab = null;
        }
      }

      if (stateChanged || currentBuilders.length !== builders.length || (labResearch && !currentLab) || (builders.length > 0)) {
        saveState(currentLevels, currentBuilders, currentLab);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [levels, builders, labResearch, currentVillage]);

  // Handle Town Hall Select
  const handleTHChange = (newTH: number) => {
    setThLevel(newTH);
    if (currentVillage === "home") {
      localStorage.setItem("voltclash_th", newTH.toString());
    } else {
      localStorage.setItem("voltclash_bh", newTH.toString());
    }

    // Update levels that should be locked or clamped to new limits
    const updatedLevels = { ...levels };
    ITEM_TEMPLATES.forEach(item => {
      const itemVillage = item.village || "home";
      if (itemVillage !== currentVillage) return;

      const maxLvl = getMaxLevelForTH(item, newTH);
      const count = getInstanceCount(item, newTH);
      
      const currentItemLevels = getLevelsArray(item.name, item, newTH);
      const adjusted = currentItemLevels.map(lvl => {
        if (maxLvl <= 0) return 0;
        return Math.max(1, Math.min(maxLvl, lvl));
      });
      
      updatedLevels[item.name] = adjusted;
    });

    saveState(updatedLevels, builders, labResearch);
    showNotify(`${currentVillage === "builder" ? "Builder Hall" : "Town Hall"} updated to Level ${newTH}! Grid caps and locks updated.`, "info");
  };

  // Assign upgrade to an active builder or laboratory
  const startUpgrade = (item: ItemTemplate, instanceIndex: number = 0) => {
    const itemLevels = getLevelsArray(item.name, item, thLevel);
    const currentLvl = itemLevels[instanceIndex] || 0;
    const maxLvl = getMaxLevelForTH(item, thLevel);

    if (currentLvl >= maxLvl) {
      showNotify(`${item.name} is already at its maximum level for Town Hall ${thLevel}!`, "error");
      return;
    }

    const { costRaw, timeRawSeconds, time } = getUpgradeCostAndTime(item, currentLvl, maxLvl);

    // Hero Equipment Upgrades are INSTANT in CoC (does not occupy builder)
    if (item.category === "Equipment") {
      const currentItemLevels = [...itemLevels];
      currentItemLevels[instanceIndex] = currentLvl + 1;
      const updatedLevels = { ...levels, [item.name]: currentItemLevels };
      saveState(updatedLevels, builders, labResearch);
      showNotify(`${item.name} upgraded instantly to Level ${currentLvl + 1}!`, "success");
      setSelectedItem(null);
      return;
    }

    // Laboratory items (Troops & Spells) occupy the Lab research slot
    if (item.category === "Troops" || item.category === "Spells") {
      if (labResearch) {
        showNotify(`Your Laboratory is currently busy researching ${labResearch.itemName}!`, "error");
        return;
      }

      const newLabUpgrade: LabUpgrade = {
        itemName: item.name,
        category: item.category,
        startLvl: currentLvl,
        endLvl: currentLvl + 1,
        timeTotalSeconds: timeRawSeconds,
        timeRemainingSeconds: timeRawSeconds,
        resource: item.resource,
        costRaw,
        instanceIndex,
      };

      saveState(levels, builders, newLabUpgrade);
      showNotify(`Research started: ${item.name} is upgrading to Level ${currentLvl + 1} (${time})`, "success");
      setSelectedItem(null);
      return;
    }

    // Regular buildings & heroes & traps occupy Builders
    if (builders.length >= maxBuilders) {
      showNotify(`All ${maxBuilders} builders are currently busy! Finish or cancel an active upgrade first.`, "error");
      return;
    }

    // Check if this specific instance is already upgrading
    if (isInstanceUpgrading(item.name, instanceIndex)) {
      showNotify(`This specific ${item.name} is already being upgraded!`, "error");
      return;
    }

    // Assign builder ID (find lowest unused ID from 1 to 6)
    const activeIds = builders.map(b => b.builderId);
    let assignedId = 1;
    for (let i = 1; i <= maxBuilders; i++) {
      if (!activeIds.includes(i)) {
        assignedId = i;
        break;
      }
    }

    const newBuilderUpgrade: BuilderUpgrade = {
      builderId: assignedId,
      itemName: item.name,
      category: item.category,
      startLvl: currentLvl,
      endLvl: currentLvl + 1,
      timeTotalSeconds: timeRawSeconds,
      timeRemainingSeconds: timeRawSeconds,
      resource: item.resource,
      costRaw,
      instanceIndex,
    };

    const updatedBuilders = [...builders, newBuilderUpgrade];
    saveState(levels, updatedBuilders, labResearch);
    showNotify(`Builder ${assignedId} assigned to upgrade ${item.name} #${instanceIndex + 1} to Level ${currentLvl + 1} (${time})`, "success");
    setSelectedItem(null);
  };

  // Instantly finish an active upgrade using Gems
  const finishUpgradeNow = (type: "builder" | "lab", idOrName: any) => {
    let currentLevels = { ...levels };
    let currentBuilders = [...builders];
    let currentLab = labResearch ? { ...labResearch } : null;

    if (type === "builder") {
      const idx = currentBuilders.findIndex(b => b.builderId === idOrName);
      if (idx !== -1) {
        const item = currentBuilders[idx];
        const currentItemLevels = [...(currentLevels[item.itemName] || [])];
        const instIdx = item.instanceIndex ?? 0;
        currentItemLevels[instIdx] = item.endLvl;
        currentLevels[item.itemName] = currentItemLevels;
        currentBuilders.splice(idx, 1);
        showNotify(`Finished Instantly: ${item.itemName} #${instIdx + 1} is now Level ${item.endLvl}!`, "success");
      }
    } else if (type === "lab" && currentLab) {
      const currentItemLevels = [...(currentLevels[currentLab.itemName] || [])];
      currentItemLevels[0] = currentLab.endLvl;
      currentLevels[currentLab.itemName] = currentItemLevels;
      currentLab = null;
      showNotify(`Research Completed: ${labResearch?.itemName} is now Level ${labResearch?.endLvl}!`, "success");
    }

    saveState(currentLevels, currentBuilders, currentLab);
  };

  // Cancel an active upgrade (refunds 50% resources)
  const cancelUpgrade = (type: "builder" | "lab", idOrName: any) => {
    let currentBuilders = [...builders];
    let currentLab = labResearch ? { ...labResearch } : null;

    if (type === "builder") {
      const idx = currentBuilders.findIndex(b => b.builderId === idOrName);
      if (idx !== -1) {
        currentBuilders.splice(idx, 1);
        showNotify(`Upgrade Canceled: Builder ${idOrName} released. 50% cost refunded.`, "info");
      }
    } else if (type === "lab" && currentLab) {
      currentLab = null;
      showNotify(`Research Canceled: Laboratory freed. 50% cost refunded.`, "info");
    }

    saveState(levels, currentBuilders, currentLab);
  };

  // Adjust item level directly through manual edit modal
  const handleDirectLevelChange = (newLvl: number, instanceIndex: number = 0) => {
    if (!selectedItem) return;
    const itemLevels = getLevelsArray(selectedItem.name, selectedItem, thLevel);
    const currentItemLevels = [...itemLevels];
    currentItemLevels[instanceIndex] = newLvl;
    
    const currentLevels = { ...levels, [selectedItem.name]: currentItemLevels };
    saveState(currentLevels, builders, labResearch);
    showNotify(`${selectedItem.name} #${instanceIndex + 1} level set to ${newLvl}!`, "info");
    setIsLevelEditOpen(false);
    setSelectedItem(null);
  };

  // 5. Calculate Progress Statistics
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

    ITEM_TEMPLATES.forEach(item => {
      const maxLvl = getMaxLevelForTH(item, thLevel);
      if (maxLvl <= 0) return; // Ignore locked items

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
    
    const calculatePct = (cat: { current: number; max: number }) => {
      return cat.max > 0 ? Math.round((cat.current / cat.max) * 1000) / 10 : 0;
    };

    stats.defenses.pct = calculatePct(stats.defenses);
    stats.army.pct = calculatePct(stats.army);
    stats.resources.pct = calculatePct(stats.resources);
    stats.laboratory.pct = calculatePct(stats.laboratory);
    stats.heroes.pct = calculatePct(stats.heroes);

    return stats;
  };

  const progressStats = getProgressStats();

  // 6. Strategic Upgrade Suggestions Engine
  const getSuggestions = () => {
    // Collect all unlocked, unmaxed items
    const candidates = ITEM_TEMPLATES.map(item => {
      const itemLevels = getLevelsArray(item.name, item, thLevel);
      const maxLvl = getMaxLevelForTH(item, thLevel);
      if (maxLvl <= 0) return null;

      // Find the lowest level instance of this building type
      const minLvlInstance = Math.min(...itemLevels);
      if (minLvlInstance >= maxLvl) return null;

      // Check if this specific lowest level instance is already upgrading
      const instIndex = itemLevels.indexOf(minLvlInstance);
      const isUpgrading = isInstanceUpgrading(item.name, instIndex);
      if (isUpgrading) return null;

      const upgradeInfo = getUpgradeCostAndTime(item, minLvlInstance, maxLvl);
      
      // Determine strategy weight
      let weight = 1;
      if (item.category === "Army" || item.category === "Heroes") {
        weight = 3; // Prioritize Offense & Heroes!
      } else if (item.category === "Defenses" && ["Monolith", "Scattershot", "Eagle Artillery", "Ricochet Cannon", "Multi-Archer Tower"].includes(item.name)) {
        weight = 2.5; // Prioritize core defenses
      } else if (item.category === "Resources") {
        weight = 1.5; // Moderate priority
      }

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
    }).filter((c): c is NonNullable<typeof c> => c !== null);

    // Sort by: Weight (descending), costRaw (ascending), timeRawSeconds (ascending)
    return candidates
      .sort((a, b) => {
        if (b.weight !== a.weight) return b.weight - a.weight;
        if (a.costRaw !== b.costRaw) return a.costRaw - b.costRaw;
        return a.timeRawSeconds - b.timeRawSeconds;
      })
      .slice(0, 3);
  };

  const suggestions = getSuggestions();

  // 7. Calculate Resources Needed to Max TH
  const getResourcesNeeded = () => {
    let gold = 0;
    let elixir = 0;
    let darkElixir = 0;
    let shinyOre = 0;
    let totalUpgradeSeconds = 0;

    ITEM_TEMPLATES.forEach(item => {
      const maxLvl = getMaxLevelForTH(item, thLevel);
      if (maxLvl <= 0) return;

      const itemLevels = getLevelsArray(item.name, item, thLevel);
      itemLevels.forEach(currLvl => {
        // Sum upgrade costs from currLvl up to maxLvl
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

  const resourcesNeeded = getResourcesNeeded();

  // 8. Player Tag Multi-Step Ingestion Sim
  const handleApiSync = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerTag) return;

    setApiSyncing(true);
    setSyncStep("Searching player tag on Supercell servers...");
    
    setTimeout(() => {
      setSyncStep("Resolving Clash of Clans player endpoints...");
    }, 800);

    setTimeout(() => {
      setSyncStep("Ingesting structures, heroes, and spell levels...");
    }, 1600);

    setTimeout(() => {
      const randomTh = Math.floor(Math.random() * 5) + 12; // TH12 to TH16
      setThLevel(randomTh);
      localStorage.setItem("voltclash_th", randomTh.toString());

      // Create mid-high village profile
      const syncedLevels: Record<string, number[]> = {};
      ITEM_TEMPLATES.forEach(item => {
        const count = getInstanceCount(item, randomTh);
        const maxLvl = getMaxLevelForTH(item, randomTh);
        if (maxLvl <= 0) {
          syncedLevels[item.name] = Array(count).fill(0);
        } else {
          // Add some realistic variation per instance
          const instances = Array.from({ length: count }, () => {
            const randVal = Math.random();
            if (randVal > 0.6) return maxLvl; // maxed
            if (randVal > 0.2) return Math.max(1, maxLvl - 1);
            return Math.max(1, Math.round(maxLvl * 0.75));
          });
          syncedLevels[item.name] = instances;
        }
      });

      // Clear any busy builders to let them start fresh
      saveState(syncedLevels, [], null);

      setApiSyncing(false);
      setIsApiSyncOpen(false);
      showNotify(`API Sync Completed! Imported Player Tag ${playerTag} at Town Hall ${randomTh}.`, "success");
    }, 2500);
  };

  // 9. JSON Import/Upload Logic
  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);

        // Validation checks
        if (typeof data.thLevel !== "number" || !data.levels) {
          showNotify("Invalid JSON backup structure! Missing thLevel or levels.", "error");
          return;
        }

        setThLevel(data.thLevel);
        localStorage.setItem("voltclash_th", data.thLevel.toString());

        // Standardize imported levels
        const importedLevels: Record<string, number[]> = {};
        ITEM_TEMPLATES.forEach(item => {
          const count = getInstanceCount(item, data.thLevel);
          const rawLvl = data.levels[item.name];
          if (Array.isArray(rawLvl)) {
            // Import array directly, clamp and resize if needed
            const maxLvl = getMaxLevelForTH(item, data.thLevel);
            const clamped = rawLvl.map((lvl: number) => Math.max(0, Math.min(maxLvl, lvl)));
            if (clamped.length === count) {
              importedLevels[item.name] = clamped;
            } else if (clamped.length < count) {
              const fill = clamped[0] || 0;
              importedLevels[item.name] = [...clamped, ...Array(count - clamped.length).fill(fill)];
            } else {
              importedLevels[item.name] = clamped.slice(0, count);
            }
          } else {
            // Single level migration import
            const maxLvl = getMaxLevelForTH(item, data.thLevel);
            const singleVal = typeof rawLvl === 'number' ? Math.max(0, Math.min(maxLvl, rawLvl)) : (maxLvl > 0 ? Math.max(1, Math.round(maxLvl * 0.75)) : 0);
            importedLevels[item.name] = Array(count).fill(singleVal);
          }
        });

        // Setup builders & lab if present in file
        const importedBuilders = Array.isArray(data.builders) ? data.builders : [];
        const importedLab = data.labResearch ?? null;

        saveState(importedLevels, importedBuilders, importedLab);
        setIsJsonUploadOpen(false);
        showNotify("Backup successfully uploaded and applied!", "success");
      } catch (err) {
        showNotify("Error parsing uploaded JSON file. Check format.", "error");
      }
    };
    reader.readAsText(file);
  };

  // 10. JSON Export/Download Backup Logic
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
    downloadAnchor.setAttribute("download", `voltclash_backup_th${thLevel}_tag_${playerTag || "village"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotify("Dashboard configuration exported successfully!", "success");
  };

  // Filtering building list
  const getFilteredItems = () => {
    return ITEM_TEMPLATES.filter(item => {
      // Category match
      if (activeTab === "Overview") return false;
      if (activeTab === "Defenses" && item.category !== "Defenses") return false;
      if (activeTab === "Army" && item.category !== "Army") return false;
      if (activeTab === "Resources" && item.category !== "Resources") return false;
      if (activeTab === "Laboratory" && item.category !== "Troops" && item.category !== "Spells") return false;
      if (activeTab === "Heroes & Equipment" && item.category !== "Heroes" && item.category !== "Equipment") return false;
      if (activeTab === "Pets" && item.category !== "Pets") return false;
      if (activeTab === "Traps" && item.category !== "Traps") return false;

      // Search match
      if (searchQuery) {
        return item.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="ad-layout relative antialiased">
      {/* Dynamic Success Notification Banner */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl glass border border-primary/20 animate-fade-in">
          {notification.type === "success" && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
          {notification.type === "info" && <HelpCircle className="w-5 h-5 text-blue-500 shrink-0" />}
          {notification.type === "error" && <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />}
          <span className="text-sm font-bold text-foreground">{notification.message}</span>
        </div>
      )}

      {/* LEFT AD Gutter */}
      <aside className="ad-gutter left-0 bg-background/50 border-r border-border/40 pl-4 pr-1">
        <div className="ad-placeholder shrink-0 select-none">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
            <Sparkles className="w-5 h-5 text-accent animate-pulse" />
          </div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-4">ADVERTISEMENT</span>
          <span className="text-sm font-bold text-foreground leading-tight block mb-2">GOLD PASS STORE</span>
          <p className="text-xs font-medium text-muted-foreground leading-relaxed px-1">
            Unlock instant upgrades & 20% builder boosts. Get safe gems, oof-free packs!
          </p>
          <div className="mt-8 px-4 py-2 bg-primary hover:opacity-90 transition-opacity text-white text-xs font-bold rounded-lg w-full">
            BUY SECURELY
          </div>
          <div className="h-44" />
        </div>
      </aside>

      {/* Main APP Content Area */}
      <div className="flex-1 flex flex-col bg-background max-w-[1400px] mx-auto border-x border-border shadow-2xl relative min-w-0">
        
        {/* Navbar / Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-4 md:px-8 bg-card/20 glass sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="text-white w-5 h-5 fill-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gradient">VoltClash</span>
            </Link>
            <span className="px-2.5 py-0.5 rounded-full bg-accent/15 border border-accent/20 text-xs font-bold text-accent uppercase tracking-widest ml-3 hidden sm:inline-block">
              Tracker Pro
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center hover:bg-muted/80 transition-colors"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>

            <button 
              onClick={() => setIsJsonUploadOpen(true)}
              className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center hover:bg-muted/80 transition-colors"
              title="Upload JSON Village Backup"
            >
              <Upload className="w-4 h-4 text-foreground" />
            </button>

            <button 
              onClick={exportTrackerJson}
              className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center hover:bg-muted/80 transition-colors"
              title="Export JSON Village Backup"
            >
              <Download className="w-4 h-4 text-foreground" />
            </button>

            <button
              onClick={() => setIsApiSyncOpen(true)}
              className="px-4 py-2 bg-primary hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              <RefreshCw className="w-3.5 h-3.5" /> <span>Sync Tag</span>
            </button>
          </div>
        </header>

        {/* Workspace Scroll Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar">
          
          {/* Top Player Tag Header inside the dashboard card block for premium feel */}
          <div className="flex flex-col items-center justify-center gap-2 mb-4 bg-card border border-border/60 p-4 rounded-3xl shadow-sm">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Village Upgrade Profile Tag</span>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 tracking-tight select-all">
                #{playerTag || "Y2J82LCVR"}
              </h1>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(playerTag || "Y2J82LCVR");
                  showNotify("Player tag copied to clipboard!", "success");
                }} 
                className="text-muted-foreground hover:text-foreground p-2 rounded-2xl bg-muted/50 border border-border/60 hover:bg-muted hover:border-border transition-all flex items-center justify-center"
                title="Copy Player Tag"
              >
                <ArrowUpRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Top Visual Town Hall Dashboard Card Grid (Replicates Second Image) */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Horizontal visual Town Hall card overview with premium Fieldset styling */}
            <div className="lg:col-span-4 p-6 rounded-3xl bg-card border border-border grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch animate-fade-in shadow-lg">
              
              {/* Column 1: Current Town Hall & Completion Progress */}
              <fieldset className="border border-border/60 rounded-2xl p-5 relative bg-card/45 shadow-inner flex flex-col justify-between gap-6 pb-6 lg:pb-5 lg:pr-6">
                <legend className="px-3 py-0.5 text-xs font-bold text-blue-500 uppercase tracking-widest bg-background border border-border/60 rounded-full shadow-sm">
                  Current Village Status
                </legend>

                <div className="flex gap-4 items-center">
                  <div className="relative group w-24 h-24 rounded-2xl bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm cursor-pointer" onClick={() => setIsApiSyncOpen(true)}>
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

                {/* Progress bars list (Structures, Lab, Heroes, Equipment, Pets, Walls) */}
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

                {/* API & Upload button under it */}
                <div className="flex gap-3 pt-3 border-t border-border/60 w-full">
                  <button 
                    onClick={() => setIsApiSyncOpen(true)}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-600/10 transition-all border border-blue-500/20"
                  >
                    <RefreshCw className="w-4 h-4 shrink-0" /> API
                  </button>
                  <button 
                    onClick={() => setIsJsonUploadOpen(true)}
                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md shadow-green-600/10 transition-all border border-green-500/20"
                  >
                    <Upload className="w-4 h-4 shrink-0" /> Upload
                  </button>
                </div>
              </fieldset>

              {/* Column 2: Next Town Hall Fieldset */}
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
                    onClick={() => {
                      if (thLevel < 16) {
                        handleTHChange(thLevel + 1);
                      } else {
                        showNotify("Town Hall 16 is the maximum level in this version! Visual simulation of TH17 upgrade complete.", "success");
                      }
                    }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm rounded-xl uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 mt-auto border border-blue-500/20"
                  >
                    ↑ Start TH Upgrade
                  </button>
                </div>
              </fieldset>

              {/* Column 3: Mass Update Controls & Boosts Panel */}
              <fieldset className="border border-border/60 rounded-2xl p-5 relative bg-card/45 shadow-inner flex flex-col justify-between gap-4 lg:pl-6">
                <legend className="px-3 py-0.5 text-xs font-bold text-green-500 uppercase tracking-widest bg-background border border-border/60 rounded-full shadow-sm">
                  Progression & Boosts
                </legend>
                
                {/* Mass Update Box */}
                <div className="relative border border-border/60 rounded-2xl p-4 bg-card/45 shadow-sm space-y-3">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    Mass Update Controls <span className="text-xs font-semibold bg-muted border border-border px-1.5 py-0.25 rounded cursor-help" title="Instantly upgrade all structures or walls to maximum levels for your current TH level.">i</span>
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2.5 text-xs font-bold uppercase tracking-wider">
                    <button 
                      onClick={() => {
                        const updatedLevels = { ...levels };
                        ITEM_TEMPLATES.forEach(item => {
                          const maxLvl = getMaxLevelForTH(item, thLevel);
                          const count = getInstanceCount(item, thLevel);
                          updatedLevels[item.name] = Array(count).fill(maxLvl);
                        });
                        saveState(updatedLevels, builders, labResearch);
                        showNotify("Mass Upgrade complete! All items set to max level for TH " + thLevel + ".", "success");
                      }}
                      className="py-2.5 px-3 bg-green-600 hover:bg-green-700 active:scale-95 text-white rounded-xl text-center shadow-sm border border-green-500/25 flex items-center justify-center gap-1.5 transition-all text-xs font-bold"
                    >
                      Structures
                    </button>
                    <button 
                      onClick={() => {
                        showNotify("All walls upgraded to level max for Town Hall " + thLevel + "!", "success");
                      }}
                      className="py-2.5 px-3 bg-slate-600 hover:bg-slate-700 active:scale-95 text-white rounded-xl text-center border border-slate-500/25 shadow-sm flex items-center justify-center gap-1.5 transition-all text-xs font-bold"
                    >
                      Walls
                    </button>
                  </div>
                </div>

                {/* Village Boosts Box */}
                <div className="relative border border-border/60 rounded-2xl p-4 bg-card/45 shadow-sm flex flex-col justify-between space-y-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    Active Village Boosts <span className="text-xs font-semibold bg-muted border border-border px-1.5 py-0.25 rounded cursor-help" title="Apply virtual potions to boost builders, lab research, or pets speed instantly.">i</span>
                  </span>
                  
                  <div className="grid grid-cols-1 xs:grid-cols-3 gap-1.5 xs:gap-2 text-[10px] xs:text-xs font-semibold uppercase tracking-wider">
                    <button 
                      onClick={() => showNotify("Builder Boost applied! Builder speeds increased by 20% for 1 hour.", "info")}
                      className="py-2 px-1 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-xl flex flex-col items-center justify-center gap-0.5 text-center shadow-sm transition-all border border-blue-400/20 font-medium"
                    >
                      <span>Builder</span>
                      <span className="font-semibold">Boost</span>
                    </button>
                    <button 
                      onClick={() => showNotify("Research Potion applied! Laboratory research speed multiplied by 24x for 1 hour.", "info")}
                      className="py-2 px-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl flex flex-col items-center justify-center gap-0.5 text-center shadow-sm transition-all border border-amber-400/20 font-medium"
                    >
                      <span>Research</span>
                      <span className="font-semibold">Boost</span>
                    </button>
                    <button 
                      onClick={() => showNotify("Pet Potion applied! Pet upgrade speed multiplied by 24x for 1 hour.", "info")}
                      className="py-2 px-1 bg-green-500 hover:bg-green-600 active:scale-95 text-white rounded-xl flex flex-col items-center justify-center gap-0.5 text-center shadow-sm transition-all border border-green-400/20 font-medium"
                    >
                      <span>Pet</span>
                      <span className="font-semibold">Potion</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-border/30 pt-2 text-xs">
                    <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <span>Status:</span>
                      <span className="flex items-center gap-1 text-foreground font-semibold">👷‍♂️ 0%</span>
                      <span className="flex items-center gap-1 text-foreground font-semibold">🧪 0%</span>
                    </div>
                    <button 
                      onClick={() => showNotify("Village boost parameters saved.", "success")}
                      className="px-3.5 py-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-lg text-xs font-semibold uppercase shadow-sm transition-all border border-amber-400/20"
                    >
                      Set
                    </button>
                  </div>
                </div>

              </fieldset>

            </div>

            {/* Immersive Sub-Village Status Board (Replicates Bottom Section of Second Image) */}
            <div className="lg:col-span-4 grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 p-3 bg-muted/30 border border-border/60 rounded-3xl text-xs font-semibold items-center shadow-sm animate-fade-in">
              <div className="flex items-center justify-between gap-2.5 p-3 bg-card rounded-2xl border border-border/40 shadow-sm w-full min-w-0">
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-muted-foreground uppercase leading-none font-medium tracking-wider truncate">Lab Assistant</span>
                  <span className="text-foreground font-semibold mt-1.5 text-xs">Now</span>
                </div>
                <button 
                  onClick={() => showNotify("Assigned Lab Assistant to research slot!", "success")}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold rounded-xl uppercase shadow-sm shrink-0 active:scale-95 transition-all border border-blue-500/20"
                >
                  Assign
                </button>
              </div>

              <div className="flex items-center justify-between gap-2.5 p-3 bg-card rounded-2xl border border-border/40 shadow-sm w-full min-w-0">
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-muted-foreground uppercase leading-none font-medium tracking-wider truncate">Builder's App.</span>
                  <span className="text-red-500 font-semibold mt-1.5 text-xs flex items-center gap-1 shrink-0">🔒 Locked</span>
                </div>
                <button 
                  onClick={() => showNotify("Unlocked Builder's Apprentice slot!", "success")}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold rounded-xl uppercase shadow-sm shrink-0 active:scale-95 transition-all border border-blue-500/20"
                >
                  Unlock
                </button>
              </div>

              <div className="flex items-center justify-between gap-2.5 p-3 bg-card rounded-2xl border border-border/40 shadow-sm w-full min-w-0">
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-muted-foreground uppercase leading-none font-medium tracking-wider truncate">Alchemist</span>
                  <span className="text-red-500 font-semibold mt-1.5 text-xs flex items-center gap-1 shrink-0">🔒 Locked</span>
                </div>
                <button 
                  onClick={() => showNotify("Unlocked Alchemist slot!", "success")}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold rounded-xl uppercase shadow-sm shrink-0 active:scale-95 transition-all border border-blue-500/20"
                >
                  Unlock
                </button>
              </div>

              <div className="flex items-center justify-between gap-2.5 p-3 bg-card rounded-2xl border border-border/40 shadow-sm w-full min-w-0">
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-muted-foreground uppercase leading-none font-medium tracking-wider truncate">Daily Star Bonus</span>
                  <span className="text-foreground font-semibold mt-1.5 text-xs">Now</span>
                </div>
                <div className="flex gap-1 shrink-0 items-center">
                  <button 
                    onClick={() => showNotify("Reset daily star bonus status.", "info")}
                    className="px-2 py-1.5 bg-muted border border-border/60 text-[10px] font-semibold rounded-xl uppercase hover:bg-muted/80 shadow-sm active:scale-95 transition-all text-foreground"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={() => showNotify("Star bonus config options.", "info")}
                    className="p-1.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 shadow-sm active:scale-95 transition-all text-[10px]"
                  >
                    🔧
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2.5 p-3 bg-card rounded-2xl border border-border/40 shadow-sm col-span-1 xs:col-span-2 md:col-span-1 w-full min-w-0">
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-muted-foreground uppercase leading-none font-medium tracking-wider truncate">Daily Capital Gold</span>
                  <span className="text-foreground font-semibold mt-1.5 text-xs">Now</span>
                </div>
                <div className="flex gap-1 shrink-0 items-center">
                  <button 
                    onClick={() => showNotify("Reset daily capital gold status.", "info")}
                    className="px-2 py-1.5 bg-muted border border-border/60 text-[10px] font-semibold rounded-xl uppercase hover:bg-muted/80 shadow-sm active:scale-95 transition-all text-foreground"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={() => showNotify("Capital gold options.", "info")}
                    className="p-1.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 shadow-sm active:scale-95 transition-all text-[10px]"
                  >
                    🔧
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Builder Board & Laboratory Active Slot Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Active Builders Status */}
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
                              onClick={() => cancelUpgrade("builder", b.builderId)}
                              className="text-red-500 hover:text-red-600 font-semibold text-xs uppercase tracking-wider"
                            >
                              Cancel Upgrade
                            </button>
                            <button 
                              onClick={() => finishUpgradeNow("builder", b.builderId)}
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
                        onClick={() => cancelUpgrade("lab", null)}
                        className="text-red-500 hover:text-red-600 font-semibold text-xs uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => finishUpgradeNow("lab", null)}
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

          {/* Interactive tabs navigation */}
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-4 mb-6">
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 md:pb-0 w-full md:w-auto">
                {categories.map((c, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      setActiveTab(c.name);
                      setSearchQuery("");
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all text-xs font-bold ${
                      activeTab === c.name 
                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                        : "bg-muted text-muted-foreground border border-border hover:bg-muted/80"
                    }`}
                  >
                    {c.icon}
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>

              {/* Search filter input */}
              {activeTab !== "Overview" && (
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search items by name..." 
                    className="w-full bg-muted/50 border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* TAB CONTENT: Overview Tab */}
            {activeTab === "Overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                
                {/* Left side: Suggestions & Total Resources Needed */}
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
                              onClick={() => startUpgrade(s.item, s.instanceIndex)}
                              className="w-full py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all"
                            >
                              Upgrade
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Resources Needed to Max Town Hall */}
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

                {/* Right side: Detailed category overview stats list */}
                <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-5">
                  <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Category Completion Grids</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-bold text-xs uppercase text-muted-foreground tracking-wider leading-none">
                        <span>Defenses & Traps</span>
                        <span className="text-foreground">{progressStats.defenses.pct}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border border-border/30">
                        <div className="h-full bg-blue-500" style={{ width: `${progressStats.defenses.pct}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between font-bold text-xs uppercase text-muted-foreground tracking-wider leading-none">
                        <span>Army & Camps</span>
                        <span className="text-foreground">{progressStats.army.pct}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border border-border/30">
                        <div className="h-full bg-pink-500" style={{ width: `${progressStats.army.pct}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between font-bold text-xs uppercase text-muted-foreground tracking-wider leading-none">
                        <span>Resource Buildings</span>
                        <span className="text-foreground">{progressStats.resources.pct}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border border-border/30">
                        <div className="h-full bg-amber-500" style={{ width: `${progressStats.resources.pct}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between font-bold text-xs uppercase text-muted-foreground tracking-wider leading-none">
                        <span>Laboratory Spells & Troops</span>
                        <span className="text-foreground">{progressStats.laboratory.pct}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border border-border/30">
                        <div className="h-full bg-purple-500" style={{ width: `${progressStats.laboratory.pct}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between font-bold text-xs uppercase text-muted-foreground tracking-wider leading-none">
                        <span>Heroes, Equipment & Pets</span>
                        <span className="text-foreground">{progressStats.heroes.pct}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border border-border/30">
                        <div className="h-full bg-orange-500" style={{ width: `${progressStats.heroes.pct}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/30 border border-border/60 rounded-2xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-primary shrink-0" />
                    <p className="text-xs text-muted-foreground leading-normal font-semibold">
                      To begin assigning upgrades, click on any tab above (e.g. Defenses) and assign virtual builders directly to the individual building instances.
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: Grids of upgrade items grouped by name (First Image UI) */}
            {activeTab !== "Overview" && (
              <div className="animate-fade-in">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-16 bg-card border border-border rounded-3xl shadow-sm">
                    <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <h4 className="font-bold text-sm mb-1">No items found matching filter</h4>
                    <p className="text-xs text-muted-foreground">Try clearing your search query or pick a different tab.</p>
                  </div>
                ) : (
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

                      // Format sum values
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

                      const remainingCostStr = formatRemainingNum(totalCostRaw);
                      const remainingTimeStr = formatRemainingTime(totalTimeRaw);

                      return (
                        <div key={idx} className="bg-card border border-border/80 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row items-stretch transition-all hover:shadow-md animate-fade-in">
                          
                          {/* LEFT GROUP BOX (Archer Tower header card slot) */}
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

                            {/* Remaining upgrade summary box (42 Upgrades, 104.6M, etc.) */}
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

                          {/* RIGHT COLUMN (Individual instances lists horizontal rows) */}
                          <div className="flex-1 divide-y divide-border/60 bg-card/10">
                            {itemLevels.map((currLvl, instIdx) => {
                              const isMaxed = currLvl >= maxLvl && !isLocked;
                              const pct = isLocked ? 0 : Math.round((currLvl / maxLvl) * 100);

                              // Check if this instance is upgrading
                              const builderMatch = builders.find(b => b.itemName === item.name && b.instanceIndex === instIdx);
                              const labMatch = labResearch?.itemName === item.name && labResearch.instanceIndex === instIdx ? labResearch : null;
                              const isUpgrading = !!builderMatch || !!labMatch;
                              const remainingSec = builderMatch?.timeRemainingSeconds ?? labMatch?.timeRemainingSeconds ?? 0;

                              // Remaining levels breakdowns
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
                                      setSelectedItem(item);
                                      setSelectedInstanceIndex(instIdx);
                                      setIsLevelEditOpen(true);
                                    }
                                  }}
                                  className={`p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 hover:bg-muted/15 cursor-pointer transition-colors ${
                                    isLocked ? "opacity-35 cursor-not-allowed" : ""
                                  }`}
                                >
                                  {/* Cell 1 & Inline Action Button for Mobile */}
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
                                      {/* Level fraction indicator */}
                                      <div className="text-xs font-semibold text-foreground bg-muted/65 border border-border/40 px-2 py-0.5 rounded-lg shrink-0">
                                        {currLvl}/{maxLvl}
                                      </div>

                                      {/* Mobile action button */}
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

                                  {/* Cell 2: Desktop Action Button Column */}
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

                                  {/* Cell 3: Cost grid & Remaining Level breakdowns */}
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
                                        {/* Multi-column grid of cost and time per level */}
                                        <div className="flex flex-wrap gap-1.5 justify-start items-center">
                                          {remainingLevels.map((rl, index) => (
                                            <div key={index} className="text-[10px] md:text-xs font-medium text-muted-foreground flex items-center gap-1 bg-card border border-border/40 px-2 py-0.5 rounded-lg shadow-sm">
                                              <span className="text-foreground font-semibold">Lvl {rl.lvl}:</span>
                                              <span className="text-accent font-semibold flex items-center gap-0.5 text-[10px] md:text-xs">
                                                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.resource === 'Dark Elixir' ? 'bg-dark-elixir' : item.resource.includes('Ore') ? 'bg-amber-400' : item.resource === 'Elixir' ? 'bg-pink-500' : 'bg-amber-500'}`} /> 
                                                {rl.cost}
                                              </span>
                                              <span className="flex items-center gap-0.5 text-muted-foreground"><Clock className="w-3 h-3" /> {rl.time}</span>
                                            </div>
                                          ))}
                                        </div>

                                        {/* Summary pill spanning full horizontal width */}
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
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* RIGHT AD Gutter */}
      <aside className="ad-gutter right-0 bg-background/50 border-l border-border/40 pl-1 pr-4">
        <div className="ad-placeholder shrink-0 select-none">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-3">
            <Trophy className="w-5 h-5 text-accent animate-bounce" />
          </div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-4">ADVERTISEMENT</span>
          <span className="text-sm font-bold text-foreground leading-tight block mb-2">CLASH GEMS DEALS</span>
          <p className="text-xs font-medium text-muted-foreground leading-relaxed px-1">
            Get 14,000 Gems for instant builder completes. Extra 10% bonus today!
          </p>
          <div className="mt-8 px-4 py-2 bg-amber-500 hover:opacity-90 transition-opacity text-white text-xs font-bold rounded-lg w-full">
            GET 14,000 GEMS
          </div>
          <div className="h-44" />
        </div>
      </aside>

      {/* 1. Modal: Direct Level Editor & Action Panel */}
      {isLevelEditOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-card rounded-3xl border border-border p-6 shadow-2xl space-y-6 relative">
            <button 
              onClick={() => {
                setIsLevelEditOpen(false);
                setSelectedItem(null);
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex gap-4 items-center border-b border-border/50 pb-4">
              <div className="w-16 h-16 bg-muted rounded-2xl border border-border flex items-center justify-center overflow-hidden shrink-0">
                <img 
                  src={getImageUrl(selectedItem.name, getLevelsArray(selectedItem.name, selectedItem, thLevel)[selectedInstanceIndex] || 0)} 
                  alt={selectedItem.name} 
                  className="w-14 h-14 object-contain drop-shadow-md"
                />
              </div>
              <div>
                <span className="text-xs font-bold bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full uppercase tracking-wider">{selectedItem.category}</span>
                <h3 className="font-bold text-lg text-foreground mt-1">{selectedItem.name} #{selectedInstanceIndex + 1}</h3>
              </div>
            </div>

            {/* Slider direct input levels */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-bold text-foreground">
                <span>Set Direct Level</span>
                <span className="px-3 py-1 bg-muted border border-border rounded-xl text-primary font-mono text-xs font-bold">
                  Level {getLevelsArray(selectedItem.name, selectedItem, thLevel)[selectedInstanceIndex] || 0} / {getMaxLevelForTH(selectedItem, thLevel)}
                </span>
              </div>
              <input 
                type="range" 
                min={getMaxLevelForTH(selectedItem, thLevel) === 0 ? 0 : 1}
                max={getMaxLevelForTH(selectedItem, thLevel)}
                value={getLevelsArray(selectedItem.name, selectedItem, thLevel)[selectedInstanceIndex] || 0}
                onChange={(e) => handleDirectLevelChange(parseInt(e.target.value), selectedInstanceIndex)}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                disabled={getMaxLevelForTH(selectedItem, thLevel) === 0}
              />
              <p className="text-xs text-muted-foreground font-bold leading-normal">
                Adjusting the slider will update this specific building instance level instantly without builder consumption.
              </p>
            </div>

            {/* Builder trigger action cost information */}
            {getLevelsArray(selectedItem.name, selectedItem, thLevel)[selectedInstanceIndex] < getMaxLevelForTH(selectedItem, thLevel) && (
              <div className="p-4 bg-muted/40 rounded-2xl border border-border/60 space-y-4">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="font-bold text-muted-foreground">Next Level Upgrade Details:</span>
                  <span className="text-xs font-bold text-primary">Lvl {getLevelsArray(selectedItem.name, selectedItem, thLevel)[selectedInstanceIndex] || 0} → {(getLevelsArray(selectedItem.name, selectedItem, thLevel)[selectedInstanceIndex] || 0) + 1}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                  <div className="p-3 bg-card border border-border/50 rounded-xl space-y-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">UPGRADE COST</span>
                    <span className="text-sm font-bold text-accent flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${selectedItem.resource === 'Dark Elixir' ? 'bg-dark-elixir' : selectedItem.resource.includes('Ore') ? 'bg-amber-400' : selectedItem.resource === 'Elixir' ? 'bg-pink-500' : 'bg-amber-500'}`} /> 
                      {getUpgradeCostAndTime(selectedItem, getLevelsArray(selectedItem.name, selectedItem, thLevel)[selectedInstanceIndex] || 0, getMaxLevelForTH(selectedItem, thLevel)).cost}
                    </span>
                  </div>
                  <div className="p-3 bg-card border border-border/50 rounded-xl space-y-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">UPGRADE TIME</span>
                    <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      {getUpgradeCostAndTime(selectedItem, getLevelsArray(selectedItem.name, selectedItem, thLevel)[selectedInstanceIndex] || 0, getMaxLevelForTH(selectedItem, thLevel)).time}
                    </span>
                  </div>
                </div>

                {/* Confirm builder button */}
                <button 
                  onClick={() => startUpgrade(selectedItem, selectedInstanceIndex)}
                  className="w-full py-3 bg-primary hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  {selectedItem.category === "Equipment" ? "Upgrade Instantly" : "Assign Virtual Builder & Start"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Modal: API Sync Dialog */}
      {isApiSyncOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-card rounded-3xl border border-border p-6 shadow-2xl relative space-y-5">
            <button 
              onClick={() => !apiSyncing && setIsApiSyncOpen(false)}
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
                Connecting directly to Supercell servers fetches your exact building, hero, pet, and spell levels.
              </p>
            </div>

            {apiSyncing ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-foreground font-semibold animate-pulse">{syncStep}</p>
              </div>
            ) : (
              <form onSubmit={handleApiSync} className="space-y-4">
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
      )}

      {/* 3. Modal: JSON Upload Import Dialog */}
      {isJsonUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-card rounded-3xl border border-border p-6 shadow-2xl relative space-y-5">
            <button 
              onClick={() => setIsJsonUploadOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" /> Upload JSON Village Backup
              </h3>
              <p className="text-xs text-muted-foreground leading-normal mt-1.5 font-semibold">
                Select your previously exported VoltClash `.json` backup file to restore your builder slots, structures, and levels instantly.
              </p>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-2xl p-8 text-center cursor-pointer space-y-3 bg-muted/20"
            >
              <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
              <div className="text-xs font-bold text-foreground">Drag and drop file here, or click to browse</div>
              <p className="text-xs text-muted-foreground font-bold">Supports only valid `.json` VoltClash format</p>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".json"
                onChange={handleJsonUpload}
                className="hidden" 
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
