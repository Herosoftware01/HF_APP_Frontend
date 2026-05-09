import React from 'react';
import { Link } from 'react-router-dom';

const Del_home = () => {
    const navItems = [
        { name: 'Cut & Delivery', path: '/cutdel/cutdel', color: 'bg-blue-500', icon: '✂️' },
        { name: 'Data Entry', path: '/cutdel/entry', color: 'bg-emerald-500', icon: '📝' },
        { name: 'Fabric Cutting', path: '/cutdel/fab_cut', color: 'bg-purple-500', icon: '🧵' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <header className="max-w-4xl mx-auto mb-12 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                    Dashboard
                </h1>
                <p className="text-gray-600">Select a module to get started</p>
            </header>

            <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                {navItems.map((item) => (
                    <Link 
                        key={item.path} 
                        to={item.path}
                        className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 border border-gray-100"
                    >
                        <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-4 text-white shadow-inner`}>
                            {item.icon}
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-1">
                            {item.name}
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Manage {item.name.toLowerCase()} operations.
                        </p>
                        <div className="flex items-center text-sm font-semibold text-blue-600">
                            Open Module 
                            <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                        </div>
                    </Link>
                ))}
            </main>
        </div>
    );
};

export default Del_home;