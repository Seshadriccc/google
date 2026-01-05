import React from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

const StatusCard = ({ issue }) => {
    const statusColors = {
        'Open': 'bg-blue-100 text-blue-700 border-blue-200',
        'In Progress': 'bg-orange-100 text-orange-700 border-orange-200',
        'Resolved': 'bg-green-100 text-green-700 border-green-200',
        'Escalated': 'bg-red-100 text-red-700 border-red-200'
    };

    const StatusIcon = {
        'Open': Clock,
        'In Progress': Clock,
        'Resolved': CheckCircle,
        'Escalated': AlertCircle
    }[issue.status] || Clock;

    return (
        <div className="bg-white/80 backdrop-blur-md border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all mb-4 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-bold border-b border-l ${statusColors[issue.status] || 'bg-slate-100'}`}>
                {issue.status.toUpperCase()}
            </div>

            <div className="flex justify-between items-start mb-2 mt-2">
                <span className="text-xs font-mono text-slate-400">#{issue.id?.slice(0, 6).toUpperCase()}</span>
                <span className="text-xs text-slate-400">{new Date(issue.createdAt?.seconds * 1000).toLocaleDateString()}</span>
            </div>

            <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">{issue.category} Issue</h3>
            <p className="text-slate-600 text-sm line-clamp-2 mb-4">
                {issue.text}
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-500">
                <StatusIcon className="w-4 h-4" />
                <span>{issue.location || "Unknown Location"}</span>
            </div>

            {/* Resolution Note or Escalation Status */}
            {issue.status === 'Escalated' && (
                <div className="mt-3 text-xs bg-red-50 text-red-700 p-2 rounded border border-red-100">
                    <div className="font-bold mb-1">Escalated to Head of Department</div>
                    {issue.escalationReason && <div><span className="font-bold">Reason:</span> {issue.escalationReason}</div>}
                </div>
            )}

            {/* Staff Updates */}
            {issue.updates && issue.updates.length > 0 && (
                <div className="mt-3 space-y-2">
                    {issue.updates.map((update, i) => (
                        <div key={i} className="text-xs bg-slate-50 text-slate-600 p-2 rounded border border-slate-100 flex gap-2">
                            <div className="w-0.5 bg-slate-300 rounded-full h-full"></div>
                            <div>
                                <span className="font-bold text-slate-700">Update:</span> {update.note}
                                <div className="text-[10px] text-slate-400 mt-0.5">{new Date(update.timestamp).toLocaleString()}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {issue.resolutionNote && (
                <div className="mt-3 text-xs bg-green-50 text-green-800 p-2 rounded border border-green-100">
                    <span className="font-bold">Staff Note:</span> {issue.resolutionNote}
                </div>
            )}
        </div>
    );
};

export default StatusCard;
