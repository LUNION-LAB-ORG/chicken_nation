import { useQueryClient } from '@tanstack/react-query';

// 1- Clé de cache
export const authKeyQuery = (...params: any[]) => {
    if (params.length === 0) {
        return ['auth'];
    }
    return ['auth', ...params];
};

// 2. Créez un hook personnalisé pour l'invalidation
export const useInvalidateAuthQuery = () => {
    const queryClient = useQueryClient();

    return async (...params: any[]) => {
        await queryClient.invalidateQueries({
            queryKey: authKeyQuery(...params),
            exact: false
        });

        await queryClient.refetchQueries({
            queryKey: authKeyQuery(),
            type: 'active'
        });
    };
};