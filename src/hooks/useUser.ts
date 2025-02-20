"use client";

import { useState, useEffect } from "react";
import liff from "@line/liff";
import { supabase } from "../lib/supabase";

type User = {
  id: string;
  name: string;
  gender: 'men' | 'women';
}

export const useUser = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initLiff = async () => {
            try {
                await liff.init({ 
                    liffId: process.env.NEXT_PUBLIC_LIFF_ID as string,
                    withLoginOnExternalBrowser: true
                });

                if (!liff.isLoggedIn()) {
                    liff.login({ redirectUri: window.location.href });
                    return;
                }

                const profile = await liff.getProfile();

                // **DBにline_idがあるかチェック**
                const { data: userData, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('line_id', profile.userId)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error("Supabaseエラー:", error);
                }

                // **DBにline_idがない場合、新規作成**
                if (!userData) {
                    console.log("⚠️ プロフィールが存在しないため、新しく作成します");

                    const { error: insertError } = await supabase
                        .from('profiles')
                        .insert([
                            { line_id: profile.userId, gender: "men" } // `gender` を `men` に仮設定
                        ]);

                    if (insertError) {
                        console.error("❌ プロフィール作成エラー:", insertError);
                    }
                }

                setUser({ 
                    id: profile.userId, 
                    name: profile.displayName,
                    gender: userData?.gender || "men",
                });

            } catch (error) {
                console.error("LIFF エラー:", error);
            } finally {
                setLoading(false);
            }
        };

        initLiff();
    }, []);

    return { user, loading };
};
