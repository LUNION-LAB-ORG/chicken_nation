"use client";

import React from "react";
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

export const ChickenLogo = () => {
  return (
    <img src="assets/images/logo_1.png" alt="Chicken Nation Logo" />
  );
};

export default function Head() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    { name: "Accueil", link: "#" },
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
          <p className="font-bold text-white text-xl ml-2">CHICKEN NATION</p>
        </NavbarBrand>
      </NavbarContent>

      {/* Menu Principal */}
      <NavbarContent className="hidden sm:flex gap-6" justify="center">
        {menuItems.map((item, index) => (
          <NavbarItem key={item.name}>
            <Link
              href={item.link}
              className={`text-white ${
                index === 0 ? "bg-white/20 px-4 py-2 rounded" : ""
              }`}
            >
              {item.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      {/* Actions à droite */}
      <NavbarContent justify="end">
        <NavbarItem>
          <Search className="text-white cursor-pointer" size={24} />
        </NavbarItem>
        <NavbarItem>
          <ShoppingCart className="text-white cursor-pointer" size={24} />
        </NavbarItem>
        <NavbarItem>
          <Button
            as={Link}
            className="bg-primary-800 text-white font-semibold"
            href="/connexion"
            variant="flat"
          >
            Connexion
          </Button>
        </NavbarItem>
      </NavbarContent>

      {/* Menu Mobile */}
      <NavbarMenu className="bg-primary">
        {menuItems.map((item) => (
          <NavbarMenuItem key={item.name}>
            <Link className="w-full text-white" href={item.link}>
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}
