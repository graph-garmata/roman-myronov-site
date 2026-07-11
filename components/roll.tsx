/**
 * Roll — hover effect: the visible word slides down out of a mask while an
 * identical duplicate slides down into its place from above.
 */
export default function Roll({ children }: { children: React.ReactNode }) {
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
