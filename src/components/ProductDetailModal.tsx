'use client'

import * as Dialog from '@radix-ui/react-dialog';
import { X, Minus, Plus, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { createClient } from '@/utils/supabase/client';

export interface ComplementCategory {
  id: string;
  name: string;
  description: string;
  min_selections: number;
  max_selections: number;
  is_required: boolean;
  complements: Complement[];
}

export interface Complement {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url?: string;
}

export default function ProductDetailModal({ 
  product, 
  children 
}: { 
  product: { id: string, name: string, price: number, description?: string, icon?: string, image_url?: string, original_price?: number, serves?: number },
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<ComplementCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [comment, setComment] = useState("");
  
  // selections map: categoryId -> array of { complementId, quantity }
  const [selections, setSelections] = useState<Record<string, { id: string, quantity: number, price: number, name: string }[]>>({});

  const addItemToCart = useCartStore(state => state.addItem);
  const openCart = useCartStore(state => state.openCart);

  // Fetch Complements only when modal opens
  useEffect(() => {
    if (open) {
      setQuantity(1);
      setComment("");
      setSelections({});
      fetchComplements();
    }
  }, [open, product.id]);

  const fetchComplements = async () => {
    setLoading(true);
    const supabase = createClient();
    
    // Fetch categories for this product
    const { data: catsData } = await supabase
      .from('product_complement_categories')
      .select('*')
      .eq('product_id', product.id)
      .order('sort_order');

    if (catsData && catsData.length > 0) {
      // Fetch the complements for these categories
      const { data: compsData } = await supabase
        .from('product_complements')
        .select('*')
        .in('category_id', catsData.map(c => c.id))
        .eq('is_available', true)
        .order('sort_order');

      // Group them together
      const fullCats = catsData.map(cat => ({
        ...cat,
        complements: compsData?.filter(comp => comp.category_id === cat.id) || []
      }));
      setCategories(fullCats);
    } else {
      setCategories([]);
    }
    
    setLoading(false);
  };

  const handleSelectComplement = (category: ComplementCategory, complement: Complement, delta: number) => {
    setSelections(prev => {
      const currentCatSelections = prev[category.id] || [];
      const currentItemIndex = currentCatSelections.findIndex(item => item.id === complement.id);
      
      let newCatSelections = [...currentCatSelections];
      
      // Validation Check for max_selections before incrementing
      const currentTotalCategoryQty = newCatSelections.reduce((sum, item) => sum + item.quantity, 0);

      if (delta > 0) {
        if (currentTotalCategoryQty >= category.max_selections) {
          // Reached limit, do nothing or replace if max_selections == 1
          if (category.max_selections === 1) {
             // Single choice mode (Radio-button like)
             newCatSelections = [{ id: complement.id, quantity: 1, price: complement.price, name: complement.name }];
             return { ...prev, [category.id]: newCatSelections };
          }
          return prev; 
        }
      }

      if (currentItemIndex >= 0) {
        // Item exists
        const newQty = newCatSelections[currentItemIndex].quantity + delta;
        if (newQty <= 0) {
          newCatSelections.splice(currentItemIndex, 1);
        } else {
          newCatSelections[currentItemIndex] = { ...newCatSelections[currentItemIndex], quantity: newQty };
        }
      } else if (delta > 0) {
        // New item Selection
        newCatSelections.push({ id: complement.id, quantity: 1, price: complement.price, name: complement.name });
      }

      return { ...prev, [category.id]: newCatSelections };
    });
  };

  const calculateTotalUnitCost = () => {
    let extrasTotal = 0;
    Object.values(selections).forEach(catSelections => {
      catSelections.forEach(item => {
        extrasTotal += item.price * item.quantity;
      });
    });
    return product.price + extrasTotal;
  };

  // Check if required categories are fulfilled
  const isRequirementsMet = () => {
    for (const cat of categories) {
      if (cat.is_required) {
        const catSelections = selections[cat.id] || [];
        const selectedQty = catSelections.reduce((sum, item) => sum + item.quantity, 0);
        if (selectedQty < cat.min_selections) return false;
      }
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!isRequirementsMet()) return; // Can show a toast or error in future
    
    // Flat array of extras selected
    const extrasArray = Object.values(selections).flat();
    
    addItemToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      icon: product.icon,
      extras: extrasArray.length > 0 ? extrasArray : undefined,
      comment: comment || undefined
    });
    
    setOpen(false);
    openCart(); // Auto open drawer to confirm to user
  };

  const formatPrice = (price: number) => `R$ ${Number(price).toFixed(2).replace('.', ',')}`;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {children}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-stone-900/40 z-50 transition-opacity backdrop-blur-sm" />
        <Dialog.Content 
          className="fixed z-50 bottom-0 left-0 right-0 max-h-[95vh] bg-stone-50 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-xl md:rounded-2xl rounded-t-3xl shadow-2xl flex flex-col focus:outline-none overflow-hidden"
          aria-describedby="product-modal-description"
        >
          {/* Main Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto pb-4">
            
            {/* Header / Hero */}
            <div className={`relative bg-white border-b border-stone-200 ${product.image_url ? 'pb-6' : 'pt-10 pb-6 px-6'}`}>
              
              {product.image_url && (
                <div className="w-full h-48 md:h-64 relative bg-stone-100 mb-4 overflow-hidden rounded-t-3xl md:rounded-t-2xl">
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent"></div>
                </div>
              )}

              <Dialog.Close asChild>
                <button className={`absolute top-4 right-4 p-2 rounded-full transition z-10 
                  ${product.image_url ? 'bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm' : 'bg-stone-100 hover:bg-stone-200 text-stone-500'}`}
                >
                  <X size={20} />
                </button>
              </Dialog.Close>
              
              <div className={`flex gap-4 items-center ${product.image_url ? 'px-6' : 'mb-3'}`}>
                {!product.image_url && (
                  <div className="w-20 h-20 bg-stone-50 border border-stone-100 rounded-2xl flex items-center justify-center text-4xl shadow-inner shrink-0">
                    {product.icon || '🥡'}
                  </div>
                )}
                <div className="flex-1 w-full">
                  <Dialog.Title className={`font-black text-stone-800 leading-tight ${product.image_url ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`}>
                    {product.name}
                  </Dialog.Title>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {product.original_price && product.original_price > product.price && (
                       <span className="text-sm text-stone-400 line-through font-medium">
                         R$ {product.original_price.toFixed(2).replace('.', ',')}
                       </span>
                    )}
                    <span className="text-primary font-black text-lg">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  {product.serves && (
                      <div className="mt-2.5 inline-flex items-center gap-1.5 bg-stone-100 text-stone-600 px-2.5 py-1 rounded-md text-xs font-bold w-max">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        Serve {product.serves} pessoa{product.serves > 1 ? 's' : ''}
                      </div>
                  )}
                </div>
              </div>

              <Dialog.Description id="product-modal-description" className={`text-stone-500 text-sm leading-relaxed mt-4 ${product.image_url ? 'px-6' : ''}`}>
                {product.description || 'Um prato delicioso preparado com os melhores ingredientes. Perfeito para o seu momento!'}
              </Dialog.Description>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="animate-spin text-stone-300" size={36} />
              </div>
            )}

            {/* Complements Sections */}
            {!loading && categories.map(cat => {
              const catSelections = selections[cat.id] || [];
              const selectedCount = catSelections.reduce((sum, item) => sum + item.quantity, 0);
              const isSatisfied = (!cat.is_required) || (selectedCount >= cat.min_selections);

              return (
                <div key={cat.id} className="mt-2 bg-white pb-3 border-y border-stone-200">
                  <div className="px-6 py-4 bg-stone-50/80 flex justify-between items-start border-b border-stone-100">
                    <div>
                      <h4 className="font-bold text-stone-800">{cat.name}</h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {cat.max_selections === 1 
                          ? 'Escolha 1 opção' 
                          : cat.is_required ? `Escolha de ${cat.min_selections} a ${cat.max_selections} opções` : `Escolha até ${cat.max_selections} opções`}
                      </p>
                    </div>
                    {cat.is_required && (
                      <span className={`text-[10px] font-bold px-2 py-1 rounded w-max uppercase ${isSatisfied ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {isSatisfied ? 'OK' : 'Obrigatório'}
                      </span>
                    )}
                  </div>

                  <div className="px-6">
                    {cat.complements.map(comp => {
                      const selectedQty = catSelections.find(s => s.id === comp.id)?.quantity || 0;
                      
                      return (
                        <div key={comp.id} className="flex justify-between items-center py-4 border-b border-stone-50 last:border-0">
                          <div className="flex-1 pr-4">
                            <h5 className="font-medium text-stone-800 text-sm">{comp.name}</h5>
                            <span className="text-stone-500 font-medium text-xs">
                              {comp.price > 0 ? `+ ${formatPrice(comp.price)}` : 'Grátis'}
                            </span>
                          </div>
                          
                          {/* Complement Controls */}
                          {cat.max_selections === 1 ? (
                            <button 
                              onClick={() => handleSelectComplement(cat, comp, 1)}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedQty > 0 ? 'border-primary bg-primary' : 'border-stone-300'}`}
                            >
                              {selectedQty > 0 && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                            </button>
                          ) : (
                            <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => handleSelectComplement(cat, comp, -1)}
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${selectedQty === 0 ? 'text-stone-300 bg-stone-50' : 'text-red-500 bg-red-50 hover:bg-red-100'}`}
                                  disabled={selectedQty === 0}
                                >
                                  <Minus size={14} />
                                </button>
                                
                                <span className={`w-3 text-center text-sm font-bold ${selectedQty > 0 ? "text-stone-800" : "text-stone-300"}`}>
                                  {selectedQty}
                                </span>
                                
                                <button 
                                  onClick={() => handleSelectComplement(cat, comp, 1)}
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${selectedCount >= cat.max_selections ? 'text-stone-300 bg-stone-50' : 'text-red-500 bg-red-50 hover:bg-red-100'}`}
                                  disabled={selectedCount >= cat.max_selections}
                                >
                                  <Plus size={14} />
                                </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Comments Section */}
            <div className="px-6 py-4 mt-2 mb-20 md:mb-4 bg-white border-y border-stone-200">
              <h4 className="font-bold text-stone-800 mb-2 flex items-center gap-2">
                Alguma observação?
              </h4>
              <textarea 
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none placeholder:text-stone-400"
                placeholder="Ex: Tirar a cebola, maionese à parte, etc."
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={140}
              />
              <div className="text-right text-xs text-stone-400 mt-1">{comment.length} / 140</div>
            </div>
          </div>

          {/* Sticky Bottom Footer */}
          <div className="bg-white border-t border-stone-200 p-4 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] md:rounded-b-2xl flex gap-3 z-10">
            <div className="flex items-center bg-stone-50 rounded-xl border border-stone-200 p-1">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center text-primary bg-white rounded-lg shadow-sm font-bold hover:bg-stone-50 transition-colors disabled:opacity-50"
                disabled={quantity <= 1}
              >
                <Minus size={18} />
              </button>
              <span className="w-8 text-center text-base font-bold text-stone-800">
                {quantity}
              </span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center text-primary bg-white rounded-lg shadow-sm font-bold hover:bg-stone-50 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              disabled={!isRequirementsMet()}
              className="flex-1 bg-primary text-white rounded-xl font-bold flex items-center justify-between px-5 hover:bg-red-700 transition shadow-lg shadow-red-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>Adicionar</span>
              <span>{formatPrice(calculateTotalUnitCost() * quantity)}</span>
            </button>
          </div>
          
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
