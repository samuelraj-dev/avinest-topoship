import AuthBg from "../assets/auth-bg.svg";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const safeBg = AuthBg.replace(/#/g, '%23');
  return (
    <div
      className="
        min-h-screen w-full
        bg-bg
        flex flex-col items-center
        py-16 px-4
      "
      style={{
        backgroundImage: `url("${safeBg}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {children}
    </div>
  );
}
