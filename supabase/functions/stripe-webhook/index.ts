import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  try {
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
    const webhookSecret2 = Deno.env.get("STRIPE_WEBHOOK_SECRET_2") || "";
    
    if (!stripeSecret || !webhookSecret) {
      logStep("Missing Stripe secrets");
      return new Response(JSON.stringify({ error: "Missing Stripe secrets" }), { status: 500 });
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: "2025-08-27.basil" });

    const signature = req.headers.get("stripe-signature") || req.headers.get("Stripe-Signature");
    const body = await req.text();

    let event: Stripe.Event;
    let webhookUsed = "";
    
    // Try first webhook secret (memorable-voyage-snapshot)
    try {
      event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
      webhookUsed = "STRIPE_WEBHOOK_SECRET";
      logStep("Event constructed with first webhook", { type: event.type, id: event.id });
    } catch (err) {
      // If first webhook fails and we have a second one, try it
      if (webhookSecret2) {
        try {
          event = stripe.webhooks.constructEvent(body, signature!, webhookSecret2);
          webhookUsed = "STRIPE_WEBHOOK_SECRET_2";
          logStep("Event constructed with second webhook", { type: event.type, id: event.id });
        } catch (err2) {
          logStep("Invalid signature on both webhooks", { 
            error1: (err as Error).message,
            error2: (err2 as Error).message 
          });
          return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
        }
      } else {
        logStep("Invalid signature", { error: (err as Error).message });
        return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
      }
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Helper: priceId -> tier mapping (keep in sync with frontend)
    const PRICE_TO_TIER: Record<string, string> = {
      "price_1UBbYVJ0DTKAEOs5SXGjUsKV": "pro",        // pro_monthly
      "price_1UBbZQJ0DTKAEOs51PjDog77": "pro",        // pro_yearly
      "price_1UBba9J0DTKAEOs518l1ITQ6": "business",   // business_monthly
      "price_1UBbc5J0DTKAEOs5o918MIj6": "business",   // business_yearly
      "price_1UBbczJ0DTKAEOs5pyklAXVb": "lifetime",   // lifetime one-off
    };

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id as string | undefined;
        const tierFromMeta = session.metadata?.tier as string | undefined;
        const mode = session.mode;

        const stripeCustomerId = typeof session.customer === "string" ? session.customer : (session.customer as any)?.id;
        const stripeSubscriptionId = typeof session.subscription === "string" ? session.subscription : (session.subscription as any)?.id;

        if (!userId) {
          logStep("Missing user_id in session metadata");
          break;
        }

        const tier = tierFromMeta || (session.mode === "subscription" ? "pro" : "lifetime");
        logStep("checkout.session.completed", { userId, tier, mode, stripeCustomerId, stripeSubscriptionId });

        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_tier: tier,
            subscription_status: "active",
            stripe_customer_id: stripeCustomerId ?? null,
            stripe_subscription_id: stripeSubscriptionId ?? null,
          })
          .eq("id", userId);

        if (error) {
          logStep("Supabase update error (checkout.session.completed)", { error: error.message });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price?.id;
        const tier = (priceId && PRICE_TO_TIER[priceId]) || "pro"; // fallback
        const stripeCustomerId = typeof subscription.customer === "string" ? subscription.customer : (subscription.customer as any)?.id;

        logStep("subscription upsert", { subscriptionId: subscription.id, status: subscription.status, tier, priceId });

        // Find profile by customer id
        const { data: profiles, error: selectErr } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", stripeCustomerId)
          .limit(1);

        if (selectErr) {
          logStep("Supabase select error (subscription.updated)", { error: selectErr.message });
          break;
        }

        const profileId = profiles?.[0]?.id;
        if (!profileId) {
          // Try by existing subscription id
          const { data: bySub, error: bySubErr } = await supabase
            .from("profiles")
            .select("id")
            .eq("stripe_subscription_id", subscription.id)
            .limit(1);
          if (bySubErr) {
            logStep("Supabase select error (by subscription id)", { error: bySubErr.message });
            break;
          }
          if (!bySub?.[0]) {
            logStep("No profile found for subscription update");
            break;
          }
          const pid = bySub[0].id;
          const { error: updErr } = await supabase
            .from("profiles")
            .update({
              subscription_tier: tier,
              subscription_status: subscription.status,
              stripe_customer_id: stripeCustomerId ?? null,
              stripe_subscription_id: subscription.id,
            })
            .eq("id", pid);
          if (updErr) logStep("Supabase update error (update by subscription id)", { error: updErr.message });
          break;
        }

        const { error: updErr } = await supabase
          .from("profiles")
          .update({
            subscription_tier: tier,
            subscription_status: subscription.status,
            stripe_customer_id: stripeCustomerId ?? null,
            stripe_subscription_id: subscription.id,
          })
          .eq("id", profileId);
        if (updErr) logStep("Supabase update error (subscription.updated)", { error: updErr.message });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("subscription deleted", { subscriptionId: subscription.id });
        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_tier: "free",
            subscription_status: "canceled",
          })
          .eq("stripe_subscription_id", subscription.id);
        if (error) logStep("Supabase update error (subscription.deleted)", { error: error.message });
        break;
      }

      default:
        // No-op for other events
        logStep("Unhandled event", { type: event.type });
        break;
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (e) {
    logStep("Unhandled error", { error: (e as Error).message });
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
});
