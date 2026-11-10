# Aura Device Master v0.9.0

This release implements group membership management (Issue #7) and adds the new Routines view with execution capabilities (Issue #8).

## What changed

### Group Membership Management (Issue #7)
- **View group members:** When an Alexa device group is selected, its current member devices are listed directly in the sidebar detail panel.
- **Add & remove devices:** Easily add available endpoints to an existing group or remove member devices with a single click.
- **Safe GraphQL mutations:** Additions and removals use the modern `updateDeviceGroup` GraphQL mutation with explicit `ADD` / `REMOVE` operations. Requests are sent one device at a time to prevent partial silent drops by Amazon.
- **Verified state:** The group's members are re-read immediately after mutations; changes are only confirmed once verified.
- **Safeguards preserved:** Aura's JSON backup and preview confirmation are required before membership changes are executed.

### Routines & Automations (Issue #8)
- **Routines view:** Dedicated view switch in the header to browse all active Alexa routines.
- **Search & inspect:** Filter routines by name, description, or voice trigger utterance (e.g. "Alexa, guten morgen").
- **Run routine:** Trigger any existing routine on a chosen Echo device after an explicit preview confirmation.
- **Safe placeholder substitution:** Automatically binds target Echo serial numbers and device types to ensure sequence execution runs smoothly.

### General Improvements
- Enhanced group device filtering to resolve members from modern GraphQL queries in addition to legacy provider lists.
- Full bilingual support (German / English) for all new group membership and routine actions.

## Permissions

No permissions were added. The extension continues to request only `scripting` and the existing regional Amazon Alexa host permissions. It does not request `tabs` or `activeTab`.

## Install

- [Install from the Chrome Web Store](https://chromewebstore.google.com/detail/aura-device-master/ebfopagpcecfbmodklhlafplpdlohfgc)
- Manual package: `Aura-Device-Master-v0.9.0.zip`

The Chrome Web Store may continue to serve an earlier version until v0.9.0 completes Google's review.
