type Props = {
  message?: string;
};

export function FormError({ message }: Props) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="
        rounded-md border border-danger/40
        bg-danger/10 px-3 py-2
        text-sm text-danger
      "
    >
      {message}
    </div>
  );
}
