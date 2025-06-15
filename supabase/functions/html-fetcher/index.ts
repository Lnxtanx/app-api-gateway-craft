
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Only POST supported" }),
      { status: 405, headers: corsHeaders }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "POST must have a JSON body" }),
      { status: 400, headers: corsHeaders }
    );
  }

  const url = body?.url;
  if (!url || typeof url !== "string" || !/^https?:\/\//.test(url)) {
    return new Response(
      JSON.stringify({ error: "Missing or invalid 'url' in body" }),
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LovableHtmlFetcher/1.0)"
      },
      redirect: "follow"
    });
    const html = await resp.text();
    return new Response(
      JSON.stringify({ url, html }),
      { headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: `Failed to fetch: ${err.message}` }),
      { status: 500, headers: corsHeaders }
    );
  }
});
