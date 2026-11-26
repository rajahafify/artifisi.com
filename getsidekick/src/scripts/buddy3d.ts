// Buddy, the Sidekick mascot, in 3D. Built from the same drawing as the logo (mark.dart's
// BuddyPainter): a soft rounded body 140 wide by 120 tall, two shiny eyes, a wink, a smile and
// two cheeks. One unit here is 100 units of that drawing, so the body is 1.4 by 1.2.
import {
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  TorusGeometry,
  type ColorRepresentation,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Shared shapes: every Buddy reuses them, so ten Buddies cost little more than one.
const shapes = {
  body: new RoundedBoxGeometry(1.4, 1.2, 0.9, 8, 0.45),
  eye: new SphereGeometry(0.11, 20, 16),
  shine: new SphereGeometry(0.036, 12, 10),
  cheek: new SphereGeometry(0.1, 16, 12),
  // Half rings: the wink is an arch (∩), the smile is a bowl (∪).
  arc: new TorusGeometry(0.11, 0.028, 8, 24, Math.PI),
};

export interface Buddy3D {
  group: Group;
  /** Blink now and then; call every frame with seconds. */
  tick(time: number): void;
  setWink(on: boolean): void;
}

export function makeBuddy(opts: {
  body: ColorRepresentation;
  features: ColorRepresentation;
  cheeks: ColorRepresentation;
  shadows?: boolean;
  /** Offsets the blink so a crowd of Buddies doesn't blink in step. */
  seed?: number;
  glow?: number;
}): Buddy3D {
  const group = new Group();
  const bodyMat = new MeshStandardMaterial({
    color: opts.body,
    roughness: 0.38,
    emissive: new Color(opts.body),
    emissiveIntensity: opts.glow ?? 0.08,
  });
  const featureMat = new MeshStandardMaterial({ color: opts.features, roughness: 0.35 });
  const cheekMat = new MeshStandardMaterial({ color: opts.cheeks, roughness: 0.6 });

  const body = new Mesh(shapes.body, bodyMat);
  group.add(body);

  const eyes: Mesh[] = [];
  for (const x of [-0.22, 0.22]) {
    const eye = new Mesh(shapes.eye, featureMat);
    eye.position.set(x, 0.08, 0.42);
    eye.scale.set(1, 1.27, 0.55);
    const shine = new Mesh(shapes.shine, bodyMat);
    shine.position.set(0.04 / 1, 0.05, 0.1);
    shine.scale.set(1, 1 / 1.27, 1 / 0.55);
    eye.add(shine);
    group.add(eye);
    eyes.push(eye);
  }

  const wink = new Mesh(shapes.arc, featureMat);
  wink.position.set(0.22, 0.04, 0.44);
  wink.visible = false;
  group.add(wink);

  const smile = new Mesh(shapes.arc, featureMat);
  smile.position.set(0, -0.12, 0.45);
  smile.rotation.z = Math.PI;
  group.add(smile);

  for (const x of [-0.38, 0.38]) {
    const cheek = new Mesh(shapes.cheek, cheekMat);
    cheek.position.set(x, -0.14, 0.39);
    cheek.scale.set(1, 0.6, 0.35);
    group.add(cheek);
  }

  group.traverse((o) => {
    if ((o as Mesh).isMesh) (o as Mesh).castShadow = !!opts.shadows;
  });

  const seed = opts.seed ?? 0;
  let winking = false;
  return {
    group,
    tick(time) {
      // A quick blink every few seconds.
      const t = (time + seed * 1.7) % 3.9;
      const open = t < 0.12 ? Math.abs(t - 0.06) / 0.06 : 1;
      eyes.forEach((e, i) => {
        if (i === 1 && winking) return;
        e.scale.y = 1.27 * Math.max(0.08, open);
      });
    },
    setWink(on) {
      if (on === winking) return;
      winking = on;
      eyes[1].visible = !on;
      wink.visible = on;
    },
  };
}
