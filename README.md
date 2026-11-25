# HOLLOW HOUSE — The Residence

A browser-based first-person horror environment built with Three.js.

## Play
Open the published game at https://morofhamoi-debug.github.io/HORROR-Game/

## Controls
- WASD / Arrow keys — move
- Mouse — look around
- Shift — move faster
- E — interact with doors and light switches
- Esc — pause
- Mobile — left virtual stick to move, drag the right side to look, E to interact

## Developer diagnostics
Append ?debug=1 to the game URL to show the diagnostics overlay.
- F3 — toggle collision bounds
- F4 — run the geometry report in the browser console

## Project layout
- src/core — game loop, input, character movement
- src/world — common layout, walls, openings, stairs, furniture, materials, lighting, diagnostics and house assembly
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

See docs/house-audit.md for findings, implemented corrections, verification scope and remaining QA work.

This is an evolving game prototype, not a finished commercial AAA product. Visual quality and frame rate depend on browser and GPU capabilities.