
import { supabase } from "@/integrations/supabase/client";
import { HeroBanner } from "./types";

export async function fetchBannersByPage(page: string, searchQuery: string): Promise<HeroBanner[]> {
  let query = supabase.from("hero_banners").select("*").eq("page", page);

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function createBanner(banner: {
  title: string;
  description: string;
  active: boolean;
  image_url: string;
  page: string;
}): Promise<void> {
  const { error } = await supabase.from("hero_banners").insert(banner);
  if (error) throw error;
}

export async function deleteBanner(id: string): Promise<void> {
  const { error } = await supabase.from("hero_banners").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleBannerStatus(id: string, active: boolean): Promise<void> {
  const { error } = await supabase
    .from("hero_banners")
    .update({ active: !active })
    .eq("id", id);

  if (error) throw error;
}
