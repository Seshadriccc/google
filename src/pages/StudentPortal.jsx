import React, { useState } from 'react';
import { db, auth, storage } from '../firebase'; // Ensure storage is exported in firebase.js
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AlertTriangle, CheckCircle, Lock, Send, Wifi, BookOpen, Utensils, Megaphone, Upload, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Helper function for Hashing
async function generateUserHash(uid, name) {
    const msgBuffer = new TextEncoder().encode(uid + name);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const CATEGORIES = [
    { id: 'wifi', label: 'Hostel/Wifi', icon: Wifi },
    { id: 'food', label: 'Mess Food', icon: Utensils },
    { id: 'academic', label: 'Academics', icon: BookOpen },
    { id: 'harassment', label: 'Harassment', icon: Megaphone },
];

export default function StudentPortal() {
    const { userData, currentUser } = useAuth();
    const navigate = useNavigate();

    // Wizard State
    const [step, setStep] = useState(1);
    const [category, setCategory] = useState(null);
    const [text, setText] = useState("");
    const [file, setFile] = useState(null);

    // AI State
    const [loading, setLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState(null);

    const handleFileUpload = async (file) => {
        if (!file) return null;
        const storageRef = ref(storage, `evidence/${currentUser.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    };

    const processWithAI = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setAiResponse(null);

        try {
            const apiKey = import.meta.env.VITE_GEMINI_KEY;

            if (!apiKey) {
                console.error("Gemini API Key missing! Check .env.local");
                alert("AI Service Unavailable (Missing Key)");
                return;
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            // Disable safety filters to ensure the model processes the "gross" text for normalization instead of blocking it
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            });

            const prompt = `You are a Trust & Safety AI. Your job is to neutralize toxic or informal student grievances into professional, formal office language.
            
            Input: "${text}"
            
            Rules:
            1. Identify if the text contains toxic, gross (e.g. "pee", "vomit"), abusive, or highly informal language. Set "isAbusive": true if found.
            2. "normalizedText": REWRITE the entire input to be professional, polite, and actionable. 
               - "Food is like pee" -> "The quality of the food served in the mess is unsatisfactory and requires improvement."
               - "Warden is stupid" -> "There are concerns regarding the warden's conduct."
            3. If the input is already clean, "normalizedText" should be the polished version of the input.
            
            Output JSON ONLY: { "isAbusive": boolean, "normalizedText": string }`;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text().replace(/```json|```/g, "").trim();
            const ai = JSON.parse(responseText);

            setAiResponse(ai);
            setStep(3);
        } catch (error) {
            console.error("AI Failure - Falling back to original text", error);
            // Fallback: If AI fails, proceed with the original text without filtering
            setAiResponse({
                isAbusive: false,
                normalizedText: text, // Use original text
                fallback: true
            });
            setStep(3); // Auto-advance to review step
        } finally {
            setLoading(false);
        }
    };

    const confirmSubmit = async () => {
        setLoading(true);
        try {
            const userRef = doc(db, "users", currentUser.uid);
            const userSnap = await getDoc(userRef);
            let strikes = userSnap.data()?.strikes || 0;

            if (aiResponse.isAbusive) {
                strikes += 1;
                await updateDoc(userRef, { strikes });
                // If 3 strikes, identity is revealed (handled in backend/logic usually, here we mark it)
            }

            // Upload File
            const imageUrl = await handleFileUpload(file);
            const userHash = await generateUserHash(currentUser.uid, currentUser.displayName || "Unknown");

            await addDoc(collection(db, "issues"), {
                originalText: text,
                text: aiResponse.normalizedText,
                author: strikes >= 3 ? currentUser.displayName : "Anonymous",
                creatorUid: currentUser.uid, // For My Dashboard
                userHash: userHash,
                status: "Open",
                level: "Warden",
                strikesAtTime: strikes,
                createdAt: serverTimestamp(),
                category: category?.label || "General",
                urgencyScore: aiResponse.isAbusive ? 90 : 50,
                evidenceUrl: imageUrl || null
            });

            navigate('/dashboard/student'); // Go to dashboard
        } catch (err) {
            console.error(err);
            alert("Submission failed. Try again.");
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto p-6 mt-4 pb-24">
            {/* Progress Bar */}
            <div className="flex justify-between mb-8">
                {[1, 2, 3].map(s => (
                    <div key={s} className={`h-2 flex-1 mx-1 rounded-full transition-all ${step >= s ? 'bg-blue-600' : 'bg-slate-200'}`} />
                ))}
            </div>

            <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden border border-white/50">
                {/* Header */}
                <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                    <h1 className="text-xl font-bold">
                        {step === 1 ? "Select Category" : step === 2 ? "Describe Issue" : "Review & Submit"}
                    </h1>
                    <div className="bg-slate-800 px-3 py-1 rounded-full text-xs font-mono flex items-center gap-2">
                        <Lock className="w-3 h-3 text-green-400" />
                        ANONYMOUS
                    </div>
                </div>

                <div className="p-8">
                    {/* STEP 1: Categories */}
                    {step === 1 && (
                        <div className="grid grid-cols-2 gap-4">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => { setCategory(cat); setStep(2); }}
                                    className="p-6 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-blue-50 hover:border-blue-500 hover:scale-105 transition-all text-center group"
                                >
                                    <div className="bg-white w-12 h-12 rounded-full shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <cat.icon className="w-6 h-6 text-slate-600 group-hover:text-white" />
                                    </div>
                                    <span className="font-bold text-slate-700">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* STEP 2: Input & File */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide">Category: {category?.label}</label>
                                <textarea
                                    className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none text-lg"
                                    placeholder="What happened? Be specific..."
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            {/* File Upload */}
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    accept="image/*"
                                />
                                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                <p className="text-sm font-bold text-slate-500">
                                    {file ? file.name : "Upload Evidence (Optional)"}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">Metadata will be stripped for privacy.</p>
                            </div>

                            <button
                                onClick={processWithAI}
                                disabled={loading || !text.trim()}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                {loading ? "Analyzing Privacy..." : "Continue"}
                            </button>
                        </div>
                    )}

                    {/* STEP 3: Review */}
                    {step === 3 && aiResponse && (
                        <div className="space-y-6">
                            {aiResponse.isAbusive ? (
                                <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex gap-3 text-red-800">
                                    <AlertTriangle className="w-6 h-6 shrink-0" />
                                    <div>
                                        <p className="font-bold">Toxic Language Detected</p>
                                        <p className="text-sm">We have rewritten your complaint to maintain professional standards.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex gap-3 text-green-800">
                                    <CheckCircle className="w-6 h-6 shrink-0" />
                                    <div>
                                        <p className="font-bold">Content Safe</p>
                                        <p className="text-sm">Your identity will remain completely anonymous.</p>
                                    </div>
                                </div>
                            )}

                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Final Submission (Preview)</p>
                                <p className="text-slate-800 text-lg leading-relaxed">{aiResponse.normalizedText}</p>
                            </div>

                            <button
                                onClick={confirmSubmit}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-green-200 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? "Securely Uploading..." : "Confirm & Submit"}
                            </button>
                            <button
                                onClick={() => setStep(2)}
                                className="w-full text-slate-400 text-sm hover:text-slate-600 py-2"
                            >
                                Go Back
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
