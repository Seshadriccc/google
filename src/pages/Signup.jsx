import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, UserPlus } from 'lucide-react';

export default function Signup() {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return setError("Passwords do not match");
        }

        try {
            setError("");
            setLoading(true);
            // Default to 'student' if not set
            const role = formData.role || "student";
            await signup(formData.email, formData.password, formData.name, role);

            // Redirect based on role
            if (role === 'warden') navigate("/dashboard/warden");
            else if (role === 'principal') navigate("/analytics");
            else if (role === 'hod') navigate("/dashboard/hod");
            else navigate("/dashboard/student");
        } catch {
            setError("Failed to create an account");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-600 p-4 rounded-full">
                        <Shield className="w-12 h-12 text-white" />
                    </div>
                </div>
                <h1 className="text-3xl font-black text-center text-slate-800 mb-2">Join TrustLoop</h1>
                <p className="text-center text-slate-500 mb-6">Create your verified identity.</p>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center mb-4 font-bold">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                        <input
                            type="text" required
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">College Email</label>
                        <input
                            type="email" required
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="john@college.edu"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                        <input
                            type="password" required
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Confirm Password</label>
                        <input
                            type="password" required
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        />
                    </div>
                    <div className="pt-2">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Role (Demo Only)</label>
                        <select
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={formData.role || "student"}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="student">Student</option>
                            <option value="warden">Warden (Staff)</option>
                            <option value="principal">Principal (Admin)</option>
                        </select>
                        <p className="text-xs text-slate-400 mt-1">Select a role to test different dashboards.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        <UserPlus className="w-5 h-5" /> Sign Up
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                    Already have an account? <Link to="/" className="text-blue-600 font-bold hover:underline">Log In</Link>
                </div>
            </div >
        </div >
    );
}
