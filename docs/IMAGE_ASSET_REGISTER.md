# Image Asset Register

Phase: Image Quality & Before/After Recovery V1  
Build ID: `compare-slider-v1-2026-08-04-01`
Date: 2026-08-04  

This register documents the image assets replaced or edited during this phase. The website continues to state that images are illustrative examples of typical work processes and expected results, not completed client projects.

## Source Notes

- No new third-party stock download was added in this phase.
- Reworked assets were derived from existing repository images and saved in place to preserve page layout, paths, alt text, and deployment behaviour.
- The original source/licence metadata for the pre-existing repository images was not present in the repository at the start of this phase.
- AI generation was not used in this phase. Before-state recovery images were created with local procedural image editing from matching after-state assets, then manually reviewed.
- New files were saved as optimized progressive JPGs to preserve existing browser compatibility and avoid broad markup changes.
- 2026-08-05 follow-up: the generated garden before image was removed because it did not meet the required natural visual quality. The garden/outdoor pair now uses the existing real-looking `assets/courtyard-before-entrance.jpg` image as the before state.

## Replaced Or Edited Assets

| Local file | Usage | Source basis | Licence / usage basis | AI-assisted? | Edit summary | Old size | New size |
|---|---|---|---|---|---|---:|---:|
| `assets/painting-before-matched.jpg` | Homepage and modal painting before image | Existing repository asset `assets/apartment-wall-refresh.jpg` | Existing project asset; original source not documented | No | Replaced the artificial wall-mark edit with a real renovation-room photo showing patching and preparation. | 276,854 B | 197,396 B |
| `assets/finished-room-1.jpg` | Homepage hero, painting after image, gallery | Existing repository asset | Existing project asset; original source not documented | No | Mild contrast, colour and sharpness optimization for clearer finished state. | 208,500 B | 280,478 B |
| `assets/drywall-before-matched.jpg` | Homepage and modal drywall before image | Existing repository asset `assets/painting-wall-repairs-spackle-smoothing.jpg` | Existing project asset; original source not documented | No | Replaced the artificial wall-mark edit with a real close-up wall repair and smoothing photo. | 193,581 B | 153,151 B |
| `assets/finished-room-2.jpg` | Drywall after image and gallery | Existing repository asset | Existing project asset; original source not documented | No | Mild contrast, colour and sharpness optimization for clearer finished state. | 147,763 B | 197,962 B |
| `assets/courtyard-before-entrance.jpg` | Homepage and modal garden before image | Existing repository asset | Existing project asset; original source not documented | No | Replaced the artificial garden before image with a more credible overgrown Sopron courtyard image. | Existing | Existing |
| `assets/courtyard-garden-1.jpg` | Garden after image, homepage service imagery, gallery | Existing repository asset | Existing project asset; original source not documented | No | Mild contrast, colour and sharpness optimization for clearer maintained-garden result. | 311,705 B | 401,576 B |
| `assets/airbnb-before-turnover-matched.jpg` | Homepage and modal Airbnb before image | Existing repository asset `assets/cleaning-services-move-out-room.jpg` | Existing project asset; original source not documented | No | Replaced the too-subtle same-room edit with a real empty move-out room photo for a clearer turnover story. | 256,529 B | 130,087 B |
| `assets/airbnb-living-room.jpg` | Airbnb after image, foreign-owner support imagery, gallery | Existing repository asset | Existing project asset; original source not documented | No | Mild contrast, colour and sharpness optimization for clearer guest-ready state. | 194,985 B | 265,440 B |
| `assets/office-before-touchup-matched.jpg` | Homepage and modal office before image | Existing repository asset `assets/office-process-wall-touchup.jpg` | Existing project asset; original source not documented | No | Replaced the artificial scuff edit with a real office wall touch-up process photo. | 244,799 B | 178,938 B |
| `assets/office-finished-1.jpg` | Office after image, foreign-owner support imagery, gallery | Existing repository asset | Existing project asset; original source not documented | No | Mild contrast, colour and sharpness optimization for clearer finished office state. | 173,263 B | 237,322 B |
| `assets/handyman-before-matched.jpg` | Homepage and modal handyman before image | Existing repository asset `assets/handyman-services-hero-drilling.jpg` | Existing project asset; original source not documented | No | Replaced the artificial bedroom defect edit with a real wall drilling/fixing photo. | 221,900 B | 266,064 B |
| `assets/airbnb-bedroom.jpg` | Handyman after image, Airbnb gallery | Existing repository asset | Existing project asset; original source not documented | No | Mild contrast, colour and sharpness optimization for clearer handover-ready state. | 169,410 B | 228,000 B |
| `assets/garden-maintenance-hero-garden.jpg` | Garden Maintenance EN/HU hero and social image | Existing repository asset derived from `assets/courtyard-garden-3.jpg` | Existing project asset; original source not documented | No | Replaced foreign-looking modern house with Sopron-style apartment courtyard greenery. | 547,883 B | 504,689 B |
| `assets/property-maintenance-drywall-sanding.jpg` | Homepage drywall service card and service-page support imagery | Existing repository asset | Existing project asset; original source not documented | No | Optimized contrast, colour and sharpness for local homepage usage. | 129,734 B | 166,605 B |
| `assets/handyman-services-wall-fixtures.jpg` | Homepage handyman service card and handyman service imagery | Existing repository asset | Existing project asset; original source not documented | No | Optimized contrast, colour and sharpness for local homepage usage. | 87,245 B | 119,911 B |

## Before / After Pair Register

| Pair | Before asset | After asset | Recovery decision |
|---|---|---|---|
| Painting / wall repair | `assets/painting-before-matched.jpg` | `assets/finished-room-1.jpg` | Real renovation-room before photo with patched walls; after remains a clean Sopron apartment-style finish. |
| Drywall / ceiling | `assets/drywall-before-matched.jpg` | `assets/finished-room-2.jpg` | Real wall smoothing before detail; after shows a clean paint-ready room. |
| Garden / outdoor | `assets/courtyard-before-entrance.jpg` | `assets/courtyard-garden-1.jpg` | Replaced the artificial garden before image with a more credible overgrown Sopron courtyard before image. |
| Airbnb / tenant turnover | `assets/airbnb-before-turnover-matched.jpg` | `assets/airbnb-living-room.jpg` | Real empty move-out room before; after shows a furnished, guest-ready apartment interior. |
| Office touch-up | `assets/office-before-touchup-matched.jpg` | `assets/office-finished-1.jpg` | Real wall touch-up process before; after shows a tidy office/representative room. |
| Handyman / small fixes | `assets/handyman-before-matched.jpg` | `assets/airbnb-bedroom.jpg` | Real wall drilling/fixing before; after shows a tidy prepared apartment room. |

## 2026-08-08 Before / After Visual Recovery V2

Baseline commit: `4df087a8641ff02b8f8e6d84b09d483536fe99de`

Backup branch: `backup-before-before-after-recovery-v2`

This pass replaced weak or nearly identical before states with stronger same-scene illustrative edits. No new third-party stock downloads were added. The edited before images are derived from the corresponding existing after image so that room geometry, camera position, windows, doors, radiators, flooring and fixed furniture stay aligned. The images remain illustrative examples only and are not presented as completed client projects.

| Local file | Component/page | Source platform / source URL / creator | Usage basis | AI-assisted? | What changed | Final dimensions | Final file size |
|---|---|---|---|---|---|---:|---:|
| `assets/painting-before-matched.jpg` | Homepage EN/HU transformation card, work example card, project modal and full comparison | Existing repository asset `assets/finished-room-1.jpg`; original source URL and creator not present in repository | Existing project asset, edited locally for same-scene illustrative comparison | No | Added visible wall cracks, uneven old paint, repair patches, protective floor/furniture covering and masking tape while preserving the same Sopron apartment room geometry. | 1600x1067 | 269,657 B |
| `assets/drywall-before-matched.jpg` | Homepage EN/HU work example card, project modal and full comparison | Existing repository asset `assets/finished-room-2.jpg`; original source URL and creator not present in repository | Existing project asset, edited locally for same-scene illustrative comparison | No | Added unfinished drywall seams, repair patches, cracks and protective covering while preserving the same room, window, radiator and floor alignment. | 1600x1067 | 198,051 B |
| `assets/airbnb-before-turnover-matched.jpg` | Homepage EN/HU transformation card, situation card, work example card, project modal and full comparison | Existing repository asset `assets/airbnb-living-room.jpg`; original source URL and creator not present in repository | Existing project asset, edited locally for same-scene illustrative comparison | No | Added guest-left soft furnishings, used cups, a small bin and wall marks while preserving the same living room composition. | 1600x1067 | 249,191 B |
| `assets/office-before-touchup-matched.jpg` | Homepage EN/HU situation card, work example card, project modal and full comparison | Existing repository asset `assets/office-finished-1.jpg`; original source URL and creator not present in repository | Existing project asset, edited locally for same-scene illustrative comparison | No | Added central wall marks, desk/table clutter, papers and a less visitor-ready office impression while preserving the same office geometry. | 1600x1067 | 223,903 B |
| `assets/handyman-before-matched.jpg` | Homepage EN/HU situation card, work example card, project modal and full comparison | Existing repository asset `assets/airbnb-bedroom.jpg`; original source URL and creator not present in repository | Existing project asset, edited locally for same-scene illustrative comparison | No | Added a loose curtain rail, mounting holes, small wall marks and a less prepared handover state while preserving the same bedroom composition. | 1600x1067 | 213,252 B |

## 2026-08-08 Pair Review

| Pair | Decision | Reason |
|---|---|---|
| Painting / wall repair | Replaced | Previous before state was too close to the after state. The new pair keeps the same room and shows visible cracks, repair preparation and protective covering. |
| Drywall / ceiling | Replaced | Previous before state did not clearly show an unfinished surface. The new pair keeps the same room and shows seams, cracks and paint-ready preparation. |
| Garden / outdoor | Retained | The pair already communicates neglected courtyard to maintained courtyard clearly, with a believable Sopron-style outdoor setting. |
| Airbnb / tenant turnover | Replaced | Previous before state was nearly identical to the after state. The new pair keeps the same living room and shows a guest-left condition before cleaning and preparation. |
| Office / representative space | Replaced | Previous before state was too subtle. The new pair keeps the same office and adds visible wall marks and untidy work surfaces. |
| Small fixes / handover | Replaced | Previous before state was too subtle. The new pair keeps the same bedroom and shows a loose fitting and small wall defects before handover. |
