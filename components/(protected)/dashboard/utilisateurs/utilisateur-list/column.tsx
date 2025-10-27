"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SquarePen, Trash2 } from "lucide-react";

import {
  IUtilisateur,
  UtilisateurRole,
  UtilisateurStatus,
} from "@/features/utilisateur/types/utilisateur.type";
import { getUtilisateurRole } from "@/features/utilisateur/utils/getUtilisateurRole";
import { getUtilisateurStatus } from "@/features/utilisateur/utils/getUtilisateurStatus";
import { Button, Chip, Tooltip, User } from "@heroui/react";

export const columns: ColumnDef<IUtilisateur>[] = [
  {
    accessorKey: "firstName",
    header: "Nom Complet",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <User name={`${user.firstName} ${user.lastName}`}>{user.email}</User>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span>{row.getValue("email")}</span>,
  },
  {
    accessorKey: "phoneNumber",
    header: "Téléphone",
    cell: ({ row }) => <span>{row.getValue("phoneNumber")}</span>,
  },
  {
    accessorKey: "role",
    header: "Rôle",
    cell: ({ row }) => {
      const role = row.getValue<UtilisateurRole>("role");
      const roleName = getUtilisateurRole(role) || "Inconnu";

      return (
        <Chip
          className="capitalize"
          color={roleName.color}
          size="sm"
          variant="flat"
        >
          {roleName.label}
        </Chip>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => {
      const status = row.getValue<UtilisateurStatus>("status");
      const statusName = getUtilisateurStatus(status) || "Inconnu";
      return (
        <Chip
          className="capitalize"
          color={statusName.color}
          size="sm"
          variant="flat"
        >
          {statusName.label}
        </Chip>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row, table }) => {
      const user = row.original as IUtilisateur;

      const meta = table.options.meta as {
        onView: (user: IUtilisateur) => void;
        onEdit: (user: IUtilisateur) => void;
        onDelete: (user: IUtilisateur) => void;
        onLockUnlock: (user: IUtilisateur) => void;
      };

      return (
        <div className="relative flex items-center gap-2">
          <Tooltip content="Activer">
            <Button
              variant="bordered"
              isIconOnly
              onPress={() => meta.onEdit(user)}
              size="sm"
            >
              <SquarePen className="w-4 h-4" />
            </Button>
          </Tooltip>

          <Tooltip content="Supprimer">
            <Button
              variant="bordered"
              isIconOnly
              onPress={() => meta.onDelete(user)}
              size="sm"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>
      );
    },
  },
];
