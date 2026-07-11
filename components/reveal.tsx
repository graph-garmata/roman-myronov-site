/**
 * Reveal — on-load intro: content starts hidden below a mask and slides up
 * into place. `delay` staggers each row for the cascade effect. Requires an
 * ancestor with the `is-loaded` class to trigger.
 */
export default function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <span className="reveal">
      <span className="reveal__i" style={{ transitionDelay: `${delay}s` }}>
        {children}
      </span>
    </span>
  );
}
