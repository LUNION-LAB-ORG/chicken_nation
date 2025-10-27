import { useState, useMemo, useCallback } from "react";
import {
    SortingState,
    VisibilityState,
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    ColumnDef,
} from "@tanstack/react-table";
import { useQueryStates } from 'nuqs';
import { utilisateurFiltersClient } from '../filters/utilisateur.filters';
import { useUtilisateursListQuery } from "../queries/utilisateur-list.query";
import { IUtilisateur, IUtilisateursParams } from "../types/utilisateur.type";

export interface IUtilisateurListTableProps {
    columns: ColumnDef<IUtilisateur>[];
}

export function useUtilisateurListTable({ columns }: IUtilisateurListTableProps) {
    // États pour le tri et la visibilité des colonnes et la sélection des lignes
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    // Gestion des paramètres d'URL via Nuqs
    const [filters, setFilters] = useQueryStates(utilisateurFiltersClient.filter, utilisateurFiltersClient.option);

    // Construction des paramètres de recherche
    const currentSearchParams: IUtilisateursParams = useMemo(() => {
        return {
            page: filters.page,
            limit: filters.limit,
            firstName: filters.firstName || undefined,
            lastName: filters.lastName || undefined,
            email: filters.email || undefined,
            phoneNumber: filters.phoneNumber || undefined,
            status: filters.status,
            role: filters.role || undefined,
        };
    }, [filters]);

    // Récupération des données avec options React Query optimisées
    const { data, isLoading, isError, isFetching } = useUtilisateursListQuery(currentSearchParams);

    const users = data?.data || [];
    const totalPages = data?.meta?.totalPages || 1;

    // États et gestionnaires pour les modales
    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [lockUnlockOpen, setLockUnlockOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<IUtilisateur | null>(null);

    const handleLockUnlockUser = useCallback((user: IUtilisateur) => {
        setCurrentUser(user);
        setLockUnlockOpen(true);
    }, []);

    const handleEditUser = useCallback((user: IUtilisateur) => {
        setCurrentUser(user);
        setEditOpen(true);
    }, []);

    const handleDeleteUser = useCallback((user: IUtilisateur) => {
        setCurrentUser(user);
        setDeleteOpen(true);
    }, []);

    /**
     * Gère les changements pour les champs de filtre textuels
     * Nuqs throttle automatiquement les mises à jour URL/serveur
     */
    const handleTextFilterChange = useCallback((
        filterName: 'firstName' | 'lastName' | 'email' | 'phoneNumber',
        value: string
    ) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value,
            page: 1, // Réinitialise à la première page
        }));
    }, [setFilters]);

    /**
     * Gère les changements pour les champs de filtre d'enum
     * Pas de throttling nécessaire pour ces filtres (changements moins fréquents)
     */
    const handleEnumFilterChange = useCallback((
        filterName: 'status' | 'role',
        value: string
    ) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value,
            page: 1,
        }));
    }, [setFilters]);

    // Configuration de TanStack Table
    const table = useReactTable({
        data: users,
        columns,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        manualPagination: true,
        pageCount: totalPages,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            pagination: {
                pageIndex: (filters.page || 1) - 1,
                pageSize: filters.limit || 10,
            },
        },
        onPaginationChange: (updater) => {
            const newState = typeof updater === 'function' ? updater(table.getState().pagination) : updater;
            setFilters(prev => ({
                ...prev,
                page: newState.pageIndex + 1,
                limit: newState.pageSize,
            }));
        },
        meta: {
            onEdit: handleEditUser,
            onDelete: handleDeleteUser,
            onLockUnlock: handleLockUnlockUser,
        },
    });

    return {
        table,
        isLoading,
        isError,
        isFetching,
        handleTextFilterChange,
        handleEnumFilterChange,
        modalStates: {
            addOpen,
            lockUnlockOpen,
            editOpen,
            deleteOpen,
        },
        modalHandlers: {
            setAddOpen,
            setLockUnlockOpen,
            setEditOpen,
            setDeleteOpen,
        },
        currentUser,
        filters,
    };
}