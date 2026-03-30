"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForgotPasswordMutation } from "@/store/api/authApi";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2, ArrowLeft,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  // API Mutations
  const [forgotPassword, { isLoading: isForgotLoading }] = useForgotPasswordMutation();

  // State
  const [email, setEmail] = useState("");
  const [localError, setLocalError] = useState("");
  const [focused, setFocused] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    try {
      await forgotPassword({ email }).unwrap();
      router.push("/reset-password");
    } catch (err: any) {
      const msg = err?.data?.message || err?.data?.errors?.email || "Failed to send OTP. Please check your email and try again.";
      setLocalError(msg);
    }
  };

  const fw = (key: string) => `field-wrap${focused === key ? " is-focused" : ""}`;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row text-white font-sans" style={{ background: '#0d0a07' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&family=DM+Mono:wght@400&family=Outfit:wght@300;400;500;600&display=swap');

        .font-serif { font-family:'Cormorant Garamond',serif; }
        .font-mono2 { font-family:'DM Mono',monospace; }
        .font-body  { font-family:'Outfit',sans-serif; }

        @keyframes grain { 0%,100%{transform:translate(0,0)} 20%{transform:translate(-4%,-8%)} 60%{transform:translate(8%,6%)} }
        .grain { position:fixed;inset:-200%;width:400%;height:400%;pointer-events:none;z-index:60;opacity:.022;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          animation:grain 1s steps(1) infinite; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .fade-up  { animation:fadeUp .8s cubic-bezier(.16,1,.3,1) both; }
        .delay-1  { animation-delay:.08s; }
        .delay-2  { animation-delay:.18s; }
        .delay-3  { animation-delay:.30s; }

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
        @keyframes regBeanDrift { 0%{transform:translateY(0) rotate(0deg);opacity:0} 5%{opacity:.08} 95%{opacity:.08} 100%{transform:translateY(-110vh) rotate(360deg);opacity:0} }

        /* ── Field: dark glass ── */
        .field-wrap {
          position:relative;
          background:rgba(255,255,255,0.08);
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
        .field-wrap input:focus { background: transparent !important; }
        .field-wrap input:-webkit-autofill,
        .field-wrap input:-webkit-autofill:hover, 
        .field-wrap input:-webkit-autofill:focus, 
        .field-wrap input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px transparent inset !important;
            -webkit-text-fill-color: white !important;
            transition: background-color 5000s ease-in-out 0s;
            background-color: transparent !important;
        }
        .field-wrap input::placeholder { color:rgba(255,255,255,.4) !important; opacity:1; }

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
           box-shadow: 0 24px 65px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1);
           padding: 2.5rem 2.25rem;
        }
      `}</style>

      {/* Background elements */}
      <div className="grain" />
      <div className="reg-grid" />
      <div className="reg-orb-1" />
      <div className="reg-orb-2" />
      <div className="reg-orb-3" />

      {mounted && (
        <div className="reg-beans text-amber-700/80">
          <div className="reg-bean rb1">☕</div>
          <div className="reg-bean rb2">☕</div>
          <div className="reg-bean rb3">☕</div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative z-10 w-full flex flex-col justify-center items-center min-h-screen p-5">
        
        {/* Navigation */}
        <div className="absolute top-5 left-5 lg:top-8 lg:left-8">
          <Link href="/login" className="flex items-center gap-1.5 text-white/55 hover:text-white transition-colors font-body text-xs font-medium group">
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Login
          </Link>
        </div>

        {/* Center Card */}
        <div className="w-full max-w-[440px] fade-up glass-card my-auto">
          
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(217,119,6,0.15)]">
              <Logo size="sm" />
            </div>
            
            <>
              <h2 className="font-serif text-[2.2rem] font-medium text-white leading-tight mb-2 tracking-tight">Recovery</h2>
              <p className="font-body text-[13px] text-white/60 px-4">Enter your email and we will send a 6-digit OTP to reset your password.</p>
            </>
          </div>

          <form onSubmit={handleRequestSubmit} className="space-y-4 fade-up">
              <div>
                <label className="block font-body text-[13px] font-semibold text-white/85 mb-1.5">
                  Email Address <span className="text-primary">*</span>
                </label>
                <div className={fw("email")}>
                  <Input type="email" placeholder="you@example.com" required
                    className="bg-transparent border-none h-11 px-4 text-white placeholder:text-white/40 focus-visible:ring-0"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} />
                </div>
              </div>

              {localError && (
                <div className="bg-red-500/15 border border-red-400/30 rounded-xl px-4 py-3 fade-up">
                  <p className="font-body text-[12.5px] text-red-300 font-medium leading-relaxed">{localError}</p>
                </div>
              )}

              <div className="pt-2">
                <Button type="submit" disabled={isForgotLoading}
                  className="btn-cta w-full h-12 text-white font-body font-semibold uppercase tracking-[.25em] text-[11.5px] disabled:opacity-40 disabled:cursor-not-allowed">
                  {isForgotLoading ? <Loader2 className="animate-spin" size={18} /> : "Request Reset"}
                </Button>
              </div>
            </form>

        </div>
      </div>
    </div>
  );
}
