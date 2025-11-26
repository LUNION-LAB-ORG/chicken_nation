export const listRestaurants: IRestaurant[] = [
    {
        id: 1,
        name: "MARCORY ZONE 4",
        hours: "10h00 - 00h00 & week-end 10h00 - 01h00",
        description:
            "Chicken Nation est un fast-food ivoirien spécialisé dans le poulet pané halal, offrant des recettes savoureuses dans une ambiance conviviale. Présent à Marcory Zone 4, Angré Djibi 8ᵉ Tranche et Sococe 2 Plateaux.",
        email: "info@chicken-nation.com",
        image: "/assets/images/illustrations/restaurant/marcory-1.png",
        contact: "+225 0720353535"

    },
    {
        id: 2,
        name: "ANGRE DJIBI 8ᵉ TRANCHE",
        hours: "10h00 - 00h00 & week-end 10h00 - 01h00",
        description:
            "Chicken Nation est un fast-food ivoirien spécialisé dans le poulet pané halal, offrant des recettes savoureuses dans une ambiance conviviale. Présent à Marcory Zone 4, Angré Djibi 8ᵉ Tranche et Sococe 2 Plateaux.",
        email: "info@chicken-nation.com",
        image: "/assets/images/illustrations/restaurant/angre.png",
        contact: "+225 0747000034"

    },
    {
        id: 3,
        name: "SOCOCE 2 PLATEAUX",
        hours: "10h00 - 23h00 & week-end 10h00 - 00h00",
        description:
            "Chicken Nation est un fast-food ivoirien spécialisé dans le poulet pané halal, offrant des recettes savoureuses dans une ambiance conviviale. Présent à Marcory Zone 4, Angré Djibi 8ᵉ Tranche et Sococe 2 Plateaux.",
        email: "info@chicken-nation.com",
        image: "/assets/images/illustrations/restaurant/sococe.jpg",
        contact: "+225 0700005556"

    },
    {
        id: 4,
        name: "RIVIERA FAYA",
        hours: "10h00 - 00h00 & week-end 10h00 - 01h00",
        description:
            "Chicken Nation est un fast-food ivoirien spécialisé dans le poulet pané halal, offrant des recettes savoureuses dans une ambiance conviviale. Présent à Marcory Zone 4, Angré Djibi 8ᵉ Tranche et Sococe 2 Plateaux.",
        email: "info@chicken-nation.com",
        image: "/assets/images/illustrations/restaurant/riviera-faya.jpg",
        contact: "+225 0741919171"
    },
];


export interface IRestaurant {
    id: number;
    name: string;
    hours: string;
    description: string;
    email: string;
    image: string;
    contact: string;
};
