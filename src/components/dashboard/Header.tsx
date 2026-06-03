"use client";

import Link from "next/link";
import { useState } from "react";
import { Zap, Sun, Moon, Upload, Download, RefreshCw, LogOut, ArrowUpRight } from "lucide-react";
import { getImageUrl } from "@/components/trackerData";
import { useRouter } from "next/navigation";

interface HeaderProps {
  theme: "dark" | "light";
  toggleTheme: () => void;
  playerTag: string;
  showNotify: (msg: string, type?: "success" | "info" | "error") => void;
  onOpenSync?: () => void;
  onOpenJsonUpload: () => void;
  onExportJson: () => void;
  onSignOut: () => void;
  playerAccounts: any[];
  onSwitchAccount: (tag: string) => void;
}

export default function Header({
  theme,
  toggleTheme,
  playerTag,
  showNotify,
  onOpenSync,
  onOpenJsonUpload,
  onExportJson,
  onSignOut,
  playerAccounts = [],
  onSwitchAccount,
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  const copyTag = () => {
    if (!playerTag) return;
    navigator.clipboard.writeText(playerTag);
    showNotify("Player tag copied to clipboard!", "success");
  };

  return (
    <div className="w-full space-y-4">
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

        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center hover:bg-muted/80 transition-colors"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          <Link
            href="/dashboard/add-village"
            className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center hover:bg-muted/80 transition-colors"
            title="Add / Import Village via JSON"
          >
            <Upload className="w-4 h-4 text-foreground" />
          </Link>

          <button
            onClick={onExportJson}
            className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center hover:bg-muted/80 transition-colors"
            title="Export JSON Village Backup"
          >
            <Download className="w-4 h-4 text-foreground" />
          </button>

          {/* Switch Village Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/10 border border-blue-500/20"
            >
              <span>↔ Switch Village</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-2xl p-4 space-y-4 z-50 animate-fade-in">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none border-b border-border/40 pb-2">
                  Linked Villages
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                  {playerAccounts.length === 0 ? (
                    <div className="text-center py-4 text-xs font-semibold text-muted-foreground">
                      No linked accounts.
                    </div>
                  ) : (
                    playerAccounts.map((account) => (
                      <div
                        key={account.player_tag}
                        onClick={() => {
                          onSwitchAccount(account.player_tag);
                          setIsDropdownOpen(false);
                        }}
                        className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all hover:bg-muted/65 ${
                          account.player_tag === playerTag
                            ? "border-primary bg-primary/5"
                            : "border-border/60"
                        }`}
                      >
                        {/* Left: TH Image */}
                        <div className="w-10 h-10 bg-muted/60 border border-border/40 rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                          <img
                            src={getImageUrl("Town Hall", account.townhall_level || 16)}
                            alt={`TH ${account.townhall_level}`}
                            className="w-8 h-8 object-contain drop-shadow"
                          />
                        </div>

                        {/* Center: Name & Tag */}
                        <div className="flex-1 min-w-0 px-3 text-left">
                          <div className="font-bold text-xs text-foreground truncate">
                            {account.name}
                          </div>
                          <div className="text-[10px] font-semibold text-muted-foreground truncate leading-tight">
                            {account.player_tag.startsWith("#") ? account.player_tag : `#${account.player_tag}`}
                          </div>
                        </div>

                        {/* Right: Builder Barracks Icon */}
                        <div className="w-10 h-10 bg-muted/60 border border-border/40 rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                          <img
                            src={getImageUrl("Builder Barracks", 12, "builder")}
                            alt="BB 12"
                            className="w-8 h-8 object-contain drop-shadow"
                            onError={(e) => {
                              e.currentTarget.src = getImageUrl("Town Hall", account.townhall_level || 16);
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add New Village Button */}
                <Link
                  href="/dashboard/add-village"
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-green-600/10 border border-green-500/20 transition-all uppercase tracking-wider"
                >
                  + Add New Village
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={onSignOut}
            className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/35 transition-colors shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </header>

      {/* Profile Tag Card */}
      {playerTag && (
        <div className="flex flex-col items-center justify-center gap-2 mb-4 bg-card border border-border/60 p-4 rounded-3xl shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Village Upgrade Profile Tag</span>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 tracking-tight select-all">
              {playerTag.startsWith("#") ? playerTag : `#${playerTag}`}
            </h1>
            <button
              onClick={copyTag}
              className="text-muted-foreground hover:text-foreground p-2 rounded-2xl bg-muted/50 border border-border/60 hover:bg-muted hover:border-border transition-all flex items-center justify-center"
              title="Copy Player Tag"
            >
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

