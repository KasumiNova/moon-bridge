export function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="placeholder-panel" aria-labelledby="page-title">
      <div>
        <p className="eyebrow">Console workspace</p>
        <h1 id="page-title">{title}</h1>
        <p>
          This surface is ready for Moon Bridge API data, staged changes, and
          operational controls.
        </p>
      </div>
    </section>
  );
}
