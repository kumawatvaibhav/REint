"use client";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
// import 'chartjs-adapter-date-fns';
import { enGB } from 'date-fns/locale';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
);

interface ChartProps {
    actuals: WindDataPoint[];
    forecasts: WindDataPoint[];
    isLoading: boolean;
}

type WindDataPoint = {
    startTime: string;
    generation: number;
};

export function WindChart({ actuals, forecasts, isLoading }: ChartProps) {

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                titleFont: {
                    family: "'Inter', sans-serif",
                    size: 13,
                },
                bodyFont: {
                    family: "'Inter', sans-serif",
                    size: 13,
                },
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                borderColor: 'rgba(148, 163, 184, 0.35)',
                borderWidth: 1,
            },
        },
        scales: {
            x: {
                type: 'time' as const,
                time: {
                    unit: 'hour' as const,
                    displayFormats: {
                        hour: 'HH:mm\ndd/MM/yy'
                    },
                    tooltipFormat: 'PPpp',
                },
                adapters: {
                    date: {
                        locale: enGB,
                    },
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.18)',
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12,
                    },
                    color: '#4B5563',
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 8,
                },
                title: {
                    display: true,
                    text: 'Target Time End (UTC)',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 14,
                        weight: 500 as const,
                    },
                    color: '#374151',
                    padding: { top: 10, bottom: 0 }
                }
            },
            y: {
                beginAtZero: false,
                grid: {
                    color: 'rgba(148, 163, 184, 0.18)',
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12,
                    },
                    color: '#4B5563',
                    callback: function (value: string | number) {
                        const numericValue = typeof value === 'string' ? Number(value) : value;
                        if (Number.isNaN(numericValue)) return value;
                        return (numericValue / 1000) + 'k';
                    },
                    maxTicksLimit: 8,
                },
                title: {
                    display: true,
                    text: 'Power (MW)',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 14,
                        weight: 500 as const,
                    },
                    color: '#374151',
                    padding: { top: 0, bottom: 10 }
                }
            },
        },
        elements: {
            line: {
                tension: 0.4, // Smooth curves
            },
            point: {
                radius: 0,
                hitRadius: 10,
                hoverRadius: 5,
            }
        }
    };

    const data = {
        datasets: [
            {
                label: 'Actual Wind Generation',
                data: actuals.map(d => ({ x: new Date(d.startTime), y: d.generation })),
                borderColor: '#16a34a', // Green 600
                backgroundColor: '#16a34a',
                borderWidth: 2.5,
                pointBackgroundColor: '#16a34a',
                fill: false,
                tension: 0.25,
            },
            {
                label: 'Forecast Wind Generation',
                data: forecasts.map(d => ({ x: new Date(d.startTime), y: d.generation })),
                borderColor: '#2563eb', // Blue 600
                backgroundColor: '#2563eb',
                borderWidth: 2.5,
                borderDash: [5, 5],
                pointBackgroundColor: '#2563eb',
                fill: false,
                tension: 0.25,
            },
        ],
    };

    if (isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                    <p className="animate-pulse text-sm font-medium text-slate-500">Loading generation data...</p>
                </div>
            </div>
        );
    }

    if (actuals.length === 0 && forecasts.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-white">
                <div className="text-center">
                    <p className="text-sm font-semibold text-slate-600">No data available</p>
                    <p className="mt-1 text-xs text-slate-500">Try a different date range or horizon.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full rounded-xl border border-slate-100 bg-white p-2 shadow-inner sm:p-4 transition-all duration-200">
            <Line options={options} data={data} className="!h-full !w-full" />
        </div>
    );
}
