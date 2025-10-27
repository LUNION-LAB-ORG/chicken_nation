"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { useCallback } from "react";
import { IUtilisateur } from "@/features/utilisateur/types/utilisateur.type";
import { useSupprimerUtilisateurMutation } from "@/features/utilisateur/queries/utilisateur-delete.mutation";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  utilisateur: IUtilisateur | null;
};

export function UtilisateurDeleteModal({
  isOpen,
  setIsOpen,
  utilisateur,
}: Props) {
  const { mutateAsync: supprimerUtilisateurMutation, isPending } =
    useSupprimerUtilisateurMutation();

  const handleClose = useCallback(() => {
    if (!isPending) {
      setIsOpen(false);
    }
  }, [isPending, setIsOpen]);

  const handleDelete = useCallback(async () => {
    await supprimerUtilisateurMutation({ id: utilisateur?.id || "" });
    handleClose();
  }, [supprimerUtilisateurMutation, handleClose, utilisateur]);

  return (
    <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h1 className="text-lg font-medium text-primary">
            {`Supprimer ${utilisateur?.firstName} ${utilisateur?.lastName} ?`}
          </h1>
          <p className="text-sm text-gray-500">
            Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cet utilisateur
            sera banni de l&apos;application.
          </p>
        </ModalHeader>
        <ModalBody />
        <ModalFooter>
          <Button color="danger" variant="light" onPress={handleClose} disabled={isPending}>
            Annuler
          </Button>
          <Button
            color="danger"
            onPress={handleDelete}
            isLoading={isPending}
            disabled={isPending}
          >
            Supprimer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
