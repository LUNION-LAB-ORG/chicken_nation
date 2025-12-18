export const listRestaurants: IRestaurant[] = [
    {
        id: 1,
        name: "MARCORY ZONE 4",
        hours: "10h00 - 00h00 & week-end 10h00 - 01h00",
        description:
            "Chicken Nation est un fast-food ivoirien spécialisé dans le poulet pané halal, offrant des recettes savoureuses dans une ambiance conviviale. Présent à Marcory Zone 4, Angré Djibi 8ᵉ Tranche et Sococe 2 Plateaux.",
        image: "/assets/images/illustrations/restaurant/marcory-1.png",

    },
    {
        id: 2,
        name: "ANGRE DJIBI 8ᵉ TRANCHE",
        hours: "10h00 - 00h00 & week-end 10h00 - 01h00",
        description:
            "Chicken Nation est un fast-food ivoirien spécialisé dans le poulet pané halal, offrant des recettes savoureuses dans une ambiance conviviale. Présent à Marcory Zone 4, Angré Djibi 8ᵉ Tranche et Sococe 2 Plateaux.",
        image: "/assets/images/illustrations/restaurant/angre.png",

    },
    {
        id: 3,
        name: "SOCOCE 2 PLATEAUX",
        hours: "10h00 - 23h00 & week-end 10h00 - 00h00",
        description:
            "Chicken Nation est un fast-food ivoirien spécialisé dans le poulet pané halal, offrant des recettes savoureuses dans une ambiance conviviale. Présent à Marcory Zone 4, Angré Djibi 8ᵉ Tranche et Sococe 2 Plateaux.",
        image: "/assets/images/illustrations/restaurant/sococe.jpg",

    },
    {
        id: 4,
        name: "RIVIERA FAYA",
        hours: "10h00 - 00h00 & week-end 10h00 - 01h00",
        description:
            "Chicken Nation est un fast-food ivoirien spécialisé dans le poulet pané halal, offrant des recettes savoureuses dans une ambiance conviviale. Présent à Marcory Zone 4, Angré Djibi 8ᵉ Tranche et Sococe 2 Plateaux.",
        image: "/assets/images/illustrations/restaurant/riviera-faya.jpg",
    },
];


export interface IRestaurant {
    id: number;
    name: string;
    hours: string;
    description: string;
    image: string;
};
