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
    <div className="">
      <label style={{ lineHeight: "2.5" }} className="text-sm text-fg text-gray-600 font-normal">{label}</label>
      {children}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
