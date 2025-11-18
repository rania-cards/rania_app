import { getSupabaseClient } from "./supabaseClient";

export type ActiveDiscount = {
  id: string;
  price: number;
  type: "standard_drop" | "receiver_drop";
};

export async function getActiveDiscountForUser(
  userId: string
): Promise<ActiveDiscount | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("discount_offers")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error loading discount_offers", error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    price: data.price,
    type: data.type,
  };
}

export async function markDiscountUsed(discountId: string) {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from("discount_offers")
    .update({ status: "used" })
    .eq("id", discountId);

  if (error) {
    console.error("Failed to mark discount as used", error);
  }
}