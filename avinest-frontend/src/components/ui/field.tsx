export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-fg">{label}</label>
      {children}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
