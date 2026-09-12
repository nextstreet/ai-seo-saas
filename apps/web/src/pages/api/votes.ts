import type { APIRoute } from 'astro';
import { hasSupabaseConfig, supabase } from '@/lib/supabase';

export const POST: APIRoute = async ({ request, clientAddress, redirect }) => {
  const form = await request.formData();
  const galleryItemId = String(form.get('galleryItemId') || '');

  if (hasSupabaseConfig && supabase && galleryItemId) {
    const voterHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${clientAddress}-${galleryItemId}`));
    const hash = Array.from(new Uint8Array(voterHash)).map((byte) => byte.toString(16).padStart(2, '0')).join('');

    await supabase.from('gallery_votes').insert({
      gallery_item_id: galleryItemId,
      voter_hash: hash
    });
  }

  return redirect('/gallery', 303);
};
