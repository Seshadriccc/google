import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <div className="text-center max-w-md">
                <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-2">404</h1>
                <h2 className="text-xl font-bold text-slate-700 mb-4">Page Not Found</h2>
                <p className="text-slate-500 mb-8">The page you are looking for does not exist or you do not have permission to view it.</p>
                <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                    Return Home
                </Link>
            </div>
        </div>
    );
}
