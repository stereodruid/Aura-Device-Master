# Aura Device Master v0.8.1

This maintenance release follows up on the ioBroker ghost-device report in issue #3.

## Changes

- When `forgetEndpoint` reports that a resource no longer exists and the main inventory has no legacy appliance ID, Aura now queries Amazon's secondary endpoint inventory.
- A legacy deletion is attempted only when that inventory returns exactly the same modern endpoint ID with a concrete `legacyAppliance.applianceId`.
- Device names are never used to authorize or target deletion.
- The behavior inventory's availability value is again preferred for the visible Online/Offline status; modern reachability remains the fallback.
- Endpoints confirmed to have no safe deletion path are displayed with an unknown status instead of a misleading Online state.
- Failed batch actions are logged once instead of duplicating the same CLI error.

## Permissions

No permissions were added. The extension still requests only `scripting` and the existing regional Amazon Alexa host permissions. It does not request `tabs` or `activeTab`.

## Install

- [Install from the Chrome Web Store](https://chromewebstore.google.com/detail/aura-device-master/ebfopagpcecfbmodklhlafplpdlohfgc)
- Manual package: `Aura-Device-Master-v0.8.1.zip`

The Chrome Web Store may continue to serve an earlier version until v0.8.1 completes Google's review.
