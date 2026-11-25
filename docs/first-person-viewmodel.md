# First-person hands and smartphone viewmodel

## Modules

- src/player/Hands.js — procedural arms, palms, fingers, phalanges, knuckles, nails, palm creases, vein details, viewmodel lighting and movement/phone poses.
- src/player/Phone.js — separate rounded titanium phone body, glass, screen plane, front sensor island, rear camera cluster, side keys, USB-C port and canvas-rendered display.
- src/core/Input.js — P key and the bottom-right SVG HUD button toggle the phone.
- src/core/Game.js — updates the viewmodel in camera space and disposes all viewmodel resources with the game.

## Runtime behaviour

The arm meshes are children of the first-person camera, so they follow head position and look direction without relying on 2D overlays. Idle arms remain low in the field of view and sway slightly when moving. Pressing P or the SVG phone control animates the hands into a holding pose and raises the phone from below the screen. The right index finger adds a subtle tapping motion. Pressing the control again lowers the device and returns the arms to their resting pose.

The phone's screen is a CanvasTexture updated once per second. Its dimensions are based on a real-world handset proportion, then enlarged slightly as a first-person viewmodel for readability. Its body is separate Three.js geometry, not the supplied standalone demo page embedded into the game.

## Geometry and visual treatment

The hand meshes use custom swept BufferGeometry with variable radii along Catmull-Rom curves. This provides tapered forearms, natural finger profiles and slightly enlarged joint regions. Palm volume is created from a bevelled extruded anatomical silhouette. Additional geometry provides joint creases, nail plates, cuticles, palm flexion lines and subtle tendon/vein relief.

Skin is shaded with MeshPhysicalMaterial, a procedural colour texture and a subtle normal map. The phone uses a bevelled extruded frame, physical glass, titanium-like PBR surfaces, machined keys and raised camera optics. The screen is an emissive-like unlit canvas surface to retain contrast in dark rooms.

## Controls

- Mobile: tap the SVG phone control at the lower-right edge.
- Desktop: press P.
- Tap again or press P again to put the phone away.

## Important quality boundary

The hands are built from procedural geometry and procedural skin maps. They are not photogrammetry, scanned human hands, a production anatomical rig or a studio-captured skin shader. The code provides a detailed browser-native 3D first-person model, but final photorealism still depends on real-time visual inspection, lighting calibration and potentially replacing this procedural model with a high-quality authored hand asset.
