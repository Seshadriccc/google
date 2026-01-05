import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, LayoutDashboard, LogOut, FileText, BarChart3, Users } from 'lucide-react';

export default function Navbar() {
    const { currentUser, userData, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (!currentUser) return null;

    return (
        <nav className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
            <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                    <Shield className="w-6 h-6 text-white" />
                </div>
                <Link to="/" className="text-xl font-black tracking-tight text-slate-800">TrustLoop<span className="text-blue-600">AI</span></Link>
            </div>

            <div className="flex items-center gap-6">
                {/* Role Based Links */}
                <Link to="/dashboard/student" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition-colors">
                    <FileText className="w-4 h-4" /> My Dashboard
                </Link>

                {(userData?.role === 'warden' || userData?.role === 'admin' || userData?.role === 'principal' || userData?.role === 'hod') && (
                    <Link to="/dashboard/warden" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Warden
                    </Link>
                )}

                {(userData?.role === 'staff' || userData?.role === 'admin') && (
                    <Link to="/dashboard/staff" className="flex items-center gap-2 text-slate-600 hover:text-purple-600 font-medium transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Staff Board
                    </Link>
                )}

                {(userData?.role === 'hod' || userData?.role === 'admin' || userData?.role === 'principal') && (
                    <Link to="/dashboard/hod" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition-colors">
                        <Users className="w-4 h-4" /> HoD
                    </Link>
                )}

                {(userData?.role === 'principal' || userData?.role === 'admin') && (
                    <Link to="/analytics" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium transition-colors">
                        <BarChart3 className="w-4 h-4" /> Principal
                    </Link>
                )}

                <div className="h-6 w-px bg-slate-200"></div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-bold text-slate-800">{currentUser.displayName}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">{userData?.role || 'Student'}</div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </nav>
    );
}
