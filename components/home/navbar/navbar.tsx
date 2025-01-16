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
    <img src="assets/images/logo_1.png" alt="Chicken Nation" />
  );
};

export default function Head() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    "Accueil",
    "Histoire",
    "Nos restaurants",
    "Franchise",
  ];

  return (
    <Navbar 
      onMenuOpenChange={setIsMenuOpen} 
      className="bg-[#F26522]"
      maxWidth="full"
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden text-white"
        />
        <NavbarBrand>
          <ChickenLogo />
          <p className="font-bold text-white text-xl ml-2">CHICKEN NATION</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-6" justify="center">
        {menuItems.map((item, index) => (
          <NavbarItem key={item} isActive={index === 0}>
            <Link 
              href="#" 
              className={`text-white ${index === 0 ? 'bg-white/20 px-4 py-2 rounded' : ''}`}
            >
              {item}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <Search className="text-white" size={24}/>
        </NavbarItem>
        <NavbarItem>
          <ShoppingCart className="text-white" size={24}/>
        </NavbarItem>
        <NavbarItem>
          <Button
            as={Link}
            className="bg-[#8B4513] text-white font-semibold"
            href="#"
            variant="flat"
          >
            Connexion
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu className="bg-[#F26522]">
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              className="w-full text-white"
              href="#"
              size="lg"
            >
              {item}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}