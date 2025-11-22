export type MomentRow = {
  [x: string]: unknown;
  id: string;
  user_id: string;
  receiver_name: string | null;
  occasion: string | null;
  relationship: string | null;
  tone: string | null;
  category: string | null;
  template_id: string | null;
  delivery_type: string;
  message_text: string | null;
  media_url: string | null;
  is_premium: boolean;
  price_charged: number;
  referrer_id: string | null;
  created_at: string;
};