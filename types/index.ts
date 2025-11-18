export type PlanType = "free" | "premium";

export type DeliveryType =
  | "text"
  | "user_voice"
  | "user_video"
  | "kid_voice"
  | "kid_video";

// -------------------------------
// USERS TABLE
// -------------------------------
export interface RaniaUser {
  id: string;
  email: string | null;
  name: string | null;
  plan: PlanType;
  referral_code: string | null;
  referral_count: number;
  free_premium_moments: number;
  created_at: string;
}

// -------------------------------
// MOMENTS TABLE
// -------------------------------
export interface RaniaMoment {
  id: string;
  user_id: string;
  receiver_name: string | null;
  occasion: string | null;
  relationship: string | null;
  tone: string | null;
  category: string | null;
  template_id: string | null;
  delivery_type: DeliveryType | null;
  message_text: string | null;
  media_url: string | null;
  is_premium: boolean;
  price_charged: number;
  has_watermark: boolean;
  referrer_id: string | null;
  created_at: string;
}

// -------------------------------
// DISCOUNT OFFERS TABLE
// -------------------------------
export interface DiscountOffer {
  id: string;
  user_id: string;
  type: "standard_drop" | "receiver_drop";
  price: number;
  status: "active" | "used" | "expired";
  expires_at: string | null;
  created_at: string;
}

// -------------------------------
// REFERRALS TABLE
// -------------------------------
export interface ReferralRow {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  status: "pending" | "completed";
  created_at: string;
}
