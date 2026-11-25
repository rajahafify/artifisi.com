// Story phases, in scroll-progress units (0 to 1). Shared by the page copy and the 3D room, and
// kept in their own module so the page can read them without loading Three.js.
export const PHASES = {
  hero: [0, 0.12],
  checkin: [0.12, 0.32],
  scout: [0.32, 0.56],
  rank: [0.56, 0.78],
  match: [0.78, 1],
} as const;
