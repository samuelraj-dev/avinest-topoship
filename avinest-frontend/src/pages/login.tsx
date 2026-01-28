import { AuthCard } from "../components/auth-card";
import { AuthLayout } from "../components/auth-layout";
import { LoginForm } from "../components/login-form";
import { ThemeToggle } from "../components/theme-toggle";

export function LoginPage() {
  return (
    // <form
    //   onSubmit={handleSubmit(onSubmit)}
    // >
    //   <input {...register("username")} className="input" />
    //   <input {...register("password")} type="password" className="input" />
    //   <button className="btn w-full">Login</button>
    // </form>
    <>
      <ThemeToggle />
      {/* <div className="mx-auto w-full max-w-sm rounded-lg border border-border bg-bg p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold">Welcome back</h1>
        <p className="mb-6 text-sm text-fg/60">
          Sign in to continue
        </p>

        <LoginForm />
      </div> */}
      <AuthLayout>
  <AuthCard
    title="Welcome back"
    subtitle="Sign in to continue"
  >
    <LoginForm />
  </AuthCard>
</AuthLayout>

    </>
  );
}
