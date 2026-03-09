import { ChevronRight, MapPin, Search, Star, Clock, TicketPercent, UserCircle, LogOut, ClipboardList } from "lucide-react";
import Link from "next/link";
import CartButton from "@/components/CartButton";
import ProductDetailModal from "@/components/ProductDetailModal";
import SearchAndDeliveryBar from "@/components/SearchAndDeliveryBar";
import StoreClosedBanner from "@/components/StoreClosedBanner";
import { createClient } from "@/utils/supabase/server";
import { getStoreStatus } from "@/utils/storeStatus";
import { logout } from "./auth/actions";
import UserProfileMenu from "@/components/profile/UserProfileMenu";
import AddressHeaderButton from "@/components/address/AddressHeaderButton";

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

  // Base query for products
  let productsQuery = supabase.from('products').select('*').eq('is_available', true);

  // Apply search filter if query exists
  const searchQuery = resolvedSearchParams?.q as string | undefined;
  if (searchQuery) {
    productsQuery = productsQuery.ilike('name', `%${searchQuery}%`);
  }

  const { data: products } = await productsQuery.order('created_at', { ascending: false }).limit(20);

  let userProfile = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    userProfile = data;
  }

  const storeStatus = await getStoreStatus();

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Header / Navbar (99 Food Style Layout, Brand Colors) */}
      <header className="sticky top-0 z-50 bg-primary shadow-lg text-white">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between gap-3">

          {/* Avatar Profile Trigger */}
          {user ? (
            <UserProfileMenu
              userEmail={user.email}
              profile={userProfile}
            />
          ) : (
            <Link href="/login" className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full border border-white/30 text-white shrink-0 hover:bg-white/30 transition">
              <UserCircle size={32} />
            </Link>
          )}

          {/* Location Selector */}
          <AddressHeaderButton initialAddress="Rua José Braz Moscow, 978" />

          {/* Action Icons */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Coupons */}
            <button className="relative flex items-center justify-center transition active:scale-95 hover:opacity-80">
              <div className="bg-[#00C48C] text-white p-1.5 rounded-lg flex items-center justify-center shadow-sm border border-[#00C48C]/20">
                <TicketPercent size={20} className="fill-current" />
              </div>
            </button>

            {/* Orders */}
            <Link href="/pedidos" className="relative flex items-center justify-center text-white transition active:scale-95 hover:opacity-80" title="Meus Pedidos">
              <ClipboardList size={26} strokeWidth={2.5} />
            </Link>

            {/* Cart */}
            <CartButton />
          </div>
        </div>
      </header>

      {!storeStatus.isOpen && (
        <div className="max-w-md mx-auto mb-4 px-4 hidden md:block">
          <StoreClosedBanner />
        </div>
      )}
      {!storeStatus.isOpen && (
        <div className="md:hidden block mb-4">
          <StoreClosedBanner />
        </div>
      )}

      <main className="max-w-md mx-auto px-4 space-y-8">
        {/* Success Alert */}
        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded-xl text-sm font-bold border border-green-200 shadow-sm text-center">
            🎉 {success}
          </div>
        )}

        {/* Search and Delivery Area */}
        <SearchAndDeliveryBar />

        {/* Hero Banner Promo */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent to-stone-900 text-white shadow-xl shadow-stone-200">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-20 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary opacity-30 rounded-full blur-2xl -ml-10 -mb-10"></div>

          <div className="relative p-6 flex flex-col justify-center h-40">
            <span className="bg-secondary text-white text-xs font-bold px-2 py-1 rounded-md w-max mb-2 uppercase tracking-wide">
              Promoção
            </span>
            <h2 className="text-2xl font-black leading-tight mb-1">
              Festival<br />Sushi & Sashimi
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
                  <button className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-transform active:scale-95 bg-white text-primary border border-stone-200 hover:border-primary/50 hover:bg-red-50 overflow-hidden relative`} suppressHydrationWarning>
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={cat.name} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">
                        {cat.name.toLowerCase().includes('temaki') ? '🍙' :
                          cat.name.toLowerCase().includes('yakisoba') ? '🍜' :
                            cat.name.toLowerCase().includes('combinado') ? '🍣' :
                              cat.name.toLowerCase().includes('entrada') ? '🥟' :
                                cat.name.toLowerCase().includes('bebida') ? '🥤' : '🥢'}
                      </span>
                    )}
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
              products?.map((item) => {
                const icon = item.name.toLowerCase().includes('temaki') ? '🍙' :
                  item.name.toLowerCase().includes('yakisoba') ? '🍜' :
                    item.name.toLowerCase().includes('combinado') ? '🍣' :
                      item.name.toLowerCase().includes('ceviche') ? '🥗' : '🍱';

                return (
                  <ProductDetailModal
                    key={item.id}
                    product={{
                      id: item.id,
                      name: item.name,
                      price: Number(item.price),
                      description: item.description,
                      icon: icon,
                      image_url: item.image_url,
                      original_price: item.original_price ? Number(item.original_price) : undefined,
                      serves: item.serves
                    }}
                  >
                    <button className="bg-white p-3 rounded-xl shadow-sm border border-stone-100 flex gap-4 hover:shadow-md transition-shadow cursor-pointer text-left focus:outline-none overflow-hidden h-32 w-full" suppressHydrationWarning>
                      <div className="w-28 h-auto bg-stone-50 border border-stone-100 rounded-lg flex items-center justify-center text-4xl flex-shrink-0 relative overflow-hidden" suppressHydrationWarning>
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          icon
                        )}
                      </div>
                      <div className="flex flex-col flex-grow py-1 justify-between min-w-0" suppressHydrationWarning>
                        <div suppressHydrationWarning>
                          <h4 className="font-bold text-stone-800 text-sm leading-tight mb-1 truncate">{item.name}</h4>
                          {item.description && (
                            <p className="text-xs text-stone-500 line-clamp-2 leading-snug">{item.description}</p>
                          )}
                          {item.serves && (
                            <p className="text-[10px] text-stone-400 mt-1 flex items-center gap-1 font-medium">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                              Serve {item.serves} pessoa{item.serves > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2" suppressHydrationWarning>
                          {item.original_price && Number(item.original_price) > Number(item.price) && (
                            <span className="text-xs text-stone-400 line-through font-medium">
                              R$ {Number(item.original_price).toFixed(2).replace('.', ',')}
                            </span>
                          )}
                          <span className="font-bold text-primary text-base">R$ {Number(item.price).toFixed(2).replace('.', ',')}</span>
                        </div>
                      </div>
                    </button>
                  </ProductDetailModal>
                )
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
