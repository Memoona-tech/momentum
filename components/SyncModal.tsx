"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  ArrowLeftRight,
  Calendar,
  Check,
  Copy,
  Download,
  FileJson,
  Layers,
  ShieldCheck,
  Sparkles,
  Upload,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import Modal from "./Modal";
import { useData } from "@/lib/DataContext";
import {
  DateScope,
  filterExportData,
  inspectPayload,
  InspectionResult,
  MergeOptions,
  MergeResult,
} from "@/lib/sync";
import { todayStr } from "@/lib/schedule";
import { format, subDays } from "date-fns";

export default function SyncModal({ onClose }: { onClose: () => void }) {
  const { habits, categories, logs, settings, mergeData } = useData();

  const [activeTab, setActiveTab] = useState<"export" | "import">("export");

  // Export State
  const [exportScopeType, setExportScopeType] = useState<
    "all" | "today" | "yesterday" | "week" | "range"
  >("today");
  const today = todayStr();
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
  const sevenDaysAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");

  const [customExportStart, setCustomExportStart] = useState(today);
  const [customExportEnd, setCustomExportEnd] = useState(today);
  const [copySuccess, setCopySuccess] = useState(false);

  // Compute active export scope
  const currentExportScope = useMemo<DateScope>(() => {
    switch (exportScopeType) {
      case "today":
        return { type: "single", startDate: today, endDate: today };
      case "yesterday":
        return { type: "single", startDate: yesterday, endDate: yesterday };
      case "week":
        return { type: "range", startDate: sevenDaysAgo, endDate: today };
      case "range":
        return {
          type: "range",
          startDate: customExportStart,
          endDate: customExportEnd,
        };
      case "all":
      default:
        return { type: "all" };
    }
  }, [
    exportScopeType,
    today,
    yesterday,
    sevenDaysAgo,
    customExportStart,
    customExportEnd,
  ]);

  const exportPayload = useMemo(() => {
    return filterExportData(
      { habits, categories, logs, settings },
      currentExportScope,
    );
  }, [habits, categories, logs, settings, currentExportScope]);

  const exportPayloadString = useMemo(() => {
    return JSON.stringify(exportPayload, null, 2);
  }, [exportPayload]);

  // Import State
  const [importInputMode, setImportInputMode] = useState<"file" | "paste">("paste");
  const [pastedText, setPastedText] = useState("");
  const [importScopeType, setImportScopeType] = useState<
    "all" | "single" | "range"
  >("all");
  const [importStartDate, setImportStartDate] = useState(today);
  const [importEndDate, setImportEndDate] = useState(today);
  const [mergeMode, setMergeMode] = useState<
    "merge" | "overwrite-range" | "replace-all"
  >("merge");
  const [mergeFeedback, setMergeFeedback] = useState<MergeResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inspection
  const inspection = useMemo<InspectionResult>(() => {
    if (!pastedText.trim()) {
      return {
        isValid: false,
        habitsCount: 0,
        categoriesCount: 0,
        logsCount: 0,
        dates: [],
      };
    }
    return inspectPayload(pastedText);
  }, [pastedText]);

  // Handle Export Copy
  async function handleCopyExport() {
    try {
      await navigator.clipboard.writeText(exportPayloadString);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch {
      handleDownloadExport();
    }
  }

  // Handle Export Download
  function handleDownloadExport() {
    const blob = new Blob([exportPayloadString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    let filenameSuffix = "all";
    if (currentExportScope.type === "single" && currentExportScope.startDate) {
      filenameSuffix = currentExportScope.startDate;
    } else if (currentExportScope.type === "range" && currentExportScope.startDate) {
      filenameSuffix = `${currentExportScope.startDate}_to_${currentExportScope.endDate || "today"}`;
    }
    link.download = `momentum-sync-${filenameSuffix}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Handle Import File Load
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result ?? "");
      setPastedText(content);
      // Auto-switch to review
      const inspected = inspectPayload(content);
      if (inspected.isValid && inspected.exportScope?.startDate) {
        if (inspected.exportScope.type === "single") {
          setImportScopeType("single");
          setImportStartDate(inspected.exportScope.startDate);
          setImportEndDate(inspected.exportScope.startDate);
        } else if (inspected.exportScope.type === "range") {
          setImportScopeType("range");
          setImportStartDate(inspected.exportScope.startDate);
          setImportEndDate(inspected.exportScope.endDate || inspected.exportScope.startDate);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // Handle Merge Execution
  function handleExecuteMerge() {
    if (!inspection.isValid || !inspection.payload) return;

    if (mergeMode === "replace-all") {
      if (
        !confirm(
          "Replace All will overwrite all current habits and logs on this device with the imported backup. Continue?",
        )
      ) {
        return;
      }
    }

    const options: MergeOptions = {
      mode: mergeMode,
      startDate:
        importScopeType === "single"
          ? importStartDate
          : importScopeType === "range"
          ? importStartDate
          : undefined,
      endDate:
        importScopeType === "single"
          ? importStartDate
          : importScopeType === "range"
          ? importEndDate
          : undefined,
    };

    const result = mergeData(inspection.payload, options);
    setMergeFeedback(result);
  }

  const inputCls =
    "w-full bg-void-800 border border-void-600 rounded-lg px-3 py-2 text-sm text-parchment focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500";

  return (
    <Modal title="Sync & Transfer Data (PC ⇋ Phone)" onClose={onClose}>
      <div className="flex flex-col gap-5">
        {/* Navigation Tabs */}
        <div className="flex rounded-xl bg-void-800 p-1 border border-void-700">
          <button
            type="button"
            onClick={() => {
              setActiveTab("export");
              setMergeFeedback(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "export"
                ? "bg-gold-500 text-void-950 shadow"
                : "text-void-400 hover:text-parchment"
            }`}
          >
            <Download size={14} /> Export from this device
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("import");
              setMergeFeedback(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "import"
                ? "bg-gold-500 text-void-950 shadow"
                : "text-void-400 hover:text-parchment"
            }`}
          >
            <Upload size={14} /> Import & Smart Merge
          </button>
        </div>

        {/* EXPORT TAB */}
        {activeTab === "export" && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-void-300 mb-2">
                Select Date or Range to Export
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "today", label: `Today (${today.slice(5)})` },
                  { id: "yesterday", label: `Yesterday (${yesterday.slice(5)})` },
                  { id: "week", label: "Last 7 Days" },
                  { id: "range", label: "Custom Range" },
                  { id: "all", label: "All Time (Full)" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setExportScopeType(item.id as any)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all text-center ${
                      exportScopeType === item.id
                        ? "border-gold-500 bg-gold-500/15 text-gold-300"
                        : "border-void-700 bg-void-800/80 text-void-400 hover:border-void-600 hover:text-parchment"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Range Date Pickers */}
            {exportScopeType === "range" && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-void-950/60 rounded-xl border border-void-700">
                <div>
                  <span className="block text-[11px] text-void-400 mb-1">
                    Start Date
                  </span>
                  <input
                    type="date"
                    value={customExportStart}
                    onChange={(e) => setCustomExportStart(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <span className="block text-[11px] text-void-400 mb-1">
                    End Date
                  </span>
                  <input
                    type="date"
                    value={customExportEnd}
                    onChange={(e) => setCustomExportEnd(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            )}

            {/* Payload summary info */}
            <div className="p-3.5 rounded-xl bg-void-950/70 border border-void-700/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Sparkles size={16} className="text-gold-400 shrink-0" />
                <span className="text-parchment">
                  Export ready: <strong>{exportPayload.habits.length}</strong>{" "}
                  habits, <strong>{exportPayload.logs.length}</strong> logs
                  {currentExportScope.type === "single"
                    ? ` for ${currentExportScope.startDate}`
                    : currentExportScope.type === "range"
                    ? ` (${currentExportScope.startDate} to ${currentExportScope.endDate})`
                    : " (all time)"}
                  .
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleCopyExport}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs bg-gold-500 hover:bg-gold-600 text-void-950 transition-colors shadow-sm"
              >
                {copySuccess ? (
                  <>
                    <Check size={16} /> Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy size={16} /> Copy Sync Text
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDownloadExport}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-xs bg-void-800 hover:bg-void-700 text-parchment border border-void-600 transition-colors"
              >
                <Download size={16} /> Download JSON File
              </button>
            </div>

            <p className="text-[11px] text-void-400 text-center leading-relaxed">
              💡 Tip: Click <strong>Copy Sync Text</strong> and paste it directly into
              Momentum on your other device (phone or PC).
            </p>
          </div>
        )}

        {/* IMPORT TAB */}
        {activeTab === "import" && (
          <div className="flex flex-col gap-4">
            {/* Input Method Toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setImportInputMode("paste")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  importInputMode === "paste"
                    ? "border-gold-500 bg-gold-500/10 text-gold-300"
                    : "border-void-700 bg-void-800 text-void-400"
                }`}
              >
                Paste text / clipboard
              </button>
              <button
                type="button"
                onClick={() => {
                  setImportInputMode("file");
                  fileInputRef.current?.click();
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  importInputMode === "file"
                    ? "border-gold-500 bg-gold-500/10 text-gold-300"
                    : "border-void-700 bg-void-800 text-void-400"
                }`}
              >
                Upload JSON file
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Paste Text Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-void-300">
                  Sync Payload JSON
                </span>
                {pastedText && (
                  <button
                    type="button"
                    onClick={() => {
                      setPastedText("");
                      setMergeFeedback(null);
                    }}
                    className="text-[11px] text-void-400 hover:text-red-400"
                  >
                    Clear
                  </button>
                )}
              </div>
              <textarea
                rows={4}
                value={pastedText}
                onChange={(e) => {
                  setPastedText(e.target.value);
                  setMergeFeedback(null);
                }}
                placeholder="Paste the JSON text copied from your PC or phone here..."
                className={`${inputCls} font-mono text-xs resize-none`}
              />
            </div>

            {/* Payload Inspection Feedback */}
            {pastedText.trim() && !inspection.isValid && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 flex items-center gap-2.5 text-xs text-red-300">
                <AlertTriangle size={16} className="shrink-0 text-red-400" />
                <span>{inspection.error || "Invalid payload format."}</span>
              </div>
            )}

            {inspection.isValid && inspection.payload && (
              <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-void-950/80 border border-void-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck size={15} /> Valid Momentum Export
                  </span>
                  <span className="text-[11px] text-void-400">
                    {inspection.dates.length} date
                    {inspection.dates.length === 1 ? "" : "s"} logged
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-void-900 border border-void-800">
                    <span className="block font-mono font-bold text-parchment">
                      {inspection.habitsCount}
                    </span>
                    <span className="text-[10px] text-void-400">Habits</span>
                  </div>
                  <div className="p-2 rounded-lg bg-void-900 border border-void-800">
                    <span className="block font-mono font-bold text-parchment">
                      {inspection.logsCount}
                    </span>
                    <span className="text-[10px] text-void-400">Logs</span>
                  </div>
                  <div className="p-2 rounded-lg bg-void-900 border border-void-800">
                    <span className="block font-mono font-bold text-parchment">
                      {inspection.categoriesCount}
                    </span>
                    <span className="text-[10px] text-void-400">Categories</span>
                  </div>
                </div>

                {inspection.minDate && (
                  <p className="text-[11px] text-void-400">
                    Dates in payload:{" "}
                    <strong className="text-parchment">
                      {inspection.minDate}
                    </strong>{" "}
                    {inspection.maxDate && inspection.maxDate !== inspection.minDate
                      ? `to ${inspection.maxDate}`
                      : ""}
                  </p>
                )}

                {/* Scope to apply */}
                <div className="pt-2 border-t border-void-800">
                  <span className="block text-xs font-medium text-void-300 mb-2">
                    Date Scope to Import:
                  </span>
                  <div className="flex gap-2">
                    {[
                      { id: "all", label: "All dates in payload" },
                      { id: "single", label: "Single day" },
                      { id: "range", label: "Date range" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setImportScopeType(opt.id as any)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-medium border ${
                          importScopeType === opt.id
                            ? "border-gold-500 bg-gold-500/10 text-gold-300"
                            : "border-void-700 bg-void-900 text-void-400"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {importScopeType === "single" && (
                    <div className="mt-2.5">
                      <span className="block text-[11px] text-void-400 mb-1">
                        Select Day to Merge
                      </span>
                      <input
                        type="date"
                        value={importStartDate}
                        onChange={(e) => {
                          setImportStartDate(e.target.value);
                          setImportEndDate(e.target.value);
                        }}
                        className={inputCls}
                      />
                    </div>
                  )}

                  {importScopeType === "range" && (
                    <div className="grid grid-cols-2 gap-2 mt-2.5">
                      <div>
                        <span className="block text-[11px] text-void-400 mb-1">
                          From
                        </span>
                        <input
                          type="date"
                          value={importStartDate}
                          onChange={(e) => setImportStartDate(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <span className="block text-[11px] text-void-400 mb-1">
                          To
                        </span>
                        <input
                          type="date"
                          value={importEndDate}
                          onChange={(e) => setImportEndDate(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Merge Strategy Selector */}
                <div className="pt-2 border-t border-void-800">
                  <span className="block text-xs font-medium text-void-300 mb-2">
                    Merge Strategy:
                  </span>
                  <div className="flex flex-col gap-2">
                    <label
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                        mergeMode === "merge"
                          ? "border-emerald-500/60 bg-emerald-500/10"
                          : "border-void-800 bg-void-900 hover:border-void-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="mergeMode"
                        checked={mergeMode === "merge"}
                        onChange={() => setMergeMode("merge")}
                        className="mt-0.5 text-emerald-500 focus:ring-0"
                      />
                      <div>
                        <p className="text-xs font-semibold text-parchment flex items-center gap-1.5">
                          🛡️ Smart Merge (Non-Destructive)
                        </p>
                        <p className="text-[11px] text-void-300 mt-0.5">
                          Preserves completed tasks from <strong>both</strong>{" "}
                          PC and Phone. No local progress is lost.
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                        mergeMode === "overwrite-range"
                          ? "border-gold-500/60 bg-gold-500/10"
                          : "border-void-800 bg-void-900 hover:border-void-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="mergeMode"
                        checked={mergeMode === "overwrite-range"}
                        onChange={() => setMergeMode("overwrite-range")}
                        className="mt-0.5 text-gold-500 focus:ring-0"
                      />
                      <div>
                        <p className="text-xs font-semibold text-parchment">
                          ⚡ Overwrite Selected Date(s) Only
                        </p>
                        <p className="text-[11px] text-void-300 mt-0.5">
                          Replaces logs for the selected date(s). All other dates
                          remain untouched.
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                        mergeMode === "replace-all"
                          ? "border-red-500/60 bg-red-500/10"
                          : "border-void-800 bg-void-900 hover:border-void-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="mergeMode"
                        checked={mergeMode === "replace-all"}
                        onChange={() => setMergeMode("replace-all")}
                        className="mt-0.5 text-red-500 focus:ring-0"
                      />
                      <div>
                        <p className="text-xs font-semibold text-parchment">
                          ⚠️ Full Overwrite (Replace All)
                        </p>
                        <p className="text-[11px] text-void-400 mt-0.5">
                          Wipes current device data and replaces it with this
                          backup entirely.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Execute Button */}
                <button
                  type="button"
                  onClick={handleExecuteMerge}
                  className="mt-1 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs bg-gold-500 hover:bg-gold-600 text-void-950 transition-colors shadow-sm"
                >
                  <RefreshCw size={15} /> Apply Sync & Merge
                </button>
              </div>
            )}

            {/* Merge Success Feedback */}
            {mergeFeedback && (
              <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-600/50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check size={18} />
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-emerald-300">
                    Sync completed successfully!
                  </p>
                  <p className="text-void-300 mt-0.5">
                    {mergeFeedback.addedLogs} logs added, {mergeFeedback.updatedLogs}{" "}
                    logs updated, {mergeFeedback.addedHabits} new habits merged
                    across {mergeFeedback.mergedDatesCount} date(s).
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
