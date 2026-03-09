import { TicketPercent } from "lucide-react";

export type CouponData = {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_order_value?: number;
    expiration_date: string;
    isNewCustomer?: boolean;
};

interface CouponCardProps {
    coupon: CouponData;
    onUse?: (code: string) => void;
}

export default function CouponCard({ coupon, onUse }: CouponCardProps) {
    const isPercentage = coupon.discount_type === 'percentage';

    // Format expiration days
    const expirationDate = new Date(coupon.expiration_date);
    const now = new Date();
    const diffTime = Math.max(0, expirationDate.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const discountText = isPercentage
        ? `${coupon.discount_value}% OFF`
        : `R$ ${coupon.discount_value.toFixed(2).replace('.', ',')} OFF`;

    const minOrderText = coupon.min_order_value
        ? `Acima de R$${coupon.min_order_value.toFixed(0)}`
        : `Sem valor mínimo`;

    return (
        <div className="relative bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col items-start w-full border border-stone-100">

            {/* Left side semi-circle cutout */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-6 h-6 bg-stone-50 rounded-full border border-stone-100/50"></div>
            {/* Right side semi-circle cutout */}
            <div className="absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-6 bg-stone-50 rounded-full border border-stone-100/50"></div>

            {/* New Customer Badge (Optional based on data) */}
            {coupon.isNewCustomer && (
                <div className="bg-[#00C48C] text-white text-xs font-bold px-3 py-1 rounded-md mb-2">
                    Cupons para novos clientes
                </div>
            )}

            {/* Main Title */}
            <h3 className="text-[#00C48C] text-2xl font-black tracking-tight mb-2">
                {discountText} {coupon.min_order_value ? `- Até R$${(coupon.discount_value * 1.5).toFixed(0)}` : ''}
            </h3>

            {/* Subtext info */}
            <h4 className="font-bold text-stone-900 text-[15px] mb-1">{discountText}</h4>

            {diffDays <= 7 ? (
                <p className="text-[#FF8A00] text-sm font-medium mb-3">Expira em {diffDays} dia(s)</p>
            ) : (
                <p className="text-stone-500 text-sm font-medium mb-3">
                    Válido até {expirationDate.toLocaleDateString('pt-BR')}
                </p>
            )}

            {/* Tags */}
            <div className="flex flex-col gap-2 w-full mt-2">
                <span className="bg-stone-100 text-stone-600 text-[13px] font-medium px-2 py-0.5 rounded w-fit">
                    Apenas no restaurante
                </span>

                <div className="flex items-center justify-between w-full mt-2">
                    <div className="flex items-center gap-1 bg-stone-100 rounded-full px-3 py-1 cursor-pointer hover:bg-stone-200 transition">
                        <span className="text-[13px] font-medium text-stone-700">{minOrderText}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-500 mt-0.5">
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </div>

                    <button
                        onClick={() => onUse && onUse(coupon.code)}
                        className="bg-[#FFDD00] text-stone-900 font-bold px-4 py-2 rounded-3xl text-sm shadow-sm hover:brightness-95 transition active:scale-95"
                    >
                        Usar agora
                    </button>
                </div>
            </div>
        </div>
    );
}
