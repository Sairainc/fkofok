"use client";

import { useState, useEffect } from "react";
import liff from "@line/liff";
import { supabase } from "@/lib/supabase";

type User = {
  id: string;
  name: string;
  gender?: 'men' | 'women';
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
                
                // Supabaseからユーザーの性別情報を取得
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('gender')
                    .eq('line_id', profile.userId)
                    .single();

                setUser({ 
                    id: profile.userId, 
                    name: profile.displayName,
                    gender: profileData?.gender
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
