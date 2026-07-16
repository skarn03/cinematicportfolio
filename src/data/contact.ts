/**
 * The single source of truth for every contact detail on the site — the
 * 3D contact scene, and anywhere else a hello-link or handle needs to
 * show up. Add or update a platform here and it appears everywhere at
 * once.
 *
 * Nothing here is invented: any social account without a real URL yet is
 * left as an explicit placeholder (`url: ""`) rather than a guessed or
 * fabricated link, and the UI renders those as "add your handle" prompts
 * instead of dead links.
 */

export type SocialIcon = "instagram";

export type SocialLink = {
  platform: string;
  /** e.g. "@saikacinematics" — shown as-is, never guessed. */
  handle: string;
  /** Full profile URL. Leave "" until the real one is supplied — the UI
   * will show a placeholder state instead of a broken link. */
  url: string;
  icon: SocialIcon;
  description?: string;
};

export const contactLinks = {
  email: "saikacinematics@gmail.com",

  message: {
    headline: "Email's usually the fastest way to reach me.",
    sub: "Open to photography, cinematography, and other projects worth showing up for.",
  },

  mailSubject: "Creative project inquiry",
  mailBody: "Hi Sahil,\n\nI came across your portfolio and would love to discuss…",

  socials: [
    { platform: "Instagram", handle: "@your-handle", url: "", icon: "instagram", description: "Behind the scenes and new work first" },
  ] as SocialLink[],
};

export function mailtoHref(): string {
  const params = new URLSearchParams({ subject: contactLinks.mailSubject, body: contactLinks.mailBody });
  return `mailto:${contactLinks.email}?${params.toString().replace(/\+/g, "%20")}`;
}
