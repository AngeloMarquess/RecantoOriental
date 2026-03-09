'use client';

import { useState, useRef } from 'react';
import { UserProfile, updateProfileInfo, uploadAvatar } from '@/utils/supabase/profile';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, UserCircle, ShieldCheck, Camera, Loader2 } from 'lucide-react';

interface EditProfileScreenProps {
    profile: UserProfile | null;
    userEmail?: string;
    onBack: () => void;
}

export default function EditProfileScreen({ profile, userEmail, onBack }: EditProfileScreenProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isUploading, setIsUploading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url);

    const fullName = profile?.full_name || '';
    const firstName = fullName.split(' ')[0] || '';
    const lastName = fullName.substring(firstName.length).trim() || '';

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !profile?.id) return;

        try {
            setIsUploading(true);
            const newAvatarUrl = await uploadAvatar(profile.id, file);

            if (newAvatarUrl) {
                await updateProfileInfo(profile.id, { avatar_url: newAvatarUrl });
                setAvatarUrl(newAvatarUrl);
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to upload avatar", error);
            alert("Erro ao enviar a imagem. Tente novamente.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#F5F5F5]">
            {/* Header */}
            <div className="bg-gradient-to-b from-[#FFF5ED] to-white pt-6 pb-20 relative px-4">
                <button
                    onClick={onBack}
                    className="absolute top-4 left-4 p-2 text-stone-700 hover:bg-black/5 rounded-full transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>

                {/* Center Avatar */}
                <div className="mt-6 flex flex-col items-center justify-center">
                    <div
                        className="relative w-24 h-24 rounded-full border-4 border-white shadow-md bg-stone-200 cursor-pointer overflow-hidden group mb-3"
                        onClick={handleAvatarClick}
                    >
                        {isUploading ? (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            </div>
                        ) : (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                        )}

                        {avatarUrl ? (
                            <Image src={avatarUrl} alt={fullName} width={96} height={96} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400">
                                <UserCircle size={64} />
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />

                    {/* Badges */}
                    <div className="flex items-center gap-2 mt-2">
                        <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm">
                            ⭐ 4,92
                        </span>
                        <span className="bg-white text-stone-700 border border-stone-200 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 shadow-sm">
                            <ShieldCheck size={14} className="text-yellow-500" /> Perfil Premium
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 px-4 -mt-12 overflow-y-auto">
                {/* Info Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden mb-4">
                    <div className="flex items-center justify-between p-4 border-b border-stone-100 cursor-pointer hover:bg-stone-50 transition-colors">
                        <span className="font-medium text-stone-800">Nome</span>
                        <div className="flex items-center gap-2 text-stone-500 text-sm">
                            <span className="truncate max-w-[120px]">{firstName}</span>
                            <ChevronRight size={16} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-stone-50 transition-colors">
                        <span className="font-medium text-stone-800">Sobrenome</span>
                        <div className="flex items-center gap-2 text-stone-500 text-sm">
                            <span className="truncate max-w-[120px]">{lastName}</span>
                            <ChevronRight size={16} />
                        </div>
                    </div>
                </div>

                {/* Settings Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden mb-6">
                    <div className="flex items-center justify-between p-4 border-b border-stone-100 cursor-pointer hover:bg-stone-50 transition-colors">
                        <span className="font-medium text-stone-800">Alterar telefone</span>
                        <div className="flex items-center gap-2 text-stone-500 text-sm">
                            <span>{profile?.phone_number || 'Adicionar'}</span>
                            <ChevronRight size={16} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border-b border-stone-100 cursor-pointer hover:bg-stone-50 transition-colors">
                        <span className="font-medium text-stone-800">Alterar email</span>
                        <div className="flex items-center gap-2 text-stone-500 text-sm">
                            <span className="truncate max-w-[150px]">{userEmail}</span>
                            <ChevronRight size={16} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border-b border-stone-100 cursor-pointer hover:bg-stone-50 transition-colors">
                        <span className="font-medium text-stone-800">Alterar senha</span>
                        <ChevronRight size={16} className="text-stone-400" />
                    </div>
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-stone-50 transition-colors">
                        <span className="font-medium text-stone-800">Gestão de dispositivo</span>
                        <ChevronRight size={16} className="text-stone-400" />
                    </div>
                </div>

                {/* Delete Account */}
                <button className="w-full bg-white rounded-2xl shadow-sm border border-stone-100 p-4 text-red-500 font-medium mb-8 hover:bg-red-50 transition-colors active:scale-[0.98]">
                    Excluir minha conta
                </button>
            </div>
        </div>
    );
}
