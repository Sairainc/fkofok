"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

const DynamicMultiStepForm = dynamic(() => import("@/components/MultiStepForm"), {
    ssr: false,
    loading: () => <div>Loading...</div>,
});

export default function Form() {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        const checkProfileStatus = async () => {
            if (user) {
                // プロフィールの登録状況を確認
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_profile_completed')
                    .eq('line_id', user.id)
                    .single();

                // プロフィール登録が完了している場合は決済ページへ
                if (profile?.is_profile_completed) {
                    router.push('/payment');
                }
            }
        };

        if (!loading) {
            checkProfileStatus();
        }
    }, [user, loading, router]);

    if (loading) return <div>Loading...</div>;

    if (!user) return <div>LINEログインが必要です</div>;

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DynamicMultiStepForm lineId={user.id} />
        </Suspense>
    );
}
