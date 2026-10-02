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
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ReceiptText } from "lucide-react";
import ChickenNationLogo from "../../common/chicken-nation-logo";
// Routeur next-intl : il garde la langue dans l'adresse (/fr/...).
import { Link, useRouter } from "@/i18n/navigation";
import { IconePanier } from "@/features/commande/components/BarrePanier";

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
        <NavbarBrand as={Link} href="/">
          <ChickenNationLogo />
          <span className="hidden xl:block font-bold text-white text-xl ml-2">
            CHICKEN NATION
          </span>
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
        {/* Sur ordinateur, « Mes commandes » n'était joignable que panier vide :
            icône seule jusqu'à xl pour ne pas charger la barre. Sur téléphone,
            le lien est dans le menu. */}
        <NavbarItem className="hidden sm:flex">
          <Link
            href="/commander/mes-commandes"
            aria-label="Mes commandes"
            title="Mes commandes"
            className="flex items-center gap-2 text-white"
          >
            <ReceiptText size={24} />
            <span className="hidden xl:inline">Mes commandes</span>
          </Link>
        </NavbarItem>
        <NavbarItem>
          <IconePanier />
        </NavbarItem>
        <NavbarItem>
          <Button
            as={Link}
            className="bg-secondary text-secondary-foreground font-semibold"
            href="/restaurants/nos-menus"
            variant="flat"
          >
            Commander
          </Button>
        </NavbarItem>
        <NavbarItem className="hidden 2xl:flex">
          <Button
            as={Link}
            className="border-white text-white font-semibold"
            href="/app-mobile"
            variant="bordered"
          >
            Téléchargez l&apos;application
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
        <NavbarMenuItem onClick={() => setIsMenuOpen(false)}>
          <Link className="w-full h-full text-white" href="/commander/mes-commandes">
            Mes commandes
          </Link>
        </NavbarMenuItem>
        <NavbarItem>
          <Button
            className="bg-white text-primary font-semibold w-full"
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
