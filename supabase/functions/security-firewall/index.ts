import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In-memory storage for blocked IPs and rate limiting
const blockedIPs = new Map<string, { blockedUntil: number; reason: string }>();
const requestCounts = new Map<string, { count: number; windowStart: number }>();
const suspiciousActivity = new Map<string, { score: number; lastActivity: number }>();

// Configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100; // Max 100 requests per minute
const BLOCK_DURATION = 60 * 60 * 1000; // Block for 1 hour
const SUSPICIOUS_THRESHOLD = 10; // Score threshold for auto-block

// Known malicious patterns
const MALICIOUS_PATTERNS = [
  /\.\.\//g, // Path traversal
  /<script/gi, // XSS attempts
  /union\s+select/gi, // SQL injection
  /exec\s*\(/gi, // Code execution
  /eval\s*\(/gi, // Eval injection
  /javascript:/gi, // JavaScript protocol
  /on\w+\s*=/gi, // Event handlers
  /SELECT\s+.*\s+FROM/gi, // SQL queries
  /INSERT\s+INTO/gi, // SQL insert
  /DELETE\s+FROM/gi, // SQL delete
  /DROP\s+TABLE/gi, // SQL drop
  /'\s*OR\s+'1'\s*=\s*'1/gi, // SQL injection
  /admin'--/gi, // Admin bypass
];

// Known malicious user agents
const MALICIOUS_USER_AGENTS = [
  /sqlmap/i,
  /nikto/i,
  /havij/i,
  /acunetix/i,
  /nessus/i,
  /python-requests/i, // Often used for scraping/attacks
  /curl/i, // Block direct curl unless needed
];

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

function isIPBlocked(ip: string): { blocked: boolean; reason?: string; remainingTime?: number } {
  const blockInfo = blockedIPs.get(ip);
  if (!blockInfo) {
    return { blocked: false };
  }

  const now = Date.now();
  if (now >= blockInfo.blockedUntil) {
    blockedIPs.delete(ip);
    return { blocked: false };
  }

  return {
    blocked: true,
    reason: blockInfo.reason,
    remainingTime: Math.ceil((blockInfo.blockedUntil - now) / 1000 / 60), // minutes
  };
}

function blockIP(ip: string, reason: string, durationMs: number = BLOCK_DURATION) {
  blockedIPs.set(ip, {
    blockedUntil: Date.now() + durationMs,
    reason,
  });
  console.log(`🚫 BLOCKED IP: ${ip.substring(0, 8)}*** - Reason: ${reason}`);
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now - record.windowStart >= RATE_LIMIT_WINDOW) {
    requestCounts.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count };
}

function checkMaliciousPatterns(content: string): { isMalicious: boolean; matches: string[] } {
  const matches: string[] = [];
  
  for (const pattern of MALICIOUS_PATTERNS) {
    if (pattern.test(content)) {
      matches.push(pattern.source);
    }
  }

  return { isMalicious: matches.length > 0, matches };
}

function checkUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return true; // Block requests without user agent
  
  for (const pattern of MALICIOUS_USER_AGENTS) {
    if (pattern.test(userAgent)) {
      return true;
    }
  }
  
  return false;
}

function updateSuspiciousScore(ip: string, score: number) {
  const now = Date.now();
  const record = suspiciousActivity.get(ip) || { score: 0, lastActivity: now };
  
  // Decay score over time (reduce by 1 every minute)
  const decayMinutes = (now - record.lastActivity) / 60000;
  record.score = Math.max(0, record.score - decayMinutes) + score;
  record.lastActivity = now;
  
  suspiciousActivity.set(ip, record);
  
  if (record.score >= SUSPICIOUS_THRESHOLD) {
    blockIP(ip, "Suspicious activity threshold exceeded");
    return true;
  }
  
  return false;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = getClientIP(req);
    const userAgent = req.headers.get("user-agent");
    const requestUrl = req.url;
    
    // Check if IP is blocked
    const blockStatus = isIPBlocked(clientIP);
    if (blockStatus.blocked) {
      console.log(`🔒 Request from blocked IP: ${clientIP.substring(0, 8)}***`);
      return new Response(
        JSON.stringify({
          error: "Access denied",
          reason: blockStatus.reason,
          remainingBlockTime: `${blockStatus.remainingTime} minutes`,
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check rate limit
    const rateLimit = checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      updateSuspiciousScore(clientIP, 3);
      console.log(`⚠️ Rate limit exceeded for IP: ${clientIP.substring(0, 8)}***`);
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          retryAfter: "60 seconds",
        }),
        {
          status: 429,
          headers: { 
            "Content-Type": "application/json",
            "Retry-After": "60",
            ...corsHeaders 
          },
        }
      );
    }

    // Check for malicious user agent
    if (checkUserAgent(userAgent)) {
      updateSuspiciousScore(clientIP, 5);
      console.log(`🤖 Malicious user agent detected: ${userAgent?.substring(0, 30)}***`);
      return new Response(
        JSON.stringify({ error: "Request blocked" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // For POST requests, check body for malicious patterns
    if (req.method === "POST" || req.method === "PUT") {
      try {
        const body = await req.text();
        const patternCheck = checkMaliciousPatterns(body);
        
        if (patternCheck.isMalicious) {
          blockIP(clientIP, `Malicious patterns detected: ${patternCheck.matches.join(", ")}`);
          console.log(`🚨 Malicious content blocked from: ${clientIP.substring(0, 8)}***`);
          return new Response(
            JSON.stringify({ error: "Request blocked - malicious content detected" }),
            {
              status: 403,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            }
          );
        }
      } catch (e) {
        // Body might not be readable, continue
      }
    }

    // Check URL for malicious patterns
    const urlCheck = checkMaliciousPatterns(requestUrl);
    if (urlCheck.isMalicious) {
      updateSuspiciousScore(clientIP, 5);
      console.log(`🚨 Malicious URL pattern from: ${clientIP.substring(0, 8)}***`);
      return new Response(
        JSON.stringify({ error: "Request blocked" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get request body for admin actions
    let requestBody: any = {};
    try {
      requestBody = await req.json();
    } catch {
      // No JSON body or already read
    }

    // Admin actions (requires authentication)
    const authHeader = req.headers.get("authorization");
    if (authHeader && requestBody.action) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        {
          global: {
            headers: { Authorization: authHeader },
          },
        }
      );

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      // Check if user is the admin
      if (user?.id !== "2f987c9c-4701-4cff-b58c-0373af6fc8eb") {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Handle admin actions
      switch (requestBody.action) {
        case "block_ip":
          if (requestBody.ip) {
            blockIP(requestBody.ip, requestBody.reason || "Manual block", 
              requestBody.duration || BLOCK_DURATION);
            return new Response(
              JSON.stringify({ success: true, message: `IP ${requestBody.ip} blocked` }),
              {
                status: 200,
                headers: { "Content-Type": "application/json", ...corsHeaders },
              }
            );
          }
          break;

        case "unblock_ip":
          if (requestBody.ip) {
            blockedIPs.delete(requestBody.ip);
            return new Response(
              JSON.stringify({ success: true, message: `IP ${requestBody.ip} unblocked` }),
              {
                status: 200,
                headers: { "Content-Type": "application/json", ...corsHeaders },
              }
            );
          }
          break;

        case "get_blocked_ips":
          const blockedList = Array.from(blockedIPs.entries()).map(([ip, info]) => ({
            ip: ip.substring(0, 8) + "***", // Partial for privacy
            reason: info.reason,
            remainingTime: Math.ceil((info.blockedUntil - Date.now()) / 1000 / 60),
          }));
          return new Response(
            JSON.stringify({ blocked_ips: blockedList }),
            {
              status: 200,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            }
          );

        case "get_stats":
          return new Response(
            JSON.stringify({
              blockedCount: blockedIPs.size,
              activeRequests: requestCounts.size,
              suspiciousIPs: suspiciousActivity.size,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            }
          );
      }
    }

    // Default response - request is allowed
    return new Response(
      JSON.stringify({
        status: "allowed",
        remaining: rateLimit.remaining,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Firewall error:", error);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
