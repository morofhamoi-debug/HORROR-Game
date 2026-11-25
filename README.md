# HOLLOW HOUSE — The Residence

A browser-based first-person architectural horror environment prototype built with Three.js.

## Run
Open index.html through GitHub Pages or any static HTTP server. The project uses ES modules and imports Three.js from jsDelivr.

## Controls
- WASD / Arrow keys — move
- Mouse — look around (click the canvas to recapture the pointer)
- Shift — walk faster
- E — interact with doors and light switches
- Esc — pause
- Mobile — left virtual stick to move, drag the right side to look, E to interact

## Current build
- Three connected walkable levels: basement, ground floor and upper floor.
- Modular room architecture, real window openings, hinged doors, stairwell, porch and roof silhouette.
- Procedural PBR-style materials for wood, plaster, tile, concrete, fabric and metal.
- Environment reflections, ACES tone mapping, soft shadows, fog, warm interior lighting and cool night fill.
- Desktop post-processing: GTAO contact shading and restrained bloom; mobile rendering automatically uses a lighter path.
- Individually modelled furniture and architectural details with collision volumes for the main solid objects.
- Mobile touch controls and desktop pointer-lock controls.

## Project layout
src/core contains the game loop, input and player movement. src/world contains architecture, materials, furniture, decor, lighting and house assembly. src/ui contains the HUD and visual styling.

This is an evolving environment prototype, not a finished commercial game. Visual quality and frame rate depend on browser, GPU and device capabilities.