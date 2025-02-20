"use client";

import { useState, useEffect } from "react";
import liff from "@line/liff";
import { supabase } from "../lib/supabase";

type User = {
  id: string;
  gender: "men" | "women";
};

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initLiff = async () => {
      try {
        console.log("📢 LIFF 初期化開始");
        await liff.init({
          liffId: process.env.NEXT_PUBLIC_LIFF_ID as string,
          withLoginOnExternalBrowser: true,
        });

        console.log("✅ LIFF 初期化成功");

        if (!liff.isLoggedIn()) {
          console.log("⚠️ ユーザーがログインしていません。ログイン処理を開始");
          liff.login({ redirectUri: window.location.href });
          return;
        }

        console.log("✅ ユーザーがログイン済み");
        const profile = await liff.getProfile();
        console.log("✅ ユーザープロフィール取得成功:", profile);

        // **DBにline_idがあるかチェック**
        const { data: userData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("line_id", profile.userId)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("❌ Supabaseエラー:", error);
        }

        // **DBにline_idがない場合、新規作成**
        if (!userData) {
          console.log("⚠️ プロフィールが存在しないため、新しく作成します");

          const { error: insertError } = await supabase.from("profiles").insert([
            {
              line_id: profile.userId,
              gender: "men", // 🔹 仮に "men" をデフォルトとして設定
            },
          ]);

          if (insertError) {
            console.error("❌ プロフィール作成エラー:", insertError);
          }
        }

        // **取得したデータを user ステートにセット（name を削除）**
        setUser({
          id: profile.userId,
          gender: userData?.gender || "men",
        });

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
