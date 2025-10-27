# Next-Starter : Architecture Standardisée pour Projets Next.js

Ce dépôt contient la base d'un projet Next.js structuré selon une architecture propre, visant à garantir la cohérence du code, la maintenabilité et la scalabilité. Ce document sert de guide pour tous les développeurs travaillant sur des projets Next.js.


![enter image description here](https://i.pinimg.com/736x/5e/f2/ee/5ef2ee333b101ee58b5f0236be633d3d.jpg)

-----

## 1\. Principes d'Architecture Adoptés

Nous combinons plusieurs patrons d'architecture modernes, particulièrement adaptés à l'environnement Next.js / React, pour optimiser la structure de nos projets :

  * **Tranches Verticales (Vertical Slices / Feature Slices)** : L'organisation du code est basée sur les **fonctionnalités métier (features)** plutôt que sur des couches techniques horizontales. Chaque fonctionnalité est autonome et regroupe tous les éléments la concernant. Cela favorise la modularité et la clarté.

  * **MVVM (Model-View-ViewModel)** : Ce patron est implémenté naturellement dans nos applications React/Next.js :

      * Le **Modèle** : Représenté par les définitions de données (types, schemas), les interfaces avec le backend (apis) et les logiques serveur encapsulées (actions).
      * La **Vue** : Correspond aux composants React (**components**) et aux pages (`app/[locale]/[module]`) qui affichent l'interface utilisateur.
      * Le **ViewModel** : Géré par les **hooks** personnalisés (hooks) et les hooks de gestion de données (**queries** via TanStack Query). Il contient la logique de présentation et d'état de l'interface utilisateur, agissant comme un intermédiaire entre le Modèle et la Vue.

  * **Principes de Clean Architecture / Hexagonal** : Pour les logiques métier complexes, nous appliquons ces principes pour isoler le "cœur" de l'application (règles métier, entités) des détails d'infrastructure (UI, base de données, API). Cela garantit une meilleure testabilité et une indépendance vis-à-vis des frameworks.

-----

## 2\. Structure des Dossiers Principaux

Voici la structure de haut niveau du projet. Elle est conçue pour être intuitive et prévisible.

```
start/
├── app/                  # App Router Next.js 14 : pages, layouts, groupes de routes
│   └── [locale]/         # Support de l'internationalisation (ex: en, ar)
│       └── (protected)/  # Routes protégées (authentification requise)
│           └── users/    # Exemple de page pour le module "utilisateur"
│               └── page.tsx
│       └── layout.tsx    # Layouts racines ou de groupes de routes
│
├── components/           # Composants React génériques et réutilisables dans toute l'application
│   ├── ui/               # Composants UI de base (shadcn/ui, Button, Input, Select)
│   ├── partials/         # Composants de layout (Header, Sidebar, Footer)
│   └── blocks/           # Blocs de contenu réutilisables (ex: StatusBlock)
│
├── features/             # **LE CŒUR** : Toutes les fonctionnalités métier, organisées en tranches verticales
│   └── [module_name]/    # Chaque dossier représente une fonctionnalité ou un domaine (ex: products, users, auth)
│       ├── actions/      # Actions serveur (Server Actions)
│       ├── apis/         # Fonctions API brutes
│       ├── components/   # Composants spécifiques à ce module
│       ├── filters/      # Définitions des filtres pour Nuqs
│       ├── hooks/        # Hooks personnalisés (le ViewModel du module)
│       ├── queries/      # Hooks TanStack Query
│       ├── schemas/      # Schémas de validation Zod et types DTO
│       ├── tests/        # Tests unitaires et d'intégration
│       ├── types/        # Types TypeScript spécifiques au module
│       └── utils/        # Fonctions utilitaires / helpers spécifiques au module
│   ├── auth/             # Exemple de module d'authentification
│   └── notification/     # Exemple de module de notifications
│   └── utilisateur/      # **Exemple détaillé dans ce README**
│
├── hooks/                # Hooks React personnalisés globaux et réutilisables
├── i18n/                 # Fichiers de traduction pour `next-intl`
├── lib/                  # Utilitaires globaux, configurations, clients API centralisés
│   ├── api.ts            # Configuration Axios, intercepteurs centralisés
│   ├── get-query-client.ts # Configuration du `QueryClient` de TanStack Query
│   └── utils/            # Fonctions utilitaires globales
│
├── middlewares/          # Middlewares Next.js (ex: pour l'authentification, la gestion des locales)
├── providers/            # Providers React (thème, auth, etc.)
├── public/               # Assets statiques
├── styles/               # Styles globaux et spécifiques aux modules
│   └── [module]/         # Styles spécifiques à un module (ex: `products.module.css`)
│   └── globals.css       # Styles généraux (Tailwind, CSS de base)
│
└── types/                # Types TypeScript globaux (interfaces, énumérations partagées)
```

-----

## 3\. Conventions de Code et Responsabilités Détaillées

Pour maintenir la cohérence et l'efficacité, veuillez respecter scrupuleusement les conventions suivantes.

### 3.1 Dossier app/\[locale]/\[module]/ (Pages)

  * **Responsabilité** : Ce dossier contient les pages Next.js et leurs layouts. Les pages doivent être des **Server Components** autant que possible, avec un préchargement de données optimisé via TanStack Query.
  * **Contenu** : Principalement des `page.tsx` et `layout.tsx`.
  * **À ne pas faire** : Évitez d'y placer de la logique métier complexe ou des composants réutilisables non liés au routage. La logique doit être déléguée aux `features/` ou `components/` partagés.

### 3.2 Dossier features/\[module\_name]/ (Tranches Verticales)

Chaque module est une unité autonome et contient tout ce dont il a besoin.

#### `actions/` (Server Actions) :

  * **Fichiers** : `[actionName].action.ts` (ex: `createProduct.action.ts`, `utilisateur.action.ts`)
  * **Contenu** : Fonctions de **Server Actions Next.js** ("use server"). Elles encapsulent les appels aux fonctions de `features/[module]/apis/` et retournent un type `ActionResponse<T>` standardisé pour une gestion cohérente des succès/erreurs.
  * **Objectif** : Protéger les informations sensibles du backend en ne les exposant pas côté client et centraliser la logique de mutation serveur avec une gestion d'erreur robuste.
  * **Convention** : Elles doivent appeler les fonctions API de `features/[module]/apis/` et utiliser `handleServerActionError` pour la gestion d'erreur.
  * **À ne pas faire** : **NE JAMAIS** appeler directement les API routes (de `features/[module]/apis/`) dans les `queries/` côté client. Utilisez toujours les Server Actions pour cela.

<!-- end list -->

```typescript
// src/features/utilisateur/actions/utilisateur.action.ts (Extrait)
"use server"
import { ActionResponse, PaginatedResponse } from "@/types";
import { utilisateurAPI } from "../apis/utilisateur.api";
import { UtilisateurAddDTO, UtilisateurRoleDTO, UtilisateurUpdateDTO } from "../schema/utilisateur.schema";
import { IUtilisateur, IUtilisateurActiveDesactiveDeleteResponse, IUtilisateursParams, IUtilisateurStatsResponse } from "../types/utilisateur.type";
import { handleServerActionError } from "@/utils/handleServerActionError";

export const obtenirTousUtilisateursAction = async (params: IUtilisateursParams): Promise<ActionResponse<PaginatedResponse<IUtilisateur>>> => {
    try {
        const data = await utilisateurAPI.obtenirTousUtilisateurs(params);
        return {
            success: true,
            data: data,
            message: "Utilisateurs obtenus avec succès",
        }
    } catch (error) {
        return handleServerActionError(error, "Erreur lors de la récupération des utilisateurs");
    }
}

export const ajouterUtilisateurAction = async (formdata: UtilisateurAddDTO): Promise<ActionResponse<IUtilisateur>> => {
    try {
        const data = await utilisateurAPI.ajouterUtilisateur(formdata);
        return {
            success: true,
            data: data,
            message: "Utilisateur ajoute avec succès",
        }
    } catch (error) {
        return handleServerActionError(error, "Erreur lors de l'ajout de l'utilisateur");
    }
}

// ... autres actions (modifier, supprimer, activer/désactiver)
```

#### `apis/` (API Routes Brutes) :

  * **Fichiers** : `[moduleName].api.ts` (ex: `products.api.ts`, `utilisateur.api.ts`)
  * **Contenu** : Fonctions asynchrones qui encapsulent les appels HTTP bruts via le client `api` configuré dans `lib/api.ts`.
  * **Objectif** : Représenter l'interface directe avec le backend. Elles sont la première couche d'interaction avec l'API externe.
  * **Gestion d'erreur** : En cas d'échec (statut HTTP non 2xx), une exception doit être levée automatiquement par la configuration de `lib/api.ts` pour une gestion centralisée.
  * Elles ne connaissent **PAS** TanStack Query ni les Server Actions.
  * **Note** : Le dossier `apis/` remplace l'ancien `api/` pour plus de clarté.

<!-- end list -->

```typescript
// src/features/utilisateur/apis/utilisateur.api.ts (Extrait)
import { api } from "@/lib/api"; // Client HTTP centralisé (basé sur axios)
import { IUtilisateur, IUtilisateursParams, IUtilisateurAddUpdateResponse } from "../types/utilisateur.type";
import { PaginatedResponse } from "@/types";
import { UtilisateurAddDTO } from "../schema/utilisateur.schema";

export const utilisateurAPI = {
    obtenirTousUtilisateurs(params: IUtilisateursParams): Promise<PaginatedResponse<IUtilisateur>> {
        return api.request<PaginatedResponse<IUtilisateur>>({
            endpoint: `/users`,
            method: "GET",
            searchParams: params,
        });
    },
    ajouterUtilisateur(data: UtilisateurAddDTO): Promise<IUtilisateur> {
        return api.request<IUtilisateur>({
            endpoint: `/users`,
            method: "POST",
            data,
        });
    },
    // ... autres fonctions API (obtenir un seul, modifier, supprimer, stats)
};
```

#### `components/` :

  * **Contenu** : Composants React qui sont spécifiques à cette fonctionnalité et ne seront pas réutilisés ailleurs. Si un composant est partagé entre plusieurs modules, il doit aller dans `components/` à la racine.
  * **Convention de nommage** : `[nom-du-module]-[traitement]-[type-de-composant].tsx`.
      * `[nom-du-module]` : Le nom du module (ex: `utilisateur`).
      * `[traitement]` : L'action ou la vue principale (ex: `add`, `edit`, `delete`, `view`).
      * `[type-de-composant]` : Le type de composant (ex: `form`, `modal`, `table`, `list`).
  * **Exemples** : `utilisateur-add-form.tsx`, `utilisateur-edit-modal.tsx`, `utilisateur-view-table.tsx`, `utilisateur-view-list.tsx`.
  * **Nommage fichier/dossier** : En minuscule.
  * **Nommage fonction/composant** : En `PascalCase` (ex: `UtilisateurAddForm`).
  * **Gestion des données** : Un composant doit gérer ses données, ses requêtes (via les hooks de `queries/` ou `actions/`) et ses affichages.

<!-- end list -->

```typescript
// src/features/utilisateur/components/utilisateur-list/index.tsx (Extrait)
// Ce composant est un exemple de "Vue" qui utilise un "ViewModel" (useUtilisateurListTable)
// et d'autres composants spécifiques au module.
"use client";
import { useUtilisateurListTable } from "../../hooks/useUtilisateurListTable";
import { UtilisateurAddModal } from "../utilisateur-modal/utilisateur-add-modal";
// ... autres imports de composants UI et modales

export function UserList({ type }: { type: "personnel" | "demandeur" }) {
    const columns = getColumns({ type });
    const { table, isLoading, isError, error, isFetching, modalStates, modalHandlers, currentUser, filters } =
        useUtilisateurListTable({ columns, type });

    return (
        <div className="w-full">
            {/* ... Options de filtrage et barre d'outils ... */}
            <Table>
                {/* ... En-têtes et corps de la table avec flexRender ... */}
            </Table>
            <TablePagination table={table} />

            {/* Modales */}
            <UtilisateurAddModal isOpen={modalStates.addOpen} setIsOpen={modalHandlers.setAddOpen} />
            {currentUser && (
                <>
                    <UtilisateurUpdateModal /* ... */ />
                    <UtilisateurDeleteModal /* ... */ />
                    <UtilisateurLockUnlockModal /* ... */ />
                </>
            )}
        </div>
    );
}
```

#### `filters/` :

  * **Fichiers** : `[moduleName].filters.ts` (ex: `utilisateur.filters.ts`)
  * **Contenu** : Définitions des schémas de parsing pour les paramètres de requête d'URL, utilisés pour filtrer et paginer les listes. Utilise [nuqs](https://www.npmjs.com/package/nuqs) pour la synchronisation avec l'URL.
  * **Objectif** : Centraliser la logique de gestion des paramètres d'URL pour les filtres et la pagination, avec des valeurs par défaut et du throttling.

<!-- end list -->

```typescript
// src/features/utilisateur/filters/utilisateur.filters.ts (Extrait)
import { parseAsString, parseAsInteger, parseAsStringEnum } from 'nuqs';
import { UtilisateurRole, UtilisateurStatus, UtilisateurType } from '@/features/utilisateur/types/utilisateur.type';
import { getEnumValues } from '@/utils/getEnumValues';

export const utilisateurFiltersClient = {
    filter: {
        type: parseAsStringEnum<UtilisateurType>(getEnumValues(UtilisateurType)).withDefault(UtilisateurType.PERSONNEL),
        status: parseAsStringEnum<UtilisateurStatus>(getEnumValues(UtilisateurStatus)).withDefault(UtilisateurStatus.ACTIVE),
        role: parseAsStringEnum<UtilisateurRole>(getEnumValues(UtilisateurRole)),
        firstName: parseAsString.withDefault(''),
        // ... autres filtres
        page: parseAsInteger.withDefault(1),
        limit: parseAsInteger.withDefault(10),
    },
    option: {
        clearOnDefault: true,
        throttleMs: 500, // 500ms de délai pour les filtres textuels
    }
};
```

#### `hooks/` (ViewModels) :

  * **Fichiers** : `use[NomFonctionnalite]Logic.ts` ou `use[NomFonctionnalite].ts` (ex: `useProductForm.ts`, `useUtilisateurListTable.ts`).
  * **Contenu** : Hooks personnalisés qui encapsulent la logique de présentation et la gestion des états de l'interface utilisateur. Ils sont le **ViewModel** de notre architecture.
  * **Responsabilité** : Ils préparent les données pour la Vue, gèrent les interactions UI complexes et peuvent appeler les hooks de `queries/` ou `actions/`.
  * **Quand l'utiliser** : Créez un ViewModel (un hook) lorsque la logique métier de l'IU devient complexe et doit être isolée du composant de la Vue.

<!-- end list -->

```typescript
// src/features/utilisateur/hooks/useUtilisateurListTable.ts (Extrait)
"use client";
import { useState, useMemo, useCallback } from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, ColumnDef } from "@tanstack/react-table";
import { useQueryStates } from 'nuqs';
import { utilisateurFiltersClient } from '../filters/utilisateur.filters';
import { useUtilisateursListQuery } from "../queries/utilisateur-list.query";
import { IUtilisateur, IUtilisateursParams, UtilisateurType } from "../types/utilisateur.type";

export function useUtilisateurListTable({ columns, type }: IUtilisateurListTableProps) {
    const [filters, setFilters] = useQueryStates(utilisateurFiltersClient.filter, utilisateurFiltersClient.option);

    const currentSearchParams: IUtilisateursParams = useMemo(() => {
        return {
            page: filters.page, limit: filters.limit, email: filters.email || undefined,
            type: type === "personnel" ? UtilisateurType.PERSONNEL : UtilisateurType.DEMANDEUR,
            status: filters.status, role: filters.role || undefined,
        };
    }, [filters, type]);

    const { data, isLoading, isError, error, isFetching } = useUtilisateursListQuery(currentSearchParams);
    const users = data?.data || [];
    const totalPages = data?.meta?.totalPages || 1;

    // ... gestion des états des modales et des handlers d'action

    const table = useReactTable({
        data: users, columns, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(),
        manualPagination: true, pageCount: totalPages,
        state: { pagination: { pageIndex: (filters.page || 1) - 1, pageSize: filters.limit || 10 } },
        onPaginationChange: (updater) => { /* ... met à jour les filtres Nuqs */ },
        meta: { onEdit: handleEditUser, onDelete: handleDeleteUser, onLockUnlock: handleLockUnlockUser },
    });

    return { table, isLoading, isError, error, isFetching, filters, /* ... modalStates, modalHandlers, currentUser */ };
}
```

#### `queries/` (TanStack Query) :

  * **Fichiers** : `[queryName].query.ts` (ex: `getAllProducts.query.ts`, `utilisateur-list.query.ts`), `[mutationName].mutation.ts` (ex: `createProduct.mutation.ts`, `utilisateur.mutation.ts`), `index.query.ts` (pour les clés de cache et l'invalidation).
  * **Contenu** : Hooks `useQuery`, `useInfiniteQuery` et `useMutation` de TanStack Query avec gestion d'erreur intégrée.
  * **Objectif** : Gérer le cache, les re-fetches, les chargements, les erreurs pour les opérations de lecture et de mutation.
  * **Convention** : Ces hooks **DOIVENT** appeler les Server Actions de `features/[module]/actions/` pour interagir avec le backend, et non directement les fonctions de `apis/`.
  * **Gestion d'erreur** : Chaque hook inclut une gestion automatique des erreurs avec `toast.error`.

<!-- end list -->

```typescript
// src/features/utilisateur/queries/utilisateur-list.query.ts (Extrait)
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import getQueryClient from '@/lib/get-query-client';
import { obtenirTousUtilisateursAction } from '../actions/utilisateur.action';
import { IUtilisateursParams } from '../types/utilisateur.type';
import { utilisateurKeyQuery } from './index.query';
import { toast } from 'sonner';

const queryClient = getQueryClient();

//1- Option de requête optimisée
export const utilisateursListQueryOption = (utilisateursParamsDTO: IUtilisateursParams) => {
    return {
        queryKey: utilisateurKeyQuery("list", utilisateursParamsDTO),
        queryFn: async () => {
            const result = await obtenirTousUtilisateursAction(utilisateursParamsDTO);
            if (!result.success) {
                throw new Error(result.error || "Erreur lors de la récupération des utilisateurs");
            }
            return result.data!;
        },
        placeholderData: (previousData: any) => previousData,
        staleTime: 30 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
    };
};

//2- Hook pour récupérer les utilisateurs
export const useUtilisateursListQuery = (utilisateursParamsDTO: IUtilisateursParams) => {
    const query = useQuery(utilisateursListQueryOption(utilisateursParamsDTO));

    // Gestion des erreurs dans le hook
    React.useEffect(() => {
        if (query.isError && query.error) {
            toast.error("Erreur lors de la récupération des utilisateurs:", {
                description: query.error instanceof Error ? query.error.message : "Erreur inconnue",
            });
        }
    }, [query]);

    return query;
};

//3- Fonction pour précharger les utilisateurs
export const prefetchUtilisateursListQuery = (utilisateursParamsDTO: IUtilisateursParams) => {
    return queryClient.prefetchQuery(utilisateursListQueryOption(utilisateursParamsDTO));
}
```

```typescript
// src/features/utilisateur/queries/utilisateur.mutation.ts (Extrait)
"use client";
import { useMutation } from '@tanstack/react-query';
import { ajouterUtilisateurAction } from '../actions/utilisateur.action';
import { useInvalidateUtilisateurQuery } from './index.query';
import { UtilisateurAddDTO } from '../schema/utilisateur.schema';
import { toast } from "sonner";
import { processAndValidateFormData } from "ak-zod-form-kit";
import { UtilisateurAddSchema } from "../schema/utilisateur.schema";

export const useAjouterUtilisateurMutation = () => {
    const invalidateUtilisateurQuery = useInvalidateUtilisateurQuery()

    return useMutation({
        mutationFn: async (data: UtilisateurAddDTO) => {
            // Validation des données côté client
            const validation = processAndValidateFormData(UtilisateurAddSchema, data, {
                outputFormat: "object"
            })
            if (!validation.success) {
                throw new Error(validation.errorsInString || "Une erreur est survenue lors de la validation des données.");
            }

            const result = await ajouterUtilisateurAction(validation.data as UtilisateurAddDTO);

            if (!result.success) {
                throw new Error(result.error || "Erreur lors de l'ajout de l'utilisateur");
            }

            return result.data!;
        },
        onSuccess: async () => {
            await invalidateUtilisateurQuery();
            toast.success("Utilisateur ajouté avec succès");
        },
        onError: async (error) => {
            toast.error("Erreur lors de l'ajout de l'utilisateur:", {
                description: error.message,
            });
        },
    });
};
// ... autres mutations (modifier, supprimer, activer/désactiver)
```

#### `schemas/` (Zod Schemas & DTOs) :

  * **Fichiers** : `[schemaName].schema.ts` (ex: `product.schema.ts`, `utilisateur.schema.ts`).
  * **Contenu** : Définitions des schémas de validation avec [Zod](https://zod.dev/).
  * **Types DTO** : Les types TypeScript générés à partir de ces schémas (`z.infer<typeof someSchema>`) sont nos **DTOs (Data Transfer Objects)**, assurant la cohérence des données avec le backend.

<!-- end list -->

```typescript
// src/features/utilisateur/schema/utilisateur.schema.ts (Extrait)
import { z } from 'zod';
import { UtilisateurRole } from '../types/utilisateur.type';

export const UtilisateurAddSchema = z.object({
    firstName: z.string({ message: "Le prénom est requis" }).min(2, "Le prénom doit contenir au moins 2 caractères").trim(),
    lastName: z.string({ message: "Le nom est requis" }).min(2, "Le nom doit contenir au moins 2 caractères").trim(),
    email: z.string({ message: "L'email est requis" }).email("L'email doit être une adresse valide").toLowerCase().trim(),
    phoneNumber: z.string({ message: "Le numéro de téléphone est requis" }).max(20, "Le numéro de téléphone ne doit pas dépasser 20 caractères").regex(/^\+?[\d\s\-]+$/, "Numéro de téléphone invalide").trim(),
    role: z.enum(['AGENT', 'CHEF_SERVICE', 'CONSUL', 'ADMIN'], { message: "Le rôle est requis" })
});

export type UtilisateurAddDTO = z.infer<typeof UtilisateurAddSchema>;
export const UtilisateurUpdateSchema = UtilisateurAddSchema.partial();
export type UtilisateurUpdateDTO = z.infer<typeof UtilisateurUpdateSchema>;
```

#### `tests/` :

  * **Contenu** : Tests unitaires et d'intégration pour les éléments du module.
  * **Objectif** : Assurer la qualité et la fiabilité du code.

#### `types/` :

  * **Fichiers** : `[typeName].d.ts` ou `[typeName].ts` (ex: `product.d.ts`, `utilisateur.type.ts`).
  * **Contenu** : Types TypeScript spécifiques à ce module qui ne sont pas dérivés des schémas Zod. Par exemple, des interfaces pour les props de composants internes, des types pour des états complexes, des enums spécifiques au module.

<!-- end list -->

```typescript
// src/features/utilisateur/types/utilisateur.type.ts (Extrait)
export enum UtilisateurRole { AGENT = "AGENT", CHEF_SERVICE = "CHEF_SERVICE", CONSUL = "CONSUL", ADMIN = "ADMIN" }
export enum UtilisateurType { DEMANDEUR = "DEMANDEUR", PERSONNEL = "PERSONNEL" }
export enum UtilisateurStatus { ACTIVE = "ACTIVE", INACTIVE = "INACTIVE", DELETED = "DELETED" }

export interface IUtilisateur {
    id: string; email: string; firstName: string; lastName: string; phoneNumber: string;
    role: UtilisateurRole; type: UtilisateurType; status: UtilisateurStatus;
    isPasswordChangeRequired: boolean; createdAt: string; updatedAt: string; deletedAt: string;
    // ... autres propriétés optionnelles (requests, uploadedDocuments, etc.)
}
export interface IUtilisateursParams { /* ... paramètres de recherche ... */ }
export interface IUtilisateurStatsResponse { /* ... structure des stats ... */ }
// ... autres interfaces de réponse
```

#### `utils/` et `helpers/` (Utilitaires du Module) :

  * **Contenu** : Fonctions utilitaires pures, spécifiques à ce module (ex: `formatProductPrice`, `getUtilisateurRole`).
  * **Objectif** : Isoler la logique réutilisable et testable propre au module.

### 3.3 Dossiers à la racine (`components/`, `hooks/`, `lib/`, `styles/`, `types/`)

Ces dossiers sont réservés aux éléments globaux, réutilisables dans toute l'application et non spécifiques à une seule fonctionnalité.

  * **`components/`** : Composants React génériques et réutilisables partout (ex: `Button`, `Modal`, `Input`). Peut contenir des sous-dossiers pour l'organisation (`components/ui`, `components/layout`, `components/navigation`, `components/blocks`).
  * **`hooks/`** : Hooks personnalisés génériques et réutilisables partout (ex: `useDebounce`, `useLocalStorage`).
  * **`lib/`** : Utilitaires globaux (ex: `api.ts` pour la configuration axios, `get-query-client.ts` pour la configuration du client TanStack Query, `utils/` pour des fonctions globales comme `formatDate`).

<!-- end list -->

```typescript
// src/lib/api.ts (Extrait)
import { Api } from "ak-api-http"; // Votre bibliothèque de client HTTP
import { baseURL } from "@/config";
import {logout } from "@/features/auth/actions/auth.action";
import { auth } from "./auth";
import { User } from "next-auth";

export const api = new Api({
    baseUrl: baseURL, timeout: 10000, headers: { "Content-Type": "application/json" },
    enableAuth: true,
    getSession: async () => {   const session = await auth();
    const user = session?.user as User;
    if (user) {
      return {
        accessToken: user.accessToken ?? "",
      }
    }
    return {
      accessToken: "",
    } },
    signOut: logout,
    debug: process.env.NODE_ENV === "development",
});
```

```typescript
// src/lib/get-query-client.ts (Extrait)
import { QueryClient } from '@tanstack/react-query';
import { cache } from 'react';

const getQueryClient = cache(() => new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            retry: (failureCount, error: any) => { /* ... */ return failureCount < 3; },
        },
    },
}));
export default getQueryClient;
```

  * **`styles/`** : Styles globaux (Tailwind config, globales CSS) et peut contenir des sous-dossiers pour des styles spécifiques à un module s'ils sont gérés globalement (ex: `styles/products.module.css`).
  * **`types/`** : Types TypeScript globaux ou partagés entre plusieurs modules qui ne sont pas des DTOs et ne sont pas spécifiques à un seul module (ex: `CommonProps.d.ts`, `GlobalEnums.d.ts`, `PaginatedResponse.d.ts`).

-----

## 4\. Flux de Données et Sécurité (Next.js & TanStack Query)

Le flux de données suit un chemin clair et sécurisé, en tirant parti des capacités de Next.js et TanStack Query :

1.  **Vue (Composant React)** : Rend l'UI et interagit avec les `hooks/` du ViewModel.

2.  **ViewModel (Hooks dans `features/[module]/hooks/`)** : Encapsule la logique de présentation et l'état du composant. Il utilise les hooks de `queries/` ou `actions/` pour interagir avec les données.

3.  **Queries (`features/[module]/queries/`) / Mutations (`features/[module]/queries/`)** :

      * Utilisent `useQuery` ou `useMutation` de TanStack Query.
      * Point crucial de sécurité et d'optimisation : Ces hooks **DOIVENT** appeler les **Server Actions** de `features/[module]/actions/` pour toutes les interactions avec le backend (lecture et mutation). C'est le point d'entrée pour la récupération/modification des données côté client, garantissant que les informations sensibles du backend ne sont pas exposées.

4.  **Server Actions (`features/[module]/actions/`)** :

      * Fonctions s'exécutant sur le serveur ("use server"). Elles reçoivent les requêtes du client (via TanStack Query) et délèguent l'appel aux fonctions API brutes de `features/[module]/api/`.
      * C'est ici que vous pouvez ajouter des logiques de validation côté serveur (comme avec [ak-zod-form-kit](https://www.google.com/search?q=https://www.npmjs.com/package/ak-zod-form-kit)) ou de sécurité supplémentaires avant d'appeler l'API.

5.  **API (`features/[module]/api/`)** :

      * Contiennent les fonctions qui exécutent les requêtes HTTP brutes via le client configuré dans `lib/api.ts`.
      * Ces fonctions sont des wrappers directs autour des appels HTTP (ex: `axios.get`, `axios.post`).

6.  **`lib/api.ts`** :

      * Configure le client HTTP ([ak-api-http](https://www.google.com/search?q=https://www.npmjs.com/package/ak-api-http) basé sur [Axios](https://axios-http.com/fr/docs/intro)) avec les intercepteurs pour la gestion globale des requêtes/réponses, l'ajout de headers d'authentification, la gestion centralisée des erreurs, etc.

-----

## 5\. Technologies Utilisées

### Framework Principal

  * **Next.js 14** - Framework React avec App Router
  * **React 18** - Bibliothèque UI
  * **TypeScript** - Typage statique

### Styling et UI

  * **Tailwind CSS** - Framework CSS utilitaire
  * **shadcn/ui** - Composants UI réutilisables (construits sur [Radix UI](https://www.radix-ui.com/))
  * **Radix UI** - Composants primitifs accessibles
  * **Lucide React** - Icônes
  * **@heroui/react** - Bibliothèque de composants UI
  * **sonner** - Pour les notifications toast

### Gestion d'État et Données

  * **TanStack Query** - Gestion des requêtes et cache
  * **Jotai** - Gestion d'état atomique (si utilisé pour l'état global)
  * **React Hook Form** - Gestion des formulaires
  * **Zod** - Validation de schémas
  * **nuqs** - Synchronisation des paramètres d'URL avec l'état React
  * **ak-api-http** - Client HTTP basé sur Axios pour les requêtes API
  * **ak-zod-form-kit** - Utilitaire pour la validation de données de formulaire basée sur Zod

### Authentification et Sécurité

  * **NextAuth.js** - Authentification complète (si intégré)
  * **Server Actions** - Pour les opérations côté serveur sécurisées

### Internationalisation

  * **next-intl** - Support multilingue (EN/AR)
  * **RTL Support** - Support des langues de droite à gauche

### Autres Bibliothèques Notables

  * **@tanstack/react-table** - Tableaux de données avancés
  * **FullCalendar** - Calendrier interactif (si intégré)
  * **ApexCharts / Chart.js / Recharts** - Pour les graphiques et visualisations (si intégrés)

-----

## 6\. Installation et Configuration

### Prérequis

  * Node.js 18+
  * pnpm (recommandé) ou npm
  * Eslint (obligatoire)

### Installation

1.  **Cloner le projet**
    ```bash
    git clone <repository-url>
    cd start
    ```
2.  **Installer les dépendances**
    ```bash
    pnpm install
    ```
3.  **Configuration des variables d'environnement**
    ```bash
    cp .env.example .env.local
    ```
4.  **Lancer le serveur de développement**
    ```bash
    pnpm dev
    ```

-----

## 7\. Approche de Développement / Patterns

### Architecture par Fonctionnalités

Le projet est organisé autour de fonctionnalités métier dans le dossier `features/`. Cette approche favorise :

  * **Autonomie des Modules** : Chaque fonctionnalité est un mini-domaine avec sa propre logique, types, API, et composants.
  * **Clarté** : Facilite la navigation et la compréhension du code pour les nouveaux développeurs.
  * **Maintenabilité** : Les changements dans une fonctionnalité ont un impact limité sur les autres.
  * **Scalabilité** : Ajout de nouvelles fonctionnalités sans affecter l'organisation existante.

### Patterns Utilisés

  * **Feature-First Architecture** : Organisation du code autour des fonctionnalités métier.
  * **MVVM (Model-View-ViewModel)** : Pour la séparation de la logique de présentation et de l'UI.
  * **Provider Pattern** : Gestion d'état globale avec React Context ou d'autres providers (comme TanStack Query Provider).
  * **Custom Hooks** : Encapsulation de la logique métier réutilisable et de la gestion d'état.
  * **Component Composition** : Construction de composants modulaires et réutilisables à partir de composants plus petits.
  * **Type-Safe Development** : Utilisation stricte de TypeScript avec Zod pour la validation des données, garantissant la sécurité des types à travers l'application.

### Structure des Composants

  * **UI Components** (`components/ui/`) : Composants de base, génériques et stylisés (souvent issus de shadcn/ui ou Radix UI). Ils sont "stupides" et ne contiennent pas de logique métier.
  * **Partial Components** (`components/partials/`) : Composants spécifiques à la structure de l'interface globale (ex: Header, Sidebar, Footer).
  * **Block Components** (`components/blocks/`) : Composants de contenu réutilisables qui peuvent contenir une certaine logique de présentation mais sont agnostiques au module métier (ex: StatusBlock).
  * **Feature Components** (`features/[module]/components/`) : Composants liés spécifiquement à une fonctionnalité métier. Ils peuvent contenir de la logique métier propre à leur module et sont souvent des "Client Components" qui interagissent avec les ViewModels (hooks) de leur module.

## 8\. Workflow de Création d'un Module

Ce guide détaille le processus de création d'une nouvelle fonctionnalité (module) dans l'architecture Next-LB. Il s'appuie sur les principes des **Tranches Verticales** et du **MVVM**, garantissant cohérence, maintenabilité et scalabilité.

### Étape 1 : Créer le Dossier Racine du Module

* **Emplacement** : `src/features/[nom-du-module]/`
* **Description** : Conteneur principal de votre fonctionnalité.

### Étape 2 : Définir le Modèle (Données & Logique Métier)

Le Modèle gère les données, leur structure, validation et interaction avec le backend.

#### 2.1 Ajouter les Types

* **Emplacement** : `src/features/[nom-du-module]/types/`
* **Description** : Définitions TypeScript (interfaces, énumérations) spécifiques au module, non générées par Zod.
* **Exemple** : `utilisateur.type.ts`.

#### 2.2 Ajouter les Schémas et DTOs

* **Emplacement** : `src/features/[nom-du-module]/schemas/`
* **Description** : Schémas de validation **Zod** pour les données. Les types TypeScript dérivés (`z.infer<typeof MonSchema>`) sont nos **DTOs (Data Transfer Objects)**.
* **Exemple** : `utilisateur.schema.ts`.

#### 2.3 Ajouter les Fonctions API Brutes

* **Emplacement** : `src/features/[nom-du-module]/api/`
* **Description** : Fonctions encapsulant les appels HTTP bruts vers le backend via **ak-api-http**.
* **Rôle MVVM** : Couche **Modèle**.
* **Important** : Les exceptions sont gérées automatiquement par `lib/api.ts`. Ne connaissent **PAS** TanStack Query ni les Server Actions.
* **Exemple** : `utilisateur.api.ts`.

#### 2.4 Ajouter les Server Actions (Requêtes de Mutations)

* **Emplacement** : `src/features/[nom-du-module]/actions/`
* **Description** : Fonctions **Server Actions Next.js** ("use server"). Point d'entrée sécurisé client-backend. Appellent les fonctions API brutes.
* **Rôle MVVM** : Couche **Modèle**.
* **Sécurité** : Évite l'exposition d'informations sensibles et permet des validations avec **ak-zod-form-kit**.
* **Convention** : Utilisez ces actions dans vos hooks TanStack Query.
* **Exemple** : `utilisateur.action.ts`.

### Étape 3 : Définir le ViewModel (Présentation & État UI)

Le ViewModel prépare les données pour la Vue et gère la logique de présentation et les états de l'UI.

#### 3.1 Ajouter les Queries et Mutations TanStack Query

* **Emplacement** : `src/features/[nom-du-module]/queries/`
* **Description** : Hooks `useQuery` et `useMutation` de **TanStack Query**. Gèrent le cache, les re-fetches, les états.
* **Rôle MVVM** : Couche **ViewModel**.
* **Convention** : Doivent impérativement appeler les **Server Actions**, pas les fonctions API brutes.
* **Exemple** : `utilisateur-list.query.ts`, `utilisateur.mutation.ts`, `index.query.ts`.

#### 3.2 Ajouter les Hooks Personnalisés (ViewModels)

* **Emplacement** : `src/features/[nom-du-module]/hooks/`
* **Description** : Hooks personnalisés encapsulant la logique de présentation complexe et les états UI spécifiques au module. C'est le ViewModel pur.
* **Rôle MVVM** : Couche **ViewModel**.
* **Quand l'utiliser** : Pour isoler la logique UI complexe du composant Vue. Appellent les hooks de `queries/`.
* **Exemple** : `useUtilisateurListTable.ts`.

#### 3.3 Ajouter les Définitions de Filtres URL

* **Emplacement** : `src/features/[nom-du-module]/filters/`
* **Description** : Schémas de parsing pour les paramètres d'URL (filtres, pagination) via **nuqs**.
* **Rôle MVVM** : Couche **ViewModel** (gestion de l'état de présentation via l'URL).
* **Exemple** : `utilisateur.filters.ts`.

### Étape 4 : Définir la Vue (Interface Utilisateur)

La Vue est la couche responsable de l'affichage de l'interface utilisateur.

#### 4.1 Ajouter les Pages

* **Emplacement** : `src/app/[locale]/[module]/`
* **Description** : Pages Next.js, points d'entrée UI. Préférer les **Server Components** pour le préchargement de données.
* **Rôle MVVM** : Couche **Vue**.
* **Convention** : Préchargement avec TanStack Query (`prefetchQuery`).
* **Exemple** : `src/app/[locale]/(protected)/users/page.tsx`.

#### 4.2 Ajouter les Composants Spécifiques au Module

* **Emplacement** : `src/features/[nom-du-module]/components/`
* **Description** : Composants React spécifiques à cette fonctionnalité.
* **Rôle MVVM** : Couche **Vue**.
* **Convention de nommage des fichiers/dossiers** : Minuscule. Nom du composant : `[nom-du-module]-[traitement]-[type-de-composant].tsx`.
* **Exemples** : `utilisateur-add-form.tsx`, `utilisateur-list/index.tsx`.
* **Nommage des fonctions/composants** : `PascalCase` (ex: `UtilisateurAddForm`, `UserList`).
* **Gestion des données** : Affiche l'UI et interagit avec les ViewModels (hooks).

### Étape 5 : Ajouter les Utilitaires et Helpers

* **Emplacement** : `src/features/[nom-du-module]/utils/` ou `src/features/[nom-du-module]/helpers/`
* **Description** : Fonctions utilitaires pures, spécifiques au module.
* **Exemple** : `getUtilisateurRole.ts`.

### Étape 6 : Ajouter les Tests

* **Emplacement** : `src/features/[nom-du-module]/tests/`
* **Description** : Tests unitaires et d'intégration du module.


## Références
- https://www.milanjovanovic.tech/blog/vertical-slice-architecture
- https://builtin.com/software-engineering-perspectives/mvvm-architecture