# HOLLOW HOUSE — architectural and technical audit

## Audit scope

The audit was performed against the repository's main branch before changes. The source tree contained the browser entry point, game loop, input and player controller, HUD and styling, house generator, room furniture, decorative geometry, materials, lighting, package configuration and GitHub Actions validation workflow.

Files examined:

- index.html, package.json, README.md, .github/workflows/validate.yml
- src/main.js
- src/core/Game.js, src/core/Input.js, src/core/Player.js
- src/ui/HUD.js, src/ui/styles.css
- src/world/Architecture.js, src/world/Decor.js, src/world/Furniture.js
- src/world/House.js, src/world/Lighting.js, src/world/Materials.js

No imported 3D model files, texture image files, shader files, audio files or physics-engine package were present. The house was assembled from procedural Three.js geometry and canvas-generated textures.

## Findings in the audited version

### Critical

1. Floor elevations, room heights and staircase coordinates were hard-coded independently in several modules. The staircase voids in floor/ceiling slabs did not form one reliable vertical circulation system.
2. The staircase controller interpolated the player along a ramp rather than traversing individual risers. The player had no vertical velocity or gravity model.
3. Door geometry and door collision were not consistently aligned. The leaf collider remained a fixed rectangular volume when a door rotated.
4. Interior doors on walls with different orientations were not all aligned to their actual openings.
5. Window openings contained no collision surface across the glazing, so the player could move through the glass.

### Serious

1. The basement used the same nominal storey spacing as the two residential floors, leaving it taller than a typical service basement.
2. Interior and exterior walls shared an unnecessarily large thickness.
3. Basement light positions were based on a fixed level offset, so they did not follow the actual basement ceiling.
4. Point-light shadow maps were assigned to several local lights, multiplying GPU shadow cost.
5. Furniture collision coverage was partial.
6. There was no central architectural specification, room-name map, collision debug overlay or runtime geometry report.
7. Materials used procedural base-colour textures but did not have matching normal and roughness maps.
8. Renderer/environment resources and the HUD timer had incomplete disposal paths.

## Changes implemented

### Unified dimensions and levels

src/world/Layout.js is now the source of truth for the house scale and floor coordinates. One world unit represents one metre.

| Element | Current specification |
|---|---:|
| Basement clear height | 2.33 m |
| Ground-floor clear height | 2.83 m |
| Upper-floor clear height | 2.74 m |
| Exterior wall thickness | 0.30 m |
| Interior partition thickness | 0.14 m |
| Floor slab thickness | 0.24 m |
| Ceiling finish thickness | 0.08 m |
| Door leaf height | 2.08 m |
| Window sill height | 0.86 m |
| Window glazing height | 1.22 m |
| Player height | 1.78 m |
| Player collision radius | 0.32 m |

Floor elevations are -2.65 m, 0 m and +3.15 m. The clear room dimensions account for both the 0.24 m structural floor slab and the 0.08 m ceiling finish below the next storey. The upper ceiling finish is aligned below the roof eaves.

### Architecture and circulation

- Rebuilt wall sections around explicit door and window openings.
- External and internal walls now use separate thickness specifications.
- Added upper/lower slab and ceiling geometry with a matching stairwell opening.
- Added true glass panes, mullions, deep window frames, sills and window collision bounds.
- Door leaves now rotate around a hinge-side pivot. Their collision AABBs are recalculated after opening or closing.
- Corrected the alignment of doors in walls running along the X and Z axes.
- Added a dedicated stair builder. The upper flight has 17 risers (about 0.185 m rise and 0.268 m tread) and the basement flight has 13 risers (about 0.204 m rise and 0.296 m tread). Both are generated from the vertical floor difference and horizontal run.
- Added foundation slab, facade plinth, porch, a corrected symmetrical pitched roof with ridge cap, fascia, gutters and downpipes.
- Moved house geometry under a dedicated house_root group so the house resources can be disposed as one unit.

### Character movement and collisions

- Added circle-versus-AABB horizontal collision resolution and separate-axis wall sliding.
- Wall, door, furniture, window and stair-railing collision entries share one registry.
- Wall and window colliders include vertical bounds, allowing the character body height to be considered.
- Stair movement now advances by discrete tread levels rather than a continuous invisible ramp.
- Added step-height limits, vertical velocity and gravity for larger drops, plus a porch/terrain height profile. The kitchen island, dining set, upper-floor bathroom, bedroom storage and basement laundry equipment were moved clear of the staircase void.
- Added a ceiling-clearance check outside the open stairwell.

This remains a lightweight custom controller. It is not a full rigid-body or swept-capsule physics engine; extreme high-speed tunnelling, complex corner contacts and arbitrary falling through missing floor surfaces still require dedicated gameplay testing.

### Materials and lighting

- Added procedural base-colour, normal and roughness textures for wood, plaster, concrete, tile and fabric.
- Texture anisotropy now uses the renderer's supported device capability.
- Lighting positions are derived from each room's actual ceiling height.
- Removed point-light shadow maps from local fixtures; the scene uses a single directional shadow source to control shadow cost.
- Preserved per-fixture intensity variation during the subtle electrical flicker.
- Desktop rendering uses GTAO denoising and restrained bloom. The mobile path skips those heavier post-process passes and uses a lower pixel-ratio cap.

### Diagnostics and maintainability

- src/world/RoomZones.js provides room names based on the character's coordinates.
- src/world/GeometryAudit.js reports mesh counts, estimated triangles, non-finite vertices, missing/invalid normals, degenerate triangle candidates, invalid collision bounds and exact duplicate transform/collider groups.
- src/world/DebugTools.js provides ?debug=1, F3 collider bounds and F4 geometry audit.
- House materials, textures, geometries, the PMREM environment target, post-processing resources, timer and HUD interval now have disposal paths.
- Added tests/layout.test.js to verify floor elevations, room heights, step rise/tread, stair routing, door/window dimensions and room-zone assignment.

## Verification status

### Automated checks

The repository's validation workflow runs:

- node --check across the game and world modules.
- node --test tests/*.test.js for architectural constants and floor/stair/room mapping.

The latest CI result must be checked against the commit being delivered. A successful syntax/unit-test job does not prove that every route is playable or that every rendered surface is visually correct.

### Visual and gameplay checks not claimed

A manual full-browser walkthrough, screenshot sweep of every room, visual inspection from all facade sides and device-specific performance profiling were not available in this execution environment. No claim is made that every mesh intersection, visual seam, shadow artifact or collision edge case has been visually cleared.

The code-level geometry audit is a diagnostic aid, not a complete boolean mesh-intersection solver. It reports exact duplicate transform signatures and suspicious degenerate triangles, but overlapping walls, decorative mesh intersections and UV stretching still need rendered inspection.

## Remaining work

1. Run the published scene in a desktop browser and on the target phone. Inspect front/back/side facades, floor cutaways, every room, door swing arcs and both stair flights.
2. Verify player traversal manually from the entry, through all four room zones on each floor, up to the upper landing and down into the basement. Test both directions, reversing midway and closing doors while standing near them.
3. Inspect window/door reveals, corner joins, roof edge and ceiling opening for light leaks and z-fighting.
4. Profile draw calls, GPU memory, frame time and shadow quality on a representative mobile device.
5. Replace simplified procedural furniture/foliage with authored high-quality assets where they materially improve the scene. No scanned or photogrammetric assets have been added in this pass.
6. Consider a dedicated physics library or a robust swept capsule controller if the next gameplay phase introduces jumping, crouching, moving props or high-speed movement.

This audit records implemented code changes and automated checks separately from the manual visual QA that remains outstanding.