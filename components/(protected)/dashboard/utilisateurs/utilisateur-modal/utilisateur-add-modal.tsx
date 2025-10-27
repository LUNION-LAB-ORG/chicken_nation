"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@heroui/react";
import { useCallback, useMemo } from "react";

import { useAjouterUtilisateurMutation } from "@/features/utilisateur/queries/utilisateur-add.mutation";
import {
  UtilisateurAddDTO,
  UtilisateurAddSchema,
} from "@/features/utilisateur/schema/utilisateur.schema";
import { UtilisateurRole } from "@/features/utilisateur/types/utilisateur.type";
import { getUtilisateurRole } from "@/features/utilisateur/utils/getUtilisateurRole";
import { getEnumValues } from "@/utils/getEnumValues";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export function UtilisateurAddModal({ isOpen, setIsOpen }: Props) {
  const roleOptions = useMemo(() => getEnumValues(UtilisateurRole), []);

  const { mutateAsync: ajouterUtilisateurMutation, isPending } =
    useAjouterUtilisateurMutation();

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<UtilisateurAddDTO>({
    resolver: zodResolver(UtilisateurAddSchema),
    mode: "onChange",
  });

  const handleClose = useCallback(() => {
    if (!isPending) {
      setIsOpen(false);
      setTimeout(() => reset({ role: undefined }), 200);
    }
  }, [isPending, setIsOpen, reset]);

  const onSubmit = useCallback(
    async (formdata: UtilisateurAddDTO) => {
      await ajouterUtilisateurMutation({ data: formdata });
      handleClose();
    },
    [ajouterUtilisateurMutation, handleClose]
  );

  const handleRoleChange = useCallback(
    (value: string) => {
      setValue("role", value as UtilisateurRole, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue]
  );

  return (
    <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader className="flex flex-col gap-1">
            <h1 className="text-lg font-medium text-primary">
              Ajouter un utilisateur
            </h1>
            <p className="text-sm text-gray-500">
              Formulaire pour ajouter un nouvel utilisateur.
            </p>
          </ModalHeader>
          <ModalBody>
            <Input
              {...register("firstName")}
              errorMessage={errors.firstName?.message}
              isInvalid={!!errors.firstName}
              disabled={isPending}
              placeholder="Entrer le prénom"
              variant="bordered"
              type="text"
            />
            <Input
              {...register("lastName")}
              errorMessage={errors.lastName?.message}
              isInvalid={!!errors.lastName}
              disabled={isPending}
              placeholder="Entrer le nom"
              variant="bordered"
              type="text"
            />
            <Input
              {...register("email")}
              errorMessage={errors.email?.message}
              isInvalid={!!errors.email}
              disabled={isPending}
              placeholder="Entrer l'email"
              variant="bordered"
              type="email"
            />
            <Input
              {...register("phoneNumber")}
              errorMessage={errors.phoneNumber?.message}
              isInvalid={!!errors.phoneNumber}
              disabled={isPending}
              placeholder="Entrer le téléphone"
              variant="bordered"
              type="tel"
            />
            <Select
              selectedKeys={[watch("role")?.toString() || ""]}
              onChange={(e) => handleRoleChange(e.target.value)}
              errorMessage={errors.role?.message}
              isInvalid={!!errors.role}
              disabled={isPending}
              placeholder="Choisir un rôle"
              variant="bordered"
            >
              {roleOptions.map((role) => (
                <SelectItem key={role}>{getUtilisateurRole(role).label}</SelectItem>
              ))}
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={handleClose}>
              Annuler
            </Button>
            <Button
              color="primary"
              type="submit"
              disabled={isPending || !isValid}
              isLoading={isPending}
            >
              Ajouter
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
