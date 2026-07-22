"use client";

import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Input,
  Radio,
  RadioGroup,
} from "@heroui/react";
import { addToast } from "@heroui/toast";
import { Camera, CheckCircle2, GraduationCap, X } from "lucide-react";

import {
  adhesionSchema,
  AdhesionDTO,
} from "@/features/marketing/adhesion/adhesion.schema";
import { useAdhesionMutation } from "@/features/marketing/adhesion/queries/adhesion.mutation";
import { NATION_CARD_DEEPLINK } from "@/features/marketing/adhesion/adhesion.constants";

/**
 * Formulaire d'adhésion à la Carte de la Nation (pré-inscription silencieuse).
 * Champs : nom, téléphone (CI), « Êtes-vous étudiant/élève ? » (Oui/Non — si Oui,
 * établissement requis + profile_type="ETUDIANT"), consentement WhatsApp
 * obligatoire. AUCUN justificatif.
 */
export default function AdhesionForm() {
  const t = useTranslations("carte-nation.adhesion");
  const [submitted, setSubmitted] = useState(false);

  const { mutateAsync, isPending } = useAdhesionMutation();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<AdhesionDTO>({
    resolver: zodResolver(adhesionSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      phone: "",
      profile_type: undefined,
      establishment: "",
      whatsapp_opt_in: false,
    },
  });

  // Réponse à « Êtes-vous étudiant/élève ? » — tri-état pour le rendu du radio
  // (distingue « non répondu » de « Non », que profile_type=undefined ne permet pas).
  const [studentChoice, setStudentChoice] = useState<"yes" | "no" | "">("");
  // Source de vérité pour l'affichage du champ Établissement.
  const isStudent = watch("profile_type") === "ETUDIANT";

  // Photo du titulaire — OBLIGATOIRE (contrôle backoffice). Gérée hors react-hook-form
  // (un File ne se valide pas proprement via zod ici) : état local + envoi multipart.
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError(t("photo_invalid"));
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoError(null);
  };

  const onSubmit = async (data: AdhesionDTO) => {
    // Photo FACULTATIVE sur le site (décision 22/07) : elle sert à la
    // vérification backoffice et peut être fournie plus tard dans l'app.
    try {
      await mutateAsync({ data, photo });
      setSubmitted(true);
    } catch (error) {
      addToast({
        title: t("error_title"),
        description:
          error instanceof Error ? error.message : t("error_generic"),
        icon: <X />,
        color: "danger",
      });
    }
  };

  if (submitted) {
    return (
      <Card className="max-w-xl w-full mx-auto border border-primary-100 shadow-lg">
        <CardBody className="p-8 md:p-10 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-11 w-11 text-primary" />
          </div>
          <h2 className="mb-3 text-2xl md:text-3xl font-bold text-foreground">
            {t("success_title")}
          </h2>
          <p className="mb-8 text-base text-default-500">
            {t("success_subtitle")}
          </p>

          <ol className="mb-8 space-y-3 text-left">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                1
              </span>
              <span className="text-sm text-default-600">
                {t("success_step_1")}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                2
              </span>
              <span className="text-sm text-default-600">
                {t("success_step_2")}
              </span>
            </li>
          </ol>

          <Button
            as="a"
            href={NATION_CARD_DEEPLINK}
            target="_blank"
            rel="noopener noreferrer"
            color="primary"
            size="lg"
            fullWidth
            className="font-semibold"
          >
            {t("success_cta")}
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="max-w-xl w-full mx-auto border border-primary-100 shadow-lg">
      <CardHeader className="flex-col items-start gap-1 px-6 pt-6">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {t("title")}
        </h2>
        <p className="text-sm text-default-500">{t("subtitle")}</p>
      </CardHeader>
      <CardBody className="px-6 pb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <Input
            {...register("name")}
            label={t("name_label")}
            placeholder={t("name_placeholder")}
            isDisabled={isPending}
            isInvalid={!!errors.name}
            errorMessage={errors.name?.message}
            variant="bordered"
            autoComplete="name"
          />

          <Input
            {...register("phone")}
            type="tel"
            inputMode="tel"
            label={t("phone_label")}
            placeholder={t("phone_placeholder")}
            description={t("phone_hint")}
            isDisabled={isPending}
            isInvalid={!!errors.phone}
            errorMessage={errors.phone?.message}
            variant="bordered"
            autoComplete="tel"
          />

          {/* Photo du titulaire — FACULTATIVE sur le site (vérification backoffice) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              {t("photo_label")}{" "}
              <span className="text-default-400 font-normal">{t("photo_optional")}</span>
            </label>
            <div className="flex items-center gap-4">
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreview}
                  alt=""
                  className="h-20 w-20 rounded-xl border border-default-200 object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-default-300 bg-default-50 text-default-400">
                  <Camera className="h-6 w-6" />
                </div>
              )}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={isPending}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="bordered"
                  size="sm"
                  isDisabled={isPending}
                  onPress={() => fileInputRef.current?.click()}
                >
                  {photo ? t("photo_change") : t("photo_choose")}
                </Button>
                <p className="mt-1 text-tiny text-default-400">
                  {t("photo_hint")}
                </p>
              </div>
            </div>
            {photoError && (
              <p className="text-tiny text-danger">{photoError}</p>
            )}
          </div>

          <div className="space-y-4">
            <RadioGroup
              label={t("student_label")}
              orientation="horizontal"
              value={studentChoice}
              onValueChange={(value) => {
                setStudentChoice(value as "yes" | "no");
                if (value === "yes") {
                  setValue("profile_type", "ETUDIANT", {
                    shouldValidate: false,
                  });
                } else {
                  // « Non » : aucun profile_type ni établissement envoyés.
                  setValue("profile_type", undefined, { shouldValidate: false });
                  setValue("establishment", "", { shouldValidate: false });
                  clearErrors("establishment");
                }
              }}
              isDisabled={isPending}
              classNames={{ wrapper: "gap-3" }}
            >
              <Radio value="yes">
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4" />
                  {t("student_yes")}
                </span>
              </Radio>
              <Radio value="no">{t("student_no")}</Radio>
            </RadioGroup>

            {isStudent && (
              <Input
                {...register("establishment")}
                label={t("establishment_label")}
                placeholder={t("establishment_placeholder")}
                isDisabled={isPending}
                isInvalid={!!errors.establishment}
                errorMessage={errors.establishment?.message}
                variant="bordered"
              />
            )}
          </div>

          <Controller
            control={control}
            name="whatsapp_opt_in"
            render={({ field }) => (
              <div>
                <Checkbox
                  isSelected={field.value}
                  onValueChange={field.onChange}
                  isDisabled={isPending}
                  isInvalid={!!errors.whatsapp_opt_in}
                  size="sm"
                >
                  <span className="text-sm text-default-600">
                    {t("optin_label")}
                  </span>
                </Checkbox>
                {errors.whatsapp_opt_in && (
                  <p className="mt-1 text-tiny text-danger">
                    {errors.whatsapp_opt_in.message}
                  </p>
                )}
              </div>
            )}
          />

          <Button
            type="submit"
            color="primary"
            size="lg"
            fullWidth
            isLoading={isPending}
            isDisabled={isPending}
            className="font-semibold"
          >
            {isPending ? t("submitting") : t("submit")}
          </Button>

          <p className="text-center text-tiny text-default-400">
            {t("legal_note")}
          </p>
        </form>
      </CardBody>
    </Card>
  );
}
