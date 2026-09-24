export const ROLES = [
  "Club Coordinator",
  "Executive Member",
  "Wing Member",
  "Alumni",
];

// Backwards compatibility alias
export const MEMBER_TYPES = ROLES;

export const DOMAINS = [
  "ELECTRONICS",
  "INTEGRATED SYSTEMS",
  "AI AND ML",
  "UI/UX WEBDEV AND DS",
  "PR AND DESIGN",
];

export const DOMAIN_LABELS = {
  "ELECTRONICS": "Electronics",
  "INTEGRATED SYSTEMS": "Integrated Systems",
  "AI AND ML": "AI & ML",
  "UI/UX WEBDEV AND DS": "UI/UX, Web Dev & DS",
  "PR AND DESIGN": "PR & Design",
};

export const getDomainLabel = (domain) => {
  if (!domain) return "";
  return DOMAIN_LABELS[domain] || domain;
};

// Fixed domain display order presentation rule
export const DOMAIN_DISPLAY_ORDER = [
  "ELECTRONICS",
  "INTEGRATED SYSTEMS",
  "AI AND ML",
  "UI/UX WEBDEV AND DS",
  "PR AND DESIGN",
];
