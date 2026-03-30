"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useResetPasswordMutation } from "@/store/api/authApi";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2
} from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  
  // API Mutations
  const [resetPassword, { isLoading: isResetLoading }] = useResetPasswordMutation();

  // State
  const [step, setStep] = useState<"reset" | "success">("reset");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [localError, setLocalError] = useState("");
  const [focused, setFocused] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    if (newPassword !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setLocalError("Password must meet all rules below.");
      return;
    }
    if (otp.length !== 6) {
      setLocalError("Please enter the 6-digit OTP.");
      return;
    }
    try {
      await resetPassword({ otp, newPassword }).unwrap();
      setStep("success");
    } catch (err: any) {
      const msg = err?.data?.message || "Invalid OTP or request failed.";
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
          <Link href="/forgot-password" className="flex items-center gap-1.5 text-white/55 hover:text-white transition-colors font-body text-xs font-medium group">
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Request OTP
          </Link>
        </div>

        {/* Center Card */}
        <div className="w-full max-w-[440px] fade-up glass-card my-auto">
          
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(217,119,6,0.15)]">
              <Logo size="sm" />
            </div>
            
            {step === "reset" && (
              <>
                <h2 className="font-serif text-[2.2rem] font-medium text-white leading-tight mb-2 tracking-tight">Set Password</h2>
                <p className="font-body text-[13px] text-white/60 px-4">Enter the OTP sent to your email and your new password.</p>
              </>
            )}
            {step === "success" && (
              <>
                <h2 className="font-serif text-[2.2rem] font-medium text-white leading-tight mb-2 tracking-tight">Complete</h2>
                <p className="font-body text-[13px] text-white/60 px-4">Your password has been successfully reset.</p>
              </>
            )}
          </div>

          {step === "reset" && (
            <form onSubmit={handleResetSubmit} className="space-y-4 fade-up">
              <div>
                <label className="block font-body text-[13px] font-semibold text-white/85 mb-1.5">
                  6-Digit OTP <span className="text-primary">*</span>
                </label>
                <div className={fw("otp")}>
                  <Input type="text" placeholder="123456" autoComplete="one-time-code" required maxLength={6} minLength={6}
                    className="bg-transparent border-none h-11 px-4 text-white text-center tracking-[.5em] focus-visible:ring-0"
                    value={otp} onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    onFocus={() => setFocused("otp")} onBlur={() => setFocused(null)} />
                </div>
              </div>

              <div>
                <label className="block font-body text-[13px] font-semibold text-white/85 mb-1.5">
                  New Password <span className="text-primary">*</span>
                </label>
                <div className={`${fw("newPassword")} relative`}>
                  <Input type={showPass ? "text" : "password"} placeholder="Create a new password" required minLength={8}
                    className="bg-transparent border-none h-11 px-4 pr-12 text-white placeholder:text-white/40 focus-visible:ring-0"
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    onFocus={() => setFocused("newPassword")} onBlur={() => setFocused(null)} />
                </div>
                {newPassword.length > 0 && (
                  <ul className="text-[12px] font-body space-y-1.5 mt-3 fade-up">
                    <StrengthHint ok={newPassword.length >= 8} label="At least 8 characters" />
                    <StrengthHint ok={/[A-Z]/.test(newPassword)} label="One uppercase letter" />
                    <StrengthHint ok={/\d/.test(newPassword)} label="One number" />
                  </ul>
                )}
              </div>

              <div>
                <label className="block font-body text-[13px] font-semibold text-white/85 mb-1.5">
                  Confirm Password <span className="text-primary">*</span>
                </label>
                <div className={`${fw("confirmPassword")} relative`}>
                  <Input type={showPass ? "text" : "password"} placeholder="Repeat your password" required minLength={8}
                    className="bg-transparent border-none h-11 px-4 pr-12 text-white placeholder:text-white/40 focus-visible:ring-0"
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocused("confirmPassword")} onBlur={() => setFocused(null)} />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/45 hover:text-primary transition-colors"
                    aria-label={showPass ? "Hide password" : "Show password"}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {localError && (
                <div className="bg-red-500/15 border border-red-400/30 rounded-xl px-4 py-3 fade-up">
                  <p className="font-body text-[12.5px] text-red-300 font-medium leading-relaxed">{localError}</p>
                </div>
              )}

              <div className="pt-2">
                <Button type="submit" disabled={isResetLoading || newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword) || otp.length !== 6 || newPassword !== confirmPassword}
                  className="btn-cta w-full h-12 text-white font-body font-semibold uppercase tracking-[.25em] text-[11.5px] disabled:opacity-40 disabled:cursor-not-allowed">
                  {isResetLoading ? <Loader2 className="animate-spin" size={18} /> : "Update Password"}
                </Button>
              </div>
            </form>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-6 fade-up">
              <CheckCircle2 size={48} className="text-green-500 mb-6" />
              <Link href="/login" className="w-full">
                <Button className="btn-cta w-full h-12 text-white font-body font-semibold uppercase tracking-[.25em] text-[11.5px]">
                  Return to Login
                </Button>
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function StrengthHint({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-2 ${ok ? "text-amber-500" : "text-white/40"} transition-colors duration-300`}>
      <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${ok ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" : "bg-white/20"} transition-all duration-300`} />
      {label}
    </li>
  );
}
