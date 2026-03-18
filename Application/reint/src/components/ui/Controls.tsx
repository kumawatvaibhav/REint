"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface ControlsProps {
    onSearch: (startDate: string, endDate: string, horizon: number) => void;
    isLoading: boolean;
}

const MAX_WINDOW_HOURS = 30 * 24;
const DEFAULT_START = "2024-01-01T00:00";
const DEFAULT_END = "2024-01-02T00:00";

const WINDOW_PRESETS = [
    { hours: 24, label: "24h" },
    { hours: 72, label: "72h" },
    { hours: 168, label: "7d" },
    { hours: 336, label: "14d" },
    { hours: 720, label: "30d" },
];

const HORIZON_PRESETS = [2, 4, 8, 24];

function asUtcDate(inputValue: string) {
    return new Date(`${inputValue}:00Z`);
}

function toInputValue(date: Date) {
    return date.toISOString().slice(0, 16);
}

function sanitizeRange(startRaw: string, endRaw: string) {
    const startDate = asUtcDate(startRaw);
    const endDate = asUtcDate(endRaw);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return null;
    }

    let normalizedStart = startDate;
    let normalizedEnd = endDate;

    if (normalizedEnd < normalizedStart) {
        normalizedEnd = new Date(normalizedStart.getTime() + 24 * 60 * 60 * 1000);
    }

    const spanHours = (normalizedEnd.getTime() - normalizedStart.getTime()) / (60 * 60 * 1000);
    if (spanHours > MAX_WINDOW_HOURS) {
        normalizedEnd = new Date(normalizedStart.getTime() + MAX_WINDOW_HOURS * 60 * 60 * 1000);
    }

    const nextStart = toInputValue(normalizedStart);
    const nextEnd = toInputValue(normalizedEnd);

    return {
        nextStart,
        nextEnd,
        startIso: normalizedStart.toISOString(),
        endIso: normalizedEnd.toISOString(),
        changed: nextStart !== startRaw || nextEnd !== endRaw,
    };
}

export function Controls({ onSearch, isLoading }: ControlsProps) {
    const [startStr, setStartStr] = useState(DEFAULT_START);
    const [endStr, setEndStr] = useState(DEFAULT_END);
    const [horizon, setHorizon] = useState(4);
    const [autoSync, setAutoSync] = useState(true);
    const hasInitializedRef = useRef(false);

    const triggerSearch = useCallback(() => {
        const normalized = sanitizeRange(startStr, endStr);
        if (!normalized) return;

        if (normalized.changed) {
            setStartStr(normalized.nextStart);
            setEndStr(normalized.nextEnd);
        }

        onSearch(normalized.startIso, normalized.endIso, horizon);
    }, [startStr, endStr, horizon, onSearch]);

    useEffect(() => {
        if (!autoSync) return;
        const delay = hasInitializedRef.current ? 900 : 180;
        const timer = setTimeout(() => {
            triggerSearch();
            hasInitializedRef.current = true;
        }, delay);
        return () => clearTimeout(timer);
    }, [triggerSearch, autoSync]);

    const applyWindowPreset = useCallback((hours: number) => {
        const startDate = asUtcDate(startStr);
        if (Number.isNaN(startDate.getTime())) return;
        const nextEnd = new Date(startDate.getTime() + hours * 60 * 60 * 1000);
        setEndStr(toInputValue(nextEnd));
    }, [startStr]);

    const spanLabel = useMemo(() => {
        const normalized = sanitizeRange(startStr, endStr);
        if (!normalized) return "--";
        const startTime = new Date(normalized.startIso).getTime();
        const endTime = new Date(normalized.endIso).getTime();
        const span = Math.round((endTime - startTime) / (60 * 60 * 1000));
        return `${span}h`;
    }, [startStr, endStr]);



    return (
        <div className="w-full space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="section-kicker">Query studio</p>
                    <h3 className="mt-1 text-lg font-semibold text-[var(--ink-900)] md:text-xl">Window + horizon controls</h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setAutoSync((value) => !value)}
                        className="rounded-full border border-[var(--line-soft)] bg-white/75 px-3 py-1.5 text-xs font-medium text-[var(--ink-700)] transition hover:bg-white"
                    >
                        {autoSync ? "auto sync: on" : "auto sync: off"}
                    </button>

                    <button
                        type="button"
                        onClick={triggerSearch}
                        disabled={isLoading}
                        className="rounded-full border border-transparent bg-[var(--sun)] px-4 py-1.5 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(255,122,50,0.35)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isLoading ? "syncing" : "apply now"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <label className="block rounded-xl border border-[var(--line-soft)] bg-white/73 p-4">
                    <span className="text-xs uppercase tracking-[0.12em] text-[var(--ink-500)]">Start time (UTC)</span>
                    <input
                        type="datetime-local"
                        id="startStr"
                        value={startStr}
                        onChange={(e) => setStartStr(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-[var(--line-soft)] bg-white px-3 py-2.5 text-sm text-[var(--ink-900)] shadow-sm outline-none transition focus:border-[var(--ocean)] focus:ring-2 focus:ring-[rgba(15,123,159,0.2)]"
                    />
                </label>

                <label className="block rounded-xl border border-[var(--line-soft)] bg-white/73 p-4">
                    <span className="text-xs uppercase tracking-[0.12em] text-[var(--ink-500)]">End time (UTC)</span>
                    <input
                        type="datetime-local"
                        id="endStr"
                        value={endStr}
                        onChange={(e) => setEndStr(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-[var(--line-soft)] bg-white px-3 py-2.5 text-sm text-[var(--ink-900)] shadow-sm outline-none transition focus:border-[var(--ocean)] focus:ring-2 focus:ring-[rgba(15,123,159,0.2)]"
                    />
                </label>
            </div>

            <section className="rounded-xl border border-[var(--line-soft)] bg-white/72 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <label htmlFor="horizon" className="text-xs uppercase tracking-[0.12em] text-[var(--ink-500)]">
                        Forecast horizon
                    </label>
                    <span className="data-pill">{horizon}h</span>
                </div>

                <input
                    type="range"
                    id="horizon"
                    min="1"
                    max="48"
                    value={horizon}
                    onChange={(e) => setHorizon(parseInt(e.target.value, 10))}
                    className="mt-3 h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-[linear-gradient(90deg,rgba(31,63,118,0.18)_0%,rgba(255,122,50,0.25)_100%)]"
                />

                <div className="mt-3 flex flex-wrap gap-2">
                    {HORIZON_PRESETS.map((hours) => (
                        <button
                            key={hours}
                            type="button"
                            onClick={() => setHorizon(hours)}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                                horizon === hours
                                    ? "bg-[var(--blueprint)] text-white"
                                    : "border border-[var(--line-soft)] bg-white text-[var(--ink-700)] hover:bg-[rgba(15,123,159,0.08)]"
                            }`}
                        >
                            {hours}h lead
                        </button>
                    ))}
                </div>
            </section>

            <section className="rounded-xl border border-[var(--line-soft)] bg-white/72 p-4">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-[var(--ink-500)]">Window presets</p>
                    <span className="data-pill">span {spanLabel}</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {WINDOW_PRESETS.map((preset) => (
                        <button
                            key={preset.hours}
                            type="button"
                            onClick={() => applyWindowPreset(preset.hours)}
                            className="rounded-xl border border-[var(--line-soft)] bg-white px-3 py-2 text-xs font-semibold text-[var(--ink-700)] transition hover:bg-[rgba(255,122,50,0.1)]"
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>

                <p className="mt-3 text-xs text-[var(--ink-500)]">
                    Range length is capped at 30 days to keep responses reliable and charts responsive.
                </p>
            </section>
        </div>
    );
}
