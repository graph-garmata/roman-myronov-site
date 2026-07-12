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

type Phase = "idle" | "covering" | "revealing";

const NavigateContext = createContext<(href: string) => void>(() => {});
export const usePageTransition = () => useContext(NavigateContext);

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
  const pendingHref = useRef<string | null>(null);
  const prevPathname = useRef(pathname);

  const navigate = useCallback(
    (href: string) => {
      if (phase !== "idle") return;
      pendingHref.current = href;
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
      setPhase((p) => (p === "covering" ? "revealing" : p));
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
      navigate(href);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [navigate]);

  return (
    <NavigateContext.Provider value={navigate}>
      {children}
      <div
        className={`curtain${phase !== "idle" ? ` curtain--${phase}` : ""}`}
        onTransitionEnd={handleTransitionEnd}
        aria-hidden
      />
    </NavigateContext.Provider>
  );
}
