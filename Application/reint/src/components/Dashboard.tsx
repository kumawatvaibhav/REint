"use client";

import { useState, useCallback, useMemo } from "react";
import { Controls } from "../components/ui/Controls";
import { WindChart } from "../components/ui/Chart";

type WindDataPoint = {
    startTime: string;
    generation: number;
};

export function Dashboard() {
    const [actuals, setActuals] = useState<WindDataPoint[]>([]);
    const [forecasts, setForecasts] = useState<WindDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const metrics = useMemo(() => {
        const average = (list: WindDataPoint[]) => {
            if (list.length === 0) return null;
            return list.reduce((sum, point) => sum + point.generation, 0) / list.length;
        };

        const forecastByTime = new Map(
            forecasts
                .map((point) => [new Date(point.startTime).getTime(), point.generation] as const)
                .filter(([time]) => Number.isFinite(time))
        );

        const overlapPairs = actuals.flatMap((point) => {
            const time = new Date(point.startTime).getTime();
            const forecastValue = forecastByTime.get(time);
            if (!Number.isFinite(time) || forecastValue === undefined) {
                return [];
            }
            return [{
                time,
                actual: point.generation,
                forecast: forecastValue,
            }];
        });

        const meanAbsoluteError = overlapPairs.length > 0
            ? overlapPairs.reduce((sum, pair) => sum + Math.abs(pair.actual - pair.forecast), 0) / overlapPairs.length
            : null;

        const latestPair = overlapPairs.length > 0 ? overlapPairs[overlapPairs.length - 1] : null;
        const latestDelta = latestPair ? latestPair.actual - latestPair.forecast : null;
        const latestDeltaPct = latestPair && latestPair.forecast !== 0
            ? ((latestPair.actual - latestPair.forecast) / latestPair.forecast) * 100
            : null;

        const latestTimestamp = [...actuals, ...forecasts].reduce<number | null>((max, point) => {
            const value = new Date(point.startTime).getTime();
            if (!Number.isFinite(value)) return max;
            if (max === null) return value;
            return Math.max(max, value);
        }, null);

        return {
            actualMean: average(actuals),
            forecastMean: average(forecasts),
            overlapCount: overlapPairs.length,
            mae: meanAbsoluteError,
            latestDelta,
            latestDeltaPct,
            latestTimestamp,
        };
    }, [actuals, forecasts]);

    const formatPower = useCallback((value: number | null) => {
        if (value === null) return "--";
        return `${Math.round(value).toLocaleString("en-GB")} MW`;
    }, []);

    const formatPct = useCallback((value: number | null) => {
        if (value === null || Number.isNaN(value)) return "--";
        const sign = value > 0 ? "+" : "";
        return `${sign}${value.toFixed(1)}%`;
    }, []);

    const lastUpdatedText = useMemo(() => {
        if (metrics.latestTimestamp === null) {
            return "No synchronized points yet";
        }
        const formatted = new Intl.DateTimeFormat("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "UTC",
        }).format(metrics.latestTimestamp);
        return `${formatted} UTC`;
    }, [metrics.latestTimestamp]);

    const fetchWithTimeout = useCallback(async (url: string, timeoutMs = 20000) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) {
                let message = `Request failed with status ${response.status}`;
                try {
                    const body = await response.json();
                    if (body?.error && typeof body.error === "string") {
                        message = body.error;
                    }
                } catch {
                    // Ignore non-JSON error payloads.
                }
                throw new Error(message);
            }

            return response.json();
        } finally {
            clearTimeout(timeoutId);
        }
    }, []);

    const fetchData = useCallback(async (startIso: string, endIso: string, horizon: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const [actualsResult, forecastsResult] = await Promise.allSettled([
                fetchWithTimeout(`/api/actuals?start=${startIso}&end=${endIso}`),
                fetchWithTimeout(`/api/forecasts?start=${startIso}&end=${endIso}&horizon=${horizon}`)
            ]);

            const actualsPayload = actualsResult.status === "fulfilled" ? actualsResult.value : [];
            const forecastsPayload = forecastsResult.status === "fulfilled" ? forecastsResult.value : [];

            const actualsData = Array.isArray(actualsPayload) ? actualsPayload : [];
            const forecastsData = Array.isArray(forecastsPayload) ? forecastsPayload : [];

            setActuals(actualsData);
            setForecasts(forecastsData);

            if (actualsData.length === 0 && forecastsData.length === 0) {
                const errorMessages = [actualsResult, forecastsResult]
                    .filter((result): result is PromiseRejectedResult => result.status === "rejected")
                    .map((result) => result.reason instanceof Error ? result.reason.message : "Unknown API error");

                if (errorMessages.length > 0) {
                    throw new Error(errorMessages.join(" | "));
                }
            }
        } catch (err: unknown) {
            console.error(err);
            if (err instanceof Error && err.name === "AbortError") {
                setError("Request timed out. Please try a shorter date range or retry.");
            } else {
                setError(err instanceof Error ? err.message : "An error occurred while fetching data.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [fetchWithTimeout]);

    const handleSearch = useCallback((start: string, end: string, horizon: number) => {
        fetchData(start, end, horizon);
    }, [fetchData]);

    return (
        <div className="space-y-6 pb-6 pt-3">
            <section className="surface-panel reveal-enter px-5 py-6 md:px-8 md:py-8">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="max-w-3xl">
                        <p className="section-kicker">REint control room</p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink-900)] md:text-4xl">
                            Wind Forecast Reliability Studio
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--ink-500)] md:text-base">
                            Compare actual UK wind generation against
                            forecast curves, tune horizon lead times, and inspect how deviation shifts across the selected window.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="data-pill">feed: elexon bmrs</span>
                            <span className="data-pill">zone: uk wind</span>
                            <span className="data-pill">render: near real-time</span>
                        </div>
                    </div>

                    <div className="metric-card min-w-0 p-4 md:w-[21rem]">
                        <p className="section-kicker">Stream status</p>
                        <p className="mt-2 text-base font-semibold text-[var(--ink-900)]">
                            {isLoading ? "Synchronizing live feeds" : "Live stream ready"}
                        </p>
                        <p className="mt-2 text-sm text-[var(--ink-500)]">Last synchronized point: {lastUpdatedText}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="data-pill">actual points: {actuals.length}</span>
                            <span className="data-pill">forecast points: {forecasts.length}</span>
                            <span className="data-pill">overlap pairs: {metrics.overlapCount}</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
                <section className="surface-panel reveal-enter reveal-delay-1 p-5 md:p-6">
                    <Controls onSearch={handleSearch} isLoading={isLoading} />
                </section>

                <section className="surface-panel reveal-enter reveal-delay-2 p-5 md:p-6">
                    <p className="section-kicker">Snapshot metrics</p>
                    <h2 className="mt-2 text-xl font-semibold text-[var(--ink-900)]">Forecast accuracy pulse</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <article className="metric-card p-4">
                            <p className="text-xs uppercase tracking-[0.12em] text-[var(--ink-500)]">Average actual</p>
                            <p className="mt-2 text-lg font-semibold text-[var(--ink-900)]">{formatPower(metrics.actualMean)}</p>
                        </article>

                        <article className="metric-card p-4">
                            <p className="text-xs uppercase tracking-[0.12em] text-[var(--ink-500)]">Average forecast</p>
                            <p className="mt-2 text-lg font-semibold text-[var(--ink-900)]">{formatPower(metrics.forecastMean)}</p>
                        </article>

                        <article className="metric-card p-4">
                            <p className="text-xs uppercase tracking-[0.12em] text-[var(--ink-500)]">Mean absolute error</p>
                            <p className="mt-2 text-lg font-semibold text-[var(--ink-900)]">{formatPower(metrics.mae)}</p>
                        </article>

                        <article className="metric-card p-4">
                            <p className="text-xs uppercase tracking-[0.12em] text-[var(--ink-500)]">Latest delta</p>
                            <p className="mt-2 text-lg font-semibold text-[var(--ink-900)]">{formatPower(metrics.latestDelta)}</p>
                            <p className="mt-1 font-mono text-xs text-[var(--ink-500)]">{formatPct(metrics.latestDeltaPct)} vs latest overlap</p>
                        </article>
                    </div>

                    <div className="mt-4 rounded-xl border border-[var(--line-soft)] bg-white/70 px-4 py-3 text-sm text-[var(--ink-500)]">
                        Values update whenever range or horizon changes. If either stream returns no points, metrics stay visible
                        while awaiting a valid overlap window.
                    </div>
                </section>
            </div>

            {error && (
                <section className="reveal-enter rounded-2xl border border-red-200/90 bg-gradient-to-r from-red-50 to-orange-50 px-5 py-4">
                    <div className="flex gap-3">
                        <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-red-500" />
                        <div>
                            <p className="text-sm font-semibold text-red-800">Data stream warning</p>
                            <p className="mt-1 text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </section>
            )}

            <section className="surface-panel reveal-enter reveal-delay-2 w-full p-4 sm:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="section-kicker">Generation timeline</p>
                        <h2 className="mt-1 text-xl font-semibold text-[var(--ink-900)] md:text-2xl">Actual vs forecast curve</h2>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-[var(--ink-700)]">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line-soft)] bg-white/80 px-3 py-1">
                            <span className="h-2.5 w-2.5 rounded-full bg-[var(--sun)]" />
                            actual generation
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line-soft)] bg-white/80 px-3 py-1">
                            <span className="h-2.5 w-2.5 rounded-full bg-[var(--ocean)]" />
                            forecast generation
                        </span>
                    </div>
                </div>

                <div className="h-[560px] w-full rounded-2xl border border-[var(--line-soft)] bg-white/76 p-2 md:p-4">
                    <WindChart
                        actuals={actuals}
                        forecasts={forecasts}
                        isLoading={isLoading}
                    />
                </div>
            </section>
        </div>
    );
}
