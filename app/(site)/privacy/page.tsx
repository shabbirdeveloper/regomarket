import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage, Prose } from "@/components/common/content-page";

export const metadata: Metadata = { title: "Privacy policy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <ContentPage
      crumbs={[{ label: "Privacy policy" }]}
      title="Privacy policy"
      intro="What we collect, why, and the choices you have. In plain words."
      updated="September 2026"
    >
      <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          ["We never sell your data", "Not to advertisers, not to anyone."],
          ["Your number stays hidden", "Buyers see it only when you allow it."],
          ["You can delete your account", "And we delete your data with it."],
        ].map(([t, s]) => (
          <div key={t} className="rounded-2xl bg-mint p-5">
            <p className="text-[15px] font-semibold text-mountain">{t}</p>
            <p className="mt-1 text-[13.5px] text-ink/70">{s}</p>
          </div>
        ))}
      </div>
      <Prose>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Account:</strong> your mobile number, name, and account type. For shops: business name, address and verification documents.
          </li>
          <li>
            <strong>What you post:</strong> ads, photos, prices, reviews, Wanted requests and messages.
          </li>
          <li>
            <strong>Orders:</strong> delivery name, phone and address you enter at checkout.
          </li>
          <li>
            <strong>Usage:</strong> pages you visit and searches, to improve results. Your saved ads and followed shops.
          </li>
        </ul>

        <h2>How we use it</h2>
        <ul>
          <li>To run your account, show your ads, and deliver messages and orders.</li>
          <li>To keep people safe: stop spam, fake ads and scams.</li>
          <li>To send notifications you asked for, like replies and price drops. You can turn these off in your account.</li>
        </ul>

        <h2>Who sees what</h2>
        <ul>
          <li>Everyone can see your ads, your first name or shop name, your town and your ratings.</li>
          <li>Your phone number is shown only to signed-in users when you choose to show it.</li>
          <li>Shops see the delivery details of orders placed with them.</li>
          <li>Verification documents are seen only by our review team and are never public.</li>
        </ul>

        <h2>Where it&apos;s stored</h2>
        <p>
          Data is stored with our hosting providers (database, image storage and SMS delivery) under contracts that require them to protect it.
        </p>

        <h2>Your choices</h2>
        <ul>
          <li>Edit or delete any ad at any time from your account.</li>
          <li>Turn notifications on or off in <Link href="/dashboard#settings">settings</Link>.</li>
          <li>
            Ask for a copy of your data, or to delete your account, through <Link href="/contact">contact</Link>.
          </li>
        </ul>

        <h2>Cookies</h2>
        <p>We use only the cookies and local storage needed to keep you signed in and remember your saved ads and settings.</p>

        <h2>Contact</h2>
        <p>
          Questions about privacy? <Link href="/contact">Write to us</Link>.
        </p>
      </Prose>
    </ContentPage>
  );
}
