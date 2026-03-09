'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function AdminCouponForm() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formElement = e.currentTarget;
        const formData = new FormData(formElement);
        const code = formData.get('code') as string;
        const discount_type = formData.get('discount_type') as string;
        const discount_value = Number(formData.get('discount_value'));
        const min_order_value_raw = formData.get('min_order_value');
        const min_order_value = min_order_value_raw ? Number(min_order_value_raw) : null;
        const expiration_date = formData.get('expiration_date') as string;

        // Basic validation
        if (!code || !discount_value || !expiration_date) {
            setError("Preencha todos os campos obrigatórios.");
            setLoading(false);
            return;
        }

        const { error: insertError } = await supabase.from('coupons').insert({
            code: code.toUpperCase(),
            discount_type,
            discount_value,
            min_order_value,
            expiration_date: new Date(expiration_date).toISOString(),
            active: true
        });

        if (insertError) {
            console.error(insertError);
            setError(insertError.code === '23505' ? 'Este código já existe.' : 'Erro ao criar cupom. Tente novamente.');
        } else {
            formElement.reset();
            router.refresh(); // Refresh server component to show new list
        }

        setLoading(false);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

            <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Código do Cupom *</label>
                <input
                    type="text"
                    name="code"
                    placeholder="Ex: QUERO40"
                    required
                    className="w-full bg-stone-50 text-stone-900 border border-stone-200 rounded-lg p-2.5 uppercase focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Tipo *</label>
                    <select
                        name="discount_type"
                        className="w-full bg-stone-50 text-stone-900 border border-stone-200 rounded-lg p-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    >
                        <option value="percentage">Porcentagem (%)</option>
                        <option value="fixed">Valor Fixo (R$)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Valor *</label>
                    <input
                        type="number"
                        name="discount_value"
                        step="0.01"
                        min="0.01"
                        placeholder="Ex: 40"
                        required
                        className="w-full bg-stone-50 text-stone-900 border border-stone-200 rounded-lg p-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Valor Mínimo do Pedido (R$)</label>
                <input
                    type="number"
                    name="min_order_value"
                    min="0"
                    step="0.01"
                    placeholder="Opcional. Ex: 50"
                    className="w-full bg-stone-50 text-stone-900 border border-stone-200 rounded-lg p-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
                <p className="text-xs text-stone-500 mt-1">Deixe em branco p/ não exigir valor mínimo.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Data de Expiração *</label>
                <input
                    type="datetime-local"
                    name="expiration_date"
                    required
                    className="w-full bg-stone-50 text-stone-900 border border-stone-200 rounded-lg p-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:brightness-95 transition flex justify-center mt-6 disabled:opacity-70"
            >
                {loading ? 'Criando...' : 'Criar Código Promocional'}
            </button>
        </form>
    );
}
