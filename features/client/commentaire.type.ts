// Interface Client
interface IClient {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    image: string | null;
}

// Interface Commande
interface ICommande {
    id: string;
    reference: string;
    created_at: string;
}

// Interface Commentaire
interface ICommentaire {
    id: string;
    message: string;
    rating: number;
    customer_id: string;
    order_id: string;
    created_at: string;
    updated_at: string;
    customer: IClient;
    order: ICommande;
}


type ObtenirCommentairesParams = {
    page?: number;
    limit?: number;
    min_rating?: number;
    max_rating?: number;
    restaurantId?: string;
};