export interface HeroCard {
    id: string;
    emoji: string;
    imageUrl?: string;
    nameKey: string;
    descKey: string;
    bgGradient: string;
    price: string;
}

export interface FeaturedItem {
    id: string;
    emoji: string;
    imageUrl?: string;
    nameKey: string;
    descKey: string;
    tagKey: string;
    gradient: string;
    accent: string;
    accentLight: string;
    accentText: string;
    price: string;
    name: string;
    desc: string;
    tag: string;
}

function localProductImage(objectKey: string): string {
    const key = objectKey.startsWith("/") ? objectKey.slice(1) : objectKey;
    return `/${key}`;
}

export const HERO_CARDS_DATA: HeroCard[] = [
    {
        id: "hero-matcha",
        emoji: "🍵",
        imageUrl: localProductImage("products/matcha_green_tea.jpg"),
        nameKey: "heroCard1.name",
        descKey: "heroCard1.desc",
        bgGradient: "linear-gradient(135deg, rgba(158,197,101,0.95), rgba(115,161,66,0.95))",
        price: "$4.90",
    },
    {
        id: "hero-coldbrew",
        emoji: "🧋",
        imageUrl: localProductImage("products/iced_latte.jpg"),
        nameKey: "heroCard2.name",
        descKey: "heroCard2.desc",
        bgGradient: "linear-gradient(135deg, rgba(89,60,37,0.95), rgba(57,35,20,0.95))",
        price: "$5.40",
    },
    {
        id: "hero-oat-latte",
        emoji: "☕",
        imageUrl: localProductImage("products/cappuccino.jpg"),
        nameKey: "heroCard3.name",
        descKey: "heroCard3.desc",
        bgGradient: "linear-gradient(135deg, rgba(213,148,90,0.95), rgba(181,120,66,0.95))",
        price: "$4.70",
    },
];

export const FEATURED_DATA: FeaturedItem[] = [
    {
        id: "featured-signature-latte",
        emoji: "☕",
        imageUrl: localProductImage("products/cappuccino.jpg"),
        nameKey: "featured.signatureLatte",
        descKey: "featured.signatureLatteDesc",
        tagKey: "featured.tagBestseller",
        gradient: "from-amber-200 via-amber-300 to-orange-300",
        accent: "#d97706",
        accentLight: "rgba(245,158,11,0.18)",
        accentText: "#92400e",
        price: "$4.80",
        name: "Signature Latte",
        desc: "Velvety espresso with house-made caramel syrup and silky steamed milk.",
        tag: "Bestseller",
    },
    {
        id: "featured-matcha-mist",
        emoji: "🍵",
        imageUrl: localProductImage("products/matcha_green_tea.jpg"),
        nameKey: "featured.matchaMist",
        descKey: "featured.matchaMistDesc",
        tagKey: "featured.tagVegan",
        gradient: "from-lime-200 via-green-200 to-emerald-200",
        accent: "#4d7c0f",
        accentLight: "rgba(132,204,22,0.20)",
        accentText: "#365314",
        price: "$5.20",
        name: "Matcha Mist",
        desc: "Ceremonial-grade matcha, oat milk, a touch of vanilla and raw honey.",
        tag: "Vegan",
    },
    {
        id: "featured-cold-brew-float",
        emoji: "🧋",
        imageUrl: localProductImage("products/iced_latte.jpg"),
        nameKey: "featured.coldBrewFloat",
        descKey: "featured.coldBrewFloatDesc",
        tagKey: "featured.tagSummerPick",
        gradient: "from-sky-200 via-cyan-200 to-blue-200",
        accent: "#0369a1",
        accentLight: "rgba(14,165,233,0.18)",
        accentText: "#0c4a6e",
        price: "$5.60",
        name: "Cold Brew Float",
        desc: "18-hour cold brew over ice crowned with a scoop of vanilla bean gelato.",
        tag: "Summer Pick",
    },
    {
        id: "featured-butter-croissant",
        emoji: "🥐",
        imageUrl: localProductImage("products/croissant.jpg"),
        nameKey: "featured.butterCroissant",
        descKey: "featured.butterCroissantDesc",
        tagKey: "featured.tagFreshDaily",
        gradient: "from-amber-100 via-yellow-100 to-orange-100",
        accent: "#b45309",
        accentLight: "rgba(251,191,36,0.20)",
        accentText: "#78350f",
        price: "$3.40",
        name: "Butter Croissant",
        desc: "Freshly baked, imported French-style pastry - flaky, golden, warm.",
        tag: "Fresh Daily",
    },
    {
        id: "featured-mocha-madness",
        emoji: "🍫",
        imageUrl: localProductImage("products/espresso.jpg"),
        nameKey: "featured.mochaMadness",
        descKey: "featured.mochaMadnessDesc",
        tagKey: "featured.tagPopular",
        gradient: "from-stone-300 via-neutral-300 to-zinc-300",
        accent: "#7c3f00",
        accentLight: "rgba(120,53,15,0.16)",
        accentText: "#431407",
        price: "$5.10",
        name: "Mocha Madness",
        desc: "Double espresso, dark Belgian chocolate, and clouds of whipped cream.",
        tag: "Popular",
    },
    {
        id: "featured-berry-smoothie",
        emoji: "🍓",
        imageUrl: localProductImage("products/iced_latte.jpg"),
        nameKey: "featured.berrySmoothie",
        descKey: "featured.berrySmoothieDesc",
        tagKey: "featured.tagHealthy",
        gradient: "from-pink-200 via-rose-200 to-fuchsia-200",
        accent: "#be185d",
        accentLight: "rgba(236,72,153,0.18)",
        accentText: "#831843",
        price: "$4.60",
        name: "Berry Smoothie",
        desc: "Wild blueberry, strawberry, banana and coconut milk blended smooth.",
        tag: "Healthy",
    },
    {
        id: "featured-berry-smoothie",
        emoji: "🍓",
        imageUrl: localProductImage("products/iced_latte.jpg"),
        nameKey: "featured.berrySmoothie",
        descKey: "featured.berrySmoothieDesc",
        tagKey: "featured.tagHealthy",
        gradient: "from-pink-200 via-rose-200 to-fuchsia-200",
        accent: "#be185d",
        accentLight: "rgba(236,72,153,0.18)",
        accentText: "#831843",
        price: "$4.60",
        name: "Berry Smoothie",
        desc: "Wild blueberry, strawberry, banana and coconut milk blended smooth.",
        tag: "Healthy",
    },
];
