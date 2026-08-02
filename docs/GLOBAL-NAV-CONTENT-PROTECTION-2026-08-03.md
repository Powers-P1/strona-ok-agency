# Global navigation and content protection remediation

Status: in progress

## Scope and invariants

- [x] One opaque, route-independent navigation canvas on desktop and compact layouts.
- [x] One explicit dropdown alignment contract; route typography cannot change its layout.
- [x] Reuse the responsive art-mask system for authored scenes whose artwork crosses the copy area.
- [x] Keep scene-specific composition in HTML data, not one-off CSS overrides.
- [x] Improve the first About scene spacing without breaking the one-viewport scene contract.
- [x] Keep About annotations attached to visible tree/orb structure at desktop profiles.
- [x] Remove the redundant FAQ count label from source and guard against its return.
- [x] No new `!important`, no route-local navigation patches, no mobile hotspot regression.

## Reproduction ledger

- [x] Navigation: dropdown alignment and background at wide desktop, compact desktop and Safari-compatible computed styles.
- [x] Campaigns: opening copy protected from the branch/energy line.
- [x] Process: discovery copy protected from branches behind the heading and lead.
- [x] About: first-scene spacing, artwork treatment and authored hotspot anchors.
- [x] FAQ: redundant label absent; accordion still starts with the first real question.

## Implementation

- [x] Make the shared navigation canvas opaque and make dropdown alignment explicit.
- [x] Add a declarative `data-ok-safe-mask="always"` contract to responsive safety.
- [x] Opt Campaigns opening and Process discovery into that shared contract.
- [x] Remove the Campaigns rule that disables the shared mask.
- [x] Remove duplicate artwork layers and tune the About reading rhythm after screenshot review.
- [x] Preserve an exiting callout's coordinates during rapid A → B interaction.
- [x] Remove FAQ label and extend system checks.
- [x] Synchronize asset versions.

## Verification and release

- [x] Screenshot review: 2048x931, 1512x800, 1024x768 and 390x844 where applicable.
- [x] Navigation disclosure open/close interaction and clean console (Chromium and WebKit).
- [x] Target annotation geometry for Campaigns, Process and About at seven viewports.
- [x] Full 42-case annotation geometry matrix and affected-route placement-mask audit.
- [x] Quality, links, UI-system checks, build and `git diff --check`.
- [ ] Commit, PR, CI, merge and production deployment.
- [ ] Production smoke on the affected routes.
