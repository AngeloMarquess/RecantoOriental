'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import AddressSelectionDrawer from './AddressSelectionDrawer';

interface AddressHeaderButtonProps {
    initialAddress?: string;
}

export default function AddressHeaderButton({ initialAddress = "Rua José Braz Moscow, 978" }: AddressHeaderButtonProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex-1 flex items-center gap-1 text-left group"
                suppressHydrationWarning
            >
                <h2 className="font-bold text-[17px] text-white leading-tight truncate group-hover:text-red-100 transition">
                    {initialAddress}
                </h2>
                <ChevronRight size={18} className="text-red-200 shrink-0 group-hover:text-white transition" />
            </button>

            <AddressSelectionDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                currentAddress={initialAddress}
            />
        </>
    );
}
