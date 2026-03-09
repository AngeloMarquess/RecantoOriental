import { createClient } from './client';

export interface UserProfile {
    id: string;
    full_name: string;
    phone_number: string | null;
    role: string;
    avatar_url: string | null;
}

export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
    const supabase = createClient();

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading avatar:', uploadError);
            throw uploadError;
        }

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        return data.publicUrl;
    } catch (error) {
        console.error('Exception configuring upload:', error);
        return null;
    }
}

export async function updateProfileInfo(
    userId: string,
    updates: Partial<UserProfile>
) {
    const supabase = createClient();

    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

    if (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
}
