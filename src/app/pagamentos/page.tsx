import Link from "next/link";
import { ChevronLeft, ChevronRight, Wallet, HelpCircle, ArrowDownToLine, HandCoins } from "lucide-react";
import AddCardDrawer from "@/components/payments/AddCardDrawer";

export const dynamic = 'force-dynamic';

export default async function PaymentMethodsPage() {

    // Mock data for the visual representation
    const savedMethods = [
        { id: 1, type: 'credit', brand: 'mastercard', last4: '8137', expired: false },
        { id: 2, type: 'credit', brand: 'mastercard', last4: '3622', expired: false },
        { id: 3, type: 'credit', brand: 'mastercard', last4: '9030', expired: false },
        { id: 4, type: 'credit', brand: 'elo', last4: '8443', expired: false },
        { id: 5, type: 'credit', brand: 'mastercard', last4: '9664', expired: true },
        { id: 6, type: 'pix', label: 'Pix' },
        { id: 7, type: 'cash', label: 'Pagar pessoalmente' }
    ];

    return (
        <div className="min-h-screen bg-[#F5F5F5] pb-24 relative">

            {/* Header */}
            <header className="bg-white sticky top-0 z-50">
                <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="p-2 -ml-2 text-stone-900 hover:bg-stone-100 rounded-full transition">
                            <ChevronLeft size={24} strokeWidth={2.5} />
                        </Link>
                        <h1 className="text-xl font-bold text-stone-900">Seus métodos de pagamento</h1>
                    </div>
                    <button className="text-stone-500 hover:text-stone-900 transition p-2 -mr-2 rounded-full">
                        <HelpCircle size={22} />
                    </button>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-4 space-y-4">

                {/* Account Balance Card */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 flex items-center justify-between">
                    <div className="flex items-start gap-3">
                        <div className="bg-[#FFF5B2] text-stone-900 p-1.5 rounded-lg shrink-0 mt-0.5">
                            <Wallet size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="font-bold text-stone-900 text-lg leading-tight">Saldo em conta</h2>
                            <p className="text-stone-400 text-sm font-medium mt-0.5">R$0,00</p>
                        </div>
                    </div>

                    <button className="bg-[#FFDD00] text-stone-900 font-bold px-4 py-2.5 rounded-xl text-sm shadow-sm hover:brightness-95 transition active:scale-95 shrink-0 flex items-center gap-1.5">
                        <ArrowDownToLine size={16} strokeWidth={2.5} />
                        Depositar via Pix
                    </button>
                </div>

                {/* Saved Methods List */}
                <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden mt-6 pb-2">
                    {savedMethods.map((method, index) => (
                        <div
                            key={method.id}
                            className={`flex items-center justify-between p-5 cursor-pointer hover:bg-stone-50 transition-colors group ${index !== savedMethods.length - 1 ? 'border-b border-stone-100/60' : ''
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Method Icon Wrapper */}
                                <div className="w-10 h-6 flex items-center justify-center shrink-0">
                                    {method.type === 'credit' && method.brand === 'mastercard' && (
                                        <div className="flex -space-x-1.5 opacity-90">
                                            <div className="w-5 h-5 rounded-full bg-[#EB001B] mix-blend-multiply flex-shrink-0"></div>
                                            <div className="w-5 h-5 rounded-full bg-[#F79E1B] mix-blend-multiply flex-shrink-0"></div>
                                        </div>
                                    )}
                                    {method.type === 'credit' && method.brand === 'elo' && (
                                        <div className="w-8 h-5 bg-black rounded-sm flex items-center justify-center border border-stone-800">
                                            <span className="text-white text-[9px] font-bold tracking-tighter">elo</span>
                                        </div>
                                    )}
                                    {method.type === 'pix' && (
                                        <div className="w-6 h-6 shrink-0 relative flex items-center justify-center">
                                            <div className="w-4 h-4 transform rotate-45 border-2 border-[#1DB954] rounded-sm"></div>
                                            <div className="absolute w-2 h-2 bg-[#1DB954] transform rotate-45 rounded-sm"></div>
                                        </div>
                                    )}
                                    {method.type === 'cash' && (
                                        <HandCoins size={22} className="text-stone-500 shrink-0" strokeWidth={2} />
                                    )}
                                </div>

                                {/* Method Info */}
                                <div>
                                    <h3 className="font-semibold text-stone-900 text-[17px]">
                                        {method.type === 'credit' ? `Mastercard ${method.last4}` : method.label}
                                    </h3>
                                    {method.expired && (
                                        <p className="text-[#FF2D55] text-xs font-medium mt-0.5">Cartão vencido</p>
                                    )}
                                </div>
                            </div>

                            <ChevronRight size={18} className="text-stone-300 group-hover:text-stone-500 transition-colors shrink-0" />
                        </div>
                    ))}
                </div>

            </main>

            <AddCardDrawer />

        </div>
    );
}
