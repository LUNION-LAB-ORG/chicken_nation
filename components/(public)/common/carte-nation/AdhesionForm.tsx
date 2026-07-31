"use client";

import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button, Checkbox, Input } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { Camera, GraduationCap, X } from "lucide-react";

import {
  adhesionSchema,
  AdhesionDTO,
} from "@/features/marketing/adhesion/adhesion.schema";
import { useAdhesionMutation } from "@/features/marketing/adhesion/queries/adhesion.mutation";
import { NATION_CARD_DEEPLINK } from "@/features/marketing/adhesion/adhesion.constants";
import NationCardVisual from "./NationCardVisual";

/**
 * Formulaire d'adhésion à la Carte de la Nation (pré-inscription silencieuse).
 * Champs : nom, téléphone (CI), « Êtes-vous étudiant/élève ? » (Oui/Non — si Oui,
 * établissement requis + profile_type="ETUDIANT"), consentement WhatsApp
 * obligatoire. AUCUN justificatif.
 *
 * REFONTE UI « identité CN » : conteneur à ombre décalée (look affiche), liseré
 * rayé signature, titres font-title, question étudiant en deux gros boutons
 * (plus tactile qu'un radio). La logique (RHF + mutation + photo) est intacte.
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
      first_name: "",
      last_name: "",
      phone: "",
      profile_type: undefined,
      establishment: "",
      whatsapp_opt_in: false,
    },
  });

  // Réponse à « Êtes-vous étudiant/élève ? » — tri-état pour le rendu du toggle
  // (distingue « non répondu » de « Non », que profile_type=undefined ne permet pas).
  const [studentChoice, setStudentChoice] = useState<"yes" | "no" | "">("");
  // Source de vérité pour l'affichage du champ Établissement.
  const isStudent = watch("profile_type") === "ETUDIANT";

  const choisirEtudiant = (value: "yes" | "no") => {
    setStudentChoice(value);
    if (value === "yes") {
      setValue("profile_type", "ETUDIANT", { shouldValidate: false });
    } else {
      // « Non » : aucun profile_type ni établissement envoyés.
      setValue("profile_type", undefined, { shouldValidate: false });
      setValue("establishment", "", { shouldValidate: false });
      clearErrors("establishment");
    }
  };

  // Photo du titulaire — FACULTATIVE sur le site (contrôle backoffice). Gérée hors
  // react-hook-form (un File ne se valide pas proprement via zod ici) : état local
  // + envoi multipart.
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

  /* ── Fin du workflow : moment de marque, pas une carte générique ── */
  if (submitted) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-white shadow-[10px_10px_0_0_rgba(255,98,0,0.12)] ring-1 ring-black/5">
        <div className="h-2 w-full bg-[repeating-linear-gradient(45deg,#ff6200,#ff6200_16px,#ffc700_16px,#ffc700_32px)]" />

        <div className="p-7 text-center md:p-10">
          {/* La carte que le client vient de demander */}
          <div className="mx-auto mb-8 max-w-xs">
            <NationCardVisual
              cardLabel={t("card_label")}
              memberLabel={t("card_member")}
              tilted={false}
            />
          </div>

          <h2 className="font-title text-3xl uppercase tracking-wide text-[#ff6200] md:text-4xl">
            {t("success_title")}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-neutral-600 md:text-base">
            {t("success_subtitle")}
          </p>

          <ol className="mx-auto mt-8 max-w-md space-y-3 text-left">
            {[t("success_step_1"), t("success_step_2")].map((step, i) => (
              <li
                key={step}
                className="flex items-start gap-3 rounded-2xl bg-neutral-50 p-4"
              >
                <span className="flex h-8 w-8 flex-shrink-0 -rotate-3 items-center justify-center rounded-lg bg-secondary font-title text-base font-bold text-black shadow-[2px_2px_0_0_#ff6200]">
                  {i + 1}
                </span>
                <span className="pt-1 text-sm text-neutral-700">{step}</span>
              </li>
            ))}
          </ol>

          <Button
            as="a"
            href={NATION_CARD_DEEPLINK}
            target="_blank"
            rel="noopener noreferrer"
            color="primary"
            size="lg"
            fullWidth
            className="mt-8 h-14 rounded-2xl font-title text-base uppercase tracking-widest"
          >
            {t("success_cta")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white shadow-[10px_10px_0_0_rgba(255,98,0,0.12)] ring-1 ring-black/5">
      {/* Liseré rayé signature */}
      <div className="h-2 w-full bg-[repeating-linear-gradient(45deg,#ff6200,#ff6200_16px,#ffc700_16px,#ffc700_32px)]" />

      <div className="p-6 md:p-8">
        <h2 className="font-title text-2xl uppercase tracking-wide text-neutral-900 md:text-3xl">
          {t("title")}
        </h2>
        <p className="mt-1 text-sm text-neutral-500">{t("subtitle")}</p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 space-y-5"
          noValidate
        >
          {/* Nom + prénom(s) — deux champs EXPLICITES (plus de découpe du nom
              complet : un prénom composé « Jean Marc » reste entier). */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-3">
            <Input
              {...register("last_name")}
              label={t("last_name_label")}
              placeholder={t("last_name_placeholder")}
              isDisabled={isPending}
              isInvalid={!!errors.last_name}
              errorMessage={errors.last_name?.message}
              variant="bordered"
              radius="lg"
              autoComplete="family-name"
            />
            <Input
              {...register("first_name")}
              label={t("first_name_label")}
              placeholder={t("first_name_placeholder")}
              isDisabled={isPending}
              isInvalid={!!errors.first_name}
              errorMessage={errors.first_name?.message}
              variant="bordered"
              radius="lg"
              autoComplete="given-name"
            />
          </div>

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
            radius="lg"
            autoComplete="tel"
          />

          {/* Photo du titulaire — FACULTATIVE (vérification backoffice) */}
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-4">
            <label className="block text-sm font-semibold text-neutral-800">
              {t("photo_label")}{" "}
              <span className="font-normal text-neutral-400">
                {t("photo_optional")}
              </span>
            </label>
            <div className="mt-3 flex items-center gap-4">
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreview}
                  alt=""
                  className="h-20 w-20 rounded-2xl object-cover ring-2 ring-secondary"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-neutral-300 ring-1 ring-neutral-200">
                  <Camera className="h-7 w-7" />
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
                  radius="lg"
                  isDisabled={isPending}
                  onPress={() => fileInputRef.current?.click()}
                >
                  {photo ? t("photo_change") : t("photo_choose")}
                </Button>
                <p className="mt-1.5 text-tiny leading-relaxed text-neutral-400">
                  {t("photo_hint")}
                </p>
              </div>
            </div>
            {photoError && (
              <p className="mt-2 text-tiny text-danger">{photoError}</p>
            )}
          </div>

          {/* Étudiant / élève — deux gros boutons, plus francs qu'un radio */}
          <div>
            <p className="text-sm font-semibold text-neutral-800">
              {t("student_label")}
            </p>
            <div className="mt-2.5 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isPending}
                onClick={() => choisirEtudiant("yes")}
                className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3.5 text-sm font-semibold transition ${
                  studentChoice === "yes"
                    ? "border-[#ff6200] bg-primary/10 text-[#ff6200]"
                    : "border-neutral-200 bg-white text-neutral-600 hover:border-primary/40"
                }`}
              >
                <GraduationCap className="h-4.5 w-4.5" />
                {t("student_yes")}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => choisirEtudiant("no")}
                className={`flex items-center justify-center rounded-2xl border-2 px-4 py-3.5 text-sm font-semibold transition ${
                  studentChoice === "no"
                    ? "border-[#ff6200] bg-primary/10 text-[#ff6200]"
                    : "border-neutral-200 bg-white text-neutral-600 hover:border-primary/40"
                }`}
              >
                {t("student_no")}
              </button>
            </div>

            {isStudent && (
              <div className="mt-3">
                <Input
                  {...register("establishment")}
                  label={t("establishment_label")}
                  placeholder={t("establishment_placeholder")}
                  isDisabled={isPending}
                  isInvalid={!!errors.establishment}
                  errorMessage={errors.establishment?.message}
                  variant="bordered"
                  radius="lg"
                />
              </div>
            )}
          </div>

          <Controller
            control={control}
            name="whatsapp_opt_in"
            render={({ field }) => (
              <div className="rounded-2xl bg-neutral-50 p-3.5">
                <Checkbox
                  isSelected={field.value}
                  onValueChange={field.onChange}
                  isDisabled={isPending}
                  isInvalid={!!errors.whatsapp_opt_in}
                  size="sm"
                >
                  <span className="text-sm text-neutral-700">
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
            className="h-14 rounded-2xl font-title text-base uppercase tracking-widest shadow-[4px_4px_0_0_#ffc700]"
          >
            {isPending ? t("submitting") : t("submit")}
          </Button>

          <p className="text-center text-tiny leading-relaxed text-neutral-400">
            {t("legal_note")}
          </p>
        </form>
      </div>
    </div>
  );
}
