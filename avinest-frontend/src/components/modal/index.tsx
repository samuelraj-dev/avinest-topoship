export function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-lg bg-surface shadow-lg">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ModalHeader({ title }: { title: string }) {
  return (
    <div className="border-b border-border px-6 py-4">
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  );
}

export function ModalBody({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-4">{children}</div>;
}

export function ModalFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
      {children}
    </div>
  );
}
