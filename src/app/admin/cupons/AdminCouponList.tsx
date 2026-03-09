'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { TicketPercent, Power } from 'lucide-react';
import { useState } from 'react';

// Using partial any type for quick iteration. Will refine if needed.
type AdminCouponListProps = {
    initialCoupons: any[];
}

export default function AdminCouponList({ initialCoupons }: AdminCouponListProps) {
    const supabase = createClient();
    const router = useRouter();
    const [loadingId, setLoadingId] = useState<string | null>(null);

    async function toggleActive(id: string, currentStatus: boolean) {
        setLoadingId(id);
        const { error } = await supabase
            .from('coupons')
            .update({ active: !currentStatus })
            .eq('id', id);

        if (!error) {
            router.refresh();
        } else {
            console.error(error);
        }
        setLoadingId(null);
    }

    if (initialCoupons.length === 0) {
        return (
            <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200 border-dashed">
                <TicketPercent size={48} className="mx-auto text-stone-300 mb-4" />
                <h3 className="text-stone-900 font-bold text-lg">Nenhum cupom criado</h3>
                <p className="text-stone-500">Preencha o formulário ao lado para adicionar o primeiro cupom.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {initialCoupons.map((coupon) => (
                <div
                    key={coupon.id}
                    className={`bg-white border rounded-xl p-4 flex flex-col justify-between transition-opacity ${coupon.active ? 'border-primary/20 shadow-sm' : 'border-stone-200 opacity-60'
                        }`}
                >
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-black text-stone-900 tracking-tight">{coupon.code}</h3>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${coupon.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {coupon.active ? 'ATIVO' : 'INATIVO'}
                            </span>
                        </div>

                        <p className="text-stone-700 font-medium mb-1 flex items-center gap-1.5">
                            <span className="bg-stone-100 p-1 rounded">
                                <TicketPercent size={14} className="text-stone-500" />
                            </span>
                            Desconto: {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `R$ ${coupon.discount_value.toFixed(2)}`}
                        </p>

                        <p className="text-sm text-stone-500 mb-1">
                            Mínimo: {coupon.min_order_value ? `R$ ${coupon.min_order_value.toFixed(2)}` : 'Nenhum'}
                        </p>

                        <p className="text-xs text-stone-400">
                            Vence em: {new Date(coupon.expiration_date).toLocaleString('pt-BR')}
                        </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-stone-100 flex justify-end">
                        <button
                            onClick={() => toggleActive(coupon.id, coupon.active)}
                            disabled={loadingId === coupon.id}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition disabled:opacity-50 ${coupon.active
                                    ? 'text-stone-700 bg-stone-100 hover:bg-stone-200'
                                    : 'text-white bg-primary hover:bg-red-700'
                                }`}
                        >
                            <Power size={16} />
                            {loadingId === coupon.id ? 'Aguarde...' : (coupon.active ? 'Desativar' : 'Reativar')}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
