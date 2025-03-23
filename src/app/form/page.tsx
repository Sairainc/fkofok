"use client";

import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RegistrationForm } from "@/components/RegistrationForm";
import { Navigation } from "@/components/Navigation";

export default function Form() {
    const { user, loading, hasMatch } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        
        if (!user) {
            router.push('/auth');
            return;
        }
        
        if (hasMatch) {
            if (process.env.NODE_ENV === 'development') {
                console.log("🔄 マッチが見つかりました。マッチページへリダイレクト");
            }
            router.push('/match');
            return;
        }
    }, [user, loading, router, hasMatch]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }
    
    if (!user) return null;

    return (
        <>
            <Navigation />
            <div className="pt-16">
                <RegistrationForm userId={user.id} />
            </div>
        </>
    );
}
