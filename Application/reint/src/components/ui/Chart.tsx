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
    TimeScale,
    Filler,
    type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { enGB } from 'date-fns/locale';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    Filler
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

    const options: ChartOptions<'line'> = {
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
                backgroundColor: 'rgba(16, 35, 56, 0.95)',
                titleFont: {
                    family: "'Space Grotesk', 'Segoe UI', sans-serif",
                    size: 13,
                },
                bodyFont: {
                    family: "'Space Grotesk', 'Segoe UI', sans-serif",
                    size: 13,
                },
                padding: 12,
                cornerRadius: 10,
                displayColors: true,
                borderColor: 'rgba(224, 234, 245, 0.4)',
                borderWidth: 1,
                callbacks: {
                    label: (context) => {
                        const value = Number(context.parsed.y);
                        if (Number.isNaN(value)) return context.dataset.label ?? '';
                        return `${context.dataset.label}: ${Math.round(value).toLocaleString('en-GB')} MW`;
                    },
                },
            },
        },
        scales: {
            x: {
                type: 'time' as const,
                time: {
                    unit: 'hour' as const,
                    displayFormats: {
                        hour: 'HH:mm\ndd/MM'
                    },
                    tooltipFormat: 'PPpp',
                },
                adapters: {
                    date: {
                        locale: enGB,
                    },
                },
                grid: {
                    color: 'rgba(34, 65, 95, 0.14)',
                    drawTicks: false,
                },
                ticks: {
                    font: {
                        family: "'IBM Plex Mono', 'Consolas', monospace",
                        size: 12,
                    },
                    color: '#35516A',
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 8,
                },
                title: {
                    display: true,
                    text: 'Target time end (UTC)',
                    font: {
                        family: "'Space Grotesk', 'Segoe UI', sans-serif",
                        size: 14,
                        weight: 500 as const,
                    },
                    color: '#1F3F76',
                    padding: { top: 10, bottom: 0 }
                }
            },
            y: {
                beginAtZero: false,
                grid: {
                    color: 'rgba(34, 65, 95, 0.14)',
                    drawTicks: false,
                },
                ticks: {
                    font: {
                        family: "'IBM Plex Mono', 'Consolas', monospace",
                        size: 12,
                    },
                    color: '#35516A',
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
                        family: "'Space Grotesk', 'Segoe UI', sans-serif",
                        size: 14,
                        weight: 500 as const,
                    },
                    color: '#1F3F76',
                    padding: { top: 0, bottom: 10 }
                }
            },
        },
        elements: {
            line: {
                tension: 0.34,
            },
            point: {
                radius: 0,
                hitRadius: 10,
                hoverRadius: 5,
            }
        },
        animation: {
            duration: 620,
            easing: 'easeOutQuart',
        },
    };

    const data = {
        datasets: [
            {
                label: 'Actual generation',
                data: actuals.map(d => ({ x: new Date(d.startTime), y: d.generation })),
                borderColor: '#ff7a32',
                backgroundColor: 'rgba(255, 122, 50, 0.16)',
                borderWidth: 2.7,
                pointBackgroundColor: '#ff7a32',
                fill: 'origin',
                tension: 0.3,
            },
            {
                label: 'Forecast generation',
                data: forecasts.map(d => ({ x: new Date(d.startTime), y: d.generation })),
                borderColor: '#0f7b9f',
                backgroundColor: 'rgba(15, 123, 159, 0.14)',
                borderWidth: 2.7,
                borderDash: [8, 6],
                pointBackgroundColor: '#0f7b9f',
                fill: 'origin',
                tension: 0.3,
            },
        ],
    };

    if (isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center rounded-xl border border-[var(--line-soft)] bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(255,246,237,0.86))]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[rgba(255,122,50,0.35)] border-t-[var(--sun)]" />
                    <p className="text-sm font-medium text-[var(--ink-500)]">Rendering generation curves</p>
                </div>
            </div>
        );
    }

    if (actuals.length === 0 && forecasts.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-[var(--line-strong)] bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(236,244,255,0.84))]">
                <div className="text-center">
                    <p className="text-sm font-semibold text-[var(--ink-700)]">No timeline loaded</p>
                    <p className="mt-1 text-xs text-[var(--ink-500)]">Choose another range or horizon to populate the graph.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full rounded-xl border border-[var(--line-soft)] bg-white/88 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] sm:p-4 transition-all duration-300">
            <Line options={options} data={data} className="!h-full !w-full" />
        </div>
    );
}
