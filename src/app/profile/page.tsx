"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    useGetProfileQuery,
    useUpdateProfileMutation,
    useUpdateNotificationPreferenceMutation,
} from "@/store/api/profileApi";
import { useLogoutMutation } from "@/store/api/authApi";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveStorageUrl } from "@/lib/storage";
import { Save, Loader2, CheckCircle2, LogOut, ShoppingBag, ImageIcon, Bell, Star } from "lucide-react";

export default function ProfilePage() {
    const isAuthenticated = useAuthGuard();
    const { data: profile, isLoading } = useGetProfileQuery();
    const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation();
    const [updateNotificationPreference, { isLoading: savingNotification }] = useUpdateNotificationPreferenceMutation();
    const [logout] = useLogoutMutation();
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [notificationPreference, setNotificationPreference] = useState<"IN_APP" | "TELEGRAM">("IN_APP");
    const [notificationSaved, setNotificationSaved] = useState(false);
    const [notificationError, setNotificationError] = useState<string | null>(null);
    const [form, setForm] = useState({
        givenName: "", familyName: "", phoneNumber: "", gender: "", dob: "",
        profileImage: "", coverImage: "",
    });

    useEffect(() => {
        if (profile) {
            setForm({
                givenName:    profile.givenName    ?? "",
                familyName:   profile.familyName   ?? "",
                phoneNumber:  profile.phoneNumber  ?? "",
                gender:       profile.gender       ?? "",
                dob:          profile.dob          ?? "",
                profileImage: profile.profileImage ?? "",
                coverImage:   profile.coverImage   ?? "",
            });

            if (profile.notificationPreference === "TELEGRAM") {
                setNotificationPreference("TELEGRAM");
            } else {
                setNotificationPreference("IN_APP");
            }
        }
    }, [profile]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveError(null);
        try {
            await updateProfile({
                givenName:    form.givenName    || undefined,
                familyName:   form.familyName   || undefined,
                phoneNumber:  form.phoneNumber  || undefined,
                gender:       form.gender       || undefined,
                dob:          form.dob          || null,
                profileImage: form.profileImage || undefined,
                coverImage:   form.coverImage   || undefined,
            }).unwrap();
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err: unknown) {
            const msg = (err as { data?: { message?: string } })?.data?.message;
            setSaveError(msg ?? "Failed to save profile.");
        }
    };

    const handleSaveNotification = async () => {
        setNotificationError(null);
        try {
            await updateNotificationPreference({ preference: notificationPreference }).unwrap();
            setNotificationSaved(true);
            setTimeout(() => setNotificationSaved(false), 2500);
        } catch (err: unknown) {
            const msg = (err as { data?: { message?: string } })?.data?.message;
            setNotificationError(msg ?? "Failed to save notification preference.");
        }
    };

    if (!isAuthenticated) return null;

    const f = (key: keyof typeof form) => ({
        value: form[key],
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((prev) => ({ ...prev, [key]: e.target.value })),
    });

    const displayName = [profile?.givenName, profile?.familyName].filter(Boolean).join(" ") || profile?.username || "";
    const initials = `${profile?.givenName?.[0] ?? profile?.username?.[0] ?? "?"}${profile?.familyName?.[0] ?? ""}`.toUpperCase();
    const profileImageUrl = resolveStorageUrl(profile?.profileImage);
    const coverImageUrl = resolveStorageUrl(profile?.coverImage);
    const accountFacts = [
        { label: "Phone", value: profile?.phoneNumber || "Not added yet" },
        { label: "Gender", value: profile?.gender || "Not specified" },
        { label: "Birthday", value: profile?.dob ? new Date(profile.dob).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Not added yet" },
        { label: "Alerts", value: profile?.notificationPreference === "TELEGRAM" ? "Telegram" : "In-App" },
    ];

    return (
        <div className="min-h-screen" style={{ background: "var(--background)" }}>
            <AppHeader
                backHref="/menu"
                backLabel="Menu"
                title="Profile"
                className="border-(--g-card-border) bg-(--g-surface-bg)"
                right={
                    <Button variant="outline" size="sm"
                        className="border-red-500/30 text-red-600 hover:bg-red-500/10 hover:text-red-700"
                        onClick={() => logout()}>
                        <LogOut size={13} /> Sign Out
                    </Button>
                }
            />

            <main className="mx-auto max-w-xl px-4 pb-12 pt-6 sm:px-6">
                {isLoading ? (
                    <div className="flex flex-col items-center gap-4 py-28">
                        <Loader2 size={36} className="animate-spin text-primary" />
                        <p className="text-sm text-foreground/70">Loading profile</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/*  Profile hero  */}
                        <div className="overflow-hidden rounded-2xl border shadow-sm backdrop-blur-xl" style={{ background: "var(--g-elevated-bg)", borderColor: "var(--g-card-border)" }}>
                            {/* Cover */}
                            <div
                                className="h-28 bg-linear-to-br from-amber-400 via-orange-500 to-amber-700"
                                style={coverImageUrl ? {
                                    backgroundImage: `url(${coverImageUrl})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center"
                                } : {}}
                            />
                            {/* Avatar + info */}
                            <div className="relative px-5 pb-5">
                                <div className="flex items-end justify-between gap-3">
                                    <div className="-mt-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-primary/15 text-2xl font-bold text-primary shadow-sm overflow-hidden">
                                        {profileImageUrl ? (
                                            <Image src={profileImageUrl} alt="avatar" width={80} height={80} className="h-full w-full object-cover" />
                                        ) : initials}
                                    </div>
                                    <Link href="/orders"
                                        className="mb-1 flex items-center gap-1.5 rounded-xl border border-border bg-(--g-surface-bg) px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-(--g-surface-hover)">
                                        <ShoppingBag size={12} /> My Orders
                                    </Link>
                                </div>

                                <div className="mt-3">
                                    <p className="text-lg font-extrabold text-foreground">{displayName}</p>
                                    <p className="text-sm text-foreground/70">
                                        @{profile?.username}
                                        {profile?.email && <span className="ml-2">• {profile.email}</span>}
                                    </p>
                                    {profile?.roles && profile.roles.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {profile.roles.map((r) => (
                                                <span key={r} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                                                    {r}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        {accountFacts.map((fact) => (
                                            <div key={fact.label} className="rounded-xl border border-(--g-card-border) bg-(--g-surface-bg) px-3 py-2">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/55">{fact.label}</p>
                                                <p className="mt-1 text-sm font-medium text-foreground">{fact.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border p-6 shadow-sm backdrop-blur-xl" style={{ background: "var(--g-elevated-bg)", borderColor: "var(--g-card-border)" }}>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Star size={14} />
                                        <p className="text-xs font-bold uppercase tracking-widest">Loyalty Points</p>
                                    </div>
                                    <p className="mt-2 text-2xl font-extrabold text-foreground">{profile?.loyaltyPoints ?? 0}</p>
                                    <p className="text-xs text-foreground/68">Earn 1 point per $1 spent after served orders.</p>
                                </div>

                                <div className="rounded-2xl border border-border bg-(--g-surface-bg) p-4">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Bell size={14} />
                                        <p className="text-xs font-bold uppercase tracking-widest">Notifications</p>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setNotificationPreference("IN_APP")}
                                            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${notificationPreference === "IN_APP" ? "bg-primary text-white" : "bg-background text-foreground/70 hover:bg-muted"}`}
                                        >
                                            In-App
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNotificationPreference("TELEGRAM")}
                                            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${notificationPreference === "TELEGRAM" ? "bg-primary text-white" : "bg-background text-foreground/70 hover:bg-muted"}`}
                                        >
                                            Telegram
                                        </button>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSaveNotification}
                                        disabled={savingNotification}
                                        className="mt-3"
                                    >
                                        {savingNotification ? <Loader2 size={13} className="animate-spin" /> : <Bell size={13} />}
                                        {notificationSaved ? "Saved" : "Save Preference"}
                                    </Button>
                                    {notificationError && (
                                        <p className="mt-2 text-xs text-red-400">{notificationError}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/*  Edit form  */}
                        <div className="rounded-2xl border p-6 shadow-sm backdrop-blur-xl" style={{ background: "var(--g-elevated-bg)", borderColor: "var(--g-card-border)" }}>
                            <h2 className="mb-5 font-bold text-foreground">Edit Profile</h2>
                            <form onSubmit={handleSave} className="space-y-4">
                                {/* Name row */}
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold uppercase tracking-wide text-foreground/65">First Name</label>
                                        <Input type="text" {...f("givenName")} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold uppercase tracking-wide text-foreground/65">Last Name</label>
                                        <Input type="text" {...f("familyName")} />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold uppercase tracking-wide text-foreground/65">Phone Number</label>
                                    <Input type="tel" placeholder="+66 8x xxx xxxx" {...f("phoneNumber")} />
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold uppercase tracking-wide text-foreground/65">Gender</label>
                                        <select
                                            value={form.gender}
                                            onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}
                                            className="h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-amber-500/15 dark:bg-white/5"
                                        >
                                            <option value="">Not specified</option>
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold uppercase tracking-wide text-foreground/65">Date of Birth</label>
                                        <Input type="date" {...f("dob")} />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/65">
                                        <ImageIcon size={11} /> Profile Image URL
                                    </label>
                                    <Input type="url" placeholder="https://" {...f("profileImage")} />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/65">
                                        <ImageIcon size={11} /> Cover Image URL
                                    </label>
                                    <Input type="url" placeholder="https://" {...f("coverImage")} />
                                </div>

                                {saveError && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                         {saveError}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className={`h-11 w-full text-base transition-all ${saved ? "bg-green-600 hover:bg-green-700" : ""}`}
                                    size="lg"
                                >
                                    {saving ? <Loader2 size={16} className="animate-spin" /> :
                                     saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                                    {saved ? "Saved!" : saving ? "Saving" : "Save Changes"}
                                </Button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
