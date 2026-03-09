'use client';

import { useState, useEffect } from 'react';
import { UserProfile } from '@/utils/supabase/profile';
import CustomerProfileDrawer from './CustomerProfileDrawer';
import { UserCircle } from 'lucide-react';
import Image from 'next/image';

interface UserProfileMenuProps {
    userEmail?: string;
    profile: UserProfile | null;
}

export default function UserProfileMenu({ userEmail, profile }: UserProfileMenuProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Only render drawer on the client to prevent hydration mismatch from fixed portals
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const firstName = profile?.full_name?.split(" ")[0] || "Cliente";

    return (
        <>
            <button
                onClick={() => setIsDrawerOpen(true)}
                className="relative rounded-full transition active:scale-95 shrink-0"
                suppressHydrationWarning
            >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20 border-2 border-white/40 flex items-center justify-center">
                    {profile?.avatar_url ? (
                        <Image
                            src={profile.avatar_url}
                            alt={firstName}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <UserCircle size={32} className="text-white" />
                    )}
                </div>
                {/* Red dot indicator */}
                <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-primary"></div>
            </button>

            {isMounted && (
                <CustomerProfileDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    profile={profile}
                    userEmail={userEmail}
                />
            )}
        </>
    );
}
