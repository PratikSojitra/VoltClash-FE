"use client";

import { Sparkles, Trophy } from "lucide-react";

interface AdGutterProps {
  showNotify: (msg: string, type?: "success" | "info" | "error") => void;
}

export function LeftAdGutter({ showNotify }: AdGutterProps) {
  return (
    <aside className="ad-gutter left-0 bg-background/50 border-r border-border/40 pl-4 pr-1 hidden xl:block">
      <div className="ad-placeholder shrink-0 select-none">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
          <Sparkles className="w-5 h-5 text-accent animate-pulse" />
        </div>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-4">ADVERTISEMENT</span>
        <span className="text-sm font-bold text-foreground leading-tight block mb-2">GOLD PASS STORE</span>
        <p className="text-xs font-medium text-muted-foreground leading-relaxed px-1">
          Unlock instant upgrades & 20% builder boosts. Get safe gems, oof-free packs!
        </p>
        <button
          onClick={() => showNotify("Redirecting securely to Gold Pass Deals...", "info")}
          className="mt-8 px-4 py-2 bg-primary hover:opacity-90 transition-opacity text-white text-xs font-bold rounded-lg w-full text-center"
        >
          BUY SECURELY
        </button>
        <div className="h-44" />
      </div>
    </aside>
  );
}

export function RightAdGutter({ showNotify }: AdGutterProps) {
  return (
    <aside className="ad-gutter right-0 bg-background/50 border-l border-border/40 pl-1 pr-4 hidden xl:block">
      <div className="ad-placeholder shrink-0 select-none">
        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-3">
          <Trophy className="w-5 h-5 text-accent animate-bounce" />
        </div>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-4">ADVERTISEMENT</span>
        <span className="text-sm font-bold text-foreground leading-tight block mb-2">CLASH GEMS DEALS</span>
        <p className="text-xs font-medium text-muted-foreground leading-relaxed px-1">
          Get 14,000 Gems for instant builder completes. Extra 10% bonus today!
        </p>
        <button
          onClick={() => showNotify("Redirecting securely to Gem Purchase Portal...", "info")}
          className="mt-8 px-4 py-2 bg-amber-500 hover:opacity-90 transition-opacity text-white text-xs font-bold rounded-lg w-full text-center"
        >
          GET 14,000 GEMS
        </button>
        <div className="h-44" />
      </div>
    </aside>
  );
}
