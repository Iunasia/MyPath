"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ApiAuditEntry } from "@/app/lib/api";
import { useAdminLoad } from "./ui";

export type EditorMode = "view" | "edit" | "create";

/** A row managed by the editor — the fields the hook needs to track. */
export interface EditableRow {
  id: number;
  archived_at: string | null;
  edited_at: string | null;
}

/**
 * The entity-specific wiring. Define this at module scope so its identity is
 * stable — the hook rebuilds the loader whenever `resource` changes.
 */
export interface ContentResource<T extends EditableRow, TInput> {
  fetchAll: (options: { includeArchived: boolean }) => Promise<T[]>;
  create: (input: TInput) => Promise<T>;
  update: (id: number, input: TInput) => Promise<T>;
  archive: (id: number, reason?: string) => Promise<T>;
  restore: (id: number) => Promise<T>;
  history: (id: number) => Promise<ApiAuditEntry[]>;
  exportCsv: (includeArchived: boolean) => Promise<Blob>;
  /** Optional verify / mark-checked action, e.g. for scholarships. */
  verify?: (id: number) => Promise<T>;
}

/**
 * The behaviour shared by every catalogue editor: list + archived toggle,
 * selection, create/edit/view modes, archive/restore, history, CSV export, and
 * the transient notice. Pages supply the resource and the form.
 */
export function useContentEditor<T extends EditableRow, TInput>({
  resource,
  initialMode = "view",
}: {
  resource: ContentResource<T, TInput>;
  initialMode?: EditorMode;
}) {
  const [includeArchived, setIncludeArchived] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mode, setMode] = useState<EditorMode>(initialMode);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmArchive, setConfirmArchive] = useState<T | null>(null);
  const [archiveReason, setArchiveReason] = useState("");
  const [historyState, setHistoryState] = useState<{ id: number; entries: ApiAuditEntry[] } | null>(null);

  const load = useCallback(
    () => resource.fetchAll({ includeArchived }),
    [resource, includeArchived]
  );
  const { data, setData, error, loading, reload } = useAdminLoad(load);

  const rows = useMemo(() => data ?? [], [data]);
  const selected = rows.find((row) => row.id === selectedId) ?? null;

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 2600);
    return () => clearTimeout(timer);
  }, [notice]);

  // History is tagged with its id, so a stale response never shows under a
  // different row and nothing has to be cleared on deselect.
  const historyTargetId = mode === "view" && selected ? selected.id : null;
  const historyVersion = mode === "view" && selected ? selected.edited_at : null;
  useEffect(() => {
    if (historyTargetId === null) return;
    let cancelled = false;
    resource
      .history(historyTargetId)
      .then((entries) => {
        if (!cancelled) setHistoryState({ id: historyTargetId, entries });
      })
      .catch(() => {
        if (!cancelled) setHistoryState({ id: historyTargetId, entries: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [resource, historyTargetId, historyVersion]);

  const history = historyState && historyState.id === historyTargetId ? historyState.entries : null;

  const applyUpdate = useCallback(
    (updated: T) => setData((prev) => prev?.map((row) => (row.id === updated.id ? updated : row)) ?? prev),
    [setData]
  );

  const open = useCallback((row: T) => {
    setSelectedId(row.id);
    setMode("view");
    setFormError("");
  }, []);

  const startCreate = useCallback(() => {
    setFormError("");
    setSelectedId(null);
    setMode("create");
  }, []);

  const startEdit = useCallback(() => {
    setFormError("");
    setMode("edit");
  }, []);

  const closeForm = useCallback(() => {
    setFormError("");
    setMode("view");
  }, []);

  const save = async (input: TInput, opts?: { keepCreating?: boolean }) => {
    setBusy(true);
    setFormError("");
    try {
      if (mode === "create") {
        const created = await resource.create(input);
        await reload();
        if (opts?.keepCreating) {
          setNotice("Added — ready for the next");
        } else {
          setSelectedId(created.id);
          setMode("view");
          setNotice("Added");
        }
      } else if (selected) {
        const updated = await resource.update(selected.id, input);
        applyUpdate(updated);
        setMode("view");
        setNotice("Changes saved");
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  const doArchive = async () => {
    if (!confirmArchive) return;
    setBusy(true);
    try {
      const archived = await resource.archive(confirmArchive.id, archiveReason.trim() || undefined);
      applyUpdate(archived);
      if (!includeArchived) setSelectedId(null);
      setConfirmArchive(null);
      setArchiveReason("");
      setNotice("Archived");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Could not archive");
    } finally {
      setBusy(false);
    }
  };

  const doRestore = async (row: T) => {
    setBusy(true);
    try {
      applyUpdate(await resource.restore(row.id));
      setNotice("Restored");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Could not restore");
    } finally {
      setBusy(false);
    }
  };

  const doVerify = async (id: number) => {
    if (!resource.verify) return;
    setBusy(true);
    try {
      applyUpdate(await resource.verify(id));
      setNotice("Marked as checked");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  const doExport = async (filename: string) => {
    try {
      const blob = await resource.exportCsv(includeArchived);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Export failed");
    }
  };

  return {
    includeArchived,
    setIncludeArchived,
    data,
    setData,
    rows,
    selected,
    mode,
    busy,
    formError,
    notice,
    setNotice,
    history,
    confirmArchive,
    setConfirmArchive,
    archiveReason,
    setArchiveReason,
    error,
    loading,
    reload,
    open,
    startCreate,
    startEdit,
    closeForm,
    save,
    doArchive,
    doRestore,
    doVerify,
    doExport
  };
}
