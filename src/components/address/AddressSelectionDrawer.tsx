'use client';

import { useState } from 'react';
import { ChevronLeft, Search, Navigation, MapPin, Pencil } from 'lucide-react';

interface AddressSelectionDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    currentAddress?: string;
}

export default function AddressSelectionDrawer({ isOpen, onClose, currentAddress }: AddressSelectionDrawerProps) {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[80] transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed inset-y-0 right-0 w-full md:w-[450px] bg-[#F5F5F5] shadow-2xl z-[90] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="bg-[#F5F5F5] px-4 pt-6 pb-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="p-2 -ml-2 text-stone-900 hover:bg-stone-200 rounded-full transition-colors"
                        >
                            <ChevronLeft size={24} strokeWidth={2.5} />
                        </button>
                        <h2 className="font-bold text-lg text-stone-900">Endereço de entrega</h2>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-4 relative">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Pesquise para adicionar um endereço"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#E8E8E8] text-stone-800 placeholder:text-stone-500 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                        />
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-4 pb-10">

                    {/* Current Location Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 flex items-center gap-4 mb-6 cursor-pointer hover:bg-stone-50 transition-colors">
                        <div className="shrink-0 p-2 text-stone-900">
                            {/* Using a custom angled arrow to mimic the GPS dart */}
                            <Navigation size={22} className="fill-stone-900 transform rotate-45" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-stone-900">Usar minha localização</h3>
                            <p className="text-xs text-stone-500 mt-0.5 pr-2">
                                Tv. São Sebastião, 3ª - Piedade, Jaboatão dos Guararapes - PE
                            </p>
                        </div>

                        <button className="shrink-0 text-stone-900 text-xs font-bold px-3 py-1.5 rounded-3xl border border-stone-200 bg-white hover:bg-stone-50 transition-colors">
                            Atualizar
                        </button>
                    </div>

                    <h4 className="font-bold text-sm text-stone-800 mb-3 px-1">Endereços recentes</h4>

                    {/* Saved Address Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 flex items-start gap-4 cursor-pointer hover:bg-stone-50 transition-colors group relative">
                        <div className="shrink-0 pt-0.5 text-[#FF8A00]">
                            <MapPin size={22} className="fill-transparent" strokeWidth={2.5} />
                        </div>

                        <div className="flex-1 min-w-0 pr-8">
                            <h3 className="font-bold text-[#FF8A00]">Casa</h3>
                            <p className="text-sm text-[#FF8A00] mt-0.5 font-medium leading-tight opacity-90">
                                {currentAddress || "R. José Braz Moscow, 978 - Piedade, Jaboatão dos Guararapes - PE"}
                            </p>
                            <p className="text-xs text-[#FF8A00] mt-1 font-medium opacity-80">
                                apt 1907 lunnar
                            </p>
                        </div>

                        <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-stone-900 hover:bg-stone-100 rounded-full transition-colors opacity-80 group-hover:opacity-100">
                            <Pencil size={18} strokeWidth={2.5} />
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}
