import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Generate or retrieve a unique visitor ID
const getVisitorId = (): string => {
  let visitorId = localStorage.getItem("visitor_id");
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem("visitor_id", visitorId);
  }
  return visitorId;
};

export const usePageVisit = (pagePath: string = "/") => {
  useEffect(() => {
    const trackVisit = async () => {
      try {
        const visitorId = getVisitorId();
        
        await supabase.from("page_visits").insert({
          page_path: pagePath,
          visitor_id: visitorId,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
        });
      } catch (error) {
        console.error("Error tracking page visit:", error);
      }
    };

    trackVisit();
  }, [pagePath]);
};
