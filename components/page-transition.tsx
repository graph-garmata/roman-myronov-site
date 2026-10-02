"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

// "custom": a page's own cover animation is playing (see usePageCover).
// "covered": it finished — the curtain snaps in fully closed, unseen behind
// the already-black screen, and takes over from there.
type Phase = "idle" | "covering" | "custom" | "covered" | "revealing";

/** A page's own cover: start it and return a promise that resolves once the
 *  screen is fully black, or return null to fall back to the curtain. */
type Cover = (href: string) => Promise<void> | null;

const NavigateContext = createContext<(href: string) => void>(() => {});
export const usePageTransition = () => useContext(NavigateContext);

const CoverContext = createContext<React.RefObject<Cover | null> | null>(null);

/** Lets the current page replace the curtain's cover for link clicks made
 *  on it (Home's eye blackout). The reveal on the next page is unchanged. */
export function usePageCover(cover: Cover) {
  const slot = useContext(CoverContext);
  const latest = useRef(cover);
  latest.current = cover;
  useEffect(() => {
    if (!slot) return;
    const fn: Cover = (href) => latest.current(href);
    slot.current = fn;
    return () => {
      if (slot.current === fn) slot.current = null;
    };
  }, [slot]);
}

/**
 * Page transitions: on an internal navigation, a black rectangle scales down
 * from the top to cover the screen, the route commits behind it, then it
 * retracts downward to reveal the new page.
 */
export default function PageTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  // The curtain goes white when the destination is Home's Contact takeover
  // (which is a light-mode section), so the wipe matches what's behind it.
  const [light, setLight] = useState(false);
  const pendingHref = useRef<string | null>(null);
  const prevPathname = useRef(pathname);
  const coverRef = useRef<Cover | null>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const navigate = useCallback(
    (href: string, isLight = false) => {
      if (phase !== "idle") return;
      pendingHref.current = href;
      setLight(isLight);
      setPhase("covering");
    },
    [phase]
  );

  // Commit the pending navigation exactly once (whichever trigger fires first).
  const commit = useCallback(() => {
    const href = pendingHref.current;
    if (href) {
      pendingHref.current = null;
      router.push(href);
    }
  }, [router]);

  // Cover finished → navigate; reveal finished → back to idle. transitionend is
  // the smooth trigger, but it's frozen in background tabs, so each phase also
  // has a timeout fallback below so the sequence can never get stuck.
  const handleTransitionEnd = () => {
    if (phase === "covering") commit();
    else if (phase === "revealing") setPhase("idle");
  };

  useEffect(() => {
    if (phase === "covering") {
      const t = setTimeout(commit, 650);
      return () => clearTimeout(t);
    }
    if (phase === "covered") {
      commit();
      // If the route never commits, don't leave the screen black.
      const t = setTimeout(() => setPhase("revealing"), 3000);
      return () => clearTimeout(t);
    }
    if (phase === "revealing") {
      const t = setTimeout(() => setPhase("idle"), 650);
      return () => clearTimeout(t);
    }
  }, [phase, commit]);

  // Once the new route has committed (pathname changed), lift the curtain.
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      pendingHref.current = null;
      setPhase((p) => (p === "covering" || p === "covered" ? "revealing" : p));
    }
  }, [pathname]);

  // Intercept internal link clicks so navigation plays the curtain first.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const anchor = (e.target as HTMLElement)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");
      if (
        !href ||
        target === "_blank" ||
        anchor.hasAttribute("download") ||
        !href.startsWith("/") ||
        href.startsWith("//") ||
        href.startsWith("/#")
      ) {
        return;
      }
      const url = new URL(href, window.location.href);
      if (url.pathname === window.location.pathname) return; // same page
      e.preventDefault();
      e.stopPropagation();
      if (phaseRef.current !== "idle") return;
      const custom = coverRef.current?.(href);
      if (custom) {
        pendingHref.current = href;
        setLight(false);
        setPhase("custom");
        custom.then(() => setPhase("covered"));
        return;
      }
      // Home's Contact takeover is light — wipe white for it.
      navigate(href, url.searchParams.get("contact") === "1");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [navigate]);

  return (
    <NavigateContext.Provider value={navigate}>
      <CoverContext.Provider value={coverRef}>{children}</CoverContext.Provider>
      <div
        className={`curtain${phase !== "idle" && phase !== "custom" ? ` curtain--${phase}` : ""}${light ? " curtain--light" : ""}`}
        onTransitionEnd={handleTransitionEnd}
        aria-hidden
      />
    </NavigateContext.Provider>
  );
}
