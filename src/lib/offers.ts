import { supabase } from "@/integrations/supabase/client";
import { whatsappUrl } from "@/lib/business";

export type Offer = {
  id: string;
  headline: string;
  supporting_text: string | null;
  original_price: string | null;
  offer_price: string | null;
  image_url: string;
  cta_label: string;
  active: boolean;
  sort_order: number;
};

export async function fetchActiveOffers(): Promise<Offer[]> {
  const { data, error } = await (supabase as any)
    .from("offers")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Offer[];
}

export function offerEnquiryUrl(headline: string) {
  return whatsappUrl(`Hello Maleka Furnitures, I'd like to know more about the offer: ${headline}.`);
}
