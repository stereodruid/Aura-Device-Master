import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import fs from "node:fs";
const code = fs.readFileSync(
  new URL("../chrome-extension/background.js", import.meta.url),
  "utf8",
);
function fixture({ status = "loading", injectionError = false } = {}) {
  let listener,
    timer,
    injections = 0,
    created = 0;
  const updated = new Set(),
    removed = new Set(),
    results = [];
  const event = (set) => ({
    addListener: (f) => set.add(f),
    removeListener: (f) => set.delete(f),
  });
  const chrome = {
    runtime: {
      id: "test",
      onMessage: {
        addListener: (f) => {
          listener = f;
        },
      },
    },
    scripting: {
      executeScript: async () => {
        injections++;
        if (injectionError) throw Error("blocked");
      },
    },
    tabs: {
      create: (_opts, cb) => {
        created++;
        cb({ id: 1 });
      },
      get: (_id, cb) => cb({ status }),
      onUpdated: event(updated),
      onRemoved: event(removed),
    },
  };
  vm.runInNewContext(code, {
    chrome,
    setTimeout: (fn) => {
      timer = fn;
      return 1;
    },
    clearTimeout: () => {},
  });
  return {
    open: (domain) =>
      listener({ type: "OPEN_MANAGER", domain }, { id: "test" }, (result) =>
        results.push(result),
      ),
    complete: () => [...updated].forEach((f) => f(1, { status: "complete" })),
    timeout: () => timer(),
    updated,
    removed,
    results,
    injections: () => injections,
    created: () => created,
  };
}
test("all selectable regions can display extension images", () => {
  const manifest = JSON.parse(
    fs.readFileSync(
      new URL("../chrome-extension/manifest.json", import.meta.url),
    ),
  );
  for (const host of manifest.host_permissions)
    assert(manifest.web_accessible_resources[0].matches.includes(host));
});
test("manifest requests only the permissions used by the extension", () => {
  const manifest = JSON.parse(
    fs.readFileSync(
      new URL("../chrome-extension/manifest.json", import.meta.url),
    ),
  );
  assert.deepEqual(manifest.permissions, ["scripting"]);
  assert.equal(manifest.permissions.includes("tabs"), false);
  assert.equal(manifest.permissions.includes("activeTab"), false);
  assert(manifest.host_permissions.every((host) => /amazon\.(?:de|com|co\.uk|fr|it|es|ca|com\.au|co\.jp|in|com\.br|com\.mx)\//.test(host)));
});
test("background injects once even if load events repeat", async () => {
  const f = fixture();
  f.open("amazon.de");
  f.complete();
  f.complete();
  await new Promise(setImmediate);
  assert.equal(f.injections(), 1);
  assert.equal(f.results[0].ok, true);
  assert.equal(f.updated.size, 0);
  assert.equal(f.removed.size, 0);
});
test("already loaded tab is handled, injection failure is returned", async () => {
  const f = fixture({ status: "complete", injectionError: true });
  f.open("amazon.de");
  await new Promise(setImmediate);
  assert.equal(f.results[0].ok, false);
});
test("background removes listeners on timeout and rejects unknown regions", () => {
  const f = fixture();
  f.open("amazon.de");
  f.timeout();
  assert.equal(f.results[0].ok, false);
  assert.equal(f.updated.size, 0);
  const invalid = fixture();
  invalid.open("example.com");
  assert.equal(invalid.created(), 0);
  assert.equal(invalid.results[0].ok, false);
});
