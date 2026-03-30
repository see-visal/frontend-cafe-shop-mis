/**
 * HomeStyles — injects all CSS keyframes & utility classes used by the home page.
 * Render this once at the top of the home page layout.
 */
export function HomeStyles() {
    return (
        <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&display=swap');

      .font-display { font-family: 'Playfair Display', Georgia, serif; }

      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(28px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes slideDown {
        from { opacity: 0; transform: translateY(-12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes shimmer {
        0%   { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50%       { transform: translateY(-12px) rotate(2deg); }
      }
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 20px rgba(217, 119, 6, 0.30); }
        50%       { box-shadow: 0 0 40px rgba(217, 119, 6, 0.55); }
      }

      .animate-fade-up    { animation: fadeUp    0.7s cubic-bezier(.22,1,.36,1) both; }
      .animate-fade-in    { animation: fadeIn    0.6s ease both; }
      .animate-slide-down { animation: slideDown 0.35s cubic-bezier(.22,1,.36,1) both; }
      .delay-100 { animation-delay: 0.1s; }
      .delay-200 { animation-delay: 0.2s; }
      .delay-300 { animation-delay: 0.3s; }
      .delay-400 { animation-delay: 0.4s; }

      .shimmer-text {
        background: linear-gradient(
          90deg,
          #d97706 0%, #b45309 25%, #fbbf24 50%, #b45309 75%, #d97706 100%
        );
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: shimmer 4s linear infinite;
      }

      .card-hover {
        transition: transform 0.4s cubic-bezier(.22,1,.36,1), box-shadow 0.4s ease;
      }
      .card-hover:hover {
        transform: translateY(-6px);
        box-shadow: 0 32px 64px rgba(0,0,0,0.12);
      }

      .nav-link::after {
        content: '';
        display: block;
        height: 1px;
        width: 0;
        background: linear-gradient(90deg, var(--primary), var(--primary));
        transition: width 0.3s ease;
        margin-top: 2px;
      }
      .nav-link:hover::after { width: 100%; }

      .grain {
        position: fixed; inset: 0; pointer-events: none; z-index: 9999;
        opacity: 0.02;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      }

      .order-btn {
        background: linear-gradient(135deg, var(--primary), var(--primary));
        transition: all 0.3s ease;
        animation: pulse-glow 3s ease-in-out infinite;
      }
      .order-btn:hover {
        background: linear-gradient(135deg, var(--primary), var(--primary));
        transform: translateY(-1px);
        box-shadow: 0 12px 32px rgba(217, 119, 6, 0.45);
        animation: none;
      }

      .emoji-float { animation: float 6s ease-in-out infinite; }

      .divider-line {
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.08), transparent);
      }

      /* ── Home page scoped CSS token overrides ────────────── */
      .home-page {
        --primary: #d97706;
        --primary-foreground: #ffffff;
        --foreground: #1a0a03;
        --background: #ffffff;
        --g-muted-text: rgba(30, 15, 5, 0.62);
        --g-card-bg: rgba(255, 255, 255, 0.80);
        --g-card-bg-hover: rgba(255, 255, 255, 0.95);
        --g-card-border: rgba(0, 0, 0, 0.08);
        --g-soft-bg: rgba(255, 255, 255, 0.32);
        --g-soft-bg-strong: rgba(255, 255, 255, 0.52);
        --g-soft-border: rgba(255, 255, 255, 0.48);
        --nb-brand-color: rgba(26, 16, 4, 0.92);
        --nb-link-color: rgba(42, 27, 7, 0.74);
        --nb-link-hover: rgba(17, 9, 2, 0.95);
        --nb-login-border: rgba(180, 140, 80, 0.30);
        --nb-login-color: rgba(78, 53, 18, 0.76);
        --nb-login-hover-bg: rgba(217, 119, 6, 0.08);
        --nb-login-hover-border: rgba(217, 119, 6, 0.46);
        --nb-login-hover-color: rgba(18, 10, 2, 0.92);
        --nb-rule: rgba(0, 0, 0, 0.13);
        --nb-ham-bg: rgba(255, 255, 255, 0.62);
        --nb-ham-border: rgba(0, 0, 0, 0.10);
        --nb-ham-color: rgba(42, 27, 7, 0.78);
        --nb-ham-active-bg: rgba(255, 255, 255, 0.82);
        --nb-ham-active-border: rgba(0, 0, 0, 0.16);
        --nb-ham-active-color: rgba(22, 12, 3, 0.9);
        --nb-scrolled-bg: rgba(253, 249, 243, 0.9);
        --nb-scrolled-border: rgba(180, 140, 80, 0.24);
        --nb-drawer-bg: rgba(253, 249, 243, 0.96);
        --nb-drawer-border: rgba(180, 140, 80, 0.2);
        --nb-mlink-color: rgba(70, 47, 14, 0.78);
        --nb-mlink-hover-bg: rgba(0, 0, 0, 0.04);
        --nb-mlink-hover-border: rgba(0, 0, 0, 0.08);
        --nb-mlink-hover-color: rgba(20, 10, 0, 0.92);
        --nb-section-border: rgba(0, 0, 0, 0.09);
        --nb-shell-bg: rgba(255, 255, 255, 0.72);
        --nb-shell-border: rgba(180, 140, 80, 0.24);
        --nb-shell-shadow: 0 8px 28px rgba(36, 22, 6, 0.14);
        /* Navbar vars — light page overrides */
        --nav-link: rgba(35, 26, 14, 0.68);
        --nav-link-hover: rgba(35, 26, 14, 0.96);
        --nav-scrolled-bg: rgba(255, 255, 255, 0.92);
        --nav-border: rgba(0, 0, 0, 0.08);
        --nav-hover-bg: rgba(0, 0, 0, 0.04);
        --nav-mobile-bg: rgba(255, 255, 255, 0.98);
        /* Hero background system (easy to tune) */
        --hero-bg: linear-gradient(135deg, #ffffff 0%, #fef9f0 55%, #ffffff 100%);
        --hero-overlay: radial-gradient(ellipse at 18% 18%, rgba(240, 214, 160, 0.28) 0%, transparent 60%);
        --hero-overlay-2: radial-gradient(ellipse at 80% 24%, rgba(123, 153, 113, 0.12) 0%, transparent 55%);
        --hero-orb: rgba(255, 255, 255, 0.50);
        --hero-heading-main: #2a1408;
        --hero-heading-accent: #c77717;
        --hero-body-text: rgba(42, 20, 8, 0.76);
        --hero-secondary-bg: rgba(255, 255, 255, 0.72);
        --hero-secondary-border: rgba(28, 14, 4, 0.10);
        --hero-secondary-text: rgba(42, 20, 8, 0.88);
        --hero-spark: rgba(42, 20, 8, 0.20);
        --hero-spark-shadow: rgba(42, 20, 8, 0.16);
        --hero-corner-star: linear-gradient(145deg, rgba(42,20,8,0.82), rgba(199,119,23,0.36));
        --special-panel-bg: linear-gradient(135deg, rgba(255,248,232,0.92) 0%, rgba(255,255,255,0.92) 48%, rgba(245,158,11,0.10) 100%);
        --special-panel-shadow: 0 16px 48px rgba(31, 20, 8, 0.08);
        --special-chip-bg: rgba(255,255,255,0.75);
      }

      html.dark .home-page {
        --foreground: rgba(255, 255, 255, 0.92);
        --background: #0d0b14;
        --g-muted-text: rgba(255, 255, 255, 0.62);
        --g-card-bg: rgba(255, 255, 255, 0.08);
        --g-card-bg-hover: rgba(255, 255, 255, 0.12);
        --g-card-border: rgba(255, 255, 255, 0.16);
        --g-soft-bg: rgba(255, 255, 255, 0.12);
        --g-soft-bg-strong: rgba(255, 255, 255, 0.16);
        --g-soft-border: rgba(255, 255, 255, 0.18);
        --nb-brand-color: rgba(255, 255, 255, 0.95);
        --nb-link-color: rgba(255, 255, 255, 0.72);
        --nb-link-hover: rgba(255, 255, 255, 0.96);
        --nb-login-border: rgba(255, 255, 255, 0.20);
        --nb-login-color: rgba(255, 255, 255, 0.76);
        --nb-login-hover-bg: rgba(217, 119, 6, 0.14);
        --nb-login-hover-border: rgba(217, 119, 6, 0.52);
        --nb-login-hover-color: rgba(255, 255, 255, 0.95);
        --nb-rule: rgba(255, 255, 255, 0.18);
        --nb-ham-bg: rgba(255, 255, 255, 0.06);
        --nb-ham-border: rgba(255, 255, 255, 0.14);
        --nb-ham-color: rgba(255, 255, 255, 0.84);
        --nb-ham-active-bg: rgba(255, 255, 255, 0.12);
        --nb-ham-active-border: rgba(255, 255, 255, 0.22);
        --nb-ham-active-color: rgba(255, 255, 255, 0.96);
        --nb-scrolled-bg: rgba(13, 11, 20, 0.88);
        --nb-scrolled-border: rgba(255, 255, 255, 0.14);
        --nb-drawer-bg: rgba(16, 13, 26, 0.96);
        --nb-drawer-border: rgba(255, 255, 255, 0.10);
        --nb-mlink-color: rgba(255, 255, 255, 0.78);
        --nb-mlink-hover-bg: rgba(255, 255, 255, 0.08);
        --nb-mlink-hover-border: rgba(255, 255, 255, 0.14);
        --nb-mlink-hover-color: rgba(255, 255, 255, 0.96);
        --nb-section-border: rgba(255, 255, 255, 0.12);
        --nb-shell-bg: rgba(255, 255, 255, 0.08);
        --nb-shell-border: rgba(255, 255, 255, 0.16);
        --nb-shell-shadow: 0 10px 30px rgba(0, 0, 0, 0.38);
        --hero-bg: linear-gradient(140deg, #0d0b14 0%, #141123 55%, #0d0b14 100%);
        --hero-overlay: radial-gradient(ellipse at 18% 18%, rgba(217, 119, 6, 0.20) 0%, transparent 60%);
        --hero-overlay-2: radial-gradient(ellipse at 80% 24%, rgba(124, 87, 184, 0.18) 0%, transparent 55%);
        --hero-orb: rgba(93, 60, 150, 0.25);
        --hero-heading-main: #f8f1eb;
        --hero-heading-accent: #d88a2d;
        --hero-body-text: rgba(244,236,229,0.80);
        --hero-secondary-bg: rgba(255,255,255,0.10);
        --hero-secondary-border: rgba(255,255,255,0.12);
        --hero-secondary-text: #f7f0ea;
        --hero-spark: rgba(255,255,255,0.42);
        --hero-spark-shadow: rgba(255,255,255,0.30);
        --hero-corner-star: linear-gradient(145deg, rgba(255,255,255,0.92), rgba(230,225,236,0.72));
        --special-panel-bg: linear-gradient(135deg, rgba(28,22,34,0.94) 0%, rgba(20,16,28,0.96) 48%, rgba(217,119,6,0.16) 100%);
        --special-panel-shadow: 0 18px 52px rgba(0, 0, 0, 0.34);
        --special-chip-bg: rgba(255,255,255,0.12);
      }
    `}</style>
    );
}
