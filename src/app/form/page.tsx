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

    if (loading) return <div>Loading...</div>;

    return (
        <Suspense fallback={<div>Loading...</div>}>
            {user ? <DynamicMultiStepForm lineId={user.id} /> : <div>LINEログインが必要です</div>}
        </Suspense>
    );
}
