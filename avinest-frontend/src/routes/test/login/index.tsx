import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/test/login/')({
  component: LoginPageEnhanced,
})

import { useForm, type SubmitHandler } from "react-hook-form";
import { Button } from "./-component/button";
import { Input } from "./-component/input";
import { PasswordInput } from "./-component/password-input";
import { useState } from "react";
import { FormError, FormSuccess } from "./-component/form-error";
import api from "../../../api/client";
import { setAccessToken } from "../../../auth/authStore";
import { useNavigate } from "@tanstack/react-router";
import { toggleTheme, getTheme } from "../../../lib/utils/theme";

type LoginFormData = {
  username: string;
  password: string;
};

function LoginPageEnhanced() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string>();
  const [formSuccess, setFormSuccess] = useState<string>();
  const [theme, setLocalTheme] = useState<"light" | "dark">(getTheme());

  const handleThemeToggle = () => {
    const newTheme = toggleTheme();
    setLocalTheme(newTheme);
  };

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    try {
      setFormError(undefined);
      setFormSuccess(undefined);
      
      const res = await api.post("/auth/login", data, { withCredentials: true });
      setAccessToken(res.data.token.access_token);
      localStorage.setItem("refreshToken", res.data.token.refresh_token);
      
      setFormSuccess("Login successful! Redirecting...");
      
      setTimeout(() => {
        const role = res.data.role;
        navigate({ to: role === "STUDENT" ? "/student" : "/faculty" });
      }, 800);
    } catch (error) {
      setFormError("Invalid username or password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-color-bg transition-colors duration-300">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-color-primary opacity-[0.03] rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-color-primary opacity-[0.03] rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-md">
        {/* Theme Toggle Button (Top Right) */}
        <button
          onClick={handleThemeToggle}
          className="absolute -top-16 right-0 p-2 rounded-lg bg-color-bg-secondary hover:bg-color-bg-tertiary border border-color-border transition-all duration-200 text-color-text-secondary hover:text-color-text-primary"
          aria-label="Toggle theme"
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? (
            // Moon Icon
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            // Sun Icon
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l-2.828-2.829a1 1 0 00-1.414 1.414l2.828 2.829a1 1 0 001.414-1.414zM2.05 6.464A1 1 0 103.464 5.05 1 1 0 002.05 6.464zm12 0a1 1 0 10-1.414 1.414 1 1 0 001.414-1.414zM2 10a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm12 0a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        {/* Card with Fade-in Animation */}
        <div className="bg-color-surface rounded-xl shadow-xl overflow-hidden border border-color-border/50 animate-fade-in">
          {/* Header Section */}
          <div className="px-6 sm:px-8 py-8 sm:py-10 relative">
            {/* Decorative Top Border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-color-primary to-transparent opacity-20"></div>

            {/* Logo/Branding - Animated */}
            <div className="flex items-center justify-center mb-8 animate-slide-in-down">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 bg-color-primary rounded-lg opacity-20 blur-lg animate-pulse"></div>
                  <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-color-primary to-color-primary-hover flex items-center justify-center shadow-lg">
                    <span className="text-color-primary-fg font-bold text-lg">A</span>
                  </div>
                </div>
                <span className="text-xl font-semibold text-color-text-primary">AviNest</span>
              </div>
            </div>

            {/* Heading - Animated */}
            <div className="mb-8 animate-slide-in-down" style={{ animationDelay: "0.1s" }}>
              <h1 className="text-2xl sm:text-3xl font-bold text-color-text-primary mb-2">
                Welcome back
              </h1>
              <p className="text-color-text-secondary text-sm sm:text-base">
                Sign in to continue to your dashboard
              </p>
            </div>

            {/* Form - Animated */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-slide-in-down" style={{ animationDelay: "0.2s" }}>
              {/* Username Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-color-text-primary"
                >
                  Username
                </label>
                <Input
                  id="username"
                  {...register("username", {
                    required: "Username is required",
                    minLength: {
                      value: 3,
                      message: "Username must be at least 3 characters",
                    },
                  })}
                  placeholder="2117230080093"
                  className={`transition-all ${
                    errors.username ? "border-color-danger ring-2 ring-color-danger/20" : ""
                  }`}
                  disabled={isSubmitting}
                  autoComplete="username"
                />
                {errors.username && (
                  <p className="text-xs sm:text-sm text-color-danger font-medium animate-shake">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-color-text-primary"
                  >
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs text-color-primary hover:text-color-primary-hover transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <PasswordInput
                  id="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  placeholder="••••••••"
                  className={`transition-all ${
                    errors.password ? "border-color-danger ring-2 ring-color-danger/20" : ""
                  }`}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
                {errors.password && (
                  <p className="text-xs sm:text-sm text-color-danger font-medium animate-shake">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Messages */}
              {formError && (
                <FormError message={formError} className="animate-slide-in" />
              )}
              {formSuccess && (
                <FormSuccess message={formSuccess} />
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>

              {/* Divider */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-color-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-2 bg-color-surface text-color-text-tertiary">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Social Login Buttons (Optional) */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="py-2.5 px-4 border border-color-border rounded-lg text-color-text-secondary hover:bg-color-bg-secondary transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="py-2.5 px-4 border border-color-border rounded-lg text-color-text-secondary hover:bg-color-bg-secondary transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </button>
              </div>
            </form>
          </div>

          {/* Footer Section */}
          <div className="px-6 sm:px-8 py-6 bg-color-bg-secondary border-t border-color-border">
            <p className="text-xs sm:text-sm text-color-text-tertiary text-center">
              By signing in, you agree to our{" "}
              <a href="#" className="text-color-primary hover:text-color-primary-hover font-medium transition-colors">
                Terms of Service
              </a>
              {" "}and{" "}
              <a href="#" className="text-color-primary hover:text-color-primary-hover font-medium transition-colors">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center animate-slide-in-up" style={{ animationDelay: "0.3s" }}>
          <p className="text-xs sm:text-sm text-color-text-secondary">
            Default credentials provided by your institution
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-in-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-2px);
          }
          75% {
            transform: translateX(2px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-slide-in-down {
          animation: slide-in-down 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-in-up {
          animation: slide-in-up 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}