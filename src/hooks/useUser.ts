"use client";

import { useState, useEffect } from "react";
import liff from "@line/liff";

export const useUser = () => {
    const [user, setUser] = useState<{ id: string; name: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initLiff = async () => {
            try {
                console.log("🔍 LIFF 初期化開始");

                await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID as string });

                if (!liff.isLoggedIn()) {
                    console.log("🔑 LINE未ログイン: liff.login() を実行");
                    liff.login();
                    return;
                }

                console.log("✅ LINEログイン済み: プロフィール取得開始");
                const profile = await liff.getProfile();
                console.log("👤 取得したプロフィール:", profile);

                setUser({ id: profile.userId, name: profile.displayName });
            } catch (error) {
                console.error("❌ LIFF 初期化エラー:", error);
            } finally {
                setLoading(false);
            }
        };

        initLiff();
    }, []);

    return { user, loading };
};
