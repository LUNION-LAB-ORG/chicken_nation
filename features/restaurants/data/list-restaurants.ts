export const listRestaurants: IRestaurant[] = [
    {
        id: 1,
        name: "Marcory Zone 4",
        hours: "10h30 - 23h30 & week-end 10h30 - 01h30",
        description:
            "Chicken Nation Zone 4 est un restaurant de type Fast-food spécialisé dans des recettes de poulet.",
        email: "chicken.marcory@gmail.com",
        image: "/assets/images/illustrations/restaurant/marcory-1.png",
        link: "/restaurants/marcory",
    },
    {
        id: 2,
        name: "Angré 8è Tranche",
        hours: "10h30 - 23h30 & week-end 10h30 - 01h30",
        description:
            "Chicken Nation Angré est un restaurant de type Fast-food spécialisé dans des recettes de poulet.",
        email: "chicken.djibi@gmail.com",
        image: "/assets/images/illustrations/restaurant/angre.png",
        link: "/restaurants/angre",
    },
];


export interface IRestaurant {
    id: number;
    name: string;
    hours: string;
    description: string;
    email: string;
    image: string;
    link: string;
};
