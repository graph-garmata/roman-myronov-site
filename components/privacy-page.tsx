import HomeButton from "@/components/home-button";
import { splitWords } from "@/lib/typography";

const EMAIL = "roman@denormalized.co";

// Plain copy keeps the site's short-word rule: 1–2 character words are bound
// to the word after them, so none is left at the end of a row.
const bind = (text: string) => splitWords(text).join(" ");

const Email = () => <a href={`mailto:${EMAIL}`}>{EMAIL}</a>;

const sections: { label: string; body: React.ReactNode }[] = [
  {
    label: "Who",
    body: (
      <>
        {bind(
          "Roman Myronov runs this site and is responsible for any personal data it handles. You can reach me at"
        )}{" "}
        <Email />.
      </>
    ),
  },
  {
    label: "Visiting",
    body: (
      <>
        {bind(
          "To show you the site, its host, Vercel Inc., processes the technical data your browser sends with every request: your IP address, browser and device type, the pages you open, and when. This is needed to deliver the site and keep it secure (Article 6(1)(f) GDPR, legitimate interests). Vercel keeps these logs only for a short time and may process them outside the EU, under the safeguards described in its"
        )}{" "}
        <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">
          privacy policy
        </a>
        .
      </>
    ),
  },
  {
    label: "Cookies",
    body: bind(
      "None. The site sets no cookies, runs no analytics or trackers, and stores nothing in your browser, so there's nothing to consent to. Fonts, images and films are all served from this site — no third-party service loads when you open a page."
    ),
  },
  {
    label: "Writing to me",
    body: bind(
      "If you email me, I use your address and message only to reply and, if we work together, to run that collaboration (Article 6(1)(b) and (f) GDPR). I keep the correspondence for as long as it's useful for that, then delete it."
    ),
  },
  {
    label: "Links",
    body: bind(
      "Links to LinkedIn, Behance, Instagram and other sites only take you there — nothing from them loads here. Once you follow one, that site's own privacy policy applies."
    ),
  },
  {
    label: "Your rights",
    body: (
      <>
        {bind(
          "You can ask me to show you, correct or delete any personal data I hold about you, to limit how I use it, to object to it, or to get a copy of it — just write to"
        )}{" "}
        <Email />.{" "}
        {bind(
          "You can also complain to the Polish data protection authority, the President of the Personal Data Protection Office"
        )}{" "}
        (
        <a href="https://uodo.gov.pl" target="_blank" rel="noreferrer">
          UODO
        </a>
        ).
      </>
    ),
  },
];

/**
 * PrivacyPage — the site's privacy notice, set like About (light theme):
 * a short statement up top, then label + text rows set in the serif (like
 * the case pages' credits), with the date in the top-right corner.
 */
export default function PrivacyPage() {
  return (
    <div className="about privacy">
      <HomeButton />
      <p className="about-label privacy__updated">Privacy · Updated 14 October 2026</p>

      <main className="about__inner">
        <h1 className="about-h">
          {bind(
            "This site is a portfolio. It uses no cookies, analytics or trackers, and asks you for nothing."
          )}
        </h1>

        <div className="privacy__sections">
          {sections.map((s) => (
            <section className="privacy__row" key={s.label}>
              <h2 className="about-label privacy__label">{s.label}</h2>
              <p className="privacy__text">{s.body}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
