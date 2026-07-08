import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
}

interface PaymentNotification {
  merchant_code: string
  transaction_id: string
  phone_number: string
  amount: number
  currency: string
  status: 'success' | 'failed'
  timestamp: string
  reference?: string
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }

  try {
    const payment: PaymentNotification = await req.json()

    if (payment.status !== 'success') {
      return new Response(
        JSON.stringify({ received: true, message: "Payment not successful, no action taken" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find organization by MomoPay merchant code
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, subscription_expires_at')
      .eq('momopay_merchant_code', payment.merchant_code)
      .single()

    if (orgError || !org) {
      console.error("Organization not found for merchant code:", payment.merchant_code)
      return new Response(
        JSON.stringify({ error: "Organization not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Calculate new expiration date
    // If already has active subscription, extend from that date
    // Otherwise, extend from now
    const currentExpiry = org.subscription_expires_at
      ? new Date(org.subscription_expires_at)
      : new Date()

    const newExpiry = currentExpiry > new Date()
      ? new Date(currentExpiry.getTime() + 30 * 24 * 60 * 60 * 1000) // Add 30 days to existing
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

    // Update organization subscription
    const { error: updateError } = await supabase
      .from('organizations')
      .update({
        subscription_expires_at: newExpiry.toISOString(),
        account_status: 'active',
      })
      .eq('id', org.id)

    if (updateError) {
      console.error("Failed to update subscription:", updateError)
      throw updateError
    }

    // Log the payment in audit_logs
    await supabase.from('audit_logs').insert({
      organization_id: org.id,
      action: 'payment_received',
      entity_type: 'subscription',
      entity_id: org.id,
      new_values: {
        transaction_id: payment.transaction_id,
        amount: payment.amount,
        currency: payment.currency,
        phone: payment.phone_number,
        new_expiry: newExpiry.toISOString(),
      },
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: "Subscription extended successfully",
        organization: org.name,
        new_expiry: newExpiry.toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (err) {
    console.error("Payment processing error:", err)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
