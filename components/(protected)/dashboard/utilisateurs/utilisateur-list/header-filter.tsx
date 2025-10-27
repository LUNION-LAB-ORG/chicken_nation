"use client";
import Subtitle from "@/components/primitives/Subtitle";
import Title from "@/components/primitives/Title";
import { useUtilisateurListTable } from "@/features/utilisateur/hooks/useUtilisateurListTable";
import {
  UtilisateurRole,
  UtilisateurStatus,
} from "@/features/utilisateur/types/utilisateur.type";
import { getUtilisateurRole } from "@/features/utilisateur/utils/getUtilisateurRole";
import { getUtilisateurStatus } from "@/features/utilisateur/utils/getUtilisateurStatus";
import { getEnumValues } from "@/utils/getEnumValues";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import { Search, UserPlus, X } from "lucide-react";

export function HeaderFilter({
  handleTextFilterChange,
  handleEnumFilterChange,
  modalHandlers,
  filters,
}: Pick<
  ReturnType<typeof useUtilisateurListTable>,
  "handleTextFilterChange" | "handleEnumFilterChange" | "filters"
> & {
  modalHandlers: any;
}) {
  // Compter les filtres actifs
  const activeFiltersCount = Object.values(filters).filter(
    (value) => value && value !== ""
  ).length;

  // Fonction pour reset tous les filtres
  const handleClearAllFilters = () => {
    handleTextFilterChange("email", "");
    handleTextFilterChange("phoneNumber", "");
    handleEnumFilterChange("status", "");
    handleEnumFilterChange("role", "");
  };

  return (
    <div className="w-full mb-6">
      {/* Header avec titre et bouton d'ajout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <Title>Utilisateurs</Title>
          <Subtitle>
            Gérez vos utilisateurs et leurs permissions
          </Subtitle>
        </div>
        <Button
          color="primary"
          startContent={<UserPlus className="w-4 h-4" />}
          className="mt-4 sm:mt-0"
          onPress={() => modalHandlers.setAddOpen(true)}
        >
          Ajouter un utilisateur
        </Button>
      </div>

      {/* Card contenant les filtres */}
      <Card className="shadow-sm border-0 bg-content1">
        <CardBody className="p-6">
          <div className="flex flex-col space-y-6">
            {/* Barre de recherche principale */}
            <div className="relative">
              <Input
                placeholder="Rechercher par email, nom ou téléphone..."
                value={filters.email}
                onChange={(e) =>
                  handleTextFilterChange("email", e.target.value)
                }
                startContent={<Search className="w-4 h-4" />}
                variant="bordered"
              />
            </div>

            {/* Filtres avancés */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Filtre par téléphone */}
              <div className="flex-1">
                <Input
                  label="Téléphone"
                  placeholder="Filtrer par téléphone..."
                  value={filters.phoneNumber}
                  onChange={(e) =>
                    handleTextFilterChange("phoneNumber", e.target.value)
                  }
                  variant="bordered"
                />
              </div>

              {/* Filtre par statut */}
              <div className="flex-1">
                <Select
                  label="Statut"
                  placeholder="Sélectionner un statut"
                  selectedKeys={filters.status ? [filters.status] : ["_all_"]}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    handleEnumFilterChange("status", value);
                  }}
                  variant="bordered"
                >
                  {getEnumValues(UtilisateurStatus).map((status) => (
                    <SelectItem key={status}>
                      {getUtilisateurStatus(status).label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Filtre par rôle */}
              <div className="flex-1">
                <Select
                  label="Rôle"
                  placeholder="Sélectionner un rôle"
                  selectedKeys={filters.role ? [filters.role] : ["_all_"]}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    handleEnumFilterChange("role", value);
                  }}
                  variant="bordered"
                >
                  {getEnumValues(UtilisateurRole).map((role) => (
                    <SelectItem key={role}>
                      {getUtilisateurRole(role).label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* Filtres actifs et actions */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-400">
                    Filtres actifs:
                  </span>

                  {filters.email && (
                    <Chip
                      size="sm"
                      variant="flat"
                      color="primary"
                      onClose={() => handleTextFilterChange("email", "")}
                    >
                      Email: {filters.email}
                    </Chip>
                  )}

                  {filters.phoneNumber && (
                    <Chip
                      size="sm"
                      variant="flat"
                      color="primary"
                      onClose={() => handleTextFilterChange("phoneNumber", "")}
                    >
                      Tél: {filters.phoneNumber}
                    </Chip>
                  )}

                  {filters.status && filters.status !== null && (
                    <Chip
                      size="sm"
                      variant="flat"
                      color={getUtilisateurStatus(filters.status).color}
                      onClose={() => handleEnumFilterChange("status", "")}
                    >
                      {getUtilisateurStatus(filters.status).label}
                    </Chip>
                  )}

                  {filters.role && filters.role !== null && (
                    <Chip
                      size="sm"
                      variant="flat"
                      color={getUtilisateurRole(filters.role).color}
                      onClose={() => handleEnumFilterChange("role", "")}
                    >
                      {getUtilisateurRole(filters.role).label}
                    </Chip>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  startContent={<X className="w-3 h-3" />}
                  onPress={handleClearAllFilters}
                >
                  Effacer tout
                </Button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
