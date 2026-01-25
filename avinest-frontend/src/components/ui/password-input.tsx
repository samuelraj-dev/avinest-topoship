import { useState } from "react";
import { Input } from "./input";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function PasswordInput({ ...props }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className="pr-10"
      />

      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        className="
          absolute right-2 top-1/2 -translate-y-1/2
          text-sm text-fg/60 hover:text-fg
        "
        tabIndex={-1}
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
