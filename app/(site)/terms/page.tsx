import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage, Prose } from "@/components/common/content-page";

export const metadata: Metadata = { title: "Terms of use", alternates: { canonical: "/terms" } };

const SECTIONS = [
  ["about", "What REGOMARKET is"],
  ["account", "Your account"],
  ["posting", "Posting ads"],
  ["prohibited", "Things you can't sell"],
  ["deals", "Deals between users"],
  ["shops", "Shops and orders"],
  ["removal", "Removing content and accounts"],
  ["liability", "Our responsibility"],
  ["changes", "Changes and contact"],
] as const;

export default function TermsPage() {
  return (
    <ContentPage
      crumbs={[{ label: "Terms of use" }]}
      title="Terms of use"
      intro="The simple rules for using REGOMARKET. Please read them. By using the site you agree to them."
      updated="September 2026"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav aria-label="On this page" className="hidden lg:block">
          <ul className="sticky top-[96px] space-y-2 text-[13.5px]">
            {SECTIONS.map(([id, t]) => (
              <li key={id}>
                <a href={`#${id}`} className="text-muted hover:text-ink">
                  {t}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <Prose>
          <h2 id="about">1. What REGOMARKET is</h2>
          <p>
            REGOMARKET is an online marketplace for people and businesses in Gilgit-Baltistan. We help buyers and sellers find each other.
            Unless an item is sold through a shop&apos;s online ordering, we are not a party to the deal between you and the other person.
          </p>

          <h2 id="account">2. Your account</h2>
          <ul>
            <li>You sign in with your own mobile number. Keep your phone and the codes we send you private.</li>
            <li>You must be at least 18, or use REGOMARKET with a parent or guardian.</li>
            <li>Use your real name. Businesses must use their real business name.</li>
            <li>You are responsible for everything done from your account.</li>
          </ul>

          <h2 id="posting">3. Posting ads</h2>
          <ul>
            <li>Only post items you own or are allowed to sell, and that you have right now (or clearly say when they will be ready).</li>
            <li>Use your own, real photos and an honest description and price.</li>
            <li>Post each item once, in the right category and district.</li>
            <li>We may check, edit the category of, or hold an ad for review before it goes live.</li>
          </ul>

          <h2 id="prohibited">4. Things you can&apos;t sell</h2>
          <p>Ads for the following are removed and may lead to a ban:</p>
          <ul>
            <li>Weapons, ammunition and explosives</li>
            <li>Drugs, medicines that need a prescription, and alcohol</li>
            <li>Stolen goods, fake or copied branded products, and non-PTA phones sold as approved</li>
            <li>Protected wildlife, their parts, and protected plants or minerals</li>
            <li>Anything else that is illegal in Pakistan or Gilgit-Baltistan</li>
          </ul>

          <h2 id="deals">5. Deals between users</h2>
          <p>
            Meet in public, check items before you pay, and never send advance payments to people you haven&apos;t met. Read our{" "}
            <Link href="/help/safety">safety tips</Link>. REGOMARKET does not guarantee the quality, safety or legality of items listed by
            users, or that a deal will happen.
          </p>

          <h2 id="shops">6. Shops and orders</h2>
          <ul>
            <li>Shops must give correct business details. The verified badge is given only after our checks.</li>
            <li>When a shop accepts online orders, it must deliver what was shown, at the price shown, within the time promised.</li>
            <li>Buyers can cancel an order for free until the shop confirms it.</li>
          </ul>

          <h2 id="removal">7. Removing content and accounts</h2>
          <p>
            We may remove ads, reviews or messages, or suspend accounts, that break these rules or harm other users. If you think we made a
            mistake, <Link href="/contact">contact us</Link> and we will look again.
          </p>

          <h2 id="liability">8. Our responsibility</h2>
          <p>
            We work hard to keep REGOMARKET safe and running, but we provide it &ldquo;as is&rdquo;. As far as the law allows, we are not
            responsible for losses from deals between users.
          </p>

          <h2 id="changes">9. Changes and contact</h2>
          <p>
            We may update these terms. If the change is important we will tell you in the app. Questions? <Link href="/contact">Contact us</Link>.
          </p>
        </Prose>
      </div>
    </ContentPage>
  );
}
