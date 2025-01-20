import { Button } from "@nextui-org/react";
import { Mail } from "lucide-react";
import Image from "next/image";
import React from "react";

export default function Eat() {
  const restaurants = [
    {
      id: 1,
      name: "Marcory Zone 4",
      hours: "10h - 23h",
      description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Expedita repudiandae neque illum aspernatur fugiat maiores id magni, modi, quaerat vitae.",
      email: "your.email.inbox@here.com",
      image: "/assets/images/illustrations/restaurant/card-items-1.png",
      imageAlt: "Chicken sandwich with fries",
    },
    {
      id: 2,
      name: "Angré 8è Tranche",
      hours: "10h - 23h",
      description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Expedita repudiandae neque illum aspernatur fugiat maiores id magni, modi, quaerat vitae.",
      email: "your.email.inbox@here.com",
      image: "/assets/images/illustrations/restaurant/card-items-2.png",
      imageAlt: "Restaurant exterior",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Restaurant List */}
      <div className="grid gap-8">
        {restaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className="flex flex-col md:flex-row gap-6 items-center bg-white md:bg-gray-100 rounded-2xl"
          >
            {/* Image Section */}
            <div className="flex-shrink-0 relative">
              <Image
                src={restaurant.image}
                alt={restaurant.imageAlt}
                width={250}
                height={150}
                className="rounded-xl"
              />
              <Button
                color="primary"
                className="text-white absolute inset-x-0 bottom-4 w-fit mx-auto px-8"
              >
                Réserver une table
              </Button>
            </div>

            {/* Details Section */}
            <div className="flex-grow">
              <div className="flex items-center gap-4 h-full">
                {/* Logo */}
                <Image
                  src="/assets/images/logo.png"
                  alt="Chicken Nation logo"
                  width={64}
                  height={64}
                  className="w-16 h-16 hidden md:block"
                />
                {/* Text Content */}
                <div className="flex flex-col justify-center">
                  <h2 className="text-xl font-bold mb-2">{restaurant.name}</h2>
                  <p className="mb-2">Horaire : {restaurant.hours}</p>
                  <p className="mb-4 text-gray-600">{restaurant.description}</p>
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <span>{restaurant.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Future Restaurants Section */}
      <div className="flex flex-col md:flex-row items-center gap-8 w-full bg-white md:bg-gray-100 my-8 rounded-lg">
        <Image
          src="/assets/images/illustrations/restaurant/card-items-4.png"
          alt="Prochaine ouverture 2025"
          width={256}
          height={256}
          className="rounded-lg"
        />
        <div className="flex flex-col justify-center rounded-lg text-black">
          <h2 className="text-2xl font-bold mb-4">
            DÉCOUVREZ NOS FUTURS RESTAURANTS DANS LE GRAND ABIDJAN
          </h2>
          <p className="text-lg text-primary">
            4 nouvelles adresses à venir en 2025
          </p>
        </div>
      </div>
    </div>
  );
}
