import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, LogIn } from 'lucide-react';

export default function Login() {
    const { loginWithGoogle, login, currentUser, userData } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    React.useEffect(() => {
        if (currentUser && userData) {
            const role = userData.role || 'student';
            if (role === 'warden') navigate("/dashboard/warden");
            else if (role === 'staff') navigate("/dashboard/staff"); // Added Staff
            else if (role === 'principal') navigate("/analytics");
            else if (role === 'hod') navigate("/dashboard/hod");
            else navigate("/dashboard/student");
        }
    }, [currentUser, userData, navigate]);


    const handleEmailLogin = async (e) => {
        e.preventDefault();
        try {
            setError("");
            setLoading(true);
            await login(email, password);
            // Navigation handled by useEffect when userData updates
        } catch {
            setError("Failed to log in");
            setLoading(false);
        }
    };

    const handleDemoLogin = async (role) => {
        const demoCreds = {
            student: { email: "student@demo.com", pass: "demo123" },
            warden: { email: "warden@demo.com", pass: "demo123" },
            staff: { email: "staff@demo.com", pass: "demo123" }, // Added Staff
            hod: { email: "hod@demo.com", pass: "demo123" },
            principal: { email: "principal@demo.com", pass: "demo123" }
        };

        const creds = demoCreds[role];
        if (!creds) return;

        try {
            setLoading(true);
            // Try to login
            await login(creds.email, creds.pass);
        } catch (err) {
            // If user not found, try to create (Auto-Provision Debug Mode)
            try {
                // Note: In real app, separate signup. Here we auto-create for demo convenience.
                const { createUserWithEmailAndPassword } = await import("firebase/auth");
                const { auth, db } = await import("../firebase");
                const { doc, setDoc } = await import("firebase/firestore");

                const userCred = await createUserWithEmailAndPassword(auth, creds.email, creds.pass);
                await setDoc(doc(db, "users", userCred.user.uid), {
                    email: creds.email,
                    displayName: role.charAt(0).toUpperCase() + role.slice(1) + " Demo",
                    role: role,
                    strikes: 0
                });
                // Auto login happens on create
            } catch (createErr) {
                console.error(createErr);
                setError(`Failed to auto-login as ${role}.`);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-600 p-4 rounded-full">
                        <ShieldCheck className="w-12 h-12 text-white" />
                    </div>
                </div>
                <h1 className="text-3xl font-black text-slate-800 mb-2">TrustLoop AI</h1>
                <p className="text-slate-500 mb-8">Verified Identity. Absolute Anonymity.</p>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 font-bold">{error}</div>}

                <form onSubmit={handleEmailLogin} className="space-y-4 mb-6 text-left">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                        <input
                            type="email" required
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                        <input
                            type="password" required
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        <LogIn className="w-5 h-5" /> Login
                    </button>
                </form>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-slate-500">Or continue with</span>
                    </div>
                </div>

                <button
                    onClick={loginWithGoogle}
                    className="w-full bg-slate-900 text-white py-4 px-6 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
                    Sign in with College Email
                </button>

                <div className="mt-6 text-center text-sm text-slate-500">
                    Need an account? <Link to="/signup" className="text-blue-600 font-bold hover:underline">Sign Up</Link>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Demo Access</p>
                    <div className="grid grid-cols-4 gap-2">
                        <button onClick={() => handleDemoLogin('student')} className="text-xs bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 p-2 rounded-lg text-slate-600 font-medium transition-colors">
                            Student
                        </button>
                        <button onClick={() => handleDemoLogin('warden')} className="text-xs bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 p-2 rounded-lg text-slate-600 font-medium transition-colors">
                            Warden
                        </button>
                        <button onClick={() => handleDemoLogin('staff')} className="text-xs bg-slate-50 hover:bg-purple-50 hover:text-purple-600 border border-slate-200 p-2 rounded-lg text-slate-600 font-medium transition-colors">
                            Staff
                        </button>
                        <button onClick={() => handleDemoLogin('hod')} className="text-xs bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 p-2 rounded-lg text-slate-600 font-medium transition-colors">
                            HoD
                        </button>
                        <button onClick={() => handleDemoLogin('principal')} className="text-xs bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 p-2 rounded-lg text-slate-600 font-medium transition-colors">
                            Principal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


