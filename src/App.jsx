import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Trash2,
  RefreshCw,
  Download,
  Terminal,
  Shield,
  Speaker,
  Power,
  X,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Home,
  Layers,
  AlertTriangle,
  HelpCircle,
  Circle,
  PowerOff,
  Send,
  Moon,
  Projector,
  Tv,
  Thermometer,
  Radio,
  LockKeyhole,
  Fan,
  Box,
  BellRing,
  ThermometerSun,
  Activity,
  DoorOpen,
  Warehouse,
  Snowflake,
  AirVent,
  Droplets,
  Heater,
  Bot,
  WashingMachine,
  Wind,
  Utensils,
  Refrigerator,
  Microwave,
  CookingPot,
  Coffee,
  Router,
  ToggleLeft,
  Lightbulb,
  PlugZap,
  Camera,
  Blinds,
  Printer,
  WandSparkles,
  Monitor,
  Gamepad2,
  ShieldCheck,
  Headphones,
  RadioTower,
  Tablet,
  Car,
  Laptop,
  Network,
  DoorClosed,
  TreePine,
  AudioLines,
  Pencil,
} from "lucide-react";
import { useAlexa } from "./hooks/useAlexa";
import { deviceVisual } from "./deviceVisual";
import { displayValue, tr } from "./i18n";
import {
  deviceName,
  deviceType,
  isEcho,
  isGroup,
  isProtected,
  source,
  reachability,
  enablement,
  canAct,
  filterDevices,
  toggleVisible,
} from "./alexa";

const defaultColumns = [
  "name",
  "description",
  "type",
  "status",
  "source",
  "id",
  "actions",
];
const defaultKpis = [
  "gesamt",
  "online",
  "offline",
  "unbekannt",
  "ohne",
  "echos",
  "ha",
  "gruppen",
  "loeschbar",
  "geschuetzt",
];
const kpiVisuals = {
  gesamt: [Smartphone, "#00A3FF"],
  online: [Circle, "#00FF88"],
  offline: [Circle, "#94A3B8"],
  unbekannt: [HelpCircle, "#EAB308"],
  ohne: [AlertTriangle, "#FF9500"],
  echos: [Speaker, "#00C853"],
  ha: [Home, "#3B82F6"],
  gruppen: [Layers, "#8B5CF6"],
  loeschbar: [Trash2, "#FF3B30"],
  geschuetzt: [Shield, "#64748B"],
};
function KpiIcon({ id }) {
  const [Icon, color] = kpiVisuals[id];
  return (
    <span className="kpi-icon" style={{ color, backgroundColor: color + "18" }}>
      <Icon
        size={18}
        fill={id === "online" || id === "offline" ? "currentColor" : "none"}
      />
    </span>
  );
}
const emptyFilters = {
  search: "",
  type: "",
  status: "",
  origin: "",
  group: "",
  hideProtected: false,
  onlyDeletable: false,
};
const isVoiceAction = (action) => ["speak", "announce", "command"].includes(action);
function readOrder(key, fallback) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (!Array.isArray(saved)) return fallback;
    return [
      ...new Set([...saved.filter((x) => fallback.includes(x)), ...fallback]),
    ];
  } catch {
    return fallback;
  }
}
function saveOrder(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Storage may be unavailable on the host page. */
  }
}
function reorder(order, from, to) {
  if (!order.includes(from) || !order.includes(to) || from === to) return order;
  const next = order.filter((x) => x !== from);
  next.splice(next.indexOf(to), 0, from);
  return next;
}
function asset(name) {
  return globalThis.chrome?.runtime?.getURL?.(name) || "";
}
const visualIcons = {
  echo: Speaker,
  plug: PlugZap,
  light: Lightbulb,
  camera: Camera,
  blind: Blinds,
  scene: WandSparkles,
  printer: Printer,
  projector: Projector,
  tv: Tv,
  computer: Monitor,
  laptop: Laptop,
  screen: Monitor,
  "game-console": Gamepad2,
  "security-panel": ShieldCheck,
  headphones: Headphones,
  "streaming-device": RadioTower,
  "music-system": AudioLines,
  tablet: Tablet,
  phone: Smartphone,
  hub: Network,
  door: DoorClosed,
  "christmas-tree": TreePine,
  vehicle: Car,
  thermostat: Thermometer,
  sensor: Radio,
  "temperature-sensor": ThermometerSun,
  "motion-sensor": Activity,
  "contact-sensor": DoorOpen,
  lock: LockKeyhole,
  doorbell: BellRing,
  garage: Warehouse,
  "air-conditioner": Snowflake,
  "air-freshener": Wind,
  "air-purifier": AirVent,
  humidifier: Droplets,
  dehumidifier: Droplets,
  heater: Heater,
  "water-heater": Heater,
  fan: Fan,
  vacuum: Bot,
  washer: WashingMachine,
  dryer: Wind,
  dishwasher: Utensils,
  refrigerator: Refrigerator,
  microwave: Microwave,
  oven: CookingPot,
  "coffee-maker": Coffee,
  router: Router,
  switch: ToggleLeft,
  group: Layers,
  speaker: Speaker,
  device: Box,
};
const visualLabels = {
  de: {
    scene: "Szene", printer: "Drucker", projector: "Beamer", tv: "Fernseher",
    computer: "Computer", laptop: "Laptop", screen: "Bildschirm", "game-console": "Spielkonsole",
    "security-panel": "Sicherheitsanlage", headphones: "Kopfhörer", "streaming-device": "Streaming-Gerät",
    "music-system": "Musikanlage", tablet: "Tablet", phone: "Telefon", hub: "Smart-Home-Hub",
    door: "Tür", "christmas-tree": "Weihnachtsbaum", vehicle: "Fahrzeug",
    thermostat: "Thermostat", sensor: "Sensor",
    "temperature-sensor": "Temperatursensor", "motion-sensor": "Bewegungssensor",
    "contact-sensor": "Kontaktsensor", lock: "Schloss", doorbell: "Türklingel",
    garage: "Garagentor", "air-conditioner": "Klimaanlage", "air-freshener": "Lufterfrischer", "air-purifier": "Luftreiniger",
    humidifier: "Luftbefeuchter", dehumidifier: "Luftentfeuchter", heater: "Heizung",
    "water-heater": "Warmwasserbereiter", fan: "Ventilator", vacuum: "Staubsauger",
    washer: "Waschmaschine", dryer: "Trockner", dishwasher: "Geschirrspüler",
    refrigerator: "Kühlschrank", microwave: "Mikrowelle", oven: "Ofen",
    "coffee-maker": "Kaffeemaschine", router: "Router", group: "Gruppe",
    speaker: "Lautsprecher", device: "Gerät", echo: "Echo", plug: "Steckdose",
    light: "Leuchte", camera: "Kamera", blind: "Jalousie", switch: "Schalter",
  },
  en: {
    scene: "Scene", printer: "Printer", projector: "Projector", tv: "Television",
    computer: "Computer", laptop: "Laptop", screen: "Screen", "game-console": "Game console",
    "security-panel": "Security panel", headphones: "Headphones", "streaming-device": "Streaming device",
    "music-system": "Music system", tablet: "Tablet", phone: "Phone", hub: "Smart home hub",
    door: "Door", "christmas-tree": "Christmas tree", vehicle: "Vehicle",
    thermostat: "Thermostat", sensor: "Sensor",
    "temperature-sensor": "Temperature sensor", "motion-sensor": "Motion sensor",
    "contact-sensor": "Contact sensor", lock: "Lock", doorbell: "Doorbell",
    garage: "Garage door", "air-conditioner": "Air conditioner", "air-freshener": "Air freshener", "air-purifier": "Air purifier",
    humidifier: "Humidifier", dehumidifier: "Dehumidifier", heater: "Heater",
    "water-heater": "Water heater", fan: "Fan", vacuum: "Vacuum cleaner",
    washer: "Washing machine", dryer: "Dryer", dishwasher: "Dishwasher",
    refrigerator: "Refrigerator", microwave: "Microwave", oven: "Oven",
    "coffee-maker": "Coffee maker", router: "Router", group: "Group",
    speaker: "Speaker", device: "Device", echo: "Echo", plug: "Plug",
    light: "Light", camera: "Camera", blind: "Blind", switch: "Switch",
  },
};
function DeviceImage({ device, language }) {
  const kind = deviceVisual(device);
  const Icon = visualIcons[kind] || Box;
  const label = visualLabels[language]?.[kind] || visualLabels.en[kind] || kind;
  return (
    <span className={`device-art device-art-${kind}`} role="img" aria-label={label} title={label}>
      <Icon size={48} strokeWidth={1.5} />
    </span>
  );
}
function Status({ device, language }) {
  const status = reachability(device);
  return (
    <div>
      <span
        className={
          status === "Online"
            ? "status-online"
            : status === "Offline"
              ? "status-offline"
              : "muted"
        }
      >
        {displayValue(language, status)}
      </span>
      <small className="block muted">Alexa: {displayValue(language, enablement(device))}</small>
    </div>
  );
}


export default function App() {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem("admLanguage") === "en" ? "en" : "de";
    } catch {
      return "de";
    }
  });
  const t = (key, values) => tr(language, key, values);
  const {
    devices,
    busy,
    error,
    ready,
    loadedAt,
    logs,
    progress,
    logger,
    fetchDevices,
    execute,
    cancelBatch,
  } = useAlexa(language);
  const [filters, setFilters] = useState({
    ...emptyFilters,
    hideProtected: true,
  });
  const [selectedId, setSelectedId] = useState(null);
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [sort, setSort] = useState({ key: "name", dir: 1 });
  const [columns, setColumns] = useState(() =>
    readOrder("aura_col_order", defaultColumns),
  );
  const [kpiOrder, setKpiOrder] = useState(() =>
    readOrder("aura_kpi_order", defaultKpis),
  );
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(0);
  const [plan, setPlan] = useState(null);
  const [backedUp, setBackedUp] = useState(false);
  const [protectedIds, setProtectedIds] = useState(new Set());
  const [confirmation, setConfirmation] = useState("");
  const [speech, setSpeech] = useState("");
  const [speechMode, setSpeechMode] = useState("speak");
  const logRef = useRef(null);
  const initialLoad = useRef(false);
  useEffect(() => {
    if (!plan) return;
    const previous = document.activeElement;
    const onKey = (event) => {
      if (event.key === "Escape" && !busy) setPlan(null);
      if (event.key !== "Tab") return;
      const items = [
        ...document.querySelectorAll(
          '#aura-root [role="dialog"] button:not(:disabled), #aura-root [role="dialog"] input:not(:disabled)',
        ),
      ];
      if (!items.length) return;
      const index = items.indexOf(document.activeElement);
      if (
        index === -1 ||
        (event.shiftKey && index === 0) ||
        (!event.shiftKey && index === items.length - 1)
      ) {
        event.preventDefault();
        (event.shiftKey ? items.at(-1) : items[0]).focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (previous?.isConnected) previous.focus();
    };
  }, [plan, busy]);
  useEffect(() => {
    if (initialLoad.current) return;
    initialLoad.current = true;
    fetchDevices();
  }, [fetchDevices]);
  useEffect(() => {
    saveOrder("aura_col_order", columns);
  }, [columns]);
  useEffect(() => {
    saveOrder("aura_kpi_order", kpiOrder);
  }, [kpiOrder]);
  useEffect(() => {
    try {
      localStorage.setItem("admLanguage", language);
    } catch {
      /* Storage may be unavailable on the host page. */
    }
  }, [language]);
  useEffect(() => {
    setCheckedIds(new Set());
    setPlan(null);
    setBackedUp(false);
  }, [devices]);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);
  useEffect(() => {
    setPage(0);
  }, [filters, pageSize, sort]);

  const filtered = useMemo(() => {
    const value = (d) =>
      ({
        name: deviceName(d),
        description: d.description,
        type: deviceType(d),
        status: `${reachability(d)} ${enablement(d)}`,
        source: source(d),
        id: d._admEndpointId || d._admApplianceId || d.id,
      })[sort.key] || "";
    return filterDevices(devices, filters).sort(
      (a, b) =>
        String(value(a)).localeCompare(String(value(b)), "de", {
          numeric: true,
        }) * sort.dir,
    );
  }, [devices, filters, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages - 1);
  const visible = filtered.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );
  const selected = devices.find((d) => d.id === selectedId);
  const checked = devices.filter((d) => checkedIds.has(d.id));
  const hiddenCount = checked.filter(
    (d) => !visible.some((x) => x.id === d.id),
  ).length;
  const allVisible =
    visible.length > 0 && visible.every((d) => checkedIds.has(d.id));
  const count = (fn) => devices.filter(fn).length;
  const kpis = {
    gesamt: [t("total"), devices.length, {}],
    online: [
      t("online"),
      count((d) => reachability(d) === "Online"),
      { status: "Online" },
    ],
    offline: [
      t("offline"),
      count((d) => reachability(d) === "Offline"),
      { status: "Offline" },
    ],
    unbekannt: [
      t("unknown"),
      count((d) => reachability(d) === "Unbekannt"),
      { status: "Unbekannt" },
    ],
    ohne: [
      t("noEndpoint"),
      count((d) => !d._admEndpointId),
      { status: "Ohne Endpoint" },
    ],
    echos: [t("echoes"), count(isEcho), { status: "Echos" }],
    ha: [
      "Home Assistant",
      count((d) => source(d) === "Home Assistant"),
      { origin: "Home Assistant" },
    ],
    gruppen: [t("groups"), count(isGroup), { status: "Gruppen" }],
    loeschbar: [
      t("deletable"),
      count((d) => canAct(d, "delete") && !isProtected(d)),
      { onlyDeletable: true },
    ],
    geschuetzt: [
      t("protected"),
      count((d) => isProtected(d) || !canAct(d, "delete")),
      { status: "Geschützt" },
    ],
  };
  function toggle(id) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function exportJson() {
    try {
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(devices, null, 2)], {
          type: "application/json",
        }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `alexa-devices-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      logger(t("backupStarted"));
    } catch {
      logger(t("backupFailed"));
    }
  }
  function preview(action, list = checked, extra = {}) {
    if (busy || !ready || !list.length) return;
    setPlan({
      action,
      list: [...list],
      text: speech,
      locale: language === "de" ? "de-DE" : "en-US",
      groupName:
        extra.groupName ?? (action === "groupRename" ? deviceName(list[0]) : ""),
    });
    setBackedUp(false);
    setProtectedIds(new Set());
    setConfirmation("");
  }
  function dryRun() {
    if (blocked || !checked.length) return;
    const rows = checked.map((d) => ({
      name: deviceName(d),
      type: deviceType(d),
      status: displayValue(language, reachability(d)),
      source: displayValue(language, source(d)),
      id: d._admEndpointId || d._admApplianceId || d.id,
    }));
    console.table(rows);
    logger(t("dryRunLog", { count: rows.length }));
  }
  async function submit() {
    if (
      !plan ||
      !ready ||
      busy ||
      (!isVoiceAction(plan.action) && !backedUp) ||
      (["groupCreate", "groupRename"].includes(plan.action) && !plan.groupName?.trim()) ||
      plan.list.some(
        (d) => !isVoiceAction(plan.action) && !canAct(d, plan.action),
      ) ||
      (!isVoiceAction(plan.action) && plan.list.some((d) => isProtected(d) && !protectedIds.has(d.id))) ||
      (plan.action === "delete" && confirmation !== "DELETE")
    )
      return;
    const ok = await execute(plan.list, plan.action, {
      backup: isVoiceAction(plan.action) || backedUp,
      preview: true,
      allowProtectedIds: [...protectedIds],
      text: plan.text,
      locale: plan.locale,
      groupName: plan.groupName,
    });
    setPlan(null);
    if (ok) {
      setCheckedIds(new Set());
      if (isVoiceAction(plan.action)) setSpeech("");
    }
  }
  const filter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));
  const blocked = busy || !ready;
  const columnLabels = Object.fromEntries(defaultColumns.map((key) => [key, t(key)]));
  const actionLabels = {
    delete: t("permanentDelete"), enable: t("enable"), disable: t("disable"),
    on: t("powerOn"), off: t("powerOff"), speak: t("speak"),
    announce: t("announce"), command: t("command"),
    groupCreate: t("createGroup"), groupRename: t("renameGroup"),
  };
  return (
    <div className="aura-app">
      <header className="panel app-header">
        <div className="brand">
          <img src={asset("icon128.png")} alt="" />
          <div>
            <h1>Aura Device Master</h1>
            <p className="muted">
              {t("subtitle")}
            </p>
          </div>
        </div>
        <div className="toolbar">
          <label className="language-select">
            <span>{t("language")}</span>
            <select aria-label={t("language")} value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="de">Deutsch</option>
              <option value="en">English</option>
            </select>
          </label>
          <button onClick={exportJson} disabled={!devices.length}>
            <Download size={16} /> {t("backup")}
          </button>
          <button
            className="primary"
            disabled={busy || Boolean(plan)}
            onClick={fetchDevices}
          >
            <RefreshCw size={16} className={busy ? "spin" : ""} />
            {busy ? t("waiting") : t("reload")}
          </button>
          <button
            aria-label={t("close")}
            disabled={busy}
            onClick={() => window.dispatchEvent(new Event("aura-close"))}
          >
            <X size={16} />
          </button>
        </div>
      </header>
      {error && (
        <div role="alert" className="notice error">
          {error}
        </div>
      )}
      <div className="kpis">
        {kpiOrder.map((id) => (
          <button
            className="panel kpi"
            key={id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("aura-kpi", id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              setKpiOrder((prev) =>
                reorder(prev, e.dataTransfer.getData("aura-kpi"), id),
              );
            }}
            onClick={() => setFilters({ ...emptyFilters, ...kpis[id][2] })}
          >
            <KpiIcon id={id} />
            <span className="kpi-copy">
              <strong>{kpis[id][1]}</strong>
              <span>{kpis[id][0]}</span>
            </span>
          </button>
        ))}
      </div>
      <main className="workspace">
        <section className="panel device-list">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>
                    <input
                      aria-label={t("selectPage")}
                      type="checkbox"
                      checked={allVisible}
                      disabled={!visible.length || busy}
                      onChange={() =>
                        setCheckedIds((prev) => toggleVisible(prev, visible))
                      }
                    />
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col}
                      draggable
                      onDragStart={(e) =>
                        e.dataTransfer.setData("aura-col", col)
                      }
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        setColumns((prev) =>
                          reorder(
                            prev,
                            e.dataTransfer.getData("aura-col"),
                            col,
                          ),
                        );
                      }}
                    >
                      <button
                        disabled={col === "actions"}
                        onClick={() =>
                          setSort((prev) => ({
                            key: col,
                            dir: prev.key === col ? -prev.dir : 1,
                          }))
                        }
                      >
                        {columnLabels[col]}{" "}
                        {sort.key === col ? (sort.dir === 1 ? "↑" : "↓") : ""}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((d) => (
                  <tr
                    key={d.id}
                    className={selectedId === d.id ? "selected" : ""}
                    onClick={() => setSelectedId(d.id)}
                  >
                    <td>
                      <input
                        type="checkbox"
                        aria-label={t("selectDevice", { name: deviceName(d) })}
                        checked={checkedIds.has(d.id)}
                        disabled={busy}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggle(d.id)}
                      />
                    </td>
                    {columns.map((col) => (
                      <td key={col}>
                        {col === "name" ? (
                          <button
                            className="device-name"
                            onClick={() => setSelectedId(d.id)}
                          >
                            {deviceName(d)}
                            {isProtected(d) && (
                              <Shield size={13} aria-label={t("protected")} />
                            )}
                          </button>
                        ) : col === "description" ? (
                          <span className="description">
                            {d.description || "–"}
                          </span>
                        ) : col === "type" ? (
                          <span className="tag">{deviceType(d)}</span>
                        ) : col === "status" ? (
                          <Status device={d} language={language} />
                        ) : col === "source" ? (
                          displayValue(language, source(d))
                        ) : col === "id" ? (
                          <span
                            className="id"
                            title={
                              d._admEndpointId || d._admApplianceId || d.id
                            }
                          >
                            {d._admEndpointId || d._admApplianceId || d.id}
                          </span>
                        ) : (
                          <div className="toolbar">
                            <button
                              disabled={blocked || !canAct(d, "disable")}
                              title={
                                d._admEnablement === "DISABLED_BY_CUSTOMER"
                                  ? t("enable")
                                  : t("disable")
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                preview(
                                  d._admEnablement === "DISABLED_BY_CUSTOMER"
                                    ? "enable"
                                    : "disable",
                                  [d],
                                );
                              }}
                            >
                              <Shield size={15} />
                            </button>
                            <button
                              disabled={blocked || !canAct(d, "delete")}
                              title={t("checkDelete")}
                              onClick={(e) => {
                                e.stopPropagation();
                                preview("delete", [d]);
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                {!visible.length && (
                  <tr>
                    <td colSpan={columns.length + 1} className="empty">
                      {busy
                        ? t("loadingDevices")
                        : ready
                          ? t("noFiltered")
                          : t("noData")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <footer className="table-footer">
            <span>
              {t("hitsSelected", { hits: filtered.length, selected: checked.length })}
              {hiddenCount > 0 && t("outsidePage", { count: hiddenCount })}
            </span>
            <div className="toolbar">
              <button
                disabled={!filtered.length || busy}
                onClick={() => setCheckedIds(new Set(filtered.map((device) => device.id)))}
              >
                {t("selectAllFiltered", { count: filtered.length })}
              </button>
              <label>
                {t("perPage")}{" "}
                <select
                  aria-label={t("entriesPerPage")}
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  {[10, 50, 100].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
              <button
                aria-label={t("previousPage")}
                disabled={currentPage === 0}
                onClick={() => setPage(currentPage - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              <span>
                {currentPage + 1} / {pages}
              </span>
              <button
                aria-label={t("nextPage")}
                disabled={currentPage >= pages - 1}
                onClick={() => setPage(currentPage + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </footer>
        </section>
        <aside className="panel sidebar">
          {selected ? (
            <>
              <div className="detail-heading">
                <DeviceImage
                  key={selected.id + deviceVisual(selected)}
                  device={selected}
                  language={language}
                />
                <div>
                  <h2>{deviceName(selected)}</h2>
                  <p className="muted">
                    {selected.description || t("noDescription")}
                  </p>
                </div>
              </div>
              <div className="detail-toolbar" aria-label={t("deviceActions")}>
                <button
                  title={t("backup")}
                  aria-label={t("backup")}
                  onClick={exportJson}
                >
                  <Download size={20} />
                </button>
                <button
                  title={
                    selected._admEnablement === "DISABLED_BY_CUSTOMER"
                      ? t("enable")
                      : t("disable")
                  }
                  aria-label={
                    selected._admEnablement === "DISABLED_BY_CUSTOMER"
                      ? t("enable")
                      : t("disable")
                  }
                  disabled={blocked || !canAct(selected, "enable")}
                  onClick={() =>
                    preview(
                      selected._admEnablement === "DISABLED_BY_CUSTOMER"
                        ? "enable"
                        : "disable",
                      [selected],
                    )
                  }
                >
                  <Shield size={20} />
                </button>
                <button
                  className="delete-icon"
                  title={t("delete")}
                  aria-label={t("delete")}
                  disabled={blocked || !canAct(selected, "delete")}
                  onClick={() => preview("delete", [selected])}
                >
                  <Trash2 size={20} />
                </button>
                {isGroup(selected) && (
                  <button
                    title={t("renameGroup")}
                    aria-label={t("renameGroup")}
                    disabled={blocked || !canAct(selected, "groupRename")}
                    onClick={() => preview("groupRename", [selected])}
                  >
                    <Pencil size={20} />
                  </button>
                )}
                <span className="toolbar-divider" />
                <button
                  className="on-icon"
                  title={t("turnOnUnknown")}
                  aria-label={t("turnOn")}
                  disabled={blocked || !canAct(selected, "on")}
                  onClick={() => preview("on", [selected])}
                >
                  <Power size={20} />
                </button>
                <button
                  className="off-icon"
                  title={t("turnOffUnknown")}
                  aria-label={t("turnOff")}
                  disabled={blocked || !canAct(selected, "off")}
                  onClick={() => preview("off", [selected])}
                >
                  <PowerOff size={20} />
                </button>
                <button
                  title={t("dndUnavailable")}
                  aria-label={t("dndUnavailable")}
                  disabled
                >
                  <Moon size={20} />
                </button>
              </div>
              <dl className="detail-grid">
                <dt>{t("type")}</dt>
                <dd>{deviceType(selected)}</dd>
                <dt>{t("status")}</dt>
                <dd>
                  <Status device={selected} language={language} />
                </dd>
                <dt>{t("source")}¹</dt>
                <dd>{displayValue(language, source(selected))}</dd>
                <dt>{t("deviceId")}</dt>
                <dd
                  className="detail-id"
                  title={
                    selected._admEndpointId ||
                    selected._admApplianceId ||
                    selected.id
                  }
                >
                  {selected._admEndpointId ||
                    selected._admApplianceId ||
                    selected.id}
                </dd>
                <dt>{t("description")}</dt>
                <dd className="detail-id" title={selected.description || ""}>
                  {selected.description || "–"}
                </dd>
                <dt>{t("deletable")}</dt>
                <dd
                  className={
                    canAct(selected, "delete") ? "status-online" : "muted"
                  }
                >
                  {canAct(selected, "delete") ? t("yes") : t("no")}
                </dd>
                {selected._admDeleteUnavailable && (
                  <>
                    <dt>{t("deleteStatus")}</dt>
                    <dd className="status-offline">{t("deleteUnavailable")}</dd>
                  </>
                )}
                <dt>{t("protected")}</dt>
                <dd>
                  {isProtected(selected)
                    ? t("yes")
                    : !canAct(selected, "delete")
                      ? t("noSafeId")
                      : t("no")}
                </dd>
                <dt>{t("dataAsOf")}</dt>
                <dd>{loadedAt?.toLocaleTimeString(language === "de" ? "de-DE" : "en-US") || t("unknown")}</dd>
              </dl>
              {isEcho(selected) ? (
                <form
                  className="speech-panel"
                  onSubmit={(e) => {
                    e.preventDefault();
                    preview(speechMode, [selected]);
                  }}
                >
                  <div className="speech-heading">
                    <label htmlFor="aura-speech">{t("alexaAction")}</label>
                    <div className="speech-modes" role="group" aria-label={t("alexaAction")}>
                      <button type="button" className={speechMode === "speak" ? "active" : ""} aria-pressed={speechMode === "speak"} title={t("speak")} aria-label={t("speak")} onClick={() => setSpeechMode("speak")}><Speaker size={15} /></button>
                      <button type="button" className={speechMode === "announce" ? "active" : ""} aria-pressed={speechMode === "announce"} title={t("announce")} aria-label={t("announce")} onClick={() => setSpeechMode("announce")}><Send size={15} /></button>
                      <button type="button" className={speechMode === "command" ? "active" : ""} aria-pressed={speechMode === "command"} title={t("command")} aria-label={t("command")} onClick={() => setSpeechMode("command")}><Terminal size={15} /></button>
                    </div>
                  </div>
                  <div className="speech-row">
                    <input
                      id="aura-speech"
                      value={speech}
                      maxLength={500}
                      onChange={(e) => setSpeech(e.target.value)}
                      aria-label={t("alexaAction")}
                      placeholder={t("speechPlaceholder")}
                    />
                    <button
                      className="primary"
                      title={t("sendAlexa")}
                      disabled={blocked || !speech.trim()}
                    >
                      <Send size={16} /> {t("send")}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="speech-panel muted">
                  {t("noAlexa")}
                </div>
              )}
            </>
          ) : (
            <div className="empty">
              <Shield size={36} />
              <h2>{t("chooseDevice")}</h2>
              <p>{t("chooseHint")}</p>
            </div>
          )}
          <section className="log">
            <h3>
              <Terminal size={15} /> CLI Terminal
            </h3>
            <div ref={logRef} role="log" aria-label={t("activityLog")}>
              {logs.map((line, i) => (
                <p key={i} className={line.level === "error" ? "log-error" : ""}>{line.text}</p>
              ))}
            </div>
          </section>
        </aside>
      </main>
      <section className="panel filters" aria-label={t("filters")}>
        <label className="search">
          <Search size={16} />
          <input
            aria-label={t("search")}
            placeholder={t("searchPlaceholder")}
            value={filters.search}
            onChange={(e) => filter("search", e.target.value)}
          />
        </label>
        <select
          aria-label={t("deviceType")}
          value={filters.type}
          onChange={(e) => filter("type", e.target.value)}
        >
          <option value="">{t("allTypes")}</option>
          {[...new Set(devices.map(deviceType))].sort().map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select
          aria-label={t("statusFilter")}
          value={filters.status}
          onChange={(e) => filter("status", e.target.value)}
        >
          <option value="">{t("allStatuses")}</option>
          {[
            "Online",
            "Offline",
            "Unbekannt",
            "Aktiviert",
            "Deaktiviert",
            "Ohne Endpoint",
            "Geschützt",
            "Echos",
            "Gruppen",
          ].map((s) => (
            <option key={s} value={s}>{displayValue(language, s)}</option>
          ))}
        </select>
        <select
          aria-label={t("origin")}
          value={filters.origin}
          onChange={(e) => filter("origin", e.target.value)}
        >
          <option value="">{t("allSources")}</option>
          {[...new Set(devices.map(source))].sort().map((s) => (
            <option key={s} value={s}>{displayValue(language, s)}</option>
          ))}
        </select>
        <select
          aria-label={t("group")}
          value={filters.group}
          onChange={(e) => filter("group", e.target.value)}
        >
          <option value="">{t("allGroups")}</option>
          {devices.filter(isGroup).map((d) => (
            <option key={d.id} value={d.id}>
              {deviceName(d)}
            </option>
          ))}
        </select>
        <label>
          <input
            type="checkbox"
            checked={filters.hideProtected}
            onChange={(e) => filter("hideProtected", e.target.checked)}
          />{" "}
          {t("hideProtected")}
        </label>
        <label>
          <input
            type="checkbox"
            checked={filters.onlyDeletable}
            onChange={(e) => filter("onlyDeletable", e.target.checked)}
          />{" "}
          {t("onlyDeletable")}
        </label>
        <button onClick={() => setFilters({ ...emptyFilters })}>
          {t("reset")}
        </button>
      </section>
      <footer className="panel action-footer">
        <div className="toolbar wrap footer-actions">
          <button
            disabled={!checked.length || busy}
            onClick={() => setCheckedIds(new Set())}
          >
            {t("clearSelection")}
          </button>
          <button
            disabled={blocked || !checked.length}
            onClick={dryRun}
          >
            {t("dryRun")}
          </button>
          <button
            disabled={blocked || !checked.length}
            onClick={() => preview("groupCreate")}
          >
            <Layers size={16} /> {t("createGroup")}
          </button>
          <button
            disabled={blocked || !checked.length}
            onClick={() => preview("enable")}
          >
            {t("enable")}
          </button>
          <button
            disabled={blocked || !checked.length}
            onClick={() => preview("disable")}
          >
            {t("disable")}
          </button>
          <button
            className="danger"
            disabled={blocked || !checked.length}
            onClick={() => preview("delete")}
          >
            <Trash2 size={16} /> {t("delete")}
          </button>
        </div>
        <div className="selection-summary">
          {progress && (
            <div className="batch-progress" role="status">
              <progress max={progress.total} value={progress.completed} />
              <span>{t("batchProgress", progress)}</span>
              <button onClick={cancelBatch}>{t("cancelQueue")}</button>
            </div>
          )}
          <strong>{t("selectedCount", { count: checked.length })}</strong>
          <small className="block muted">
            {t("dataAsOf")}: {loadedAt ? loadedAt.toLocaleString(language === "de" ? "de-DE" : "en-US") : t("notLoaded")} · {t("sourceEstimate")}
          </small>
        </div>
      </footer>
      {plan && (
        <div className="modal-backdrop">
          <section
            className="panel modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="aura-plan-title"
          >
            <h2 id="aura-plan-title">{actionLabels[plan.action]} – {t("preview")}</h2>
            <p>
              {t("targetsPreview", { count: plan.list.length })}
            </p>
            {isVoiceAction(plan.action) && <blockquote>{plan.text}</blockquote>}
            <div className="plan-list">
              {plan.list.slice(0, 100).map((d) => (
                <div className="plan-item" key={d.id}>
                  <strong>{deviceName(d)}</strong>
                  <code>{d._admEndpointId || d._admApplianceId || d.id}</code>
                  {!isVoiceAction(plan.action) && !canAct(d, plan.action) && (
                    <p className="status-offline">
                      {t("unsuitable")}
                    </p>
                  )}
                  {!isVoiceAction(plan.action) && isProtected(d) && (
                    <label>
                      <input
                        type="checkbox"
                        checked={protectedIds.has(d.id)}
                        onChange={(e) =>
                          setProtectedIds((prev) => {
                            const next = new Set(prev);
                            e.target.checked
                              ? next.add(d.id)
                              : next.delete(d.id);
                            return next;
                          })
                        }
                      />{" "}
                      {t("allowProtected")}
                    </label>
                  )}
                </div>
              ))}
              {plan.list.length > 100 && (
                <div className="plan-item muted">
                  {t("moreTargets", { count: plan.list.length - 100 })}
                </div>
              )}
            </div>
            {["groupCreate", "groupRename"].includes(plan.action) && (
              <label className="group-name-field">
                {t("groupName")}
                <input
                  value={plan.groupName}
                  maxLength={100}
                  placeholder={t("groupNamePlaceholder")}
                  onChange={(event) =>
                    setPlan((current) => ({ ...current, groupName: event.target.value }))
                  }
                />
              </label>
            )}
            {!isVoiceAction(plan.action) && (
              <>
                <button onClick={exportJson}>
                  <Download size={16} /> {t("downloadBackup")}
                </button>
                <label className="backup-check">
                  <input
                    type="checkbox"
                    checked={backedUp}
                    onChange={(e) => setBackedUp(e.target.checked)}
                  />{" "}
                  {t("backupChecked")}
                </label>
              </>
            )}
            {plan.action === "delete" && (
              <label>
                {t("confirmDelete")}{" "}
                <input
                  aria-label={t("confirmDeleteLabel")}
                  placeholder={t("enterDelete")}
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                />
              </label>
            )}
            <div className="toolbar modal-actions">
              <button autoFocus disabled={busy} onClick={() => setPlan(null)}>
                {t("cancel")}
              </button>
              {progress && (
                <button onClick={cancelBatch}>{t("cancelQueue")}</button>
              )}
              <button
                className={plan.action === "delete" ? "danger" : "primary"}
                disabled={
                  blocked ||
                  (!isVoiceAction(plan.action) && !backedUp) ||
                  (["groupCreate", "groupRename"].includes(plan.action) && !plan.groupName?.trim()) ||
                  plan.list.some(
                    (d) => !isVoiceAction(plan.action) && !canAct(d, plan.action),
                  ) ||
                  (!isVoiceAction(plan.action) && plan.list.some(
                    (d) => isProtected(d) && !protectedIds.has(d.id),
                  )) ||
                  (plan.action === "delete" && confirmation !== "DELETE")
                }
                onClick={submit}
              >
                {busy ? t("executing") : t("executeNow")}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
