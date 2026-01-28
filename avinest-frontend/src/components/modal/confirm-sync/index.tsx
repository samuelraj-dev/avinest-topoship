import { useState } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "../index";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import api from "../../../api/client";

export function ConfirmSyncModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm(password);
      onClose();
    } finally {
      setLoading(false);
      setPassword("");
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader title="Confirm Sync" />

      <ModalBody>
        <p className="mb-4 text-sm text-fg-muted">
          Enter your password to sync your academic data from the portal.
        </p>

        <Input
          type="password"
        //   label="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoFocus
        />
      </ModalBody>

      <ModalFooter>
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={!password || loading}
        >
          Confirm Sync
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export function SyncButton({
    syncFn
}: {
    syncFn: (password: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Sync
      </Button>

      <ConfirmSyncModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={syncFn}
      />
    </>
  );
}
