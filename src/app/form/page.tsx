"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useUser } from "@/hooks/useUser";

const DynamicMultiStepForm = dynamic(() => import("@/components/MultiStepForm"), {
    ssr: false,
    loading: () => <div>Loading...</div>,
});

export default function Form() {
    const { user, loading } = useUser();

    if (loading) {
        console.log("⌛ ユーザーデータの読み込み中...");
        return <div>Loading...</div>;
    }

    if (!user) {
        console.log("❌ ユーザーがログインしていません！LINEログインを要求");
        return <div>LINEログインが必要です</div>;
    }

    console.log("✅ ユーザー認証成功！フォームを表示:", user);

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DynamicMultiStepForm lineId={user.id} />
        </Suspense>
    );
}
