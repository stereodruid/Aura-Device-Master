# Aura Device Master v0.9.1

This release addresses all three items reported in Issue #9 for the Routines view.

## What changed

- **Fixed 100-routine limit:** Raised the `/api/behaviors/v2/automations` request limit (`?limit=2000`) so accounts with more than 100 routines load their complete list instead of being truncated by Amazon's default cap.
- **Show disabled routines as well:** Disabled routines are no longer silently dropped. They are listed with their actual status (`Enabled` / `Disabled`) and can be filtered via the new status selector.
- **Routine details panel:** Selecting a routine in the Routines view populates the right sidebar with its status, routine ID, all triggers, and a readable step-by-step breakdown of the actions inside `sequence` (`SerialNode` / `ParallelNode` steps, speech, volume, waits, and resolved smart-home targets).
- **Routines JSON export:** Added a JSON export button in the Routines toolbar to back up all routines (`alexa-routines-<timestamp>.json`) plus a single-routine JSON export button in the routine detail panel, preserving Amazon's full raw automation payloads.

## Permissions

No permissions were added. The extension continues to request only `scripting` and the existing regional Amazon Alexa host permissions. It does not request `tabs` or `activeTab`.

## Install

- [Install from the Chrome Web Store](https://chromewebstore.google.com/detail/aura-device-master/ebfopagpcecfbmodklhlafplpdlohfgc)
- Manual package: `Aura-Device-Master-v0.9.1.zip`

The Chrome Web Store may continue to serve an earlier version until v0.9.1 completes Google's review.
