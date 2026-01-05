import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy, arrayUnion } from 'firebase/firestore';
import { Check, MessageSquare, AlertOctagon } from 'lucide-react';

export default function HodDash() {
    const [issues, setIssues] = useState([]);
    const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [resolutionNote, setResolutionNote] = useState("");

    useEffect(() => {
        // HoD sees issues escalated to them. 
        // Note: We check specifically for status='Escalated' or assignedRole='HoD'
        const q = query(
            collection(db, "issues"),
            where("status", "==", "Escalated"),
            orderBy("createdAt", "desc")
        );
        return onSnapshot(q, (snapshot) => {
            setIssues(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });
    }, []);

    const openResolveModal = (issue) => {
        setSelectedIssue(issue);
        setResolutionNote("");
        setIsResolveModalOpen(true);
    };

    const handleResolveConfirm = async () => {
        if (!resolutionNote.trim()) return alert("Please provide a resolution note.");

        try {
            await updateDoc(doc(db, "issues", selectedIssue.id), {
                status: "Resolved",
                resolvedAt: new Date(),
                resolvedBy: "HoD",
                resolutionNote: resolutionNote, // Critical for Student visibility
                history: arrayUnion({
                    action: "RESOLVED_BY_HOD",
                    by: "HoD",
                    note: resolutionNote,
                    timestamp: new Date().toISOString()
                })
            });
            setIsResolveModalOpen(false);
            setSelectedIssue(null);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8 border-b border-red-100 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-red-900">HoD Oversight</h1>
                    <p className="text-red-700">Escalated and breeched issues require immediate attention.</p>
                </div>
                <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                    <AlertOctagon className="w-5 h-5" />
                    {issues.length} Critical
                </div>
            </div>

            <div className="space-y-4">
                {issues.map(issue => (
                    <div key={issue.id} className="bg-white rounded-xl shadow-sm border-l-4 border-red-500 p-6 flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-bold uppercase">Escalated</span>
                                <span className="text-xs text-slate-400">from Warden</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">{issue.category} Issue at {issue.location || 'Unknown Location'}</h3>
                            <p className="text-slate-600 mb-3">"{issue.text}"</p>
                            {issue.escalationReason && (
                                <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-500 italic border border-slate-100">
                                    <span className="font-bold not-italic text-red-500">Escalation Reason:</span> {issue.escalationReason}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 justify-center min-w-[150px]">
                            <div className="text-right text-xs text-slate-400 mb-2">
                                Reported by: {issue.author}
                            </div>
                            <button
                                onClick={() => openResolveModal(issue)}
                                className="bg-slate-900 text-white py-2 px-4 rounded-lg hover:bg-slate-800 font-bold flex items-center justify-center gap-2"
                            >
                                <Check className="w-4 h-4" /> Resolve
                            </button>
                            <button
                                onClick={() => alert("Warden Contact: +91-9876543210 (Demo)\nA demo notification has been sent to the Warden.")}
                                className="border border-slate-200 text-slate-600 py-2 px-4 rounded-lg hover:bg-slate-50 font-medium flex items-center justify-center gap-2 text-sm"
                            >
                                <MessageSquare className="w-4 h-4" /> Contact Warden
                            </button>
                        </div>
                    </div>
                ))}

                {issues.length === 0 && (
                    <div className="text-center py-20 opacity-50">
                        <p>No escalated issues.</p>
                    </div>
                )}
            </div>

            {/* Resolution Modal */}
            {isResolveModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Finalize Resolution</h3>
                        <p className="text-sm text-slate-500 mb-4">Enter a note for the student explaining how this critical issue was resolved.</p>
                        <textarea
                            className="w-full h-32 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none mb-4"
                            placeholder="e.g. Approved budget for new wifi routers..."
                            value={resolutionNote}
                            onChange={(e) => setResolutionNote(e.target.value)}
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setIsResolveModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">Cancel</button>
                            <button onClick={handleResolveConfirm} className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
