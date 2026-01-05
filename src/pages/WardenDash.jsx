import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { CheckCircle, AlertOctagon, Clock, User, Eye, MessageSquare, AlertTriangle, X } from 'lucide-react';

export default function WardenDash() {
    const [issues, setIssues] = useState([]);
    const [selectedIssue, setSelectedIssue] = useState(null);

    // Modals State
    const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
    const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // Added for Updates
    const [reason, setReason] = useState("");
    const [updateNote, setUpdateNote] = useState(""); // Added for Updates

    useEffect(() => {
        // Fetch ALL Open/In Progress/Escalated issues
        const q = query(collection(db, "issues"), where("status", "!=", "Resolved"), orderBy("status"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setIssues(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    const confirmEscalation = async () => {
        if (!reason.trim()) return alert("Please provide a reason.");
        try {
            await updateDoc(doc(db, "issues", selectedIssue.id), {
                status: "Escalated",
                assignedRole: "HoD",
                escalationReason: reason, // Save at top level for easy access in HoD Dash
                history: arrayUnion({
                    action: "MANUAL_ESCALATION",
                    by: "Warden",
                    reason: reason,
                    timestamp: new Date().toISOString()
                })
            });
            setIsEscalateModalOpen(false);
            setReason("");
            setSelectedIssue(null);
        } catch (error) {
            console.error("Error escalating:", error);
        }
    };

    const confirmUpdate = async () => {
        if (!updateNote.trim()) return alert("Please provide an update.");
        try {
            await updateDoc(doc(db, "issues", selectedIssue.id), {
                updates: arrayUnion({
                    note: updateNote,
                    by: "Warden",
                    timestamp: new Date().toISOString()
                }),
                history: arrayUnion({
                    action: "UPDATE_POSTED",
                    by: "Warden",
                    note: updateNote,
                    timestamp: new Date().toISOString()
                })
            });
            setIsUpdateModalOpen(false);
            setUpdateNote("");
            // Optimistically update or wait for snapshot
        } catch (error) {
            console.error("Error posting update:", error);
        }
    };

    const confirmResolution = async () => {
        if (!reason.trim()) return alert("Please explain the resolution.");
        try {
            await updateDoc(doc(db, "issues", selectedIssue.id), {
                status: "Resolved",
                resolutionNote: reason,
                resolvedAt: new Date().toISOString(),
                history: arrayUnion({
                    action: "RESOLVED",
                    by: "Warden",
                    note: reason,
                    timestamp: new Date().toISOString()
                })
            });
            setIsResolveModalOpen(false);
            setReason("");
            setSelectedIssue(null);
        } catch (error) {
            console.error("Error resolving:", error);
        }
    };

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden">
            {/* Sidebar List */}
            <div className="w-1/3 bg-white border-r border-slate-200 overflow-y-auto">
                <div className="p-4 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
                    <h2 className="font-bold text-slate-700">Inbox ({issues.length})</h2>
                </div>
                {issues.map(issue => (
                    <div
                        key={issue.id}
                        onClick={() => setSelectedIssue(issue)}
                        className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-blue-50 transition-colors ${selectedIssue?.id === issue.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                    >
                        <div className="flex justify-between mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${issue.status === 'Escalated' ? 'bg-orange-100 text-orange-700' : issue.urgencyScore > 80 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                                {issue.status === 'Escalated' ? 'ESCALATED' : issue.urgencyScore > 80 ? 'HIGH PRIORITY' : 'NORMAL'}
                            </span>
                            <span className="text-xs text-slate-400">{new Date(issue.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm mb-1 truncate">{issue.category} Issue</h3>
                        <p className="text-xs text-slate-500 line-clamp-2">{issue.text}</p>
                    </div>
                ))}
            </div>

            {/* Main Detail View */}
            <div className="w-2/3 bg-slate-50 p-8 overflow-y-auto relative">
                {selectedIssue ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-2xl mx-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-2xl font-black text-slate-800 mb-2">{selectedIssue.category} Issue</h1>
                                <div className="flex gap-2">
                                    <div className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-600">
                                        <User className="w-3 h-3" /> {selectedIssue.author}
                                    </div>
                                    {selectedIssue.evidenceUrl && (
                                        <a href={selectedIssue.evidenceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-full text-xs font-bold text-blue-600 hover:bg-blue-200">
                                            <Eye className="w-3 h-3" /> View Evidence
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-slate-200">#{selectedIssue.id.slice(0, 4)}</div>
                            </div>
                        </div>

                        {/* Sanitized Content */}
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-8 relative group">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xs font-bold text-blue-400 uppercase">Sanitized/Neutralized Description</h3>
                                {selectedIssue.originalText && (
                                    <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        Hover to see original
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-800 leading-relaxed text-lg font-medium">{selectedIssue.text}</p>

                            {/* Hover to reveal original */}
                            {selectedIssue.originalText && selectedIssue.originalText !== selectedIssue.text && (
                                <div className="mt-4 pt-4 border-t border-blue-200/50 opacity-40 hover:opacity-100 transition-opacity">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-1">Original Submission (Hidden)</h4>
                                    <p className="text-slate-500 italic text-sm">"{selectedIssue.originalText}"</p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        {selectedIssue.status !== 'Escalated' ? (
                            <div className="border-t border-slate-100 pt-8">
                                {/* Recent Updates Log */}
                                {selectedIssue.updates && selectedIssue.updates.length > 0 && (
                                    <div className="mb-6 bg-slate-100 p-4 rounded-xl">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Staff Updates</h4>
                                        <div className="space-y-3">
                                            {selectedIssue.updates.map((update, idx) => (
                                                <div key={idx} className="flex gap-3 text-sm">
                                                    <div className="w-1 bg-blue-300 rounded-full"></div>
                                                    <div>
                                                        <p className="text-slate-700">{update.note}</p>
                                                        <span className="text-[10px] text-slate-400">
                                                            {update.by} • {new Date(update.timestamp).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => updateDoc(doc(db, "issues", selectedIssue.id), { status: 'In Progress' })}
                                        className="px-4 bg-white border-2 border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:border-blue-500 hover:text-blue-500 transition-all flex justify-center items-center gap-2"
                                        title="Mark In Progress"
                                    >
                                        <Clock className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => { setIsUpdateModalOpen(true); setUpdateNote(""); }}
                                        className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 transition-all flex justify-center items-center gap-2"
                                    >
                                        <MessageSquare className="w-4 h-4" /> Post Update
                                    </button>
                                    <button
                                        onClick={() => { setIsResolveModalOpen(true); setReason(""); }}
                                        className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 hover:shadow-lg hover:shadow-green-200 transition-all flex justify-center items-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Resolve
                                    </button>
                                    <button
                                        onClick={() => { setIsEscalateModalOpen(true); setReason(""); }}
                                        className="px-4 bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-100 hover:text-red-600 transition-colors flex items-center justify-center"
                                        title="Escalate to HoD"
                                    >
                                        <AlertTriangle className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3 border-t border-slate-100 pt-8">
                                <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl text-center font-bold flex items-center justify-center gap-2">
                                    <AlertTriangle className="w-5 h-5" /> Issue Escalated to HoD
                                </div>
                                {selectedIssue.escalationReason && (
                                    <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100 text-sm text-orange-900">
                                        <span className="font-bold">Reason:</span> {selectedIssue.escalationReason}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                        <p>Select an issue to resolve</p>
                    </div>
                )}

                {/* ESCALATION MODAL */}
                {isEscalateModalOpen && (
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-8">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" /> Confirm Escalation
                                </h3>
                                <button onClick={() => setIsEscalateModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                            </div>
                            <p className="text-sm text-slate-600 mb-4">Transferring <strong>#{selectedIssue?.id.slice(0, 5)}</strong> to HoD. This action is logged.</p>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Reason for Escalation *</label>
                            <textarea
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                className="w-full h-24 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none mb-4"
                                placeholder="Why can't you handle this? (e.g. Budget, Conflict)"
                            />
                            <button onClick={confirmEscalation} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700">Confirm Escalation</button>
                        </div>
                    </div>
                )}

                {/* UPDATE MODAL */}
                {isUpdateModalOpen && (
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-8">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5" /> Post Update
                                </h3>
                                <button onClick={() => setIsUpdateModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                            </div>
                            <p className="text-sm text-slate-600 mb-4">Add a progress note for issue <strong>#{selectedIssue?.id.slice(0, 5)}</strong>.</p>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Update Message *</label>
                            <textarea
                                value={updateNote}
                                onChange={e => setUpdateNote(e.target.value)}
                                className="w-full h-24 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none resize-none mb-4"
                                placeholder="e.g. Electrician scheduled for tomorrow..."
                            />
                            <button onClick={confirmUpdate} className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900">Post Update</button>
                        </div>
                    </div>
                )}

                {/* RESOLVE MODAL */}
                {isResolveModalOpen && (
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-8">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-green-600 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" /> Confirm Resolution
                                </h3>
                                <button onClick={() => setIsResolveModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                            </div>
                            <p className="text-sm text-slate-600 mb-4">Closing issue <strong>#{selectedIssue?.id.slice(0, 5)}</strong>.</p>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Resolution Note *</label>
                            <textarea
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                className="w-full h-24 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none mb-4"
                                placeholder="How was this resolved? (Required for student notification)"
                            />
                            <button onClick={confirmResolution} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700">Mark Resolved</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
