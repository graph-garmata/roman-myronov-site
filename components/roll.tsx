/**
 * Roll — hover effect: the visible word slides down out of a mask while an
 * identical duplicate slides down into its place from above.
 *
 * `chars` rolls each character on its own, staggered left to right — for
 * display-size type, where one slab rolling at once reads heavy. Takes a
 * plain string; the whole word stays the accessible label.
 */
export default function Roll(
  props: { children: React.ReactNode; chars?: false } | { children: string; chars: true },
) {
  if (props.chars) {
    const text = props.children;
    return (
      <span className="roll roll--chars" role="text" aria-label={text}>
        <span className="roll__chars" aria-hidden>
          {Array.from(text).map((ch, i) => (
            <span
              className="roll__inner"
              key={i}
              style={{ "--i": i } as React.CSSProperties}
            >
              <span className="roll__line">{ch}</span>
              <span className="roll__line">{ch}</span>
            </span>
          ))}
        </span>
      </span>
    );
  }

  const { children } = props;
  return (
    <span className="roll">
      <span className="roll__inner">
        <span className="roll__line">{children}</span>
        <span className="roll__line" aria-hidden>
          {children}
        </span>
      </span>
    </span>
  );
}
