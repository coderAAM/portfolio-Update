import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactNotificationRequest {
  name: string;
  email: string;
  message: string;
}

// Simple in-memory rate limiting (resets on function cold start)
// For production, consider using a database or Redis
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 3;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function getClientIP(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1, resetIn: RATE_LIMIT_WINDOW };
  }
  
  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }
  
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count, resetIn: record.resetTime - now };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check rate limit
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(clientIP);
    
    if (!rateLimit.allowed) {
      const resetMinutes = Math.ceil(rateLimit.resetIn / 60000);
      console.log(`Rate limit exceeded for IP: ${clientIP.substring(0, 8)}***`);
      return new Response(
        JSON.stringify({ 
          error: "Too many requests. Please try again later.",
          resetIn: resetMinutes
        }),
        {
          status: 429,
          headers: { 
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetIn / 1000)),
            ...corsHeaders 
          },
        }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      throw new Error("Email service is not configured");
    }

    const { name, email, message }: ContactNotificationRequest = await req.json();

    console.log("Sending contact notification for:", { name, email: email.substring(0, 5) + "***" });

    // Send notification to the portfolio owner using Resend API
    const ownerResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Portfolio Contact <onboarding@resend.dev>",
        to: ["mughalahmedali592@gmail.com"],
        subject: `New Contact Form Message from ${name}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
              .field { margin-bottom: 20px; }
              .label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
              .value { font-size: 16px; color: #111827; }
              .message-box { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-top: 10px; }
              .reply-btn { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 24px;">📬 New Contact Form Submission</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Someone wants to connect with you!</p>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">From</div>
                  <div class="value"><strong>${name}</strong></div>
                </div>
                <div class="field">
                  <div class="label">Email</div>
                  <div class="value"><a href="mailto:${email}" style="color: #7c3aed;">${email}</a></div>
                </div>
                <div class="field">
                  <div class="label">Message</div>
                  <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
                </div>
                <a href="mailto:${email}?subject=Re: Your message on my portfolio" class="reply-btn">Reply to ${name}</a>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const ownerResult = await ownerResponse.json();
    console.log("Owner notification sent:", ownerResult);

    // Send confirmation to the visitor
    const visitorResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Ahmed Ali Mughal <onboarding@resend.dev>",
        to: [email],
        subject: "Thanks for reaching out! ✨",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
              .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">Thank You, ${name}! 🙏</h1>
              </div>
              <div class="content">
                <p>Hi ${name},</p>
                <p>Thank you for reaching out through my portfolio website! I've received your message and will get back to you as soon as possible, typically within 24-48 hours.</p>
                <p><strong>Your message:</strong></p>
                <blockquote style="border-left: 3px solid #7c3aed; padding-left: 15px; color: #4b5563; margin: 20px 0;">
                  ${message.replace(/\n/g, '<br>')}
                </blockquote>
                <p>Looking forward to connecting with you!</p>
                <p>Best regards,<br><strong>Ahmed Ali Mughal</strong><br>Full Stack Developer</p>
              </div>
              <div class="footer">
                <p>This is an automated confirmation. Please don't reply to this email.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const visitorResult = await visitorResponse.json();
    console.log("Visitor confirmation sent:", visitorResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        ownerNotification: ownerResult.id,
        visitorConfirmation: visitorResult.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
