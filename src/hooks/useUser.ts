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
        try {
          // 4つの個別のクエリを実行
          const { data: matchData1, error: matchError1 } = await supabase
            .from('matches')
            .select('*')
            .eq('male_user_1_id', profile.userId)
            .limit(1);
          
          const { data: matchData2, error: matchError2 } = await supabase
            .from('matches')
            .select('*')
            .eq('male_user_2_id', profile.userId)
            .limit(1);
            
          const { data: matchData3, error: matchError3 } = await supabase
            .from('matches')
            .select('*')
            .eq('female_user_1_id', profile.userId)
            .limit(1);
            
          const { data: matchData4, error: matchError4 } = await supabase
            .from('matches')
            .select('*')
            .eq('female_user_2_id', profile.userId)
            .limit(1);
          
          // エラーがあれば出力
          if (matchError1) console.error("❌ male_user_1_id検索エラー:", matchError1);
          if (matchError2) console.error("❌ male_user_2_id検索エラー:", matchError2);
          if (matchError3) console.error("❌ female_user_1_id検索エラー:", matchError3);
          if (matchError4) console.error("❌ female_user_2_id検索エラー:", matchError4);
          
          // どれかにマッチすればhasMatchをtrue
          if (
            (matchData1 && matchData1.length > 0) || 
            (matchData2 && matchData2.length > 0) || 
            (matchData3 && matchData3.length > 0) || 
            (matchData4 && matchData4.length > 0)
          ) {
            setHasMatch(true);
            console.log("✅ マッチが見つかりました");
            
            // デバッグ用に詳細表示
            if (matchData1 && matchData1.length > 0) console.log("🔍 male_user_1_id:", matchData1);
            if (matchData2 && matchData2.length > 0) console.log("🔍 male_user_2_id:", matchData2);
            if (matchData3 && matchData3.length > 0) console.log("🔍 female_user_1_id:", matchData3);
            if (matchData4 && matchData4.length > 0) console.log("🔍 female_user_2_id:", matchData4);
          } else {
            console.log("⚠️ マッチが見つかりませんでした");
          }
        } catch (matchCheckError) {
          console.error("❌ マッチチェック例外:", matchCheckError);
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
