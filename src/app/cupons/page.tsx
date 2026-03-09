import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import CouponCard, { CouponData } from "@/components/cupons/CouponCard";
import { createClient } from "@/utils/supabase/server";

export const dynamic = 'force-dynamic';

export default async function CustomerCouponsPage() {
    const supabase = await createClient();

    // Fetch active coupons ordered by expiration date
    const { data: coupons } = await supabase
        .from('coupons')
        .select('*')
        .eq('active', true)
        .order('expiration_date', { ascending: true });

    // Map to our UI format. (Adding a mock 'isNewCustomer' tag for visual flavor if desired)
    const formattedCoupons: CouponData[] = (coupons || []).map((c, index) => ({
        ...c,
        isNewCustomer: index === 0 && c.discount_value >= 30, // Just a visual mock for the first big coupon
    }));

    return (
        <div className="min-h-screen bg-[#F5F5F5] pb-20">

            {/* Header */}
            <header className="bg-white sticky top-0 z-50">
                <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="p-2 -ml-2 text-stone-900 hover:bg-stone-100 rounded-full transition">
                            <ChevronLeft size={24} strokeWidth={2.5} />
                        </Link>
                        <h1 className="text-xl font-bold text-stone-900">Cupons</h1>
                    </div>
                    <button className="text-[15px] font-medium text-stone-700 hover:text-stone-900 transition">
                        Regras
                    </button>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-4">

                {/* Promo Code Input Bar */}
                <div className="bg-[#EEEEEE] rounded-2xl p-1.5 flex items-center mb-6">
                    <input
                        type="text"
                        placeholder="Insira o código promocional"
                        className="flex-1 bg-transparent px-3 text-stone-700 placeholder:text-stone-500 text-[15px] focus:outline-none"
                    />
                    <button className="bg-white text-stone-900 font-bold px-6 py-2.5 rounded-xl shadow-sm text-sm hover:bg-stone-50 transition active:scale-95">
                        Resgatar
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2 -mx-4 px-4">
                    <button className="shrink-0 bg-[#FFF5B2] text-stone-900 font-semibold px-4 py-2 rounded-xl text-sm transition">
                        Todos os cupons
                    </button>
                    <button className="shrink-0 bg-white text-stone-700 font-medium px-4 py-2 rounded-xl text-sm shadow-sm transition">
                        Cupons de desconto
                    </button>
                    <button className="shrink-0 bg-white text-stone-700 font-medium px-4 py-2 rounded-xl text-sm shadow-sm transition">
                        Cupons da loja
                    </button>
                </div>

                {/* Category Header */}
                <h2 className="text-[17px] font-bold text-stone-900 mb-4 px-1">Cupons de desconto</h2>

                {/* Coupon List */}
                <div className="flex flex-col gap-4">
                    {formattedCoupons.length > 0 ? (
                        formattedCoupons.map((coupon) => (
                            <CouponCard key={coupon.id} coupon={coupon} />
                        ))
                    ) : (
                        <div className="text-center py-10 bg-white rounded-3xl border border-stone-100">
                            <p className="text-stone-500 font-medium">Você não tem cupons disponíveis no momento.</p>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
