import { getSupabaseClient } from "./supabaseClient";
import type { ReferralRow, RaniaUser } from "@/types";

export async function getReferralStatus(userId: string) {
  const supabase = getSupabaseClient();

  const [{ data: userData }, { data: completedReferrals }] = await Promise.all([
    supabase.from("users").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("referrals")
      .select("*")
      .eq("referrer_id", userId)
      .eq("status", "completed"),
  ]);

  const referralCount = completedReferrals?.length ?? 0;
  const freePremiumMoments = userData?.free_premium_moments ?? 0;

  return {
    referralCount,
    freePremiumMoments,
  };
}

/**
 * Called when a new user sends their first moment and has a referrer.
 * - Marks referral as completed or creates it.
 * - Every 3 completed referrals => +1 free_premium_moments for referrer.
 */
export async function handleReferralOnFirstMoment(
  referrerId: string,
  referredUserId: string
) {
  const supabase = getSupabaseClient();

  // 1) Upsert referral row as completed
  const { data: existing, error: selectError } = await supabase
    .from("referrals")
    .select("*")
    .eq("referrer_id", referrerId)
    .eq("referred_user_id", referredUserId)
    .maybeSingle<ReferralRow>();

  if (selectError) {
    console.error("Error checking referral", selectError);
  }

  if (!existing) {
    const { error: insertError } = await supabase.from("referrals").insert({
      referrer_id: referrerId,
      referred_user_id: referredUserId,
      status: "completed",
    });

    if (insertError) {
      console.error("Error inserting referral", insertError);
    }
  } else if (existing.status !== "completed") {
    const { error: updateError } = await supabase
      .from("referrals")
      .update({ status: "completed" })
      .eq("id", existing.id);
    if (updateError) console.error("Error updating referral", updateError);
  }

  // 2) Recalculate referralCount and free premium moments
  const { data: allCompleted, error: allError } = await supabase
    .from("referrals")
    .select("*")
    .eq("referrer_id", referrerId)
    .eq("status", "completed");

  if (allError) {
    console.error("Error fetching referrals for bonus calc", allError);
    return;
  }

  const referralCount = allCompleted?.length ?? 0;
  const bonusMoments = Math.floor(referralCount / 3);

  const { data: referrerUser, error: refUserError } = await supabase
    .from("users")
    .select("*")
    .eq("id", referrerId)
    .maybeSingle<RaniaUser>();

  if (refUserError) {
    console.error("Error getting referrer user", refUserError);
    return;
  }

  const currentFree = referrerUser?.free_premium_moments ?? 0;

  const { error: updateReferrerError } = await supabase
    .from("users")
    .update({ free_premium_moments: bonusMoments })
    .eq("id", referrerId);

  if (updateReferrerError) {
    console.error("Error updating free_premium_moments", updateReferrerError);
    return;
  }

  console.log(
    `Referral bonus updated. Referrer ${referrerId}: ${bonusMoments} free premium moments`
  );
}