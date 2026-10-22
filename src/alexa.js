export const deviceName = (d) =>
  d.displayName || d.friendlyNameObject?.value?.text || d.id;
export const deviceType = (d) =>
  String(
    d.providerData?.deviceType ||
      d.deviceType ||
      d.icon?.value ||
      d.deviceFamily ||
      "UNKNOWN",
  ).toUpperCase();
export const isGroup = (d) => d.providerData?.categoryType === "GROUP";
export const isEcho = (d) =>
  [
    d.providerData?.deviceType,
    d.providerData?.categoryType,
    d.deviceType,
    d.deviceFamily,
  ].some((value) =>
    /^(ALEXA_VOICE_ENABLED|ECHO(?:_.*)?|KNIGHT|ROOK)$/i.test(
      String(value || ""),
    ),
  ) || /Amazon (intelligentes Ger|smart device)/i.test(d.description || "");
export const isProtected = (d) =>
  isGroup(d) || isEcho(d) || /amazon/i.test(d.manufacturerName || "");
export const source = (d) => {
  const text =
    `${d.description || ""} ${d.manufacturerName || ""} ${deviceName(d)}`.toLowerCase();
  if (text.includes("home assistant")) return "Home Assistant";
  if (/io\.?broker/.test(text)) return "ioBroker";
  if (text.includes("homey")) return "Homey";
  return isEcho(d) || text.includes("amazon") ? "Amazon" : "Andere";
};
export const reachability = (d) => {
  if (d._admDeleteUnavailable) return "Unbekannt";
  const behaviorStatus = {
    ONLINE: "Online",
    AVAILABLE: "Online",
    OFFLINE: "Offline",
    UNAVAILABLE: "Offline",
    UNREACHABLE: "Offline",
  }[d.availability];
  if (behaviorStatus) return behaviorStatus;
  return { OK: "Online", UNAVAILABLE: "Offline" }[d._admReachability] || "Unbekannt";
};
export const enablement = (d) =>
  ({ ENABLED: "Aktiviert", DISABLED_BY_CUSTOMER: "Deaktiviert" })[
    d._admEnablement
  ] || "Unbekannt";
export const canAct = (d, action) =>
  ["on", "off"].includes(action)
    ? Boolean(d._admApplianceId) && !isGroup(d) && !isEcho(d)
    : action === "delete"
      ? !d._admDeleteUnavailable && Boolean(d._admEndpointId || d._admApplianceId)
      : action === "groupCreate"
        ? Boolean(d._admEndpointId) && !isGroup(d)
        : action === "groupRename"
          ? Boolean(d._admGroupId) && isGroup(d)
      : Boolean(d._admEndpointId);
export function toggleVisible(selected, visible) {
  const next = new Set(selected);
  const all = visible.length > 0 && visible.every((d) => next.has(d.id));
  for (const d of visible) all ? next.delete(d.id) : next.add(d.id);
  return next;
}
export function filterDevices(devices, filters) {
  const {
    search = "",
    type = "",
    status = "",
    origin = "",
    group = "",
    hideProtected = false,
    onlyDeletable = false,
  } = filters;
  const members = new Set(
    devices.find((d) => d.id === group)?.providerData?.groupMembers || [],
  );
  return devices.filter((d) => {
    if (hideProtected && (isProtected(d) || !canAct(d, "delete"))) return false;
    if (onlyDeletable && (!canAct(d, "delete") || isProtected(d))) return false;
    if (type && deviceType(d) !== type) return false;
    if (origin && source(d) !== origin) return false;
    if (group && d.id !== group && !members.has(d.id)) return false;
    if (status === "Geschützt" && !isProtected(d) && canAct(d, "delete"))
      return false;
    if (status === "Ohne Endpoint" && d._admEndpointId) return false;
    if (status === "Echos" && !isEcho(d)) return false;
    if (status === "Gruppen" && !isGroup(d)) return false;
    if (
      ["Online", "Offline", "Unbekannt"].includes(status) &&
      reachability(d) !== status
    )
      return false;
    if (
      ["Aktiviert", "Deaktiviert"].includes(status) &&
      enablement(d) !== status
    )
      return false;
    const haystack = [
      deviceName(d),
      d.description,
      deviceType(d),
      source(d),
      d.id,
      d._admEndpointId,
      d._admApplianceId,
    ]
      .join(" ")
      .toLowerCase();
    return search
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .every((word) => haystack.includes(word));
  });
}

export const LIST_QUERY = `query getDevicesBaseData {
  allDevices: listEndpoints(listEndpointsInput: { includeHouseholdDevices: true }) {
    endpoints {
      endpointId: id enablement
      legacyAppliance { applianceId }
      legacyIdentifiers { chrsIdentifier { entityId } }
      friendlyNameObject { value { text } }
      manufacturer { value { text } }
      displayCategories { primary { value } }
      features { name properties { name ... on Reachability { reachabilityStatusValue } } }
    }
  }
}`;
export const ENABLE_QUERY = `mutation setEndpointEnablement($input: SetEndpointEnablementInput!) {
  setEndpointEnablement(input: $input) { endpoint { endpointId: id enablement } error { __typename } }
}`;
const DELETE_QUERY =
  "mutation forgetEndpoint($input: ForgetEndpointInput!) { forgetEndpoint(forgetEndpointInput: $input) { endpointId } }";
export const LIST_GROUPS_QUERY = `query listDeviceGroups {
  listDeviceGroups(listDeviceGroupsInput: {}) {
    deviceGroups {
      id
      friendlyName { value { text } }
      memberDevices { items { id friendlyNameObject { value { text } } } }
    }
  }
}`;
export const LEGACY_ENDPOINTS_QUERY = `query getLegacyEndpointData {
  endpoints(endpointsQueryParams: { paginationParams: { disablePagination: true } }) {
    items {
      id
      enablement
      legacyAppliance { applianceId }
    }
  }
}`;
export const CREATE_GROUP_QUERY = `mutation createDeviceGroup($in: CreateDeviceGroupInput!) {
  createDeviceGroup(createDeviceGroupInput: $in) { __typename }
}`;
export const RENAME_ENDPOINT_QUERY = `mutation setEndpointFriendlyName($in: SetEndpointFriendlyNameInput!) {
  setEndpointFriendlyName(input: $in) { __typename }
}`;

const missingResourcePattern =
  /\b(resource|endpoint)\b.*\b(does not exist|not found|no longer exists)\b/i;

export const isMissingResourceError = (error) =>
  Boolean(
    missingResourcePattern.test(String(error?.message || "")) ||
      error?.graphQLErrors?.some((entry) =>
        missingResourcePattern.test(String(entry?.message || "")),
      ),
  );

export function mergeDevices(entities, endpoints) {
  if (!Array.isArray(entities) || !Array.isArray(endpoints))
    throw new Error("Unvollständige Gerätedaten.");
  const byKey = new Map();
  const all = new Map();
  for (const ep of endpoints) {
    if (!ep?.endpointId) throw new Error("Endpoint ohne eindeutige ID.");
    if (all.has(ep.endpointId)) throw new Error("Doppelte Endpoint-ID.");
    all.set(ep.endpointId, ep);
    for (const key of new Set(
      [
        ep.endpointId,
        ep.legacyIdentifiers?.chrsIdentifier?.entityId,
        ep.endpointId.replace(/^amzn1\.alexa\.endpoint\./, ""),
      ].filter(Boolean),
    )) {
      if (byKey.has(key) && byKey.get(key) !== ep)
        throw new Error("Mehrdeutige Gerätezuordnung. Laden abgebrochen.");
      byKey.set(key, ep);
    }
  }
  const matched = new Set(),
    seen = new Set();
  const attach = (d, ep) => ({
    ...d,
    _admEndpointId: ep?.endpointId || null,
    _admApplianceId: ep?.legacyAppliance?.applianceId || null,
    _admEnablement: ep?.enablement || null,
    _admReachability:
      ep?.features
        ?.find((f) => f?.name === "connectivity")
        ?.properties?.find(
          (p) => p?.reachabilityStatusValue || p?.name === "reachability",
        )?.reachabilityStatusValue || null,
  });
  const result = entities.map((d) => {
    if (!d?.id || seen.has(d.id))
      throw new Error("Fehlende oder doppelte Geräte-ID.");
    seen.add(d.id);
    const ep = byKey.get(d.id);
    if (ep) matched.add(ep.endpointId);
    return attach(d, ep);
  });
  for (const ep of all.values())
    if (!matched.has(ep.endpointId)) {
      result.push(
        attach(
          {
            id: ep.endpointId,
            displayName:
              ep.friendlyNameObject?.value?.text || "Unbekannter Endpoint",
            description: "GraphQL Skill Endpoint",
            manufacturerName: ep.manufacturer?.value?.text || "",
            providerData: {
              categoryType: ep.displayCategories?.primary?.value || "ENDPOINT",
              deviceType: ep.displayCategories?.primary?.value || "ENDPOINT",
            },
            availability: "UNKNOWN",
          },
          ep,
        ),
      );
    }
  return result;
}

const normalizedName = (value) =>
  String(value || "").trim().toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");

export function attachDeviceGroups(devices, groups = []) {
  if (!Array.isArray(groups)) return devices;
  const byId = new Map(groups.filter((g) => g?.id).map((g) => [g.id, g]));
  const byName = new Map();
  for (const group of groups) {
    const key = normalizedName(group?.friendlyName?.value?.text);
    if (!key) continue;
    const matches = byName.get(key) || [];
    matches.push(group);
    byName.set(key, matches);
  }
  return devices.map((device) => {
    if (!isGroup(device)) return device;
    const direct = byId.get(device.id) || byId.get(device._admEndpointId);
    const matches = byName.get(normalizedName(deviceName(device))) || [];
    const group = direct || (matches.length === 1 ? matches[0] : null);
    if (!group) return device;
    return {
      ...device,
      _admGroupId: group.id,
      _admGroupMemberEndpointIds:
        group.memberDevices?.items?.map((item) => item?.id).filter(Boolean) || [],
    };
  });
}

export function enrichEndpointDetails(endpoints, details = []) {
  if (!Array.isArray(endpoints) || !Array.isArray(details)) return endpoints;
  const byId = new Map(details.filter((item) => item?.id).map((item) => [item.id, item]));
  return endpoints.map((endpoint) => {
    const detail = byId.get(endpoint?.endpointId);
    if (!detail) return endpoint;
    return {
      ...endpoint,
      enablement: endpoint.enablement || detail.enablement,
      legacyAppliance:
        endpoint.legacyAppliance?.applianceId
          ? endpoint.legacyAppliance
          : detail.legacyAppliance || endpoint.legacyAppliance,
    };
  });
}

export function resolveEcho(d, devices) {
  if (!Array.isArray(devices)) throw new Error("Echo-Geräteliste fehlt.");
  const identifiers = new Set(
    [
      d.serialNumber,
      d.providerData?.serialNumber,
      d.deviceAccountId,
      d.providerData?.deviceAccountId,
      d.id,
      d._admEndpointId,
    ].filter(Boolean),
  );
  let exact = devices.filter(
    (x) =>
      identifiers.has(x.serialNumber) || identifiers.has(x.deviceAccountId),
  );
  // Amazon's smart-home endpoint IDs are often unrelated to the Echo serial.
  // A unique, exact account name is the only safe fallback available here.
  if (exact.length === 0) {
    const name = deviceName(d).trim().toLocaleLowerCase();
    exact = devices.filter(
      (x) => String(x.accountName || "").trim().toLocaleLowerCase() === name,
    );
  }
  if (exact.length !== 1)
    throw new Error(
      "Echo nicht eindeutig über eine Geräte-ID zugeordnet. Keine Sprachausgabe gesendet.",
    );
  const match = exact[0];
  if (!match.serialNumber || !match.deviceType || !match.deviceOwnerCustomerId)
    throw new Error("Vollständige Echo-Zieldaten fehlen.");
  return match;
}

export function createAlexaClient(fetchImpl = (...args) => fetch(...args)) {
  async function request(url, options = {}) {
    const res = await fetchImpl(url, {
      ...options,
      credentials: "same-origin",
      signal: AbortSignal.timeout(20000),
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
    if (!res.ok) {
      const error = new Error(
        res.status === 429
          ? "Amazon begrenzt die Anfragen. Bitte später neu laden."
          : `Amazon-Anfrage fehlgeschlagen (HTTP ${res.status}).`,
      );
      error.status = res.status;
      throw error;
    }
    const text = await res.text();
    if (!text.trim()) return null;
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      throw new Error("Amazon lieferte kein JSON. Anmeldung prüfen.");
    }
    if (body?.errors?.length || body?.error || body?.errorMessage) {
      const graphQLErrors = Array.isArray(body?.errors) ? body.errors : [];
      const message =
        graphQLErrors.find((entry) => entry?.message)?.message ||
        body?.errorMessage ||
        (typeof body?.error === "string" ? body.error : body?.error?.message) ||
        "Amazon hat die Anfrage abgelehnt.";
      const error = new Error(message);
      error.graphQLErrors = graphQLErrors;
      error.code =
        graphQLErrors.find((entry) => entry?.extensions?.code)?.extensions?.code ||
        body?.error?.code;
      throw error;
    }
    return body;
  }
  const gqlVariables = (query, operationName, variables) =>
    request("/nexus/v1/graphql", {
      method: "POST",
      body: JSON.stringify({
        query,
        operationName,
        ...(variables ? { variables } : {}),
      }),
    });
  const gql = (query, operationName, input) =>
    gqlVariables(query, operationName, input ? { input } : undefined);
  const listGroups = async () => {
    const body = await gqlVariables(LIST_GROUPS_QUERY, "listDeviceGroups");
    const groups = body?.data?.listDeviceGroups?.deviceGroups;
    if (!Array.isArray(groups)) throw new Error("Gruppendaten fehlen.");
    return groups;
  };
  const listLegacyEndpointDetails = async () => {
    const body = await gqlVariables(
      LEGACY_ENDPOINTS_QUERY,
      "getLegacyEndpointData",
    );
    const items = body?.data?.endpoints?.items;
    if (!Array.isArray(items)) throw new Error("Legacy-Endpunktdaten fehlen.");
    return items;
  };
  return {
    async load() {
      const entities = await request(
        "/api/behaviors/entities?skillId=amzn1.ask.1p.smarthome",
      );
      const data = await gql(LIST_QUERY, "getDevicesBaseData");
      let endpoints = data?.data?.allDevices?.endpoints;
      try {
        endpoints = enrichEndpointDetails(endpoints, await listLegacyEndpointDetails());
      } catch {
        // The main inventory remains usable if this optional legacy lookup changes.
      }
      const devices = mergeDevices(entities, endpoints);
      try {
        return attachDeviceGroups(devices, await listGroups());
      } catch {
        return devices;
      }
    },
    listGroups,
    listLegacyEndpointDetails,
    async createGroup(name, memberDeviceIds) {
      const friendlyName = String(name || "").trim();
      const ids = [...new Set(memberDeviceIds || [])];
      if (!friendlyName || !ids.length || ids.some((id) => !id))
        throw new Error("Gruppenname und eindeutige Mitglieder sind erforderlich.");
      const before = await listGroups();
      if (
        before.some(
          (group) =>
            normalizedName(group?.friendlyName?.value?.text) ===
            normalizedName(friendlyName),
        )
      )
        throw new Error("Eine Gruppe mit diesem Namen ist bereits vorhanden.");
      const body = await gqlVariables(CREATE_GROUP_QUERY, "createDeviceGroup", {
        in: { friendlyName, memberDeviceIds: ids },
      });
      if (!body?.data?.createDeviceGroup)
        throw new Error("Amazon hat die Gruppenerstellung nicht bestätigt.");
      const groups = await listGroups();
      const matches = groups.filter(
        (group) => normalizedName(group?.friendlyName?.value?.text) === normalizedName(friendlyName),
      );
      const verified = matches.find((group) => {
        const actual = new Set(
          group.memberDevices?.items?.map((item) => item?.id).filter(Boolean) || [],
        );
        return ids.every((id) => actual.has(id));
      });
      if (!verified)
        throw new Error("Die neue Gruppe konnte bei der Nachkontrolle nicht bestätigt werden.");
      return verified;
    },
    async renameGroup(groupId, name) {
      const friendlyName = String(name || "").trim();
      if (!groupId || !friendlyName)
        throw new Error("Gruppe und neuer Name sind erforderlich.");
      if (/[-\x00-\x1f\x7f]/.test(friendlyName))
        throw new Error("Der Gruppenname enthält Zeichen, die Alexa nicht sprechen kann.");
      const before = await listGroups();
      if (!before.some((group) => group.id === groupId))
        throw new Error("Die ausgewählte Gruppe wurde nicht mehr gefunden.");
      if (
        before.some(
          (group) =>
            group.id !== groupId &&
            normalizedName(group?.friendlyName?.value?.text) ===
              normalizedName(friendlyName),
        )
      )
        throw new Error("Eine andere Gruppe verwendet diesen Namen bereits.");
      const body = await gqlVariables(RENAME_ENDPOINT_QUERY, "setEndpointFriendlyName", {
        in: { endpointId: groupId, friendlyName },
      });
      if (!body?.data?.setEndpointFriendlyName)
        throw new Error("Amazon hat die Umbenennung nicht bestätigt.");
      const groups = await listGroups();
      const verified = groups.find(
        (group) =>
          group.id === groupId &&
          group?.friendlyName?.value?.text === friendlyName,
      );
      if (!verified)
        throw new Error("Der neue Gruppenname konnte bei der Nachkontrolle nicht bestätigt werden.");
      return verified;
    },
    async mutate(d, action) {
      if (!canAct(d, action))
        throw new Error("Keine geeignete Ziel-ID vorhanden.");
      if (action === "delete") {
        if (d._admEndpointId) {
          try {
            const body = await gql(DELETE_QUERY, "forgetEndpoint", {
              endpointId: d._admEndpointId,
            });
            if (body?.data?.forgetEndpoint?.endpointId !== d._admEndpointId)
              throw new Error("Löschung von Amazon nicht bestätigt.");
          } catch (error) {
            if (!isMissingResourceError(error)) throw error;
            let applianceId = d._admApplianceId;
            if (!applianceId) {
              try {
                const exact = (await listLegacyEndpointDetails()).filter(
                  (item) => item?.id === d._admEndpointId,
                );
                if (exact.length === 1)
                  applianceId = exact[0]?.legacyAppliance?.applianceId || null;
              } catch (lookupError) {
                if ([429, 401, 403].includes(lookupError.status)) throw lookupError;
              }
            }
            if (!applianceId) {
              const unavailable = new Error(
                "Amazon listet diesen Endpoint noch auf, findet aber keine löschbare Ressource. Keine sichere Legacy-ID für einen Rückfall vorhanden.",
              );
              unavailable.code = "NO_SAFE_DELETE_ID";
              throw unavailable;
            }
            await request(
              "/api/phoenix/appliance/" +
                encodeURIComponent(applianceId),
              { method: "DELETE" },
            );
          }
        } else
          await request(
            "/api/phoenix/appliance/" + encodeURIComponent(d._admApplianceId),
            { method: "DELETE" },
          );
      } else {
        const target = action === "enable" ? "ENABLED" : "DISABLED_BY_CUSTOMER";
        const body = await gql(ENABLE_QUERY, "setEndpointEnablement", {
          endpointId: d._admEndpointId,
          enablement: target,
        });
        const result = body?.data?.setEndpointEnablement;
        if (
          result?.error ||
          result?.endpoint?.endpointId !== d._admEndpointId ||
          result?.endpoint?.enablement !== target
        )
          throw new Error("Zielstatus von Amazon nicht bestätigt.");
      }
    },
    async power(d, on) {
      if (!canAct(d, "on"))
        throw new Error("Keine sichere Appliance-ID zum Schalten vorhanden.");
      const body = await request("/api/phoenix/state", {
        method: "POST",
        body: JSON.stringify({
          stateRequests: [
            {
              entityId: d._admApplianceId,
              entityType: "APPLIANCE",
              parameters: { action: on ? "turnOn" : "turnOff" },
            },
          ],
        }),
      });
      if (body?.controlResponses?.some((r) => r.code && r.code !== "SUCCESS"))
        throw new Error("Amazon hat den Schaltbefehl nicht bestätigt.");
    },
    async sendAlexaAction(d, text, mode = "speak", locale = "de-DE") {
      if (!text.trim()) throw new Error("Bitte einen Text eingeben.");
      if (!["speak", "announce", "command"].includes(mode))
        throw new Error("Unbekannte Alexa-Aktion.");
      const csrf =
        typeof document === "undefined"
          ? ""
          : document.cookie.match(/(?:^|;\s*)csrf=([^;]+)/i)?.[1] || "";
      const data = await request("/api/devices-v2/device?cached=true", {
        headers: { csrf },
      });
      const target = resolveEcho(d, data?.devices);
      const base = {
        deviceType: target.deviceType,
        deviceSerialNumber: target.serialNumber,
        locale,
        customerId: target.deviceOwnerCustomerId,
      };
      const targetPayload = {
        customerId: target.deviceOwnerCustomerId,
        devices: [
          {
            deviceSerialNumber: target.serialNumber,
            deviceTypeId: target.deviceType,
          },
        ],
      };
      const operations = {
        speak: {
          type: "Alexa.Speak",
          operationPayload: {
            ...base,
            textToSpeak: text.trim(),
            target: targetPayload,
            skillId: "amzn1.ask.1p.saysomething",
          },
        },
        announce: {
          type: "AlexaAnnouncement.Announcement",
          operationPayload: {
            ...base,
            expireAfter: "PT5S",
            content: [
              {
                locale,
                display: { title: "Aura Device Master", body: text.trim() },
                speak: { type: "text", value: text.trim() },
              },
            ],
            target: targetPayload,
            skillId: "amzn1.ask.1p.routines.messaging",
          },
        },
        command: {
          type: "Alexa.TextCommand",
          operationPayload: {
            ...base,
            text: text.trim(),
            skillId: "amzn1.ask.1p.tellalexa",
          },
        },
      };
      await request("/api/behaviors/preview", {
        method: "POST",
        headers: { csrf },
        body: JSON.stringify({
          behaviorId: "PREVIEW",
          status: "ENABLED",
          sequenceJson: JSON.stringify({
            "@type": "com.amazon.alexa.behaviors.model.Sequence",
            startNode: {
              "@type":
                "com.amazon.alexa.behaviors.model.SerialNode",
              nodesToExecute: [
                {
                  "@type":
                    "com.amazon.alexa.behaviors.model.OpaquePayloadOperationNode",
                  ...operations[mode],
                },
              ],
            },
          }),
        }),
      });
    },
    async speak(d, text, locale = "de-DE") {
      return this.sendAlexaAction(d, text, "speak", locale);
    },
  };
}

export async function runBatch(
  client,
  list,
  action,
  {
    allowProtectedIds = [],
    logger = () => {},
    delay = (ms) => new Promise((r) => setTimeout(r, ms)),
    onProgress = () => {},
    shouldCancel = () => false,
  } = {},
) {
  if (!["delete", "enable", "disable"].includes(action))
    throw new Error("Unbekannte Aktion.");
  const allowed = new Set(allowProtectedIds);
  if (list.some((d) => isProtected(d) && !allowed.has(d.id)))
    throw new Error("Geschützte Ziele müssen einzeln freigegeben werden.");
  if (!list.length || list.some((d) => !canAct(d, action)))
    throw new Error("Auswahl enthält keine oder ungeeignete Ziele.");
  const unique = [
    ...new Map(
      list.map((d) => [d._admEndpointId || d._admApplianceId, d]),
    ).values(),
  ];
  const results = [];
  let stopped = false;
  let cancelled = false;
  onProgress({ completed: 0, total: unique.length, current: null });
  for (let index = 0; index < unique.length; index++) {
    const d = unique[index];
    if (shouldCancel()) {
      cancelled = true;
      for (const remaining of unique.slice(index))
        results.push({ device: remaining, error: "Vom Benutzer abgebrochen.", skipped: true });
      break;
    }
    if (stopped) {
      results.push({
        device: d,
        error: "Nach Anfragelimit oder Anmeldefehler übersprungen.",
        skipped: true,
      });
      continue;
    }
    onProgress({ completed: index, total: unique.length, current: deviceName(d) });
    try {
      const target = action === "enable" ? "ENABLED" : "DISABLED_BY_CUSTOMER";
      if (action === "delete" || d._admEnablement !== target)
        await client.mutate(d, action);
      results.push({ device: d });
      logger(`${deviceName(d)}: Nachkontrolle ausstehend.`);
    } catch (error) {
      results.push({
        device: d,
        error: error.message,
        errorCode: error.code,
        logged: true,
      });
      logger(`${deviceName(d)}: ${error.message}`, "error");
      stopped = [429, 401, 403].includes(error.status);
    }
    onProgress({ completed: index + 1, total: unique.length, current: deviceName(d) });
    if (!stopped) await delay(800);
  }
  if (stopped) return { results, devices: null, verified: false, cancelled };
  let devices;
  try {
    devices = await client.load();
  } catch {
    return { results, devices: null, verified: false, cancelled };
  }
  for (const result of results) {
    const d = result.device;
    const matches = devices.filter((x) =>
      d._admEndpointId
        ? x._admEndpointId === d._admEndpointId
        : x._admApplianceId === d._admApplianceId,
    );
    // The behavior entity can outlive the modern endpoint; do not claim removal yet.
    const absent = !matches.length && !devices.some((x) => x.id === d.id);
    result.success =
      !result.error && !result.skipped &&
      (action === "delete"
        ? absent
        : matches.length > 0 &&
          matches.every(
            (x) =>
              x._admEnablement ===
              (action === "enable" ? "ENABLED" : "DISABLED_BY_CUSTOMER"),
          ));
  }
  return { results, devices, verified: true, cancelled };
}
