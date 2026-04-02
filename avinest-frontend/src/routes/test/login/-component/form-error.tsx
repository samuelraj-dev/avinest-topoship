
interface FormErrorProps {
  message?: string;
  messages?: string[];
  className?: string;
}

export function FormError({ message, messages, className = "" }: FormErrorProps) {
  const allMessages = messages || (message ? [message] : []);

  if (allMessages.length === 0) return null;

  return (
    <div className={`rounded-lg bg-color-danger-light border border-color-danger/20 p-3.5 ${className}`}>
      {allMessages.length === 1 ? (
        <p className="text-sm text-color-danger font-medium">{allMessages[0]}</p>
      ) : (
        <ul className="space-y-1.5">
          {allMessages.map((msg, idx) => (
            <li key={idx} className="text-sm text-color-danger flex gap-2">
              <span>•</span>
              <span>{msg}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function FormSuccess({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div className="rounded-lg bg-color-success/10 border border-color-success/20 p-3.5">
      <p className="text-sm text-color-success font-medium">{message}</p>
    </div>
  );
}