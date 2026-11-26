// Story phases, in scroll-progress units (0 to 1). Shared by the page copy and the 3D room, and
// kept in their own module so the page can read them without loading Three.js.
// The story is the problem, then four steps that fix it: you check in, everyone else checks in,
// the sidekicks talk, and the conversations end in a match or a pass.
export const PHASES = {
  hero: [0, 0.1],
  problem: [0.1, 0.27],
  checkin: [0.27, 0.43],
  arrive: [0.43, 0.59],
  talk: [0.59, 0.79],
  outcome: [0.79, 1],
} as const;
