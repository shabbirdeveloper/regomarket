# REGOMARKET — AWS + Supabase launch guide

**Plan:** the website runs on **AWS Mumbai (ap-south-1)** through **SST + OpenNext**: CloudFront → Lambda → S3. The data lives in **Supabase** (Postgres + login + photos), also in Mumbai.

```
Visitor ──► CloudFront (AWS CDN) ──► Lambda (Next.js pages) ──► Supabase (Mumbai)
                     └──► S3 (JS, CSS, /public images)
```

---

## Step 1 — Install packages (one time, on your computer)

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install --save-dev sst
```

When it finishes, tell Claude "install ho gaya". Claude will then switch the data layer to Supabase.

---

## Step 2 — Supabase project (15 minutes)

1. Sign up at <https://supabase.com> → **New project**
   - Name: `regomarket`
   - Region: **South Asia (Mumbai)**
   - Database password: make a strong one and **save it**
2. **SQL Editor** → **New query** → paste all of `supabase/migrations/20260928000000_init.sql` → **Run**.
   This creates the tables, security rules (RLS) and photo buckets.
3. **New query** → paste all of `supabase/seed.sql` → **Run**.
   This loads the 65 demo ads, 8 shops, reviews, and Wanted requests.
   (If you change the files in `/data`, run `npm run db:seed` and paste it again.)
4. **Project Settings → API**: copy the **Project URL** and the **anon / publishable key**.
5. In the project folder, create a file named `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ....
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
   Restart `npm run dev`. The site now reads from Supabase.
6. **Login by SMS** (can be done later): Authentication → Providers → **Phone** → enable, then choose an SMS provider (for example Twilio).
   - Until then, add test numbers under **Phone → Test OTP** (e.g. `923550000000` with code `123456`).
   - SMS to Pakistani numbers costs money per message. Check the provider's price first.

> ⚠️ Never put the **service_role** key in the website or on GitHub. It bypasses all security.

---

## Step 3 — AWS account (20 minutes)

1. Create an account at <https://aws.amazon.com>. A card is required.
2. **Billing → Budgets → Create budget** → monthly **$10** → alert to your email. Do this first.
3. **IAM → Users → Create user** `regomarket-deploy`
   - Attach policy **AdministratorAccess**. SST creates many kinds of resources; this can be narrowed later.
   - **Security credentials → Create access key** (type: CLI). Save the **Access key ID** and **Secret access key**.
4. On your computer, install the AWS CLI and run:
   ```bash
   aws configure
   # Access key ID:      AKIA...
   # Secret access key:  ....
   # Default region:     ap-south-1
   # Output format:      json
   ```

---

## Step 4 — First deploy (from your computer)

```bash
npx sst secret set SupabaseUrl https://xxxx.supabase.co --stage production
npx sst secret set SupabaseAnonKey eyJ....              --stage production
npm run deploy
```

- The first deploy takes about 10–15 minutes.
- At the end SST prints a link like `https://d1234abcd.cloudfront.net`. **That is your live site.**
- Later deploys take 3–5 minutes.

---

## Step 5 — Automatic deploys from GitHub

`.github/workflows/deploy.yml` is ready. On every `git push` to `main`, GitHub type-checks the code and deploys it.

In GitHub → your repo → **Settings → Secrets and variables → Actions → New repository secret**, add:

| Name | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | from Step 3 |
| `AWS_SECRET_ACCESS_KEY` | from Step 3 |

The Supabase keys are already stored in SST (Step 4), so GitHub doesn't need them.

---

## Step 6 — Domain `regomarket.pk` (when you buy it)

1. Buy the domain from PKNIC (or a reseller).
2. AWS **Route 53 → Hosted zones → Create** `regomarket.pk` → copy the 4 **NS** records.
3. At PKNIC, set the domain's nameservers to those 4 NS records. This can take up to 24–48 hours.
4. GitHub → **Settings → Variables → Actions** → add `REGO_DOMAIN` = `regomarket.pk`
   (or run `REGO_DOMAIN=regomarket.pk npm run deploy`).

SST then creates the free SSL certificate and points `regomarket.pk` + `www` to the site.

---

## Rough monthly cost (low traffic)

| Service | Estimate |
|---|---|
| AWS (Lambda + CloudFront + S3) | Mostly within the free tier at first, then a few dollars. Keeping 2 servers warm adds a little. |
| Supabase | Free plan to start (limits apply). Pro plan when you grow. |
| SMS OTP | Per message, from the SMS provider |
| Domain `.pk` | Yearly fee to PKNIC |

Check current prices on each provider's website before launch.

---

## Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Local development |
| `npm run db:seed` | Rebuild `supabase/seed.sql` from `/data` |
| `npm run deploy` | Deploy to AWS (production) |
| `npx sst deploy --stage test` | A separate test copy of the site |
| `npx sst remove --stage test` | Delete the test copy |
