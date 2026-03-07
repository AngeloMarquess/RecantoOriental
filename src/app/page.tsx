import { ChevronRight, MapPin, Search, Star, Clock, Utensils, UserCircle, LogOut } from "lucide-react";
import Link from "next/link";
import CartButton from "@/components/CartButton";
import AddToCartButton from "@/components/AddToCartButton";
import { createClient } from "@/utils/supabase/server";
import { logout } from "./auth/actions";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  const success = resolvedSearchParams?.success as string | undefined

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch real categories and products
  const { data: categories } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
  const { data: products } = await supabase.from('products').select('*').eq('is_available', true).order('created_at', { ascending: false }).limit(20);

  // Get user's first name from metadata
  const fullName = user?.user_metadata?.full_name || "";
  const firstName = fullName.split(" ")[0];

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-primary shadow-lg text-white">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-full w-10 h-10 flex items-center justify-center text-primary">
              <Utensils size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-wide uppercase">Recanto Oriental</h1>
              <p className="text-xs text-red-200 font-medium">Delivery Rápido</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium hidden sm:block">Olá, {firstName}</span>
                <form action={logout}>
                  <button type="submit" className="p-2 hover:bg-white/20 rounded-full transition" title="Sair" suppressHydrationWarning>
                    <LogOut size={18} />
                  </button>
                </form>
              </div>
            ) : (
              <Link href="/login" className="text-sm font-bold flex items-center gap-1 hover:text-red-200 transition">
                <UserCircle size={20} /> Entrar
              </Link>
            )}
            <CartButton />
          </div>
        </div>
      </header>

      {/* Location Bar */}
      <div className="bg-white py-3 px-4 shadow-sm mb-4">
        <div className="max-w-md mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-stone-600">
            <MapPin size={18} className="text-primary" />
            <p className="truncate w-48">Entregar em: <span className="font-semibold text-stone-900">Rua das Flores, 123</span></p>
          </div>
          <button className="text-primary font-medium text-xs" suppressHydrationWarning>Alterar</button>
        </div>
      </div>

      <main className="max-w-md mx-auto px-4 space-y-8">
        {/* Success Alert */}
        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded-xl text-sm font-bold border border-green-200 shadow-sm text-center">
            🎉 {success}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
          <input 
            type="text" 
            placeholder="O que vamos pedir hoje?" 
            className="w-full bg-white border border-stone-200 text-stone-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            suppressHydrationWarning
          />
        </div>

        {/* Hero Banner Promo */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent to-stone-900 text-white shadow-xl shadow-stone-200">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-20 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary opacity-30 rounded-full blur-2xl -ml-10 -mb-10"></div>
          
          <div className="relative p-6 flex flex-col justify-center h-40">
            <span className="bg-secondary text-white text-xs font-bold px-2 py-1 rounded-md w-max mb-2 uppercase tracking-wide">
              Promoção
            </span>
            <h2 className="text-2xl font-black leading-tight mb-1">
              Festival<br/>Sushi & Sashimi
            </h2>
            <p className="text-sm text-stone-300">Até 30% Off nos combinados</p>
          </div>
        </section>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-stone-100 flex items-center gap-3">
            <div className="bg-green-100 text-green-600 p-2 rounded-lg">
              <Star size={20} fill="currentColor" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Avaliação</p>
              <p className="font-bold text-stone-800">4.9 <span className="text-[10px] font-normal text-stone-400">(500+)</span></p>
            </div>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-stone-100 flex items-center gap-3">
            <div className="bg-orange-100 text-orange-600 p-2 rounded-lg">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-stone-500">Tempo Médio</p>
              <p className="font-bold text-stone-800">40-50 min</p>
            </div>
          </div>
        </div>

        {/* Categories Carousel */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-stone-800">Categorias</h3>
            <button className="text-primary text-sm font-medium flex items-center hover:text-red-700 transition" suppressHydrationWarning>
              Ver todas <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {categories?.length === 0 ? (
               <p className="text-sm text-stone-500 italic">Nenhuma categoria cadastrada.</p>
            ) : (
              categories?.map((cat, i) => (
                <div key={cat.id || i} className="flex flex-col items-center gap-2 min-w-[72px]">
                  <button className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-transform active:scale-95 bg-white text-primary border border-stone-200 hover:border-primary/50 hover:bg-red-50`} suppressHydrationWarning>
                    {/* Placeholder for real images. We use an emoji map or default icon for now. */}
                    {cat.name.toLowerCase().includes('temaki') ? '🍙' : 
                     cat.name.toLowerCase().includes('yakisoba') ? '🍜' : 
                     cat.name.toLowerCase().includes('combinado') ? '🍣' : 
                     cat.name.toLowerCase().includes('entrada') ? '🥟' : 
                     cat.name.toLowerCase().includes('bebida') ? '🥤' : '🥢'}
                  </button>
                  <span className={`text-xs font-medium text-stone-700 text-center truncate w-full`}>{cat.name}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Popular Items / Products */}
        <section className="pb-8">
          <h3 className="font-bold text-lg text-stone-800 mb-4">Destaques do Cardápio</h3>
          <div className="space-y-4">
            {products?.length === 0 ? (
              <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm text-center">
                <p className="text-stone-500 text-sm">Nenhum produto cadastrado no momento.</p>
              </div>
            ) : (
              products?.map((item) => (
                <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm border border-stone-100 flex gap-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="w-24 h-24 bg-stone-50 border border-stone-100 rounded-lg flex items-center justify-center text-4xl flex-shrink-0">
                    {/* Using simple emojis if no image is uploaded */}
                    {item.name.toLowerCase().includes('temaki') ? '🍙' : 
                     item.name.toLowerCase().includes('yakisoba') ? '🍜' : 
                     item.name.toLowerCase().includes('combinado') ? '🍣' : 
                     item.name.toLowerCase().includes('ceviche') ? '🥗' : '🍱'}
                  </div>
                  <div className="flex flex-col flex-grow py-1">
                    <h4 className="font-bold text-stone-800 text-sm leading-tight mb-1">{item.name}</h4>
                    {item.description && (
                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-auto">{item.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <span className="font-bold text-primary text-base">R$ {Number(item.price).toFixed(2).replace('.', ',')}</span>
                      <AddToCartButton 
                        product={{
                          id: item.id,
                          name: item.name,
                          price: Number(item.price),
                          icon: item.name.toLowerCase().includes('temaki') ? '🍙' : 
                                item.name.toLowerCase().includes('yakisoba') ? '🍜' : 
                                item.name.toLowerCase().includes('combinado') ? '🍣' : 
                                item.name.toLowerCase().includes('ceviche') ? '🥗' : '🍱'
                        }} 
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
