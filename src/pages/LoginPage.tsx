import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { ArrowLeft, Eye, EyeOff, GraduationCap, LogIn, School, Shield, Users } from "lucide-react";
import { LottieIcon } from "@/components/LottieIcon";

export default function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (login(email, password)) {
      navigate("/dashboard");
    } else {
      setError("Invalid email or password. Try the credentials below.");
    }
  };

  const quickLogin = (email: string, password: string) => {
    if (login(email, password)) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "hsl(201, 100%, 13%)" }}>
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 relative">
        <div className="absolute inset-0 z-0 opacity-20">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
              type="video/mp4"
            />
          </video>
        </div>
        <div className="relative z-10">
          <h1
            className="text-5xl mb-4 animate-fade-rise"
            style={{ fontFamily: "'Instrument Serif', serif", color: "hsl(0,0%,100%)" }}
          >
            Smart Playschool
          </h1>
          <p className="text-lg leading-relaxed max-w-md animate-fade-rise-delay" style={{ color: "hsl(240,4%,66%)" }}>
            A complete management system for playschools. Manage students, attendance, galleries, fees — all in one place.
          </p>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-rise">
          <div className="liquid-glass rounded-2xl p-8">
            <div className="text-center mb-8">
              <div
                className="relative w-14 h-14 rounded-2xl mx-auto mb-4 overflow-hidden flex items-center justify-center border border-white/10"
                style={{ background: "hsla(350,80%,55%,0.25)" }}
              >
                <LottieIcon className="absolute inset-0 w-full h-full opacity-40" loop />
                <School className="relative z-10 h-7 w-7" style={{ color: "hsl(0,0%,100%)" }} strokeWidth={2} aria-hidden />
              </div>
              <h2
                className="text-2xl"
                style={{ fontFamily: "'Instrument Serif', serif", color: "hsl(0,0%,100%)" }}
              >
                Welcome back
              </h2>
              <p className="text-sm mt-1" style={{ color: "hsl(240,4%,66%)" }}>
                Sign in to your account
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "hsl(240,4%,66%)" }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2"
                  style={{
                    background: "hsla(0,0%,100%,0.05)",
                    border: "1px solid hsl(0,0%,18%)",
                    color: "hsl(0,0%,100%)",
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "hsl(240,4%,66%)" }}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 pr-10"
                    style={{
                      background: "hsla(0,0%,100%,0.05)",
                      border: "1px solid hsl(0,0%,18%)",
                      color: "hsl(0,0%,100%)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "hsl(240,4%,66%)" }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs rounded-lg px-3 py-2" style={{ background: "hsla(0,84%,60%,0.15)", color: "hsl(0,84%,60%)" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                style={{ background: "hsl(350,80%,55%)", color: "hsl(0,0%,100%)" }}
              >
                <LogIn size={16} /> Sign In
              </button>
            </form>

            {/* Quick Login */}
            <div className="mt-6 pt-6" style={{ borderTop: "1px solid hsl(0,0%,18%)" }}>
              <p className="text-xs font-medium mb-3" style={{ color: "hsl(240,4%,66%)" }}>Quick Login (Demo)</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Admin", email: "admin@smartplay.com", password: "admin123", color: "hsl(350,80%,55%)", Icon: Shield },
                  { label: "Teacher", email: "teacher@smartplay.com", password: "teacher123", color: "hsl(38,92%,55%)", Icon: GraduationCap },
                  { label: "Parent", email: "parent@smartplay.com", password: "parent123", color: "hsl(142,72%,42%)", Icon: Users },
                ].map((opt) => {
                  const QuickIcon = opt.Icon;
                  return (
                  <button
                    key={opt.label}
                    onClick={() => quickLogin(opt.email, opt.password)}
                    className="py-2 rounded-lg text-xs font-medium transition-transform hover:scale-[1.02] flex items-center justify-center gap-1.5"
                    style={{ background: `${opt.color}20`, color: opt.color }}
                  >
                    <QuickIcon size={14} strokeWidth={2} className="shrink-0" aria-hidden />
                    {opt.label}
                  </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-4 text-xs mx-auto flex items-center justify-center gap-1.5 transition-colors"
            style={{ color: "hsl(240,4%,66%)" }}
          >
            <ArrowLeft size={14} strokeWidth={2} aria-hidden />
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
