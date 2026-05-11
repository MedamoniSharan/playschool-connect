import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { ArrowLeft, Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
  const { login, branches } = useApp();
  const navigate = useNavigate();
  const [branchId, setBranchId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!branchId && branches.length === 1) {
      setBranchId(branches[0].id);
    }
  }, [branches, branchId]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const success = await login(email, password, branchId.trim() || undefined);
    setIsLoading(false);
    if (success) {
      navigate("/dashboard");
    } else {
      setError("Invalid credentials or no access to this campus.");
    }
  };

  const inputCls =
    "min-h-[44px] w-full rounded-xl px-4 py-3 text-base outline-none transition-all focus:ring-2 focus:ring-[hsl(350,80%,55%)]";

  return (
    <div
      className="min-h-[100dvh] flex flex-col lg:flex-row bg-[hsl(201,100%,13%)] pb-[max(1rem,env(safe-area-inset-bottom))]"
      style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
    >
      {/* Brand — mobile header + desktop hero */}
      <div className="relative flex flex-col justify-center px-5 pt-2 pb-6 lg:hidden">
        <div className="relative z-10 text-center">
          <img
            src="/logo.png"
            alt=""
            className="mx-auto mb-3 h-14 w-auto object-contain drop-shadow-md"
          />
          <h1
            className="text-3xl font-normal tracking-tight text-white"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Little Berries
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[hsl(240,4%,66%)]">
            Playschool hub — staff pick a campus; admins may skip to manage all campuses.
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:px-16 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <video autoPlay loop muted playsInline className="h-full w-full object-cover">
            <source
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
              type="video/mp4"
            />
          </video>
        </div>
        <div className="relative z-10">
          <h1
            className="mb-4 text-5xl text-white animate-fade-rise"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Little Berries
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-[hsl(240,4%,66%)] animate-fade-rise-delay">
            Manage students, attendance, galleries, and fees — campus by campus.
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-start lg:justify-center px-4 sm:px-6 pb-8 lg:py-12">
        <div className="mx-auto w-full max-w-md animate-fade-rise">
          <div className="liquid-glass rounded-2xl p-5 sm:p-8">
            <div className="mb-6 hidden text-center lg:block">
              <img
                src="/logo.png"
                alt="Little Berries Logo"
                className="mx-auto mb-4 h-16 w-auto object-contain drop-shadow-md"
              />
              <h2 className="text-2xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
                Welcome back
              </h2>
              <p className="mt-1 text-sm text-[hsl(240,4%,66%)]">Campus optional for admins — teachers and parents should select theirs</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[hsl(240,4%,66%)]">Campus / branch</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className={`${inputCls} appearance-none bg-[hsla(0,0%,100%,0.06)] border border-[hsl(0,0%,22%)] text-white`}
                >
                  <option value="">All campuses (admins) — or pick yours…</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id} className="bg-[hsl(201,40%,15%)]">
                      {b.name}
                    </option>
                  ))}
                </select>
                {branches.length === 0 && (
                  <p className="mt-1 text-xs text-amber-400/90">
                    No campuses listed yet — admins can still sign in to add them under Campuses.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[hsl(240,4%,66%)]">Email</label>
                <input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`${inputCls} bg-[hsla(0,0%,100%,0.05)] border border-[hsl(0,0%,18%)] text-white placeholder:text-[hsl(240,4%,45%)]`}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[hsl(240,4%,66%)]">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputCls} bg-[hsla(0,0%,100%,0.05)] border border-[hsl(0,0%,18%)] pr-11 text-white placeholder:text-[hsl(240,4%,45%)]`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[hsl(240,4%,66%)] active:bg-white/5"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-lg px-3 py-2 text-xs text-[hsl(0,84%,60%)] bg-[hsla(0,84%,60%,0.15)]">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 active:scale-[0.99]"
                style={{ background: "hsl(350,80%,55%)" }}
              >
                <LogIn size={18} /> {isLoading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mx-auto mt-5 flex min-h-[44px] items-center justify-center gap-2 px-4 text-xs text-[hsl(240,4%,66%)] transition-colors hover:text-white"
          >
            <ArrowLeft size={14} strokeWidth={2} aria-hidden />
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
