"use client";

import { useState, useCallback } from "react";
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
        <div className="mt-4 flex flex-col gap-5">
            <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">UK Wind Power Monitor</h1>
                        <p className="text-sm text-slate-500">Compare actual generation with forecasted values by time window and forecast horizon.</p>
                    </div>
                    <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                        {isLoading ? "Syncing latest values..." : `${actuals.length} actual points • ${forecasts.length} forecast points`}
                    </div>
                </div>

                <Controls onSearch={handleSearch} isLoading={isLoading} />

                {error && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-semibold text-red-800">Error fetching data</h3>
                                <div className="mt-1 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            <section className="w-full rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm sm:p-5">
                <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-600 sm:text-sm">
                    <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-green-600" />Actual Generation</span>
                    <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" />Forecast Generation</span>
                </div>

                <div className="h-[520px] w-full rounded-xl bg-white">
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
