import { createClient } from "@/utils/supabase/server";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Calculate today's date range (midnight to 23:59:59)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = today.toISOString();

  today.setHours(23, 59, 59, 999);
  const endOfDay = today.toISOString();

  // 1. Pedidos Hoje
  const { count: ordersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay);

  // 2. Faturamento Hoje
  // Only sum delivered, prepared, out_for_delivery, or even pending orders (depending on business rule). Let's sum all orders not cancelled.
  const { data: todayOrders } = await supabase
    .from('orders')
    .select('total_amount')
    .neq('status', 'cancelled')
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay);

  const todayRevenue = todayOrders
    ? todayOrders.reduce((sum, order) => sum + Number(order.total_amount), 0)
    : 0;

  // 3. Clientes Ativos (Let's count all non-admin profiles)
  const { count: clientsCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .neq('role', 'admin');

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Visão Geral</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
          <h3 className="text-stone-500 font-medium text-sm">Pedidos Hoje</h3>
          <p className="text-3xl font-black text-stone-900 mt-2">{ordersCount || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
          <h3 className="text-stone-500 font-medium text-sm">Faturamento Hoje</h3>
          <p className="text-3xl font-black text-green-600 mt-2">
            R$ {todayRevenue.toFixed(2).replace('.', ',')}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
          <h3 className="text-stone-500 font-medium text-sm">Total de Clientes</h3>
          <p className="text-3xl font-black text-stone-900 mt-2">{clientsCount || 0}</p>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 text-blue-800 p-4 rounded-lg text-sm border border-blue-100">
        <strong>Seja bem-vindo(a) ao seu painel!</strong> Use o menu lateral para gerenciar os seus pedidos, produtos, categorias e cupons.
      </div>
    </div>
  )
}
