# Aura Device Master v0.8.0

## What changed

- Create Alexa device groups from the currently selected endpoints.
- Rename existing Alexa groups through their exact group endpoint ID.
- Verify both group operations by reading the current group list back from Amazon.
- Select all filtered results instead of being limited to the current page.
- Process large enable, disable and delete selections in a visible queue that can be stopped between requests.
- Keep the existing safe stop on rate limits and authentication failures; no automatic retry loop was added.
- Mark endpoints that Amazon cannot safely delete and direct users to remove them from the source integration.

## Permissions

The package requests only `scripting` plus the existing regional Amazon Alexa host permissions. It does not request `tabs` or `activeTab`.

## Install

- [Install from the Chrome Web Store](https://chromewebstore.google.com/detail/aura-device-master/ebfopagpcecfbmodklhlafplpdlohfgc)
- Manual package: `Aura-Device-Master-v0.8.0.zip`

The Chrome Web Store may continue to serve v0.7.1 until the v0.8.0 package has completed Google's review.
