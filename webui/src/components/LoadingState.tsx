export function LoadingState({ label = "加载中" }: { label?: string }) {
  return (
    <section className="state-panel" aria-busy="true">
      <p className="eyebrow">Loading</p>
      <h2>{label}</h2>
    </section>
  );
}
