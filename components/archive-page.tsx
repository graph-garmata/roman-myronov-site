"use client";

import Link from "next/link";
import Clock from "@/components/clock";
import Roll from "@/components/roll";
import Reveal from "@/components/reveal";
import ArchiveList from "@/components/archive-list";

const navLinks = [
  { label: "Projects", href: "/" },
  { label: "About", href: "/about" },
  { label: "Archive", href: "/archive" },
  { label: "Dump", href: "/dump" },
  { label: "Contact", href: "mailto:roman@denormalized.co" },
];

const archiveItems = ["Linen", "wcf2023", "Boko", "Specialty"];

export default function ArchivePage() {
  return (
    <div className="archive">
      <div className="archive__inner">
        <p className="archive-lead">
          <Reveal delay={0.05}>A collection of old but precious works</Reveal>
        </p>

        <ArchiveList items={archiveItems} />

        <nav className="nav" aria-label="Primary">
          <ul>
            {navLinks.map((link, i) => (
              <li key={link.href}>
                <Link href={link.href} className="nav__link">
                  <Reveal delay={0.1 + i * 0.06}>
                    <Roll>{link.label}</Roll>
                  </Reveal>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="clock body">
          <Reveal delay={0.2}>
            <span>Local Time</span>
          </Reveal>
          <Reveal delay={0.25}>
            <Clock />
          </Reveal>
        </div>

        <div className="colophon body">
          <div className="colophon__text">
            <Reveal delay={0.2}>
              <span>©RM</span>
            </Reveal>
            <Reveal delay={0.25}>
              <span>2026</span>
            </Reveal>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="colophon__mark"
            src="/images/duck.svg"
            alt=""
            width={20}
            height={20}
          />
        </div>
      </div>
    </div>
  );
}
