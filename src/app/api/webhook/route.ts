import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
      console.error("❌ Missing Stripe signature");
      return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
      console.error("⚠️ Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;

        if (!userId) {
          throw new Error("User ID not found in session metadata");
        }

        // 🔹 `stripe_customers` テーブルに保存
        const { error: customerError } = await supabase
          .from("stripe_customers")
          .upsert(
            {
              line_id: userId,
              stripe_customer_id: session.customer as string,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "line_id" }
          );

        if (customerError) throw customerError;

        // 🔹 `payment_history` テーブルに保存
        const { error: paymentError } = await supabase
          .from("payment_history")
          .insert({
            line_id: userId,
            stripe_customer_id: session.customer as string,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency,
            payment_status: session.payment_status,
            payment_intent_id: session.payment_intent as string,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (paymentError) throw paymentError;

        // 🔹 `subscriptions` テーブルに保存（サブスクの場合のみ）
        if (session.subscription) {
          const { error: subscriptionError } = await supabase
            .from("subscriptions")
            .insert({
              line_id: userId,
              stripe_subscription_id: session.subscription as string,
              stripe_customer_id: session.customer as string,
              status: "active",
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (subscriptionError) throw subscriptionError;
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        if (!subscription.id) {
          console.error("❌ Subscription ID not found in event");
          return NextResponse.json({ error: "Subscription ID missing" }, { status: 400 });
        }

        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (updateError) {
          console.error("❌ Failed to update subscription:", updateError);
        }

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
} 