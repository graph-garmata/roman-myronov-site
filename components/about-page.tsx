"use client";

import HomeButton from "@/components/home-button";
import ScrollRevealLines from "@/components/scroll-reveal-lines";
import ScrollDivider from "@/components/scroll-divider";
import Roll from "@/components/roll";

const bio: { q: string; a: string }[] = [
  {
    q: "Who?",
    a: "Designer and art director, founded in 1997, started my ninja way in 2018. Since then I've made a lot of different design works, including coins and art objects, but my main expertise lies in the field of branding, web design, and motion graphics.",
  },
  {
    q: "Where?",
    a: "I've worked as a designer and art director at top Ukrainian agencies and studios{2}, alongside international ones{3}.",
  },
  {
    q: "Now?",
    a: "I also co-run Denormalized{4}, a strategy-first branding and digital design studio, where we help businesses build integrated solutions from brand to final product.",
  },
  {
    q: "Next?",
    a: "Always open to interesting collaborations, and currently open to art/creative director roles where I can work at that level day to day, alongside the small amount of studio and teaching work I've built over the years.",
  },
];

const awards: { year: string; items: string[] }[] = [
  {
    year: "2026",
    items: [
      "European Design Awards 2026. Bronze winner. Logo. Estyl",
      "European Design Awards 2026. Gold winner. Digital Product & App Design. Estyl",
    ],
  },
  {
    year: "2025",
    items: [
      "Red Dot winner 2025. Brand Design & Identity. Specialty",
      "European Design Awards 2025. Bronze winner. Corporate illustration. Specialty",
      "European Design Awards 2025. Bronze winner. Integrated Identity Applications. Specialty",
      "ADC*UA Awards 2025 (Silver). Corporate Brand Identity. Specialty",
      "ADC*UA Awards 2025 (Silver). Graphic Communication. Specialty",
    ],
  },
];

const teaching = {
  label: "Projector Institute{6}",
  items: ["Graphic Design Medium", "Graphic Design Beginning", "Poster Design"],
};

const num = (i: number) => String(i + 1).padStart(2, "0");

/** A "label + numbered list" group (used by Awards years and Teaching). */
function ListGroup({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="about-group">
      <ScrollDivider />
      <p className="about-h about-group__label">
        <ScrollRevealLines text={label} />
      </p>
      <div className="about-group__list">
        {items.map((item, i) => (
          <div className="about-row" key={i}>
            <p className="about-h about-row__num">
              <ScrollRevealLines text={num(i)} />
            </p>
            <p className="about-h about-row__text">
              <ScrollRevealLines text={item} baseDelay={0.05} />
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="about">
      <HomeButton />

      <main className="about__inner">
        {/* ---- Intro ---- */}
        <section className="about-intro">
          <h1 className="about-h">
            <ScrollRevealLines text="Hi, I'm Roman{1}." />
          </h1>

          {bio.map((item) => (
            <div className="about-qa" key={item.q}>
              <p className="about-label">
                <ScrollRevealLines text={item.q} />
              </p>
              <p className="about-h">
                <ScrollRevealLines text={item.a} />
              </p>
            </div>
          ))}
        </section>

        {/* ---- Awards ---- */}
        <section className="about-section">
          <h2 className="about-h about-section__title">
            <ScrollRevealLines text="Awards{5}" />
          </h2>
          <div className="about-section__body">
            {awards.map((group) => (
              <ListGroup key={group.year} label={group.year} items={group.items} />
            ))}
          </div>
        </section>

        {/* ---- Teaching ---- */}
        <section className="about-section">
          <h2 className="about-h about-section__title">
            <ScrollRevealLines text="Teaching" />
          </h2>
          <div className="about-section__body">
            <ListGroup label={teaching.label} items={teaching.items} />
          </div>
        </section>

        {/* ---- Contact ---- */}
        <section className="about-contact">
          <h2 className="about-h">
            <ScrollRevealLines text="Any inquiries?" />
          </h2>
          <a className="email-link" href="mailto:roman@denormalized.co">
            <Roll>roman@denormalized.co</Roll>
          </a>
        </section>
      </main>
    </div>
  );
}
