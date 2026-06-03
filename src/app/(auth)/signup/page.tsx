"use client";

import { Zap, ArrowLeft, ShieldCheck, Gamepad2, Info } from "lucide-react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { useState } from "react";
import { useRouter } from "next/navigation";

import api from "@/lib/api";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await api.post("/auth/register", { username, password });

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      const errMsg = err.response?.data?.message;
      setError(
        Array.isArray(errMsg)
          ? errMsg.join(", ")
          : errMsg || err.message || "An error occurred during signup"
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Visual / Info */}
      <div className="hidden lg:flex flex-col justify-center bg-card/50 border-r border-white/5 relative overflow-hidden p-24 space-y-12">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-secondary/10" />
        
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold tracking-tight">Join the Elite <br />Clashers.</h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
              VoltClash is more than just a timer. It's a strategic advantage for your clan.
            </p>
          </div>

          <div className="space-y-6">
            {[
              { icon: <ShieldCheck className="text-primary w-5 h-5" />, title: "Secure Integration", desc: "We use official API keys and never ask for your password." },
              { icon: <Gamepad2 className="text-secondary w-5 h-5" />, title: "Multiple Accounts", desc: "Manage up to 50 villages from a single dashboard." },
              { icon: <Info className="text-accent w-5 h-5" />, title: "Thorough Analytics", desc: "Detailed breakdown of upgrade costs and timeframes." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="mt-1">{item.icon}</div>
                <div>
                  <h4 className="font-bold text-white">{item.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 p-8 rounded-3xl glass space-y-4">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-slate-800 flex items-center justify-center text-xs font-bold">
                U{i}
              </div>
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-background bg-primary flex items-center justify-center text-xs font-bold">
              +1k
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium">Joined by 1,200+ players this month.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full -z-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary/10 blur-[100px] rounded-full" />
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
              <h2 className="text-2xl font-bold">Create an account</h2>
              <p className="text-slate-400">Enter your details to start tracking your progress.</p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSignup}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-sm font-medium flex items-center gap-2 animate-pulse">
                <Zap className="w-4 h-4 text-red-500 fill-red-500" />
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-xl text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500 fill-emerald-500 animate-bounce" />
                {success}
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
            
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <div className="flex items-start gap-3 px-1 pt-2">
              <input type="checkbox" className="mt-1 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/20" id="terms" required />
              <label htmlFor="terms" className="text-xs text-slate-500 leading-normal">
                I agree to the <Link href="#" className="text-primary hover:underline">Terms of Service</Link> and <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>.
              </label>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
