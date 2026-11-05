import * as THREE from 'three';

// Live points the armor writes every frame and the rest of the scene reads:
// the sword in its chest (so the wanderer's hand and blade meet it exactly)
// and the tip of the halberd (where a heavy blow hits the floor).
export const hilt = {
  pos: new THREE.Vector3(0, 1.5, 0.9),
  quat: new THREE.Quaternion(),
  /** world direction the blade goes into the chest */
  axis: new THREE.Vector3(0, 0, -1),
};
export const halberdTip = new THREE.Vector3(0, 0, 2.2);
