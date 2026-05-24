export function ErrorState({ title = "请求失败", message }: { title?: string; message: string }) {
  return (
    <section className="state-panel" role="alert">
      <p className="eyebrow">Error</p>
      <h2>{title}</h2>
      <p>{message}</p>
    </section>
  );
}
