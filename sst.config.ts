/// <reference path="./.sst/platform/config.d.ts" />

/**
 * REGOMARKET on AWS (Mumbai, ap-south-1) with SST v3 + OpenNext.
 *
 *   npx sst secret set SupabaseUrl https://xxxx.supabase.co --stage production
 *   npx sst secret set SupabaseAnonKey eyJ...               --stage production
 *   npx sst deploy --stage production
 *
 * Creates: CloudFront (CDN) → Lambda (server rendering) + S3 (static files
 * and images) + the ISR cache. You pay only for what is used.
 */
export default $config({
  app(input) {
    return {
      name: "regomarket",
      // Never delete production resources by accident
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: { region: "ap-south-1" },
      },
    };
  },
  async run() {
    const supabaseUrl = new sst.Secret("SupabaseUrl");
    const supabaseAnonKey = new sst.Secret("SupabaseAnonKey");

    const isProd = $app.stage === "production";
    // Set REGO_DOMAIN=regomarket.pk (hosted zone in Route 53) when the domain is ready
    const domain = process.env.REGO_DOMAIN;

    const web = new sst.aws.Nextjs("Web", {
      environment: {
        NEXT_PUBLIC_SUPABASE_URL: supabaseUrl.value,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey.value,
        NEXT_PUBLIC_SITE_URL: isProd && domain ? `https://${domain}` : "",
      },
      domain: isProd && domain ? { name: domain, redirects: [`www.${domain}`] } : undefined,
      server: { memory: "1024 MB" },
      // Keep a couple of servers warm in production so first visits are fast
      warm: isProd ? 2 : 0,
    });

    return { url: web.url };
  },
});
