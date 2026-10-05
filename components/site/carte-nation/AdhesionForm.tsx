"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";

import { Bouton, LienBouton } from "../Bouton";
import { ChampTexte } from "../Champs";
import { CaseACocher, ChoixRadio, GroupeChoix } from "../Choix";
import { Icone } from "../Icone";

import NationCardVisual from "./NationCardVisual";

import { NATION_CARD_DEEPLINK } from "@/features/marketing/adhesion/adhesion.constants";
import {
  type AdhesionDTO,
  adhesionSchema,
} from "@/features/marketing/adhesion/adhesion.schema";
import { useAdhesionMutation } from "@/features/marketing/adhesion/queries/adhesion.mutation";

/**
 * Formulaire d'adhésion à la Carte de la Nation (pré-inscription silencieuse) :
 * nom, prénom(s), téléphone, photo facultative, « Êtes-vous étudiant ou
 * élève ? » facultatif (si oui, établissement requis et profile_type
 * « ETUDIANT »), accord WhatsApp obligatoire. Aucun justificatif.
 *
 * La logique est celle de l'ancien formulaire (react-hook-form, schéma zod et
 * mutation inchangés) ; seuls l'habillage et les textes changent. Les erreurs
 * d'envoi s'affichent sous le bouton (role=alert), sans fenêtre volante.
 */
export default function AdhesionForm() {
  const t = useTranslations("carte-nation.adhesion");
  const [envoyee, setEnvoyee] = useState(false);
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);
  const titreSucces = useRef<HTMLHeadingElement>(null);

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

  // Réponse à « Êtes-vous étudiant ou élève ? » : « non répondu » se distingue
  // de « Non », ce que profile_type (undefined dans les deux cas) ne permet pas.
  const [etudiant, setEtudiant] = useState<"oui" | "non" | "">("");
  const estEtudiant = watch("profile_type") === "ETUDIANT";

  const choisirEtudiant = (valeur: "oui" | "non") => {
    setEtudiant(valeur);
    if (valeur === "oui") {
      setValue("profile_type", "ETUDIANT", { shouldValidate: false });
    } else {
      // « Non » : ni profile_type ni établissement envoyés.
      setValue("profile_type", undefined, { shouldValidate: false });
      setValue("establishment", "", { shouldValidate: false });
      clearErrors("establishment");
    }
  };

  // Photo du titulaire, FACULTATIVE sur le site (vérification au backoffice) :
  // gardée hors de react-hook-form (un fichier ne passe pas par le schéma zod)
  // et envoyée en multipart par la mutation.
  const champPhoto = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [apercu, setApercu] = useState<string | null>(null);
  const [erreurPhoto, setErreurPhoto] = useState<string | null>(null);

  // L'aperçu précédent est libéré à chaque changement et en quittant la page.
  useEffect(
    () => () => {
      if (apercu) URL.revokeObjectURL(apercu);
    },
    [apercu],
  );

  const changerPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0];

    if (!fichier) return;
    if (!fichier.type.startsWith("image/")) {
      setErreurPhoto(t("photo_invalid"));

      return;
    }
    setPhoto(fichier);
    setApercu(URL.createObjectURL(fichier));
    setErreurPhoto(null);
  };

  // Écran de confirmation : le focus va sur son titre (lecteurs d'écran).
  useEffect(() => {
    if (envoyee) titreSucces.current?.focus();
  }, [envoyee]);

  // Message lisible : celui du serveur (en français) quand il en donne un,
  // sinon une phrase du site (réseau coupé, trop de demandes).
  const messageErreur = (erreur: unknown) => {
    if (!(erreur instanceof Error) || !erreur.message)
      return t("error_generic");
    if (/too many|throttl/i.test(erreur.message)) return t("error_too_many");
    if (erreur.name === "TypeError" || /fetch|network/i.test(erreur.message))
      return t("error_generic");

    return erreur.message;
  };

  const envoyer = async (donnees: AdhesionDTO) => {
    if (isPending) return;
    setErreurEnvoi(null);
    try {
      await mutateAsync({ data: donnees, photo });
      setEnvoyee(true);
    } catch (erreur) {
      setErreurEnvoi(messageErreur(erreur));
    }
  };

  /* ── Demande envoyée ── */
  if (envoyee) {
    return (
      <div className="grid gap-6 text-center">
        <NationCardVisual
          cardLabel={t("card_label")}
          className="mx-auto mt-2 max-w-[260px]"
          memberLabel={t("card_member")}
          tilted={false}
        />
        <div>
          <h2
            ref={titreSucces}
            className="text-[clamp(24px,5vw,30px)] leading-tight font-extrabold"
            tabIndex={-1}
          >
            {t("success_title")}
          </h2>
          <p className="mt-2 text-encre-doux">{t("success_subtitle")}</p>
        </div>
        <ol className="grid gap-2.5 text-left">
          {[t("success_step_1"), t("success_step_2")].map((etape, i) => (
            <li
              key={etape}
              className="flex items-start gap-3 rounded-carte bg-surface p-3.5"
            >
              <span
                aria-hidden="true"
                className="grid size-8 shrink-0 -rotate-3 place-items-center rounded-lg bg-jaune font-extrabold shadow-autocollant"
              >
                {i + 1}
              </span>
              <span className="pt-1 text-sm leading-normal">{etape}</span>
            </li>
          ))}
        </ol>
        <LienBouton
          bloc
          nouvelOnglet
          href={NATION_CARD_DEEPLINK}
          icone="mobile"
          taille="grand"
        >
          {t("success_cta")}
        </LienBouton>
      </div>
    );
  }

  /* ── Formulaire ── */
  return (
    <form
      noValidate
      aria-describedby="adhesion-sous-titre"
      aria-labelledby="adhesion-titre"
      className="grid gap-5"
      onSubmit={handleSubmit(envoyer)}
    >
      <div>
        <h2
          className="text-[clamp(22px,4vw,26px)] leading-tight font-extrabold"
          id="adhesion-titre"
        >
          {t("title")}
        </h2>
        <p className="mt-1 text-sm text-encre-doux" id="adhesion-sous-titre">
          {t("subtitle")}
        </p>
      </div>

      {/* Nom et prénom(s) en deux champs : un prénom composé reste entier. */}
      <div className="grid gap-5 sm:grid-cols-2 sm:gap-3">
        <ChampTexte
          autoComplete="family-name"
          disabled={isPending}
          erreur={errors.last_name?.message}
          id="adhesion-nom"
          label={t("last_name_label")}
          {...register("last_name")}
        />
        <ChampTexte
          autoComplete="given-name"
          disabled={isPending}
          erreur={errors.first_name?.message}
          id="adhesion-prenom"
          label={t("first_name_label")}
          {...register("first_name")}
        />
      </div>

      <ChampTexte
        aide={t("phone_hint")}
        autoComplete="tel"
        disabled={isPending}
        erreur={errors.phone?.message}
        id="adhesion-telephone"
        inputMode="tel"
        label={t("phone_label")}
        placeholder={t("phone_placeholder")}
        type="tel"
        {...register("phone")}
      />

      {/* Photo du titulaire, facultative */}
      <div className="grid gap-2.5 rounded-carte border-[1.5px] border-dashed border-trait-fort bg-surface p-3.5">
        <p className="text-sm font-semibold" id="adhesion-photo-titre">
          {t("photo_label")}{" "}
          <span className="font-normal text-encre-doux">
            {t("photo_optional")}
          </span>
        </p>
        {/* À la ligne sous 345 px : vignette et bouton ne tiennent pas côte à côte. */}
        <div className="flex flex-wrap items-center gap-3.5">
          {apercu ? (
            // Aperçu local (adresse blob:) : next/image ne s'y applique pas.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              className="size-[72px] shrink-0 rounded-carte object-cover ring-2 ring-jaune"
              src={apercu}
            />
          ) : (
            <span className="grid size-[72px] shrink-0 place-items-center rounded-carte bg-white text-trait-fort ring-1 ring-trait">
              <Icone className="size-7" nom="plus" />
            </span>
          )}
          <div className="grid min-w-0 gap-1">
            <input
              ref={champPhoto}
              hidden
              accept="image/*"
              disabled={isPending}
              type="file"
              onChange={changerPhoto}
            />
            <Bouton
              aria-describedby="adhesion-photo-titre adhesion-photo-aide"
              className="w-fit"
              disabled={isPending}
              variante="secondaire"
              onClick={() => champPhoto.current?.click()}
            >
              {photo ? t("photo_change") : t("photo_choose")}
            </Bouton>
          </div>
        </div>
        <p
          className="text-[13px] leading-[1.45] text-encre-doux"
          id="adhesion-photo-aide"
        >
          {t("photo_hint")}
        </p>
        {erreurPhoto ? (
          <p className="text-[13px] font-semibold text-rouge" role="alert">
            {erreurPhoto}
          </p>
        ) : null}
      </div>

      {/* Étudiant ou élève : facultatif, la carte est ouverte à tous */}
      <div className="grid gap-3">
        <GroupeChoix
          pilules
          legende={t("student_label")}
          precision={t("student_hint")}
        >
          <ChoixRadio
            pilule
            checked={etudiant === "oui"}
            disabled={isPending}
            id="adhesion-etudiant-oui"
            label={t("student_yes")}
            name="adhesion-etudiant"
            value="oui"
            onChange={() => choisirEtudiant("oui")}
          />
          <ChoixRadio
            pilule
            checked={etudiant === "non"}
            disabled={isPending}
            id="adhesion-etudiant-non"
            label={t("student_no")}
            name="adhesion-etudiant"
            value="non"
            onChange={() => choisirEtudiant("non")}
          />
        </GroupeChoix>
        {estEtudiant ? (
          <ChampTexte
            autoComplete="organization"
            disabled={isPending}
            erreur={errors.establishment?.message}
            id="adhesion-etablissement"
            label={t("establishment_label")}
            placeholder={t("establishment_placeholder")}
            {...register("establishment")}
          />
        ) : null}
      </div>

      <Controller
        control={control}
        name="whatsapp_opt_in"
        render={({ field }) => (
          <div className="grid gap-1.5">
            <CaseACocher
              ref={field.ref}
              aria-describedby={
                errors.whatsapp_opt_in ? "adhesion-accord-erreur" : undefined
              }
              aria-invalid={errors.whatsapp_opt_in ? true : undefined}
              checked={field.value}
              disabled={isPending}
              id="adhesion-accord"
              label={<span className="font-medium">{t("optin_label")}</span>}
              name={field.name}
              onBlur={field.onBlur}
              onChange={(e) => field.onChange(e.target.checked)}
            />
            {errors.whatsapp_opt_in ? (
              // Message du site plutôt que celui du schéma partagé.
              <p
                className="text-[13px] font-semibold text-rouge"
                id="adhesion-accord-erreur"
                role="alert"
              >
                {t("optin_error")}
              </p>
            ) : null}
          </div>
        )}
      />

      <div className="grid gap-3">
        {/* aria-disabled : le bouton garde le focus pendant l'envoi. */}
        <Bouton
          bloc
          aria-busy={isPending || undefined}
          aria-disabled={isPending || undefined}
          taille="grand"
          type="submit"
        >
          {isPending ? t("submitting") : t("submit")}
        </Bouton>
        {erreurEnvoi ? (
          <div
            className="rounded-carte border border-rouge/30 bg-rouge-fond px-3.5 py-3 text-sm"
            role="alert"
          >
            <p className="font-bold text-rouge">{t("error_title")}</p>
            <p className="mt-0.5">{erreurEnvoi}</p>
          </div>
        ) : null}
        <p className="text-center text-xs leading-normal text-encre-doux">
          {t("legal_note")}
        </p>
      </div>
    </form>
  );
}
