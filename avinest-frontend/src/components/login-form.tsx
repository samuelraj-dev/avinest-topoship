import { useForm, type SubmitHandler } from "react-hook-form";
import { Button } from "../components/ui/button";
import { Field } from "../components/ui/field";
import { Input } from "../components/ui/input";
import api from "../api/client";
import { setAccessToken } from "../auth/authStore";
import { useNavigate } from "@tanstack/react-router";
import { PasswordInput } from "./ui/password-input";
import { useState } from "react";
import { FormError } from "./ui/form-error";

type Form = {
  username: string;
  password: string;
};

export function LoginForm() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>();
    const navigate = useNavigate();
    const [formError, setFormError] = useState<string>();

    const onSubmit: SubmitHandler<Form> = async (data) => {
    const res = await api.post("/auth/login", data, { withCredentials: true });
    console.log(res.data)
    setAccessToken(res.data.token.access_token);
    localStorage.setItem(
      "refreshToken",
      res.data.token.refresh_token
    );

    const role = res.data.role;
    // console.log(role)
    navigate({ to: role === "STUDENT" ? "/student" : "/faculty" });
  };

    return (
        <form
      onSubmit={handleSubmit(async (data) => {
        try {
          setFormError(undefined);
          await onSubmit(data);
        } catch {
          setFormError("Invalid username or password");
        }
      })}
      className="space-y-4"
    >
      <Field label="Username" error={errors.username?.message}>
        <Input
          {...register("username", { required: "Username is required" })}
          placeholder="Enter your username"
        />
      </Field>

      <Field label="Password" error={errors.password?.message}>
        <PasswordInput
          {...register("password", { required: "Password is required" })}
        //   type="password"
        //   placeholder="••••••••"
        />
      </Field>

      <Button loading={isSubmitting}>
        Login
      </Button>
      <FormError message={formError} />
    </form>
    )
}