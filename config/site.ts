export type SiteConfig = typeof siteConfig;

export const locales = ["ar", "en", "fr"];

export const siteConfig = {
  name: "Chicken Nation",
  description:
    "Née de la passion pour le poulet de qualité, Chicken Nation s'est établie comme une référence en matière de restauration rapide en Côte d'Ivoire.",
  navItems: [
    {
      key: "home",
      label: "Home",
      href: "/",
    },
    {
      key: "docs",
      label: "Docs",
      href: "/docs",
    },
    {
      key: "pricing",
      label: "Pricing",
      href: "/pricing",
    },
    {
      key: "blog",
      label: "Blog",
      href: "/blog",
    },
    {
      key: "about",
      label: "About",
      href: "/about",
    },
  ],

  navMenuItems: [
    {
      key: "profile",
      label: "Profile",
      href: "/profile",
    },
    {
      key: "dashboard",
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      key: "projects",
      label: "Projects",
      href: "/projects",
    },
    {
      key: "team",
      label: "Team",
      href: "/team",
    },
    {
      key: "calendar",
      label: "Calendar",
      href: "/calendar",
    },
    {
      key: "settings",
      label: "Settings",
      href: "/settings",
    },
    {
      key: "help_feedback",
      label: "Help & Feedback",
      href: "/help-feedback",
    }
  ],
  links: {
    github: "https://github.com/LUNION-LAB-ORG/next-starter",
    docs: "https://github.com/LUNION-LAB-ORG/next-starter?tab=readme-ov-file#next-starter--architecture-standardis%C3%A9e-pour-projets-nextjs",
  },
};
