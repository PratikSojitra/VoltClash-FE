"use client";

import { Zap, ArrowLeft, Globe } from "lucide-react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { useState } from "react";
import { useRouter } from "next/navigation";

import api from "@/lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { username, password });
      const data = res.data;

      // Save credentials in session storage / local storage
      localStorage.setItem("voltclash_access_token", data.access_token);
      localStorage.setItem("voltclash_user", JSON.stringify(data.user));

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-12 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-full h-full -z-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-md w-full mx-auto space-y-10">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors mb-4 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to home
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Zap className="text-white w-6 h-6 fill-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">VoltClash</h1>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Welcome back</h2>
              <p className="text-slate-400">Enter your credentials to access your village dashboard.</p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-sm font-medium flex items-center gap-2 animate-pulse">
                <Zap className="w-4 h-4 text-red-500 fill-red-500" />
                {error}
              </div>
            )}

            <Input
              label="Username"
              type="text"
              placeholder="e.g. clasher123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-sm font-medium text-slate-400">Password</label>
                <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-slate-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="gap-2">
              <Globe className="w-4 h-4" /> Google
            </Button>
            <Button variant="outline" className="gap-2">
              <Zap className="w-4 h-4" /> GitHub
            </Button>
          </div>

          <p className="text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Visual / Placeholder */}
      <div className="hidden lg:flex items-center justify-center bg-card/50 border-l border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20" />
        <div className="relative z-10 max-w-lg p-12 text-center space-y-6">
          <div className="w-full aspect-video rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-600 mb-8 overflow-hidden">
            {/* Placeholder Image */}
            <div className="flex flex-col items-center gap-4">
              <Zap className="w-16 h-16 opacity-20" />
              <span className="text-sm font-medium opacity-50 uppercase tracking-widest">Village Preview Placeholder</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold italic text-gradient uppercase tracking-tight">"Efficiency is the ultimate weapon."</h3>
          <p className="text-slate-400 text-lg leading-relaxed leading-relaxed">
            VoltClash helps you optimize every builder second, ensuring your village reaches its full potential faster than ever before.
          </p>
        </div>
      </div>
    </div>
  );
}
