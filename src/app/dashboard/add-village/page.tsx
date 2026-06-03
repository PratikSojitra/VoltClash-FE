"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Zap,
  Upload,
  ClipboardPaste,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Smartphone,
  FileJson,
  Info,
  Loader2,
} from "lucide-react";
import { useTheme } from "../../providers";
import { parseVillageJson } from "@/components/trackerData";
import { useImportJson, useUpdatePlayerLevels, usePlayerTags } from "@/hooks/useClashQuery";

export default function AddVillagePage() {
  const { theme } = useTheme();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [pasteContent, setPasteContent] = useState("");
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error" | "loading"; message: string }>({
    type: "idle",
    message: "No export provided",
  });

  const playerTagsQuery = usePlayerTags();
  const importJsonMutation = useImportJson();
  const updatePlayerLevelsMutation = useUpdatePlayerLevels();

  // Auth guard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("voltclash_access_token");
      if (!token) router.push("/login");
    }
  }, [router]);

  const processJson = async (rawText: string) => {
    if (!rawText.trim()) {
      setStatus({ type: "error", message: "No data provided. Please paste your village export or upload a file." });
      return;
    }

    setStatus({ type: "loading", message: "Parsing village data…" });

    let rawJson: any;
    try {
      rawJson = JSON.parse(rawText);
    } catch {
      setStatus({ type: "error", message: "Invalid JSON format. Please make sure you copied the full village export." });
      return;
    }

    try {
      const parsed = parseVillageJson(rawJson);
      const targetTag = parsed.playerTag;

      if (!targetTag) {
        setStatus({
          type: "error",
          message: 'Your JSON is missing a "playerTag" or "tag" field. Please make sure you export from the in-game Settings → Data Export.',
        });
        return;
      }

      setStatus({ type: "loading", message: "Saving village to VoltClash…" });

      const existingAccounts = playerTagsQuery.data || [];
      const accountExists = existingAccounts.some((a: any) => a.player_tag === targetTag);
      let resolvedTag = targetTag;

      if (!accountExists) {
        const data = await importJsonMutation.mutateAsync({
          playerTag: targetTag,
          name: parsed.name || "Imported Village",
          townHallLevel: parsed.townHallLevel,
          buildings: parsed.buildings.map((b) => ({ name: b.name, level: b.level, village: b.village })),
          troops: [...parsed.troops, ...parsed.spells].map((t) => ({ name: t.name, level: t.level, village: t.village })),
          heroes: parsed.heroes.map((h) => ({ name: h.name, level: h.level, village: h.village })),
        });
        resolvedTag = data.player_tag || targetTag;
      } else {
        await updatePlayerLevelsMutation.mutateAsync({
          playerTag: targetTag,
          buildings: parsed.buildings.map((b) => ({ name: b.name, level: b.level, village: b.village })),
          troops: [...parsed.troops, ...parsed.spells].map((t) => ({ name: t.name, level: t.level, village: t.village })),
          heroes: parsed.heroes.map((h) => ({ name: h.name, level: h.level, village: h.village })),
        });
      }

      localStorage.setItem("voltclash_active_tag", resolvedTag);
      setStatus({
        type: "success",
        message: `Village "${parsed.name || resolvedTag}" successfully imported! Redirecting to dashboard…`,
      });

      setTimeout(() => router.push("/dashboard"), 1800);
    } catch (err: any) {
      setStatus({
        type: "error",
        message: err?.response?.data?.message || err?.message || "Import failed. Please try again.",
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = "";
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setPasteContent(text);
      processJson(text);
    };
    reader.readAsText(file);
  };

  const handlePasteSubmit = () => processJson(pasteContent);

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setPasteContent(text);
      processJson(text);
    } catch {
      setStatus({ type: "error", message: "Clipboard access denied. Please paste manually into the box below." });
    }
  };

  const steps = [
    { num: "1", text: "Open the in-game", bold: "Settings", suffix: " menu (gear icon)" },
    { num: "2", text: "Tap", bold: "More Settings" },
    { num: "3", text: "Scroll to the bottom to", bold: "Data Export", suffix: " and press Copy" },
    { num: "4", text: "Paste your village data below or click", bold: "Paste Village Data" },
  ];

  return (
    <div className={`min-h-screen bg-background antialiased ${theme === "dark" ? "dark" : ""}`}>
      {/* Top Navbar */}
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
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted border border-border text-xs font-bold text-foreground hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8 animate-fade-in">
        {/* Page Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase tracking-wider mb-2">
            <FileJson className="w-3.5 h-3.5" />
            Village Import
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Upload Village Export
          </h1>
          <p className="text-muted-foreground text-sm font-medium max-w-lg mx-auto leading-relaxed">
            Import your Clash of Clans village data to get accurate building levels, troop research, and hero tracking.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Instructions */}
          <div className="bg-card border border-border rounded-3xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-blue-500" />
              </div>
              <h2 className="font-bold text-sm text-foreground">How to get your village data</h2>
            </div>

            <ol className="space-y-3">
              {steps.map((step) => (
                <li key={step.num} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-primary/30">
                    {step.num}
                  </div>
                  <span className="text-xs font-semibold text-foreground leading-relaxed">
                    {step.text}{" "}
                    {step.bold && <strong className="text-primary font-bold">{step.bold}</strong>}
                    {step.suffix}
                  </span>
                </li>
              ))}
            </ol>

            {/* Info callout */}
            <div className="p-3.5 bg-amber-500/8 border border-amber-500/20 rounded-2xl flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 leading-relaxed">
                The official Supercell API does not provide building levels. Use the in-game <strong>Data Export</strong> for the most accurate village data.
              </p>
            </div>

            {/* What gets imported */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">What gets imported</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { emoji: "🏰", label: "Buildings & Defenses" },
                  { emoji: "⚔️", label: "Troops & Spells" },
                  { emoji: "👑", label: "Heroes & Equipment" },
                  { emoji: "🐾", label: "Pets" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 p-2 rounded-xl bg-muted/50 border border-border/60 text-[11px] font-semibold text-foreground"
                  >
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Upload / Paste Area */}
          <div className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-sm flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center">
                <Upload className="w-4 h-4 text-green-500" />
              </div>
              <h2 className="font-bold text-sm text-foreground">Paste or Upload Village Data</h2>
            </div>

            {/* Quick action buttons */}
            <div className="flex gap-2">
              <button
                id="paste-village-btn"
                onClick={handlePasteFromClipboard}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 active:scale-95 text-white text-xs font-bold rounded-2xl shadow-lg shadow-green-600/15 border border-green-500/20 transition-all"
              >
                <ClipboardPaste className="w-4 h-4" />
                Paste Village Data
              </button>
              <button
                id="upload-json-btn"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-3 bg-muted hover:bg-muted/80 border border-border text-foreground text-xs font-bold rounded-2xl flex items-center gap-2 transition-all"
              >
                <Upload className="w-4 h-4" />
                Browse
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Paste textarea */}
            <div className="flex-1 flex flex-col">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                Or paste JSON manually:
              </label>
              <textarea
                ref={textareaRef}
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder={'{\n  "playerTag": "#ABC123",\n  "buildings": [...],\n  ...\n}'}
                className="flex-1 min-h-[200px] w-full bg-muted/40 border border-border rounded-2xl p-3.5 text-[11px] font-mono text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all custom-scrollbar"
                spellCheck={false}
              />
            </div>

            {/* Submit manual paste */}
            {pasteContent && status.type === "idle" && (
              <button
                onClick={handlePasteSubmit}
                className="w-full py-3 bg-primary hover:opacity-90 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
                Import Village Data
              </button>
            )}

            {/* Status Bar */}
            <div
              id="import-status"
              className={`flex items-center gap-2.5 p-3.5 rounded-2xl border text-xs font-semibold transition-all ${
                status.type === "idle"
                  ? "bg-muted/40 border-border text-muted-foreground"
                  : status.type === "loading"
                  ? "bg-primary/8 border-primary/20 text-primary"
                  : status.type === "success"
                  ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
                  : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
              }`}
            >
              {status.type === "idle" && <Info className="w-4 h-4 shrink-0" />}
              {status.type === "loading" && <Loader2 className="w-4 h-4 shrink-0 animate-spin" />}
              {status.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0" />}
              {status.type === "error" && <AlertCircle className="w-4 h-4 shrink-0" />}
              <span className="leading-relaxed">{status.message}</span>
            </div>
          </div>
        </div>

        {/* Drag & Drop full area */}
        <div
          className="border-2 border-dashed border-border hover:border-primary/40 rounded-3xl p-10 text-center cursor-pointer transition-all group bg-muted/10 hover:bg-primary/3"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
              const text = ev.target?.result as string;
              setPasteContent(text);
              processJson(text);
            };
            reader.readAsText(file);
          }}
        >
          <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary mx-auto mb-3 transition-colors" />
          <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
            Drag and drop your JSON file here
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Supports Clash of Clans game client export and VoltClash backup format
          </p>
        </div>
      </main>
    </div>
  );
}
