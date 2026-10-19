const messages = {
  de: {
    subtitle: "Alexa-Geräte verwalten · lokal in deiner Amazon-Sitzung",
    language: "Sprache", backup: "JSON sichern", reload: "Neu laden", waiting: "Bitte warten …", close: "Manager schließen",
    total: "Gesamt", online: "Online", offline: "Offline", unknown: "Unbekannt", noEndpoint: "Ohne Endpoint", echoes: "Echos", groups: "Gruppen", deletable: "Löschbar", protected: "Geschützt",
    name: "Name", description: "Beschreibung", type: "Typ", status: "Status", source: "Quelle", id: "ID", actions: "Aktionen",
    selectPage: "Alle auf dieser Seite auswählen", selectAllFiltered: "Alle {count} Treffer auswählen", selectDevice: "{name} auswählen", enable: "Aktivieren", disable: "Deaktivieren", checkDelete: "Löschen prüfen", delete: "Löschen",
    loadingDevices: "Geräte werden geladen …", noFiltered: "Keine Geräte für diese Filter.", noData: "Keine vollständigen Gerätedaten verfügbar. Bitte neu laden.",
    hitsSelected: "{hits} Treffer · {selected} ausgewählt", outsidePage: " ({count} außerhalb dieser Seite)", perPage: "Pro Seite", entriesPerPage: "Einträge pro Seite", previousPage: "Vorherige Seite", nextPage: "Nächste Seite",
    noDescription: "Keine Beschreibung", deviceActions: "Geräteaktionen", turnOn: "Einschalten", turnOff: "Ausschalten", turnOnUnknown: "Einschalten – Zustand unbekannt", turnOffUnknown: "Ausschalten – Zustand unbekannt", dndUnavailable: "Bitte nicht stören – noch nicht verfügbar",
    deviceId: "Geräte-ID", yes: "Ja", no: "Nein", noSafeId: "Keine sichere Ziel-ID", dataAsOf: "Datenstand",
    alexaAction: "Alexa-Aktion", speak: "Direkt sprechen", announce: "Mit Hinweiston ankündigen", command: "Sprachbefehl simulieren", speechPlaceholder: "Text oder Alexa-Befehl eingeben", send: "Senden", sendAlexa: "An Alexa senden", noAlexa: "Für dieses Gerät wurde keine Alexa-Sprachsteuerung erkannt.",
    chooseDevice: "Gerät auswählen", chooseHint: "Wähle einen Eintrag für Details und Aktionen.", activityLog: "Aktionsprotokoll", filters: "Gerätefilter", search: "Geräte suchen", searchPlaceholder: "Name, Typ, Quelle oder ID suchen", deviceType: "Gerätetyp", allTypes: "Alle Gerätetypen", statusFilter: "Statusfilter", allStatuses: "Alle Status", enabled: "Aktiviert", disabled: "Deaktiviert", origin: "Quelle", allSources: "Alle Quellen", group: "Gruppe", allGroups: "Alle Gruppen", hideProtected: "Geschützte ausblenden", onlyDeletable: "Nur ungeschützte löschbare", reset: "Zurücksetzen",
    selectedCount: "{count} Geräte ausgewählt", notLoaded: "Noch nicht geladen", sourceEstimate: "¹ Quelle ist eine Schätzung.", clearSelection: "Auswahl leeren", dryRun: "Trockenlauf / Vorschau", dryRunLog: "Trockenlauf: {count} Geräte ausgewählt. Es wurde nichts verändert.", createGroup: "Gruppe erstellen", renameGroup: "Gruppe umbenennen", groupName: "Gruppenname", groupNamePlaceholder: "z. B. Wohnzimmer", groupNameRequired: "Bitte einen Gruppennamen eingeben.", exactlyOneGroup: "Bitte genau eine eindeutig zugeordnete Gruppe auswählen.", groupCreated: "Gruppe „{name}“ mit {count} Mitgliedern erstellt und geprüft.", groupRenamed: "Gruppe in „{name}“ umbenannt und geprüft.",
    permanentDelete: "Dauerhaft löschen", powerOn: "Einschalten", powerOff: "Ausschalten", preview: "Vorschau", targetsPreview: "Diese {count} Ziele sind ausgewählt. Bis zur Ausführung wird nichts verändert.", unsuitable: "Keine geeignete Ziel-ID. Bitte Auswahl korrigieren.", allowProtected: "Dieses geschützte Ziel für diese Aktion freigeben", downloadBackup: "JSON-Sicherung herunterladen", backupChecked: "Ich habe die aktuelle JSON-Sicherung gespeichert und die Ziele geprüft.", confirmDelete: "Dauerhaftes Löschen bestätigen:", confirmDeleteLabel: "DELETE bestätigen", enterDelete: "DELETE eingeben", cancel: "Abbrechen", executing: "Wird ausgeführt …", executeNow: "Jetzt ausführen",
    other: "Andere", cliReady: "Aura Device Master bereit.", loaded: "{count} Geräte vollständig geladen.", stale: "{message} Vorhandene Daten sind möglicherweise veraltet. Aktionen bleiben gesperrt.", backupStarted: "JSON-Download gestartet. Bitte die gespeicherte Datei prüfen.", backupFailed: "JSON-Sicherung konnte nicht gestartet werden.", safeguardsMissing: "Sicherung und Vorschau fehlen.", staleSelection: "Geräteauswahl ist veraltet. Bitte neu prüfen.", protectedMissing: "Geschützte Ziele sind nicht freigegeben.", exactlyOne: "Bitte genau ein Gerät auswählen.", requested: "{name}: {action} angefordert. Der tatsächliche Gerätezustand ist nicht überprüft.", speechOutput: "Sprachausgabe", announcementOutput: "Ankündigung", commandOutput: "Sprachbefehl", switchCommand: "Schaltbefehl", verificationFailed: "Nachkontrolle nicht möglich. Ergebnis unbestätigt; bitte später neu laden.", targetNotReached: "Zielzustand bei Nachkontrolle nicht erreicht.", changesConfirmed: "{success} von {total} Änderungen bestätigt.", actionsFailed: "{count} Aktionen fehlgeschlagen oder nicht bestätigt. Details im Protokoll.", batchProgress: "{completed} / {total}: {current}", cancelQueue: "Warteschlange stoppen", batchCancelRequested: "Die Warteschlange wird nach der laufenden Anfrage gestoppt.", batchCancelled: "Warteschlange gestoppt. Bereits ausgeführte Aktionen wurden nachkontrolliert.", moreTargets: "+ {count} weitere Ziele", deleteStatus: "Löschstatus", deleteUnavailable: "Nicht über Alexa löschbar – bitte in der Quellintegration entfernen."
  },
  en: {
    subtitle: "Manage Alexa devices · locally in your Amazon session",
    language: "Language", backup: "Save JSON", reload: "Reload", waiting: "Please wait …", close: "Close manager",
    total: "Total", online: "Online", offline: "Offline", unknown: "Unknown", noEndpoint: "No endpoint", echoes: "Echos", groups: "Groups", deletable: "Deletable", protected: "Protected",
    name: "Name", description: "Description", type: "Type", status: "Status", source: "Source", id: "ID", actions: "Actions",
    selectPage: "Select all on this page", selectAllFiltered: "Select all {count} results", selectDevice: "Select {name}", enable: "Enable", disable: "Disable", checkDelete: "Review deletion", delete: "Delete",
    loadingDevices: "Loading devices …", noFiltered: "No devices match these filters.", noData: "No complete device data available. Please reload.",
    hitsSelected: "{hits} results · {selected} selected", outsidePage: " ({count} outside this page)", perPage: "Per page", entriesPerPage: "Entries per page", previousPage: "Previous page", nextPage: "Next page",
    noDescription: "No description", deviceActions: "Device actions", turnOn: "Turn on", turnOff: "Turn off", turnOnUnknown: "Turn on – state unknown", turnOffUnknown: "Turn off – state unknown", dndUnavailable: "Do not disturb – not available yet",
    deviceId: "Device ID", yes: "Yes", no: "No", noSafeId: "No safe target ID", dataAsOf: "Data as of",
    alexaAction: "Alexa action", speak: "Speak directly", announce: "Announce with chime", command: "Simulate voice command", speechPlaceholder: "Enter text or an Alexa command", send: "Send", sendAlexa: "Send to Alexa", noAlexa: "Alexa voice control was not detected for this device.",
    chooseDevice: "Select a device", chooseHint: "Select an entry to view details and actions.", activityLog: "Activity log", filters: "Device filters", search: "Search devices", searchPlaceholder: "Search name, type, source or ID", deviceType: "Device type", allTypes: "All device types", statusFilter: "Status filter", allStatuses: "All statuses", enabled: "Enabled", disabled: "Disabled", origin: "Source", allSources: "All sources", group: "Group", allGroups: "All groups", hideProtected: "Hide protected", onlyDeletable: "Only deletable and unprotected", reset: "Reset",
    selectedCount: "{count} devices selected", notLoaded: "Not loaded yet", sourceEstimate: "¹ Source is an estimate.", clearSelection: "Clear selection", dryRun: "Dry run / Preview", dryRunLog: "Dry run: {count} devices selected. Nothing was changed.", createGroup: "Create group", renameGroup: "Rename group", groupName: "Group name", groupNamePlaceholder: "e.g. Living room", groupNameRequired: "Please enter a group name.", exactlyOneGroup: "Please select exactly one unambiguously matched group.", groupCreated: "Created and verified group “{name}” with {count} members.", groupRenamed: "Renamed and verified group to “{name}”.",
    permanentDelete: "Permanently delete", powerOn: "Turn on", powerOff: "Turn off", preview: "Preview", targetsPreview: "These {count} targets are selected. Nothing changes until execution.", unsuitable: "No suitable target ID. Please correct the selection.", allowProtected: "Allow this protected target for this action", downloadBackup: "Download JSON backup", backupChecked: "I saved the current JSON backup and reviewed the targets.", confirmDelete: "Confirm permanent deletion:", confirmDeleteLabel: "Confirm DELETE", enterDelete: "Enter DELETE", cancel: "Cancel", executing: "Executing …", executeNow: "Execute now",
    other: "Other", cliReady: "Aura Device Master ready.", loaded: "{count} devices fully loaded.", stale: "{message} Existing data may be outdated. Actions remain locked.", backupStarted: "JSON download started. Please review the saved file.", backupFailed: "JSON backup could not be started.", safeguardsMissing: "Backup and preview are missing.", staleSelection: "Device selection is outdated. Please review it again.", protectedMissing: "Protected targets are not approved.", exactlyOne: "Please select exactly one device.", requested: "{name}: {action} requested. The actual device state has not been verified.", speechOutput: "Speech", announcementOutput: "Announcement", commandOutput: "Voice command", switchCommand: "Switch command", verificationFailed: "Verification was not possible. Result unconfirmed; please reload later.", targetNotReached: "Target state was not reached during verification.", changesConfirmed: "{success} of {total} changes confirmed.", actionsFailed: "{count} actions failed or were not confirmed. See the activity log.", batchProgress: "{completed} / {total}: {current}", cancelQueue: "Stop queue", batchCancelRequested: "The queue will stop after the current request.", batchCancelled: "Queue stopped. Completed actions were verified.", moreTargets: "+ {count} more targets", deleteStatus: "Deletion status", deleteUnavailable: "Cannot be deleted through Alexa – remove it from the source integration."
  }
};

export function tr(language, key, values = {}) {
  let value = messages[language]?.[key] ?? messages.de[key] ?? key;
  for (const [name, replacement] of Object.entries(values))
    value = value.replaceAll(`{${name}}`, String(replacement));
  return value;
}

export function displayValue(language, value) {
  const keys = { Unbekannt: "unknown", "Ohne Endpoint": "noEndpoint", Aktiviert: "enabled", Deaktiviert: "disabled", Geschützt: "protected", Gruppen: "groups", Andere: "other" };
  return keys[value] ? tr(language, keys[value]) : value;
}

const englishErrorParts = {
  "Unvollständige Gerätedaten.": "Incomplete device data.",
  "Endpoint ohne eindeutige ID.": "Endpoint has no unique ID.",
  "Doppelte Endpoint-ID.": "Duplicate endpoint ID.",
  "Mehrdeutige Gerätezuordnung. Laden abgebrochen.": "Ambiguous device mapping. Loading stopped.",
  "Fehlende oder doppelte Geräte-ID.": "Missing or duplicate device ID.",
  "Echo-Geräteliste fehlt.": "Echo device list is missing.",
  "Echo nicht eindeutig über eine Geräte-ID zugeordnet. Keine Sprachausgabe gesendet.": "The Echo could not be mapped unambiguously by device ID. Nothing was sent.",
  "Vollständige Echo-Zieldaten fehlen.": "Complete Echo target data is missing.",
  "Amazon begrenzt die Anfragen. Bitte später neu laden.": "Amazon is rate limiting requests. Please reload later.",
  "Amazon lieferte kein JSON. Anmeldung prüfen.": "Amazon did not return JSON. Check the sign-in.",
  "Amazon hat die Anfrage abgelehnt.": "Amazon rejected the request.",
  "Löschung von Amazon nicht bestätigt.": "Amazon did not confirm the deletion.",
  "Amazon listet diesen Endpoint noch auf, findet aber keine löschbare Ressource. Keine sichere Legacy-ID für einen Rückfall vorhanden.": "Amazon still lists this endpoint but cannot find a deletable resource. No safe legacy ID is available for a fallback.",
  "Zielstatus von Amazon nicht bestätigt.": "Amazon did not confirm the target state.",
  "Amazon hat den Schaltbefehl nicht bestätigt.": "Amazon did not confirm the switch command.",
  "Bitte einen Text eingeben.": "Please enter text.",
  "Unbekannte Alexa-Aktion.": "Unknown Alexa action.",
  "Unbekannte Aktion.": "Unknown action.",
  "Geschützte Ziele müssen einzeln freigegeben werden.": "Protected targets must be approved individually.",
  "Auswahl enthält keine oder ungeeignete Ziele.": "The selection is empty or contains unsuitable targets.",
  "Nach Anfragelimit oder Anmeldefehler übersprungen.": "Skipped after a rate limit or sign-in error.",
  "Nachkontrolle ausstehend.": "Verification pending."
};

export function localizeMessage(language, message) {
  if (language !== "en") return String(message);
  let value = String(message);
  for (const [german, english] of Object.entries(englishErrorParts))
    value = value.replaceAll(german, english);
  return value.replace(/Amazon-Anfrage fehlgeschlagen \(HTTP (\d+)\)\./, "Amazon request failed (HTTP $1).");
}
