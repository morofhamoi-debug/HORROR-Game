# HOLLOW HOUSE — The Residence

A browser-based first-person horror environment built with Three.js.

## Play
Open the published game at https://morofhamoi-debug.github.io/HORROR-Game/

## Controls
- WASD / Arrow keys — move
- Mouse — look around
- Shift — move faster
- E — interact with doors and light switches
- P / bottom-right phone icon — raise or lower the 3D smartphone
- Esc — pause
- Mobile — left virtual stick to move, drag the right side to look, E to interact

## Developer diagnostics
Append ?debug=1 to the game URL to show the diagnostics overlay.
- F3 — toggle collision bounds
- F4 — run the geometry report in the browser console

## Project layout
- src/core — game loop, input, character movement
- src/world — common layout, walls, openings, stairs, furniture, materials, lighting, diagnostics and house assembly
- src/player — procedural first-person hands, arms and smartphone viewmodel
- src/ui — HUD and responsive interface
- tests — automated checks for floor dimensions, stair dimensions and room-zone mapping

## Run checks
~~~bash
npm run check
~~~

The game imports Three.js from jsDelivr via the import map in index.html. It therefore needs an HTTP server and network access to the CDN.

## Current technical profile
- One world unit equals one metre.
- Storeys are defined in one central layout module.
- Procedural PBR-style colour, normal and roughness maps are generated for wood, plaster, concrete, tile and fabric.
- Desktop post-processing uses GTAO denoising and restrained bloom. The mobile path is lighter.
- The character controller uses custom collision bounds, step traversal and gravity for larger drops; it is not a full rigid-body capsule physics engine.
- First-person arms and hands are procedural 3D geometry with tapered phalanges, joint volumes, nails, palm creases and skin maps. The titanium smartphone is a separate 3D viewmodel with a live canvas display.

See docs/house-audit.md for architectural findings and docs/first-person-viewmodel.md for the hands and smartphone implementation.

This is an evolving game prototype, not a finished commercial AAA product. Visual quality and frame rate depend on browser and GPU capabilities.