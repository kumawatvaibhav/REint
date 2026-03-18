"use client";

import { useEffect, useState } from "react";

interface ControlsProps {
    onSearch: (startDate: string, endDate: string, horizon: number) => void;
    isLoading: boolean;
}

export function Controls({ onSearch, isLoading }: ControlsProps) {
    // Defaulting to Jan 2024 to fetch actual historical records without issue
    const [startStr, setStartStr] = useState("2024-01-01T00:00");
    const [endStr, setEndStr] = useState("2024-01-02T00:00");
    const [horizon, setHorizon] = useState(4);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (startStr && endStr) {
                const s = new Date(`${startStr}:00Z`);
                let e = new Date(`${endStr}:00Z`);

                if (isNaN(s.getTime()) || isNaN(e.getTime())) return;

                // Sync bounds to prevent API timeouts if the user accidentally requests a huge timeframe
                if (e < s) {
                    e = new Date(s.getTime() + 24 * 60 * 60 * 1000);
                    setEndStr(e.toISOString().slice(0, 16));
                } else if (e.getTime() - s.getTime() > 14 * 24 * 60 * 60 * 1000) {
                    e = new Date(s.getTime() + 14 * 24 * 60 * 60 * 1000);
                    setEndStr(e.toISOString().slice(0, 16));
                }

                onSearch(s.toISOString(), e.toISOString(), horizon);
            }
        }, 1500); // 1.5s debounce
        return () => clearTimeout(timer);
    }, [startStr, endStr, horizon, onSearch]);

    return (
        <div className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(260px,1fr)] md:items-end">
                <div className="flex flex-col">
                    <label htmlFor="startStr" className="mb-1 text-sm font-medium text-slate-700">
                        Start time (UTC)
                    </label>
                    <input
                        type="datetime-local"
                        id="startStr"
                        value={startStr}
                        onChange={(e) => setStartStr(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    />
                </div>

                <div className="flex flex-col">
                    <label htmlFor="endStr" className="mb-1 text-sm font-medium text-slate-700">
                        End time (UTC)
                    </label>
                    <input
                        type="datetime-local"
                        id="endStr"
                        value={endStr}
                        onChange={(e) => setEndStr(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    />
                </div>

                <div className="flex flex-col">
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <label htmlFor="horizon" className="font-medium text-slate-700">
                            Forecast horizon
                        </label>
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 font-semibold text-blue-700">{horizon}h</span>
                    </div>
                    <input
                        type="range"
                        id="horizon"
                        min="1"
                        max="48"
                        value={horizon}
                        onChange={(e) => setHorizon(parseInt(e.target.value))}
                        className="h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed"
                        style={{ accentColor: '#2563eb' }}
                    />
                    <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                        <span>1h</span>
                        <span>24h</span>
                        <span>48h</span>
                    </div>
                </div>
            </div>

            <div className="mt-3 text-xs text-slate-500">
                {isLoading
                    ? "Refreshing data..."
                    : "Data refreshes automatically shortly after you adjust date range or horizon."}
            </div>
        </div>
    );
}
