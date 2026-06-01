"use client";

import { 
  Zap, 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  LogOut, 
  ArrowLeft,
  ChevronRight,
  Monitor,
  Globe
} from "lucide-react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { useTheme } from "../../providers";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="ad-layout">
      {/* Left Ad Gutter */}
      <div className="ad-gutter left-0">
        <div className="ad-placeholder">Space for <br /> Vertical Ad</div>
      </div>

      <div className="flex-1 flex bg-background max-w-[1400px] mx-auto border-x border-border shadow-2xl relative">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border flex flex-col bg-card/20 glass hidden md:flex shrink-0">
          <div className="p-6">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                <Zap className="text-white w-5 h-5 fill-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gradient">VoltClash</span>
            </Link>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            {[
              { icon: <User className="w-4 h-4" />, label: "Profile", active: true },
              { icon: <Bell className="w-4 h-4" />, label: "Notifications" },
              { icon: <Shield className="w-4 h-4" />, label: "Privacy & Security" },
              { icon: <Globe className="w-4 h-4" />, label: "Sync Options" },
            ].map((item, i) => (
              <button 
                key={i} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  item.active 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.icon}
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-border">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden bg-background">
          <header className="h-16 border-b border-border flex items-center px-8 bg-card/20 glass z-10">
            <h1 className="text-lg font-bold">Settings</h1>
          </header>

          <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-12 custom-scrollbar">
            {/* Account Section */}
            <section className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Account Settings</h2>
                <p className="text-sm text-muted-foreground">Manage your personal information and preferences.</p>
              </div>

              <div className="p-6 rounded-3xl bg-card border border-border space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-border">
                  <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                    JD
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold">John Doe</h4>
                    <p className="text-sm text-muted-foreground">john.doe@example.com</p>
                    <Button variant="outline" size="sm" className="h-8 text-xs">Change Avatar</Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Input label="Display Name" defaultValue="John Doe" />
                  <Input label="Email Address" defaultValue="john.doe@example.com" />
                </div>
                <Button className="w-full md:w-auto px-8">Save Changes</Button>
              </div>
            </section>

            {/* Appearance Section */}
            <section className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Appearance</h2>
                <p className="text-sm text-muted-foreground">Customize how VoltClash looks on your screen.</p>
              </div>

              <div className="p-6 rounded-3xl bg-card border border-border space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-primary" /> Theme Mode
                    </h4>
                    <p className="text-sm text-muted-foreground">Switch between light and dark themes.</p>
                  </div>
                  <button 
                    onClick={toggleTheme}
                    className="relative w-14 h-7 rounded-full bg-muted border border-border p-1 transition-all"
                  >
                    <div className={`w-5 h-5 rounded-full bg-primary shadow-sm flex items-center justify-center transition-all ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}`}>
                      {theme === 'dark' ? <Moon className="w-3 h-3 text-white" /> : <Sun className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => theme !== 'light' && toggleTheme()}
                    className={`p-4 rounded-2xl border-2 transition-all space-y-3 text-left ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                  >
                    <div className="h-20 bg-slate-100 rounded-lg border border-slate-200 p-2 space-y-2">
                      <div className="w-full h-2 bg-slate-300 rounded" />
                      <div className="w-2/3 h-2 bg-slate-200 rounded" />
                    </div>
                    <span className="text-sm font-bold">Light Mode</span>
                  </button>
                  <button 
                    onClick={() => theme !== 'dark' && toggleTheme()}
                    className={`p-4 rounded-2xl border-2 transition-all space-y-3 text-left ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                  >
                    <div className="h-20 bg-slate-900 rounded-lg border border-slate-800 p-2 space-y-2">
                      <div className="w-full h-2 bg-slate-700 rounded" />
                      <div className="w-2/3 h-2 bg-slate-800 rounded" />
                    </div>
                    <span className="text-sm font-bold">Dark Mode</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Sync Engine Section */}
            <section className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Game Sync Engine</h2>
                <p className="text-sm text-muted-foreground">Configure how we fetch data from Supercell APIs.</p>
              </div>

              <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Auto-Sync Status</p>
                      <p className="text-xs text-muted-foreground">Enabled • Every 1 hour</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
            </section>

            <div className="pt-8 border-t border-border">
              <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-500/10 gap-2">
                <LogOut className="w-4 h-4" /> Deactivate Account
              </Button>
            </div>
          </div>
        </main>
      </div>

      {/* Right Ad Gutter */}
      <div className="ad-gutter right-0">
        <div className="ad-placeholder">Space for <br /> Vertical Ad</div>
      </div>
    </div>
  );
}
