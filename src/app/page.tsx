"use client";

import { 
  Zap, 
  Clock, 
  BarChart3, 
  Shield, 
  ArrowRight, 
  LayoutDashboard,
  RefreshCw,
  Moon,
  Sun
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "./providers";

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-background">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 glass">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="text-white w-5 h-5 fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">VoltClash</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-primary transition-colors">How it Works</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
            <Link href="/signup" className="px-5 py-2 bg-primary hover:opacity-90 text-primary-foreground rounded-full text-sm font-bold transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 blur-[120px] rounded-full" />
        </div>
        
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                <Zap className="w-3 h-3" />
                Live Sync Powered
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
                Master Your <br />
                <span className="text-gradient">Village Progress</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                The ultimate progress tracker for Clash of Clans. Live builder timers, 
                automatic level detection, and time-to-max analytics.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-xl shadow-primary/20">
                  Launch Dashboard <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="#demo" className="w-full sm:w-auto px-8 py-4 bg-muted border border-border text-foreground rounded-2xl font-bold hover:bg-muted/80 transition-colors">
                  View Demo
                </Link>
              </div>
            </div>
            
            <div className="flex-1 relative w-full max-w-2xl">
              <div className="relative z-10 rounded-3xl border border-border overflow-hidden shadow-2xl shadow-primary/10">
                <Image 
                  src="/hero_dashboard_mockup_1778489461456.png" 
                  alt="VoltClash Dashboard Preview" 
                  width={800} 
                  height={600} 
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/30 blur-[80px] -z-10" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/30 blur-[80px] -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl lg:text-5xl font-bold">Built for Strategic Players</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stop guessing when your next builder is free. Get real-time insights and plan your upgrades months in advance.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <LayoutDashboard className="w-6 h-6" />,
                title: "Live Sync Engine",
                desc: "Connect your player tag and see your village data update automatically with the Supercell API."
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Virtual Builders",
                desc: "Manage all 6 builders with accurate countdown timers adjusted for Gold Pass & Potions."
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: "Time-to-Max",
                desc: "Visualize exactly how long it will take to reach the next Town Hall level with detailed charts."
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-3xl bg-card border border-border hover:border-primary/50 transition-colors group">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { val: "20k+", label: "Active Clashers" },
              { val: "1M+", label: "Upgrades Tracked" },
              { val: "99.9%", label: "Uptime" },
              { val: "TH16", label: "Ready" }
            ].map((stat, i) => (
              <div key={i} className="text-center space-y-2">
                <div className="text-4xl font-extrabold text-primary">{stat.val}</div>
                <div className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <Zap className="text-primary w-5 h-5 fill-primary" />
            <span className="text-lg font-bold">VoltClash</span>
          </div>
          <p className="text-muted-foreground text-xs text-center md:text-left max-w-md">
            © 2026 VoltClash. This content is not affiliated with, endorsed, sponsored, or specifically approved by Supercell.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Twitter</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Discord</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
