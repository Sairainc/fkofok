"use client";

import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Form() {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth');
        }
    }, [user, loading, router]);

    if (loading) return <div>Loading...</div>;
    if (!user) return <div>LINEログインが必要です</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">
                    準備中です
                </h1>
                <p className="text-gray-600">
                    フォーム機能は現在準備中です。しばらくお待ちください。
                </p>
            </div>
        </div>
    );
}
