export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Visão Geral</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
          <h3 className="text-stone-500 font-medium text-sm">Pedidos Hoje</h3>
          <p className="text-3xl font-black text-stone-900 mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
          <h3 className="text-stone-500 font-medium text-sm">Faturamento Hoje</h3>
          <p className="text-3xl font-black text-green-600 mt-2">R$ 0,00</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
          <h3 className="text-stone-500 font-medium text-sm">Clientes Ativos</h3>
          <p className="text-3xl font-black text-stone-900 mt-2">0</p>
        </div>
      </div>
      
      <div className="mt-8 bg-blue-50 text-blue-800 p-4 rounded-lg text-sm border border-blue-100">
        <strong>Aviso:</strong> A área administrativa está em construção. Comece cadastrando suas Categorias de Produtos usando o menu lateral.
      </div>
    </div>
  )
}
