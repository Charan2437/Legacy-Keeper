import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { email, userId } = await req.json()
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Store OTP in verification_tokens table
    const { error: tokenError } = await supabaseAdmin
      .from('verification_tokens')
      .insert({
        user_id: userId,
        token: otp,
        type: 'otp',
        expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
      })

    if (tokenError) throw tokenError

    // Get email template
    const { data: template, error: templateError } = await supabaseAdmin
      .from('email_templates')
      .select('subject, body')
      .eq('template_name', 'otp_login')
      .single()

    if (templateError) throw templateError

    // Get user's full name
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('full_name')
      .eq('id', userId)
      .single()

    if (userError) throw userError

    // Replace template placeholders
    const emailBody = template.body
      .replace('{{full_name}}', userData.full_name)
      .replace('{{otp}}', otp)
      .replace('{{expiry_time}}', '10')

    // Send email
    const { error: emailError } = await supabaseAdmin.auth.admin.sendRawEmail({
      to: email,
      subject: template.subject,
      text: emailBody,
    })

    if (emailError) throw emailError

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'OTP sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 