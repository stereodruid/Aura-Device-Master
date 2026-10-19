import { useState, useCallback, useRef } from "react";
import { createAlexaClient, runBatch, deviceName, isProtected } from "../alexa";
import { localizeMessage, tr } from "../i18n";

const client = createAlexaClient();
export function useAlexa(language = "de") {
  const [devices, setDevices] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);
  const [loadedAt, setLoadedAt] = useState(null);
  const [logs, setLogs] = useState([{ text: tr(language, "cliReady"), level: "info" }]);
  const [progress, setProgress] = useState(null);
  const lock = useRef(false);
  const cancelRequested = useRef(false);
  const latest = useRef([]);
  const readyRef = useRef(false);
  const logger = useCallback(
    (message, level = "info") =>
      setLogs((prev) => [
        ...prev.slice(-299),
        {
          text: `[${new Date().toLocaleTimeString(language === "de" ? "de-DE" : "en-US")}] ${message}`,
          level,
        },
      ]),
    [language],
  );
  const publish = (data) => {
    latest.current = data;
    setDevices(data);
    setLoadedAt(new Date());
    readyRef.current = true;
    setReady(true);
  };
  const fetchDevices = useCallback(async () => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    readyRef.current = false;
    setReady(false);
    try {
      const data = await client.load();
      publish(data);
      logger(tr(language, "loaded", { count: data.length }));
    } catch (e) {
      const message = localizeMessage(language, e.message);
      setError(tr(language, "stale", { message }));
      logger(message, "error");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }, [logger, language]);
  const execute = async (list, action, approval) => {
    if (lock.current || !readyRef.current) return false;
    const voiceAction = ["speak", "announce", "command"].includes(action);
    if ((!voiceAction && !approval?.backup) || !approval?.preview) {
      logger(tr(language, "safeguardsMissing"), "error");
      return false;
    }
    const current = list.map((d) => latest.current.find((x) => x.id === d.id));
    if (
      !voiceAction &&
      current.some(
        (d, i) =>
          !d ||
          d._admEndpointId !== list[i]._admEndpointId ||
          d._admApplianceId !== list[i]._admApplianceId,
      )
    ) {
      logger(tr(language, "staleSelection"), "error");
      return false;
    }
    if (
      !voiceAction &&
      current.some(
        (d) => isProtected(d) && !approval.allowProtectedIds?.includes(d.id),
      )
    ) {
      logger(tr(language, "protectedMissing"), "error");
      return false;
    }
    lock.current = true;
    cancelRequested.current = false;
    setBusy(true);
    setError(null);
    try {
      if (["on", "off", "speak", "announce", "command"].includes(action)) {
        if (current.length !== 1)
          throw new Error(tr(language, "exactlyOne"));
        if (["speak", "announce", "command"].includes(action))
          await client.sendAlexaAction(current[0], approval.text || "", action, approval.locale || (language === "de" ? "de-DE" : "en-US"));
        else await client.power(current[0], action === "on");
        const actionLabel = action === "speak" ? tr(language, "speechOutput") : action === "announce" ? tr(language, "announcementOutput") : action === "command" ? tr(language, "commandOutput") : tr(language, "switchCommand");
        logger(
          tr(language, "requested", { name: deviceName(current[0]), action: actionLabel }),
        );
        return true;
      }
      if (["groupCreate", "groupRename"].includes(action)) {
        const name = String(approval?.groupName || "").trim();
        if (!name) throw new Error(tr(language, "groupNameRequired"));
        if (action === "groupCreate") {
          await client.createGroup(name, current.map((device) => device._admEndpointId));
          logger(tr(language, "groupCreated", { name, count: current.length }));
        } else {
          if (current.length !== 1 || !current[0]._admGroupId)
            throw new Error(tr(language, "exactlyOneGroup"));
          await client.renameGroup(current[0]._admGroupId, name);
          logger(tr(language, "groupRenamed", { name }));
        }
        publish(await client.load());
        return true;
      }
      const outcome = await runBatch(client, current, action, {
        allowProtectedIds: approval.allowProtectedIds,
        logger: (message, level) => logger(localizeMessage(language, message), level),
        onProgress: setProgress,
        shouldCancel: () => cancelRequested.current,
      });
      const unavailable = new Set(
        outcome.results
          .filter((result) => result.errorCode === "NO_SAFE_DELETE_ID")
          .map((result) => result.device.id),
      );
      if (outcome.devices)
        publish(
          outcome.devices.map((device) =>
            unavailable.has(device.id)
              ? { ...device, _admDeleteUnavailable: true }
              : device,
          ),
        );
      else if (unavailable.size) {
        const marked = latest.current.map((device) =>
          unavailable.has(device.id)
            ? { ...device, _admDeleteUnavailable: true }
            : device,
        );
        latest.current = marked;
        setDevices(marked);
      }
      if (outcome.cancelled)
        logger(tr(language, "batchCancelled"), "error");
      if (!outcome.verified) {
        readyRef.current = false;
        setReady(false);
        throw new Error(
          tr(language, "verificationFailed"),
        );
      }
      const failed = outcome.results.filter((r) => !r.success);
      for (const r of failed.filter((result) => !result.skipped))
        logger(
          `${deviceName(r.device)}: ${r.error ? localizeMessage(language, r.error) : tr(language, "targetNotReached")}`,
          "error",
        );
      logger(
        tr(language, "changesConfirmed", { success: outcome.results.length - failed.length, total: outcome.results.length }),
      );
      if (failed.length)
        logger(tr(language, "actionsFailed", { count: failed.length }), "error");
      return !failed.length;
    } catch (e) {
      const message = localizeMessage(language, e.message);
      setError(null);
      logger(message, "error");
      return false;
    } finally {
      lock.current = false;
      setBusy(false);
      setProgress(null);
      cancelRequested.current = false;
    }
  };
  const cancelBatch = () => {
    if (!lock.current) return;
    cancelRequested.current = true;
    logger(tr(language, "batchCancelRequested"));
  };
  return {
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
  };
}
