import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, FileText, History, Menu, X } from 'lucide-react';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Billing', href: '/billing', icon: FileText },
    { name: 'History', href: '/history', icon: History },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-blue-800 text-white p-4 flex justify-between items-center shadow-md z-20">
        <h1 className="text-xl font-bold">Barwnal Traders</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`
        fixed inset-y-0 left-0 transform bg-white w-64 shadow-xl z-10 transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col pt-16 md:pt-0">
          <div className="hidden md:flex items-center justify-center h-20 border-b border-gray-200 bg-blue-800 text-white">
            <h1 className="text-2xl font-extrabold tracking-wider">Barwnal</h1>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center px-4 py-4 text-lg font-medium rounded-xl transition-colors
                    ${isActive(item.href) 
                      ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-800' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                  `}
                >
                  <Icon className="mr-4 h-6 w-6" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden flex flex-col h-screen overflow-y-auto">
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
      
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-0 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Layout;
