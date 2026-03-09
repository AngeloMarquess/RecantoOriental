'use client';

import { useState } from 'react';
import { UserProfile } from '@/utils/supabase/profile';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronRight, X, UserCircle, ClipboardList, ShieldCheck, HeartPulse, CreditCard, Settings, MessageSquare, TicketPercent, Share2, ScanLine, LogOut, HelpCircle, User } from 'lucide-react';
import EditProfileScreen from './EditProfileScreen';

interface CustomerProfileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    profile: UserProfile | null;
    userEmail?: string;
}

export default function CustomerProfileDrawer({ isOpen, onClose, profile, userEmail }: CustomerProfileDrawerProps) {
    const router = useRouter();
    const supabase = createClient();
    const [currentView, setCurrentView] = useState<'MENU' | 'EDIT'>('MENU');

    const fullName = profile?.full_name || 'Cliente';
    const firstName = fullName.split(' ')[0];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        onClose();
    };

    const menuItems = [
        { icon: <ClipboardList size={22} className="text-[#FF7A00]" />, label: 'Atividade', onClick: () => { onClose(); router.push('/pedidos'); } },
        { icon: <TicketPercent size={22} className="text-[#00C48C]" />, label: 'Meus Cupons', badge: 'Novos', onClick: () => { onClose(); router.push('/cupons'); } },
        { icon: <MessageSquare size={22} className="text-[#00C48C]" />, label: 'Mensagens', onClick: () => { } },
        { icon: <ShieldCheck size={22} className="text-[#1066FF]" />, label: 'Central de segurança', onClick: () => { } },
        { icon: <CreditCard size={22} className="text-[#1066FF]" />, label: 'Métodos de pagamento', onClick: () => { onClose(); router.push('/pagamentos'); } },
        { icon: <Settings size={22} className="text-[#1066FF]" />, label: 'Configurações', onClick: () => { } },
        { icon: <HelpCircle size={22} className="text-[#1066FF]" />, label: 'Ajuda', onClick: () => { } },
        { icon: <LogOut size={22} className="text-red-500" />, label: 'Sair da conta', onClick: handleLogout }
    ];

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[60] transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed inset-y-0 right-0 w-full md:w-96 bg-stone-50 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {currentView === 'MENU' ? (
                    <div className="flex-1 overflow-y-auto bg-[#F5F5F5]">
                        {/* Header/Profile Hero */}
                        <div className="bg-white p-6 pb-4">
                            <div className="flex items-start justify-between">
                                <div
                                    className="flex-1 flex items-center gap-3 cursor-pointer group"
                                    onClick={() => setCurrentView('EDIT')}
                                >
                                    <div className="flex-1">
                                        <h2 className="font-bold text-2xl text-stone-900 flex items-center gap-2">
                                            {firstName}
                                            <ShieldCheck size={20} className="text-yellow-500 fill-yellow-100" />
                                        </h2>
                                        <p className="text-stone-500 text-sm flex items-center gap-1 mt-1 group-hover:text-primary transition-colors">
                                            Editar minhas informações <ChevronRight size={14} />
                                        </p>
                                    </div>

                                    {/* Avatar */}
                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-stone-200 border-2 border-white shadow-sm flex items-center justify-center shrink-0">
                                        {profile?.avatar_url ? (
                                            <Image src={profile.avatar_url} alt={fullName} width={64} height={64} className="w-full h-full object-cover" />
                                        ) : (
                                            <UserCircle size={40} className="text-stone-400" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Clube 99 Card (Clube Recanto) */}
                            <div className="mt-6 bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-xl p-4 flex items-center justify-between border border-yellow-200/50">
                                <div>
                                    <h3 className="font-bold text-stone-900 flex items-center gap-1">
                                        Clube <span className="bg-yellow-400 text-stone-900 text-xs px-1.5 py-0.5 rounded-md font-black italic">RC</span>
                                    </h3>
                                    <p className="text-xs text-stone-600 mt-1">Receba cupons e descontos exclusivos</p>
                                </div>
                                <button className="bg-yellow-400 text-stone-900 text-sm font-bold px-4 py-1.5 rounded-full hover:bg-yellow-500 transition-colors">
                                    Ver
                                </button>
                            </div>
                        </div>

                        {/* Menu List */}
                        <div className="bg-white mt-2 py-2 flex-1">
                            {menuItems.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={item.onClick}
                                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-stone-50 transition-colors"
                                >
                                    <div className="shrink-0">{item.icon}</div>
                                    <span className="font-medium text-stone-800 text-base">{item.label}</span>
                                    {item.badge && (
                                        <span className="ml-2 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Drawer Close Button (Floating) */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm text-stone-600 hover:bg-white hover:text-stone-900 transition-colors z-10"
                        >
                            <X size={20} />
                        </button>
                    </div>
                ) : (
                    <EditProfileScreen
                        profile={profile}
                        userEmail={userEmail}
                        onBack={() => setCurrentView('MENU')}
                    />
                )}
            </div>
        </>
    );
}
