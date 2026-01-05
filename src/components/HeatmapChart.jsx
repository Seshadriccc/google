import React from 'react';
import { clsx } from 'clsx';

const Locations = ["Hostel A", "Hostel B", "Mess Hall", "Academic Block", "Library", "Main Gate", "Sports Complex", "Admin Block"];

export default function HeatmapChart({ issues }) {
    // Aggregate issues by location
    const locationCounts = Locations.reduce((acc, loc) => {
        acc[loc] = issues.filter(i => i.location === loc).length;
        return acc;
    }, {});

    const maxCount = Math.max(...Object.values(locationCounts), 1);

    const getIntensity = (count) => {
        const ratio = count / maxCount;
        if (ratio > 0.8) return 'bg-red-600';
        if (ratio > 0.6) return 'bg-orange-500';
        if (ratio > 0.4) return 'bg-yellow-400';
        if (ratio > 0.2) return 'bg-blue-300';
        return 'bg-slate-100'; // No issues or very low
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Campus Issue Heatmap</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Locations.map(loc => {
                    const count = locationCounts[loc] || 0;
                    return (
                        <div key={loc} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer border border-slate-100 transition-all hover:scale-105">
                            <div className={clsx("w-full h-full transition-colors duration-500", getIntensity(count))}></div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
                                <span className="font-bold text-slate-900 bg-white/80 px-2 py-1 rounded shadow-sm text-sm">{loc}</span>
                                <span className="text-xs font-mono mt-1 bg-black/50 text-white px-2 rounded-full">{count} Issues</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
