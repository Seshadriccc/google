import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { BarChart3, TrendingUp, AlertTriangle, MapPin } from 'lucide-react';

export default function PrincipalDash() {
    const [stats, setStats] = useState({ total: 0, critical: 0, resolved: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            const qTotal = query(collection(db, "issues"));
            const snapTotal = await getDocs(qTotal);

            const qCritical = query(collection(db, "issues"), where("urgencyScore", ">", 80));
            const snapCritical = await getDocs(qCritical);

            setStats({
                total: snapTotal.size,
                critical: snapCritical.size,
                resolved: snapTotal.docs.filter(d => d.data().status === 'Resolved').length
            });
        };
        fetchStats();
    }, []);

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 pb-24">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900">Executive Overview</h1>
                <p className="text-slate-500">Real-time campus pulse and safety metrics.</p>
            </div>

            {/* Critical Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-2">Total Issues</div>
                    <div className="text-3xl font-black text-slate-800">{stats.total}</div>
                    <div className="text-green-500 text-xs font-bold mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Live Data
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-2">Resolved</div>
                    <div className="text-3xl font-black text-slate-800">{stats.resolved}</div>
                    <div className="text-green-500 text-xs font-bold mt-1">Actionable Insights</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-2">Student Sentiment</div>
                    <div className="text-3xl font-black text-blue-600">88%</div>
                    <div className="text-slate-400 text-xs font-bold mt-1">Positive</div>
                </div>
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100 relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-4 opacity-10">
                        <AlertTriangle className="w-24 h-24 text-red-600" />
                    </div>
                    <div className="text-red-400 text-xs font-bold uppercase mb-2">Critical Alerts</div>
                    <div className="text-3xl font-black text-red-600">{stats.critical}</div>
                    <div className="text-red-600 text-xs font-bold mt-1">Requires immediate attention</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Heatmap Mockup */}
                <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-500" /> Campus Heatmap
                        </h3>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div> <span className="text-xs text-slate-500 mr-2">High</span>
                            <div className="w-3 h-3 rounded-full bg-blue-400"></div> <span className="text-xs text-slate-500">Low</span>
                        </div>
                    </div>

                    {/* Visual CSS Grid Map */}
                    <div className="h-64 bg-slate-50 rounded-xl relative border border-slate-200 overflow-hidden">
                        {/* Mock Hotspots */}
                        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"></div>
                        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-red-400/30 rounded-full blur-xl animate-pulse"></div>
                        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-green-400/20 rounded-full blur-xl"></div>

                        {/* Buildings */}
                        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-slate-300 rounded-lg flex items-center justify-center text-xs font-bold text-slate-400 bg-white/50">Hostel A</div>
                        <div className="absolute bottom-10 right-20 w-32 h-24 border-2 border-slate-300 rounded-lg flex items-center justify-center text-xs font-bold text-slate-400 bg-white/50">Academic Block</div>
                        <div className="absolute top-10 right-10 w-24 h-24 border-2 border-slate-300 rounded-lg flex items-center justify-center text-xs font-bold text-slate-400 bg-white/50">Mess</div>
                    </div>
                </div>

                {/* Top Issues */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-6">Trending Topics</h3>
                    <div className="flex flex-wrap gap-2">
                        {["Wifi", "Water Quality", "Mess Food", "Curfew", "Library", "Hygiene", "Warden"].map((tag, i) => (
                            <span key={i} className={`px-3 py-1 rounded-full text-sm font-bold ${i === 0 || i === 2 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                {tag}
                            </span>
                        ))}
                    </div>
                    <div className="mt-8">
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">By Department</h4>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                                    <span>Maintenance</span>
                                    <span>45%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[45%]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                                    <span>Mess/Food</span>
                                    <span className="text-red-500">32%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-400 w-[32%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
