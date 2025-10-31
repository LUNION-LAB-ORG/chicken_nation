"use client";

import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@heroui/react";
import { Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import ChickenNationLogo from "../../common/chicken-nation-logo";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname() || "";
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";

  const router = useRouter();
  const menuItems = [
    { name: "Accueil", link: "/" },
    { name: "Histoire", link: "/histoire" },
    { name: "Nos restaurants", link: "/restaurants" },
    { name: "Franchise", link: "/franchise" },
  ];

  return (
    <Navbar
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      className="bg-primary"
      maxWidth="full"
    >
      {/* Logo et Menu Toggle */}
      <NavbarContent>
        <NavbarBrand>
          <ChickenNationLogo />
          <p className="hidden lg:block font-bold text-white text-xl ml-2">
            CHICKEN NATION
          </p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-6" justify="center">
        {menuItems.map((item) => (
          <NavbarItem
            key={item.name}
            className={`${
              pathWithoutLocale === item.link
                ? "bg-white clip-polygon-custom text-primary py-1 px-2"
                : "text-white"
            }`}
          >
            <Link
              href={item.link}
              className={`px-4 py-2 rounded hover:bg-white/40 hover:clip-polygon-custom transition-all ${
                pathWithoutLocale === item.link ? "text-primary" : "text-white"
              }`}
            >
              {item.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        {/* <NavbarItem>
          <Search className="text-white cursor-pointer" size={24} />
        </NavbarItem>
        <NavbarItem>
          <ShoppingCart
            className="text-white cursor-pointer hidden lg:block"
            size={24}
          />
        </NavbarItem> */}
        <NavbarItem>
          <Button
            as={Link}
            className="hidden md:flex bg-secondary text-secondary-foreground font-semibold"
            href="/app-mobile"
            variant="flat"
          >
            Téléchargez <span className="hidden lg:inline">l&apos;application</span>
          </Button>
        </NavbarItem>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          className="sm:hidden text-white"
        />
      </NavbarContent>

      <NavbarMenu className="bg-primary">
        {menuItems.map((item) => (
          <NavbarMenuItem key={item.name} onClick={() => setIsMenuOpen(false)}>
            <Link className="w-full h-full text-white" href={item.link}>
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
        <NavbarItem>
          <Button
            className="bg-secondary text-secondary-foreground font-semibold w-full"
            variant="flat"
            onPress={() => {
              router.push("/app-mobile");
              setIsMenuOpen(false);
            }}
          >
            Téléchargez l&apos;application
          </Button>
        </NavbarItem>
      </NavbarMenu>
    </Navbar>
  );
}
