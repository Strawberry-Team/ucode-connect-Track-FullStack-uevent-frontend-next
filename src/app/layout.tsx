// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header/Header";
import React from "react";
import ScrollToTopButton from "@/components/ui/scroll-to-top-button";
import { AuthProvider } from "@/context/AuthContext";
import { cookies } from "next/headers";
import { Toaster } from "@/components/ui/sonner";
import { getUserMe, User } from "@/lib/user";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Calendula",
    description: "Event management platform",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value || null;
    const isAuthenticated = !!accessToken;

    let initialUser: User | null = null;
    if (accessToken) {
        const userResult = await getUserMe(accessToken);
        if (userResult.success && userResult.data) {
            initialUser = userResult.data;
        }
    }

    return (
        <html lang="en">
            <body>
                <AuthProvider initialAuthState={isAuthenticated} initialUser={initialUser}>
                    <Header />
                    {children}
                    <ScrollToTopButton />
                    <Toaster />
                </AuthProvider>
            </body>
        </html>
    );
}