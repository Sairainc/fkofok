"use client";

import { useState, useEffect } from "react";
import liff from "@line/liff";

export const useUser = () => {
    const [user, setUser] = useState<{ id: string; name: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initLiff = async () => {
            try {
                await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID as string });

                if (!liff.isLoggedIn()) {
                    liff.login();
                } else {
                    const profile = await liff.getProfile();
                    setUser({ id: profile.userId, name: profile.displayName });
                }
            } catch (error) {
                console.error("LIFF init error:", error);
            } finally {
                setLoading(false);
            }
        };

        initLiff();
    }, []);

    return { user, loading };
};
