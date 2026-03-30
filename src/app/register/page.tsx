"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRegisterMutation } from "@/store/api/authApi";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye, EyeOff, Loader2, Coffee, Star, Clock,
  ArrowLeft, Sparkles, ChevronRight,
} from "lucide-react";

const PERKS = [
  { icon: Coffee, label: "50+ Handcrafted Beverages", desc: "Curated by master baristas" },
  { icon: Star, label: "Live Order Tracking", desc: "From roast to your hands" },
  { icon: Clock, label: "Express Pickup", desc: "Your brew, ready in 5 min" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [register, { isLoading, error }] = useRegisterMutation();
  const [form, setForm] = useState({
    username: "", givenName: "", familyName: "",
    email: "", phoneNumber: "", password: "", confirm: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [localError, setLocalError] = useState("");
  const [focused, setFocused] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
    onFocus: () => setFocused(key),
    onBlur: () => setFocused(null),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    if (form.password !== form.confirm) { setLocalError("Passwords do not match."); return; }
    if (form.password.length < 6) { setLocalError("Password must be at least 6 characters."); return; }
    try {
      await register({
        username: form.username, email: form.email, password: form.password,
        givenName: form.givenName, familyName: form.familyName,
        phoneNumber: form.phoneNumber || undefined,
      }).unwrap();
      router.push("/menu");
    } catch (err: any) {
      // RTK Query throws the error object — extract a human-readable message
      const msg =
        err?.data?.message ||
        (err?.data?.errors && (Object.values(err.data.errors)[0] as string)) ||
        "Registration failed. Please check your details and try again.";
      setLocalError(msg);
    }
  };

  const fw = (key: string) =>
    `field-wrap${focused === key ? " is-focused" : ""}`;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row text-white font-sans" style={{ background: '#0d0a07' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&family=DM+Mono:wght@400&family=Outfit:wght@300;400;500;600&display=swap');

        .font-serif { font-family:'Cormorant Garamond',serif; }
        .font-mono2 { font-family:'DM Mono',monospace; }
        .font-body  { font-family:'Outfit',sans-serif; }        @keyframes grain { 0%,100%{transform:translate(0,0)} 20%{transform:translate(-4%,-8%)} 60%{transform:translate(8%,6%)} }
        .grain { position:fixed;inset:-200%;width:400%;height:400%;pointer-events:none;z-index:60;opacity:.022;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          animation:grain 1s steps(1) infinite; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .fade-up  { animation:fadeUp .8s cubic-bezier(.16,1,.3,1) both; }
        .delay-1  { animation-delay:.08s; }
        .delay-2  { animation-delay:.18s; }
        .delay-3  { animation-delay:.30s; }

        @keyframes spin20 { to{transform:rotate(360deg);} }
        .spin-ring { animation:spin20 20s linear infinite; }

        /* Animated orbs */
        .reg-orb-1 { position:fixed;top:-140px;left:-140px;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,#d97706 0%,#92400e 60%,transparent 100%);filter:blur(80px);opacity:.35;pointer-events:none;z-index:0;animation:regOrb1 14s ease-in-out infinite; }
        .reg-orb-2 { position:fixed;bottom:-100px;right:-100px;width:420px;height:420px;border-radius:50%;background:radial-gradient(circle,#b45309 0%,#451a03 60%,transparent 100%);filter:blur(80px);opacity:.35;pointer-events:none;z-index:0;animation:regOrb2 18s ease-in-out infinite; }
        .reg-orb-3 { position:fixed;top:50%;left:60%;transform:translate(-50%,-50%);width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,#f59e0b 0%,#92400e 60%,transparent 100%);filter:blur(80px);opacity:.18;pointer-events:none;z-index:0;animation:regOrb3 22s ease-in-out infinite; }
        .reg-grid { position:fixed;inset:0;background-image:linear-gradient(rgba(217,119,6,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(217,119,6,.05) 1px,transparent 1px);background-size:48px 48px;pointer-events:none;z-index:0; }

        @keyframes regOrb1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,30px) scale(1.07)} }
        @keyframes regOrb2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,-40px) scale(1.05)} }
        @keyframes regOrb3 { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.15)} }

        /* Floating coffee beans */
        .reg-beans { position:fixed;inset:0;pointer-events:none;z-index:1; }
        .reg-bean { position:absolute;font-size:1.4rem;opacity:.07;animation:regBeanDrift linear infinite; }
        .rb1{left:5%;animation-duration:20s;animation-delay:0s;top:100%}
        .rb2{left:15%;animation-duration:25s;animation-delay:-4s;top:100%}
        .rb3{left:28%;animation-duration:18s;animation-delay:-8s;top:100%}
        .rb4{left:42%;animation-duration:22s;animation-delay:-2s;top:100%}
        .rb5{left:55%;animation-duration:30s;animation-delay:-12s;top:100%}
        .rb6{left:68%;animation-duration:19s;animation-delay:-6s;top:100%}
        .rb7{left:80%;animation-duration:24s;animation-delay:-10s;top:100%}
        .rb8{left:92%;animation-duration:17s;animation-delay:-3s;top:100%}
        @keyframes regBeanDrift { 0%{transform:translateY(0) rotate(0deg);opacity:0} 5%{opacity:.08} 95%{opacity:.08} 100%{transform:translateY(-110vh) rotate(360deg);opacity:0} }

        .orb-a { position:absolute;top:-10%;right:-6%;width:55%;aspect-ratio:1;background:radial-gradient(circle,rgba(251,191,36,.10) 0%,transparent 68%);border-radius:50%;filter:blur(55px);pointer-events:none; }
        .orb-b { position:absolute;bottom:-5%;left:3%;width:40%;aspect-ratio:1;background:radial-gradient(circle,rgba(217,119,6,.08) 0%,transparent 70%);border-radius:50%;filter:blur(75px);pointer-events:none; }

        .ruled { background-image:repeating-linear-gradient(0deg,transparent,transparent 79px,rgba(255,255,255,0.03) 79px,rgba(255,255,255,0.03) 80px); }

        @keyframes mUp { from{transform:translateY(0)} to{transform:translateY(-50%)} }
        .marquee-v { animation:mUp 24s linear infinite; }

        .perk-row { transition:transform .28s ease; }
        .perk-row:hover { transform:translateX(5px); }
        .perk-icon { transition:background .28s,border-color .28s; }
        .perk-row:hover .perk-icon { background:rgba(200,118,42,.13);border-color:rgba(200,118,42,.35); }

        /* ── Field: dark glass ── */
        .field-wrap {
          position:relative;
          background:rgba(255,255,255,0.08); /* Brighter glass base */
          border:1px solid rgba(255,255,255,0.22);
          border-radius:14px;
          box-shadow: inset 0 2px 5px rgba(0,0,0,0.2);
          transition:all .3s ease;
        }
        .field-wrap.is-focused {
          background:rgba(255,255,255,0.14);
          border-color:rgba(245,158,11,.7);
          box-shadow:0 0 0 3px rgba(245,158,11,.15),0 8px 30px rgba(0,0,0,.4);
        }
        .field-wrap input { 
          color:#fff !important; 
          font-family:'Outfit',sans-serif; 
          font-size:.875rem; 
          background: transparent !important;
        }
        .field-wrap input:focus {
          background: transparent !important;
        }
        .field-wrap input:-webkit-autofill,
        .field-wrap input:-webkit-autofill:hover, 
        .field-wrap input:-webkit-autofill:focus, 
        .field-wrap input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px transparent inset !important;
            -webkit-text-fill-color: white !important;
            transition: background-color 5000s ease-in-out 0s;
            background-color: transparent !important;
        }
        .field-wrap input::placeholder { color:rgba(255,255,255,.25) !important; opacity:1; }

        /* ── CTA button ── */
        .btn-cta {
          background:linear-gradient(135deg, #d97706 0%, #b45309 100%);
          background-size:200% 100%;background-position:0% 0%;
          transition:background-position .5s,transform .25s,box-shadow .25s;
          border-radius:14px;
          box-shadow: 0 4px 24px rgba(217, 119, 6, 0.35);
        }
        .btn-cta:hover:not(:disabled) { background-position:100% 0%;transform:translateY(-2px);box-shadow:0 8px 32px rgba(217, 119, 6, 0.5); }
        .btn-cta:active:not(:disabled) { transform:translateY(0); }

        /* ── Modern Glass Card ── */
        .glass-card {
           background: linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
           backdrop-filter: blur(40px) saturate(1.8);
           -webkit-backdrop-filter: blur(40px) saturate(1.8);
           border: 1px solid rgba(255, 255, 255, 0.15);
           border-top: 1px solid rgba(255, 255, 255, 0.25);
           border-radius: 28px;
           box-shadow:
             0 24px 65px rgba(0, 0, 0, 0.6),
             inset 0 1px 0 rgba(255, 255, 255, 0.1);
           padding: 2.5rem 2.25rem;
        }

        .form-panel::-webkit-scrollbar { width:3px; }
        .form-panel::-webkit-scrollbar-thumb { background:rgba(255,255,255,.12);border-radius:99px; }
      `}</style>

      {/* Fixed background layers */}
      <div className="reg-orb-1" />
      <div className="reg-orb-2" />
      <div className="reg-orb-3" />
      <div className="reg-grid" />

      {/* Floating coffee beans */}
      {mounted && (
        <div className="reg-beans" aria-hidden="true">
          {[1,2,3,4,5,6,7,8].map(n => (
            <div key={n} className={`reg-bean rb${n}`}>☕</div>
          ))}
        </div>
      )}

      <div className="grain" />

      {/* ══════════════════════════════
          LEFT — BRAND PANEL
      ══════════════════════════════ */}
      <div className="relative hidden lg:flex lg:w-[40%] flex-col overflow-hidden border-r border-white/6 ruled">
        <div className="orb-a" /><div className="orb-b" />

        {/* Vertical marquee strip */}
        <div className="absolute left-0 top-0 bottom-0 w-9 overflow-hidden border-r border-white/6 flex items-start justify-center">
          <div className="marquee-v flex flex-col gap-8 py-8">
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i} className="font-mono2 text-[7px] tracking-[.25em] text-white/10 uppercase"
                style={{ writingMode: "vertical-rl" }}>SalSee · 2026</span>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full py-14" style={{ paddingLeft: '4.5rem', paddingRight: '3rem' }}>

          {/* Logo — click to go home */}
          <Link href="/" className="fade-up flex items-center gap-3.5 group w-fit">
            <div className="relative w-11 h-11 flex items-center justify-center">
              <div className="spin-ring absolute inset-0 rounded-full border border-dashed border-amber-700/30" />
              <div className="p-2 bg-(--g-input-bg) rounded-full border border-(--g-input-border) group-hover:bg-white/[0.14] transition-colors"><Logo size="sm" /></div>
            </div>
            <span className="font-serif text-base font-semibold tracking-[.2em] text-white/80 uppercase italic group-hover:text-primary transition-colors">SalSee</span>
          </Link>

          {/* Hero */}
          <div className="fade-up delay-1 max-w-70">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground shadow-sm/6 border border-amber-600/14 mb-8">
              <Sparkles size={8} className="text-primary/55" />
              <span className="font-mono2 text-[7.5px] tracking-[.32em] text-primary/45 uppercase">Join the Collective</span>
            </div>
            <h1 className="font-serif leading-[.88] text-white mb-8" style={{ fontSize: 'clamp(3.4rem,4.5vw,5rem)' }}>
              Begin<br />
              Your <span className="italic text-amber-500">Coffee</span><br />
              <span className="italic text-white">Journey.</span>
            </h1>
            <p className="font-body text-[11.5px] text-white/55 leading-relaxed max-w-50">
              A free account unlocks the full ceremony — from first brew to the last drop.
            </p>
          </div>

          {/* Perks */}
          <div className="fade-up delay-2 space-y-5">
            {PERKS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="perk-row flex items-center gap-4">
                <div className="perk-icon w-9 h-9 rounded-xl bg-(--g-surface-bg) border border-(--g-card-border) flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-primary" />
                </div>
                <div>
                  <p className="font-body text-[10.5px] font-semibold text-white/75 uppercase tracking-[.18em] leading-none">{label}</p>
                  <p className="font-body text-[10px] text-white/45 mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="fade-up delay-3 font-mono2 text-[7.5px] tracking-[.45em] text-white/35 uppercase">
            Roastery Collective · Est. 2026
          </p>
        </div>
      </div>

      {/* ══════════════════════════════
          RIGHT — FORM PANEL
      ══════════════════════════════ */}
      <div className="flex-1 flex flex-col bg-transparent overflow-y-auto form-panel">

        {/* Ambient glow */}
        <div className="pointer-events-none fixed right-0 top-0 w-[55vw] h-screen flex items-center justify-center" style={{ zIndex: 0 }}>
          <div className="w-125 h-125 rounded-full"
            style={{ background: 'radial-gradient(circle,rgba(130,65,8,.08) 0%,transparent 65%)' }} />
        </div>

        {/* Desktop back link */}
        <div className="hidden lg:flex sticky top-0 z-20 justify-end px-8 py-5">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-white/45 hover:text-primary transition-colors font-body text-xs font-medium group"
          >
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </Link>
        </div>

        {/* Mobile nav */}
        <div className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-5 py-3.5 bg-black/60 backdrop-blur-md border-b border-white/6">
          <Link href="/" className="flex items-center gap-1.5 text-white/55 hover:text-white transition-colors font-body text-xs font-medium">
            <ArrowLeft size={13} /> Home
          </Link>
          <Logo size="sm" />
        </div>

        {/* Mobile hero */}
        <div className="lg:hidden px-5 pt-7 pb-6 border-b border-white/6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary text-primary-foreground border border-amber-600/14 mb-3">
            <Sparkles size={8} className="text-primary/55" />
            <span className="font-mono2 text-[7.5px] tracking-[.32em] text-primary/45 uppercase">Join the Collective</span>
          </div>
          <h1 className="font-serif text-[2.6rem] italic text-white leading-tight">
            Begin Your <span className="text-amber-500">Journey.</span>
          </h1>
          <p className="font-body text-xs text-white/80 mt-1.5">A free account unlocks the full ceremony.</p>
        </div>

        {/* ── FORM ── */}
        <div className="relative z-10 flex flex-1 items-center justify-center px-5 py-10 sm:px-10 sm:py-12">
          <div className="w-full max-w-[460px] fade-up glass-card my-auto">

            {/* Desktop heading */}
            <div className="hidden lg:block mb-7 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(217,119,6,0.15)]">
                <Logo size="sm" />
              </div>
              <h2 className="font-serif text-[2.4rem] font-medium text-white leading-tight mb-2 tracking-tight">Create account</h2>
              <p className="font-body text-[13px] text-white/60">Become a member of the Roastery Collective</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Username */}
              <div>
                <label className="block font-body text-[13px] font-semibold text-white/85 mb-1.5">
                  Username <span className="text-primary">*</span>
                </label>
                <div className={fw("username")}>
                  <Input type="text" placeholder="your_username" required minLength={3}
                    className="bg-transparent border-none h-11 px-4 text-white placeholder:text-white/40 focus-visible:ring-0"
                    {...field("username")} />
                </div>
              </div>

              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-body text-[13px] font-semibold text-white/85 mb-1.5">
                    First name <span className="text-primary">*</span>
                  </label>
                  <div className={fw("givenName")}>
                    <Input type="text" placeholder="John" required
                      className="bg-transparent border-none h-11 px-4 text-white placeholder:text-white/40 focus-visible:ring-0"
                      {...field("givenName")} />
                  </div>
                </div>
                <div>
                  <label className="block font-body text-[13px] font-semibold text-white/85 mb-1.5">
                    Last name <span className="text-primary">*</span>
                  </label>
                  <div className={fw("familyName")}>
                    <Input type="text" placeholder="Doe" required
                      className="bg-transparent border-none h-11 px-4 text-white placeholder:text-white/40 focus-visible:ring-0"
                      {...field("familyName")} />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block font-body text-[13px] font-semibold text-white/85 mb-1.5">
                  Email address <span className="text-primary">*</span>
                </label>
                <div className={fw("email")}>
                  <Input type="email" placeholder="you@example.com" autoComplete="email" required
                    className="bg-transparent border-none h-11 px-4 text-white placeholder:text-white/40 focus-visible:ring-0"
                    {...field("email")} />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block font-body text-[13px] font-semibold text-white/85 mb-1.5">
                  Phone number{" "}
                  <span className="font-normal text-white/45 text-[11.5px]">(optional)</span>
                </label>
                <div className={fw("phoneNumber")}>
                  <Input type="tel" placeholder="+66 81 234 5678"
                    className="bg-transparent border-none h-11 px-4 text-white placeholder:text-white/40 focus-visible:ring-0"
                    {...field("phoneNumber")} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block font-body text-[13px] font-semibold text-white/85 mb-1.5">
                  Password <span className="text-primary">*</span>{" "}
                  <span className="font-normal text-white/45 text-[11.5px]">Min. 6 characters</span>
                </label>
                <div className={`${fw("password")} relative`}>
                  <Input
                    type={showPass ? "text" : "password"}
                    placeholder="Create a password"
                    required minLength={6} autoComplete="new-password"
                    className="bg-transparent border-none h-11 px-4 pr-12 text-white placeholder:text-white/40 focus-visible:ring-0"
                    {...field("password")}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/45 hover:text-primary transition-colors"
                    aria-label={showPass ? "Hide password" : "Show password"}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm */}
              <div>
                <label className="block font-body text-[13px] font-semibold text-white/85 mb-1.5">
                  Confirm password <span className="text-primary">*</span>
                </label>
                <div className={fw("confirm")}>
                  <Input
                    type={showPass ? "text" : "password"}
                    placeholder="Repeat your password"
                    required minLength={6} autoComplete="new-password"
                    className="bg-transparent border-none h-11 px-4 text-white placeholder:text-white/40 focus-visible:ring-0"
                    {...field("confirm")}
                  />
                </div>
              </div>

              {/* Error */}
              {localError && (
                <div className="bg-red-500/15 border border-red-400/30 rounded-xl px-4 py-3 fade-up">
                  <p className="font-body text-[13px] text-red-300 font-medium">
                    {localError}
                  </p>
                </div>
              )}

              {/* Submit */}
              <div className="pt-2">
                <Button type="submit" disabled={isLoading}
                  className="btn-cta w-full h-12 text-white font-body font-semibold uppercase tracking-[.25em] text-[11.5px] disabled:opacity-40 disabled:cursor-not-allowed">
                  {isLoading
                    ? <Loader2 className="animate-spin" size={18} />
                    : <span className="flex items-center gap-2">Join the Roastery <ChevronRight size={14} /></span>
                  }
                </Button>
              </div>
            </form>

            <div className="mt-8 flex items-center justify-center">
              <p className="font-body text-[13px] text-white/60">
                Already a member?{" "}
                <Link href="/login" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
