import type { Metadata } from "next";

// #22 — generateMetadata for SEO
export const metadata: Metadata = {
    title: "Menu",
    description: "Browse our full menu of handcrafted coffees, teas, cold drinks and bites. Order Dine-In or Takeaway at SalSee Coffee",
    openGraph: {
        title: "Menu | SalSee Coffee",
        description: "Browse our full menu of handcrafted beverages and bites.",
        type: "website",
    },
};

export { default } from "./page";
