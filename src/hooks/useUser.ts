"use client";

import { useState, useEffect } from "react";
import liff from "@line/liff";
import { supabase } from "../lib/supabase";

type User = {
  id: string;
  gender: "men" | "women";
};

export const useUser = (options?: { skipMatchCheck?: boolean }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMatch, setHasMatch] = useState(false);

  useEffect(() => {
    const initLiff = async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log("📢 LIFF 初期化開始");
        }
        await liff.init({
          liffId: process.env.NEXT_PUBLIC_LIFF_ID as string,
          withLoginOnExternalBrowser: true,
        });

        if (process.env.NODE_ENV === 'development') {
          console.log("✅ LIFF 初期化成功");
        }

        if (!liff.isLoggedIn()) {
          if (process.env.NODE_ENV === 'development') {
            console.log("⚠️ ユーザーがログインしていません。ログイン処理を開始");
          }
          liff.login({ redirectUri: window.location.href });
          return;
        }

        if (process.env.NODE_ENV === 'development') {
          console.log("✅ ユーザーがログイン済み");
        }
        const profile = await liff.getProfile();
        if (process.env.NODE_ENV === 'development') {
          console.log("✅ ユーザープロフィール取得成功:", profile);
        }

        // **DBにline_idがあるかチェック**
        const { data: userData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("line_id", profile.userId)
          .single();

        if (error && error.code !== "PGRST116" && process.env.NODE_ENV === 'development') {
          console.error("❌ Supabaseエラー:", error);
        }

        // **マッチングテーブルをチェック**
        const { data: matchData } = await supabase
          .from('matches')
          .select('*')
          .or(`male_user_1_id.eq."${profile.userId}",male_user_2_id.eq."${profile.userId}",female_user_1_id.eq."${profile.userId}",female_user_2_id.eq."${profile.userId}"`)
          .limit(1);

        if (matchData && matchData.length > 0) {
          setHasMatch(true);
          if (process.env.NODE_ENV === 'development') {
            console.log("✅ マッチが見つかりました:", matchData);
          }
        }

        // **DBにline_idがない場合、新規作成**
        if (!userData) {
          if (process.env.NODE_ENV === 'development') {
            console.log("⚠️ プロフィールが存在しないため、新しく作成します");
          }

          const { error: insertError } = await supabase.from("profiles").insert([
            {
              line_id: profile.userId,
              gender: "men", // 🔹 仮に "men" をデフォルトとして設定
            },
          ]);

          if (insertError && process.env.NODE_ENV === 'development') {
            console.error("❌ プロフィール作成エラー:", insertError);
          }
        }

        // **取得したデータを user ステートにセット（name を削除）**
        setUser({
          id: profile.userId,
          gender: userData?.gender || "men",
        });

      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("❌ LIFF 初期化エラー:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    initLiff();
  }, []);

  return { user, loading, hasMatch };
};
