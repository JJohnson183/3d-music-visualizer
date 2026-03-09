import * as THREE from "three";
import { getMid, getSmoothedBass } from "../audio";

//=============================================================//
//=================== Reaction Context ========================//
export interface ReactionContext {
  shapes: THREE.Mesh[];
  shapeHues: number[];
  shapeAngles: number[];
  shapeRadii: number[];
  shapeBaseY: number[];
  starOrbitSpeed: number;
  starPulseIntensity: number;
}

//=============================================================//
//=================== Reaction Functions ======================//
/** Defines how the shapes react to the audio data */
export function shapeReactions(ctx: ReactionContext){
  // 1) Get real-time audio data
  const mid = getMid(); // 0-255

  // 2) Smooth the bass value for more gradual pulsing
  let smoothedBass = getSmoothedBass();
  
  // 3) Make stars react
  ctx.shapes.forEach((shape, index) => {
    // Pre-compute trig for the next angle so orbit and pulse share the same values and reduce redundant calculations
    const cos = Math.cos(ctx.shapeAngles[index] + ctx.starOrbitSpeed);
    const sin = Math.sin(ctx.shapeAngles[index] + ctx.starOrbitSpeed);
    ctx.shapeAngles[index] += ctx.starOrbitSpeed;

    // Constant orbit (Must be done before pulse so the pulse sets on the new new angle set by the orbit)
    handleShapeOrbit(shape, index, cos, sin, ctx);

    //===== Position from center (bass) =====//
    handleShapePulse(shape, index, smoothedBass, cos, sin, ctx);

    //===== Color (Mid) =====//
    handleShapeColors(shape, index, mid, ctx);
  });
}

/** Handle shape colors based on Mid frequencies. If no audio is present, randomly change colors over time */
function handleShapeColors(shape: THREE.Mesh, index: number, mid: number | null, ctx: ReactionContext) {
    const prevHue = ctx.shapeHues[index];

    // 1) Determine hue: cycle slowly when no audio, map from mid when playing
    let hue: number;
    if (mid === null) {
        ctx.shapeHues[index] = (ctx.shapeHues[index] + 0.001) % 1; // Increment and wrap at 1
        hue = ctx.shapeHues[index];
    } else {
        hue = mid / 255; // Map mid (0-255) to hue (0-1)
    }

	// 2) Skip if hue hasn't changed to avoid unnecessary updates
	if (hue === prevHue) return;

    // 3) Apply hue to star and its children
    (shape.material as THREE.MeshBasicMaterial).color.setHSL(hue, 1, 0.5);
    for (let i = 0; i < shape.children.length; i++) {
        ((shape.children[i] as THREE.Mesh).material as THREE.MeshBasicMaterial).color.setHSL(hue, 1, 0.5);
    }
}

/** Handle shape orbiting around the center of the scene */
function handleShapeOrbit(shape: THREE.Mesh, index: number, cos: number, sin: number, ctx: ReactionContext) {
  // Update the shape's position based on its angle and radius to create an orbiting effect (cos and sin are pre-computed)
  shape.position.x = cos * ctx.shapeRadii[index];
  shape.position.z = sin * ctx.shapeRadii[index];
}

/** Handle shape pulsing based on the bass frequencies. If no audio is present, do not pulse */
function handleShapePulse(shape: THREE.Mesh, index: number, bass: number | null, cos: number, sin: number, ctx: ReactionContext) {
  if (bass === null) return;

  // 1) Calculate pulse amount based on bass level. (1 to 1 + starPulseIntensity)
  const pulseAmount = 1 + (bass / 255) * ctx.starPulseIntensity;

  // 2) Get the star's stable 3D base position and pulse outward along its full direction
  const baseX = cos * ctx.shapeRadii[index];
  const baseY = ctx.shapeBaseY[index];
  const baseZ = sin * ctx.shapeRadii[index];

  shape.position.x = baseX * pulseAmount;
  shape.position.y = baseY * pulseAmount;
  shape.position.z = baseZ * pulseAmount;
}
