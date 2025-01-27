"use client";

import React, { useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
  Button,
} from "@nextui-org/react";
import { Search, ShoppingCart } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";

export const ChickenLogo = () => {
  return (
    <Link href="/" >
      <Image
        src="/assets/images/icone.png"
        alt="Chicken Nation Logo"
        width={50} // Ajoutez la largeur (en pixels)
        height={50} // Ajoutez la hauteur (en pixels)
        priority // Optionnel, si vous voulez donner la priorité à ce chargement
        className="cursor-pointer" // Ajout de la classe pour le curseur
      />
    </Link>
  );
};

export default function Head() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { name: "Accueil", link: "/" },
    { name: "Histoire", link: "/histoire" },
    { name: "Nos restaurants", link: "/restaurants" },
    { name: "Franchise", link: "/franchise" },
  ];

  return (
    <Navbar
      onMenuOpenChange={setIsMenuOpen}
      className="bg-primary"
      maxWidth="full"
    >
      {/* Logo et Menu Toggle */}
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          className="sm:hidden text-white"
        />
        <NavbarBrand>
          <ChickenLogo />
          <p className="hidden md:block font-bold text-white text-xl ml-2">
            CHICKEN NATION
          </p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-6" justify="center">
        {menuItems.map((item) => (
          <NavbarItem
            key={item.name}
            className={`${
              pathname === item.link
                ? "bg-white clip-polygon-custom text-primary py-1 px-2"
                : "text-white"
            }`}
          >
            <Link
              href={item.link}
              className={`px-4 py-2 rounded hover:bg-white/40 hover:clip-polygon-custom transition-all ${
                pathname === item.link ? "text-primary" : "text-white"
              }`}
            >
              {item.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <Search className="text-white cursor-pointer" size={24} />
        </NavbarItem>
        <NavbarItem>
          <ShoppingCart
            className="text-white cursor-pointer hidden md:block"
            size={24}
          />
        </NavbarItem>
        <NavbarItem>
          <Button
            as={Link}
            className="hidden md:flex bg-secondary text-secondary-foreground font-semibold"
            href="/login"
            variant="flat"
          >
            Connexion
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu className="bg-primary">
        {menuItems.map((item) => (
          <NavbarMenuItem key={item.name}>
            <Link className="w-full h-full text-white" href={item.link}>
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
        <NavbarItem>
          <Button
            as={Link}
            className=" bg-secondary text-secondary-foreground font-semibold w-full"
            href="#"
            variant="flat"
          >
            Connexion
          </Button>
        </NavbarItem>
      </NavbarMenu>
    </Navbar>
  );
}
