"use client";

import HomeButton from "@/components/home-button";
import ScrollReveal from "@/components/scroll-reveal";

/** Serif footnote marker, e.g. {1} — rendered in SFT Schrifted Serif inline. */
function Mark({ n }: { n: number }) {
  return <span className="about-serif">{`{${n}}`}</span>;
}

const bio: { q: string; a: React.ReactNode }[] = [
  {
    q: "Who?",
    a: "Designer and art director, founded in 1997, started my ninja way in 2018. Since then I've made a lot of different design works, including coins and art objects, but my main expertise lies in the field of branding, web design, and motion graphics.",
  },
  {
    q: "Where?",
    a: (
      <>
        I&apos;ve worked as a designer and art director at top Ukrainian
        agencies and studios
        <Mark n={2} />, alongside international ones
        <Mark n={3} />.
      </>
    ),
  },
  {
    q: "Now?",
    a: (
      <>
        I also co-run Denormalized
        <Mark n={4} />, a strategy-first branding and digital design studio,
        where we help businesses build integrated solutions from brand to final
        product.
      </>
    ),
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
  label: "Projector Institute",
  marker: 6,
  items: ["Graphic Design Medium", "Graphic Design Beginning", "Poster Design"],
};

const num = (i: number) => String(i + 1).padStart(2, "0");

/** A "label + numbered list" group (used by Awards years and Teaching). */
function ListGroup({
  label,
  items,
}: {
  label: React.ReactNode;
  items: string[];
}) {
  return (
    <div className="about-group">
      <ScrollReveal className="about-group__label">
        <p className="about-h">{label}</p>
      </ScrollReveal>
      <div className="about-group__list">
        {items.map((item, i) => (
          <div className="about-row" key={i}>
            <ScrollReveal className="about-row__num">{num(i)}</ScrollReveal>
            <ScrollReveal className="about-row__text" delay={0.05}>
              <p className="about-h">{item}</p>
            </ScrollReveal>
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
          <ScrollReveal>
            <h1 className="about-h">
              Hi, I&apos;m Roman
              <Mark n={1} />.
            </h1>
          </ScrollReveal>

          {bio.map((item) => (
            <div className="about-qa" key={item.q}>
              <ScrollReveal>
                <p className="about-label">{item.q}</p>
              </ScrollReveal>
              <ScrollReveal delay={0.05}>
                <p className="about-h">{item.a}</p>
              </ScrollReveal>
            </div>
          ))}
        </section>

        {/* ---- Awards ---- */}
        <section className="about-section">
          <ScrollReveal className="about-section__title">
            <h2 className="about-h">
              Awards
              <Mark n={5} />
            </h2>
          </ScrollReveal>
          <div className="about-section__body">
            {awards.map((group) => (
              <ListGroup key={group.year} label={group.year} items={group.items} />
            ))}
          </div>
        </section>

        {/* ---- Teaching ---- */}
        <section className="about-section">
          <ScrollReveal className="about-section__title">
            <h2 className="about-h">Teaching</h2>
          </ScrollReveal>
          <div className="about-section__body">
            <ListGroup
              label={
                <>
                  {teaching.label}
                  <Mark n={teaching.marker} />
                </>
              }
              items={teaching.items}
            />
          </div>
        </section>

        {/* ---- Contact ---- */}
        <section className="about-contact">
          <ScrollReveal>
            <h2 className="about-h">Any inquiries?</h2>
          </ScrollReveal>
          <ScrollReveal>
            <a className="about-email" href="mailto:roman@denormalized.co">
              roman@denormalized.co
            </a>
          </ScrollReveal>
        </section>
      </main>
    </div>
  );
}
