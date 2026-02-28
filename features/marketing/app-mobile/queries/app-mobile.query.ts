import { useQueryClient } from '@tanstack/react-query';

// 1. Clé de cache
export const appMobileKeyQuery = (...params: any[]) => {
    if (params.length === 0) {
        return ['app-mobile'];
    }
    return ['app-mobile', ...params];
};

// 2. Hook personnalisé pour l'invalidation
export const useInvalidateAppMobileQuery = () => {
    const queryClient = useQueryClient();

    return async (...params: any[]) => {
        await queryClient.invalidateQueries({
            queryKey: appMobileKeyQuery(...params),
            exact: false
        });

        await queryClient.refetchQueries({
            queryKey: appMobileKeyQuery(),
            type: 'active'
        });
    };
};