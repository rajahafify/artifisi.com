// Story phases, in scroll-progress units (0 to 1). Shared by the page copy and the 3D room, and
// kept in their own module so the page can read them without loading Three.js.
// Each step is one action: you check in, everyone else checks in, the sidekicks talk, and the
// conversations end in a match or a pass.
export const PHASES = {
  hero: [0, 0.12],
  checkin: [0.12, 0.32],
  arrive: [0.32, 0.54],
  talk: [0.54, 0.77],
  outcome: [0.77, 1],
} as const;
