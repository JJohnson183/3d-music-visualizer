import * as THREE from "three";

//=============================================================//
//==================== Placement Types ========================//
export interface PlacementData {
  position: THREE.Vector3; // World position for the mesh
  angle: number; // Initial orbit angle (radians)
  radius: number; // XZ orbit radius (kept fixed so orbit never drifts)
  baseY: number; // Y position (kept fixed so pulse never drifts)
}

//=============================================================//
//=================== Placement Functions =====================//
/** Compute a random position distributed evenly inside a sphere */
export function computeSpherePlacement(starSpread: number): PlacementData {
    // 1) Generate a random point in spherical coordinates with uniform distribution
    const angle = Math.random() * Math.PI * 2; // Random angle around the Y axis (0 to 360°)
    const verticalAngle = Math.acos(2 * Math.random() - 1); // Random angle from top to bottom (prevents clustering at poles)
    const distanceFromCenter = Math.cbrt(Math.random()) * (starSpread / 2); // Cube root prevents clustering at center
    const radius = distanceFromCenter * Math.sin(verticalAngle); // Flat XZ distance from Y axis

    // 2) Convert spherical coordinates to Cartesian coordinates
    const x = radius * Math.cos(angle);
    const y = distanceFromCenter * Math.cos(verticalAngle);
    const z = radius * Math.sin(angle);

    return { position: new THREE.Vector3(x, y, z), angle, radius, baseY: y };
}

/** Compute a random position distributed around a flat ring */
export function computeRingPlacement(starSpread: number): PlacementData {
    // 1) Generate a random point in cylindrical coordinates with uniform distribution
    const angle = Math.random() * Math.PI * 2; // Random angle around the Y axis (0 to 360°)
    const radius = (starSpread / 2) * (0.7 + Math.random() * 0.3); // Random radius within outer 30% of spread

    // 2) Convert cylindrical coordinates to Cartesian coordinates
    const x = radius * Math.cos(angle);
    const y = (Math.random() - 0.5) * (starSpread * 0.1); // Small Y variation for slight depth
    const z = radius * Math.sin(angle);

    return { position: new THREE.Vector3(x, y, z), angle, radius, baseY: y };
}
