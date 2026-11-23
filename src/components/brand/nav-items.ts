// Prototype menu order. `key` is the message key under `Nav`.
export const navItems = [
  { href: "/origine", key: "origine" },
  { href: "/qui-sommes-nous", key: "quiSommesNous" },
  { href: "/chemin-de-vie", key: "cheminDeVie" },
  { href: "/guide-parental", key: "guideParental" },
  { href: "/communication-bienveillante", key: "communication" },
  { href: "/exemple", key: "exemple" },
  { href: "/connexion", key: "connexion" },
  { href: "/creer", key: "creer", cta: true },
  { href: "/contact", key: "contact" },
] as const;

export const legalItems = [
  { href: "/mentions-legales", key: "mentionsLegales" },
  { href: "/cgu", key: "cgu" },
  { href: "/cgv", key: "cgv" },
  { href: "/charte", key: "charte" },
  { href: "/confidentialite", key: "confidentialite" },
] as const;
