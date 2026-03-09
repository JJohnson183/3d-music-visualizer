import * as THREE from "three";
import { getMid, getSmoothedBass } from "../audio";

// Reusable objects to avoid per-frame allocation
const _matrix = new THREE.Matrix4();
const _color = new THREE.Color();
let _cos = 0;
let _sin = 0;

//=============================================================//
//=================== Reaction Context ========================//
export interface ReactionContext {
  starMesh: THREE.InstancedMesh; // Instanced mesh for all stars
  glowMesh: THREE.InstancedMesh; // Instanced mesh for all star glows
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
  const smoothedBass = getSmoothedBass();

  // 3) Make stars react
  for (let index = 0; index < ctx.shapeAngles.length; index++) {
    // Constant orbit (Must be done before pulse so the pulse sets on the new angle set by the orbit)
    handleShapeOrbit(index, ctx);

    //===== Position from center (bass pulse) =====//
    handleShapePosition(index, smoothedBass, ctx);

    //===== Color (Mid) =====//
    handleShapeColors(index, mid, ctx);
  }

  // 4) Flag both meshes for GPU upload
  ctx.starMesh.instanceMatrix.needsUpdate = true;
  ctx.glowMesh.instanceMatrix.needsUpdate = true;
  if (ctx.starMesh.instanceColor) ctx.starMesh.instanceColor.needsUpdate = true;
  if (ctx.glowMesh.instanceColor) ctx.glowMesh.instanceColor.needsUpdate = true;
}

/** Handle orbiting the shape around the center of the scene */
function handleShapeOrbit(index: number, ctx: ReactionContext){
	// Update angle for orbiting effect
	_cos = Math.cos(ctx.shapeAngles[index] + ctx.starOrbitSpeed);
	_sin = Math.sin(ctx.shapeAngles[index] + ctx.starOrbitSpeed);
	ctx.shapeAngles[index] += ctx.starOrbitSpeed;
}

/** Handle shape position based on orbit angle and bass pulse. If no audio is present, only orbit */
function handleShapePosition(index: number, smoothedBass: number | null, ctx: ReactionContext) {
  // Update position based on angle and radius to create an orbiting effect
  let x = _cos * ctx.shapeRadii[index];
  let y = ctx.shapeBaseY[index];
  let z = _sin * ctx.shapeRadii[index];

  if (smoothedBass !== null) {
    // Calculate pulse amount based on bass level (1 to 1 + starPulseIntensity) and pulse outward along full 3D direction
    const pulseAmount = 1 + (smoothedBass / 255) * ctx.starPulseIntensity;
    x *= pulseAmount;
    y *= pulseAmount;
    z *= pulseAmount;
  }

  // Set the same matrix on both the star and glow instances
  _matrix.setPosition(x, y, z);
  ctx.starMesh.setMatrixAt(index, _matrix);
  ctx.glowMesh.setMatrixAt(index, _matrix);
}

/** Handle shape colors based on Mid frequencies. If no audio is present, randomly change colors over time */
function handleShapeColors(index: number, mid: number | null, ctx: ReactionContext) {
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

  // 3) Apply hue to star and glow instances
  _color.setHSL(hue, 1, 0.5);
  ctx.starMesh.setColorAt(index, _color);
  ctx.glowMesh.setColorAt(index, _color);
}
