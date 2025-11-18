import type { DeliveryType } from "./templates";

export type PricingInput = {
  deliveryType: DeliveryType;
  totalTextMoments: number;
  activeDiscountPrice: number | null; // e.g. 50
  freePremiumMoments: number; // from referrals
  useFreePremiumMoment?: boolean;
};

export type PricingResult = {
  price: number;
  isPremium: boolean;
  hasWatermark: boolean;
  consumedFreePremium: boolean;
};

/**
 * Core RANIA pricing logic:
 * - First 10 text moments are FREE (with watermark).
 * - Premium moment default price = KES 130.
 * - Active discount price (e.g. 50) overrides KES 130.
 * - Free premium moments can be used instead of paying.
 */
export function computeMomentPricing(input: PricingInput): PricingResult {
  const {
    deliveryType,
    totalTextMoments,
    activeDiscountPrice,
    freePremiumMoments,
    useFreePremiumMoment,
  } = input;

  const isText = deliveryType === "text";
  const isPremiumDelivery =
    deliveryType === "user_voice" ||
    deliveryType === "user_video" ||
    deliveryType === "kid_voice" ||
    deliveryType === "kid_video";

  // 1) Free text tier (first 10 text moments)
  if (isText && totalTextMoments < 10 && !useFreePremiumMoment) {
    return {
      price: 0,
      isPremium: false,
      hasWatermark: true,
      consumedFreePremium: false,
    };
  }

  // 2) If user chooses to consume a free premium moment
  if (useFreePremiumMoment && freePremiumMoments > 0) {
    return {
      price: 0,
      isPremium: true,
      hasWatermark: false,
      consumedFreePremium: true,
    };
  }

  // 3) Standard premium pricing
  const basePremiumPrice = 130;
  const price = activeDiscountPrice ?? basePremiumPrice;

  return {
    price,
    isPremium: isPremiumDelivery || price > 0,
    hasWatermark: price === 0 ? false : true,
    consumedFreePremium: false,
  };
}


