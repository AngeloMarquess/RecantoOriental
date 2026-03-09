'use client';

import { useState } from 'react';
import { PlusCircle, ChevronLeft, CreditCard } from 'lucide-react';

export default function AddCardDrawer() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating Add Card Button Area */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#F5F5F5] via-[#F5F5F5] to-transparent z-40 pointer-events-none">
                <div className="max-w-md mx-auto pointer-events-auto flex justify-center pb-4">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-stone-100 rounded-full py-4 px-6 flex items-center gap-3 w-full max-w-[340px] hover:bg-stone-50 active:scale-95 transition-all group"
                    >
                        <div className="bg-[#FFDD00] text-stone-900 rounded-full p-1 group-hover:rotate-90 transition-transform duration-300">
                            <PlusCircle size={20} strokeWidth={2.5} />
                        </div>
                        <span className="font-bold text-stone-900 text-base">Adicionar método de pagamento</span>
                    </button>
                </div>
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[60] transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="bg-white px-4 pt-6 pb-4 border-b border-stone-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 -ml-2 text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
                        >
                            <ChevronLeft size={24} strokeWidth={2.5} />
                        </button>
                        <h2 className="font-bold text-lg text-stone-900">Novo Cartão de Crédito</h2>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center">
                            <CreditCard size={32} className="text-stone-400" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5 ml-1">Número do Cartão</label>
                        <input
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            className="w-full bg-stone-50 text-stone-900 border border-stone-200 rounded-xl p-3.5 focus:border-stone-400 focus:ring-1 focus:ring-stone-400 outline-none transition-shadow text-[17px] tracking-widest placeholder:tracking-normal"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5 ml-1">Nome no Cartão</label>
                        <input
                            type="text"
                            placeholder="Como impresso no cartão"
                            className="w-full bg-stone-50 text-stone-900 border border-stone-200 rounded-xl p-3.5 focus:border-stone-400 focus:ring-1 focus:ring-stone-400 outline-none transition-shadow text-[15px] uppercase"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1.5 ml-1">Validade</label>
                            <input
                                type="text"
                                placeholder="MM/AA"
                                className="w-full bg-stone-50 text-stone-900 border border-stone-200 rounded-xl p-3.5 focus:border-stone-400 focus:ring-1 focus:ring-stone-400 outline-none transition-shadow text-[15px] text-center"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1.5 ml-1">CVV</label>
                            <input
                                type="text"
                                placeholder="123"
                                maxLength={4}
                                className="w-full bg-stone-50 text-stone-900 border border-stone-200 rounded-xl p-3.5 focus:border-stone-400 focus:ring-1 focus:ring-stone-400 outline-none transition-shadow text-[15px] text-center"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-stone-100 shrink-0 bg-white">
                    <button
                        type="button"
                        className="w-full bg-[#FFDD00] text-stone-900 font-bold py-4 rounded-xl hover:brightness-95 transition-all text-[15px] active:scale-95 shadow-sm"
                    >
                        Adicionar Cartão
                    </button>
                </div>
            </div>
        </>
    );
}
