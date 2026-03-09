import { createClient } from "@/utils/supabase/server";
import { Plus, Tag, Calendar, Percent, DollarSign } from "lucide-react";
import AdminCouponForm from "./AdminCouponForm";
import AdminCouponList from "./AdminCouponList";

export const dynamic = 'force-dynamic';

export default async function AdminCouponsPage() {
    const supabase = await createClient();

    const { data: coupons } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-stone-900">Cupons de Desconto</h1>
                    <p className="text-stone-500 mt-1">Crie e gerencie os códigos promocionais do seu restaurante.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Create Coupon Form (Left Column on Desktop) */}
                <div className="lg:col-span-1 border-r border-stone-200 pr-8">
                    <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                        <Plus size={20} className="text-primary" />
                        Novo Cupom
                    </h2>
                    <AdminCouponForm />
                </div>

                {/* Coupons List (Right Column on Desktop) */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                        <Tag size={20} className="text-stone-500" />
                        Cupons Ativos e Histórico
                    </h2>
                    <AdminCouponList initialCoupons={coupons || []} />
                </div>

            </div>
        </div>
    );
}
