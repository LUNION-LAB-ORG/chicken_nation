"use client";

import Title from "@/components/primitives/Title";
import { useLoginMutation } from "@/features/auth/queries/auth-login.mutation";
import { LoginDTO, loginSchema } from "@/features/auth/schemas/auth.schema";
import { Link } from "@/i18n/navigation";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "@/i18n/navigation";

const LoginForm = () => {
  const t = useTranslations("auth.login");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const togglePassword = () => setShowPassword((prev) => !prev);

  const { mutateAsync: loginMutation, isPending } = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDTO>({
    resolver: zodResolver(loginSchema),
    mode: "all",
    defaultValues: { email: "admin@test.com", password: "password" },
  });

  const onSubmit = async (data: LoginDTO) => {
    try {
      await loginMutation({ data });
      router.push("/dashboard");
    } catch (error) {}
  };

  return (
    <Card className="max-w-md w-full border border-primary-100 mx-auto mt-10 shadow-lg">
      <CardHeader>
        <Title size="sm" className="text-primary-600">
          {t("login_title")}
        </Title>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            {...register("email")}
            id="email"
            type="email"
            label={t("email_label")}
            placeholder="admin@test.com"
            disabled={isPending}
            isInvalid={!!errors.email}
          />

          <Input
            {...register("password")}
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="password"
            disabled={isPending}
            isInvalid={!!errors.password}
            endContent={
              <Button
                size="sm"
                onPress={togglePassword}
                variant="light"
                isIconOnly
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            }
          />

          <div className="flex justify-between items-center">
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              {t("forgot_password")}
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            fullWidth
            isLoading={isPending}
            isDisabled={isPending}
            color="primary"
          >
            {isPending ? t("signing_in") : t("sign_in")}
          </Button>
        </form>
      </CardBody>
      <CardFooter>
        <p className="text-sm text-muted-foreground">{t("login_footer")}</p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
