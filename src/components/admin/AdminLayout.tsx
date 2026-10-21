import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  MapPin, 
  Compass, 
  MessageSquare, 
  FileEdit, 
  LogOut, 
  ExternalLink,
  ShieldAlert,
  Menu,
  X,
  Database,
  ArrowLeft,
  Users,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SUPER = ['super_admin'];
const STAFF = ['super_admin', 'booking_manager', 'content_manager'];
const BOOKING = ['super_admin', 'booking_manager'];
const CONTENT = ['super_admin', 'content_manager'];

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user || !isAdmin) {
    return (
      <div className="bg-sand min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-forest/15 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-earth/10 text-earth flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-forest">Admin Access Restricted</h2>
          <p className="text-forest/70 text-xs leading-relaxed">
            You must be logged in as an authorized administrator to access the Shutter And Stripes management console.
          </p>
          <div className="pt-2">
            <Link
              to="/login?redirect=/admin"
              className="px-6 py-3 bg-forest text-sand rounded-xl text-xs font-bold uppercase tracking-wider inline-block hover:bg-forest/90 transition shadow"
            >
              Sign In to Admin Console
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, roles: STAFF },
    { label: 'Bookings', path: '/admin/bookings', icon: BookOpen, roles: BOOKING },
    { label: 'Inquiries', path: '/admin/inquiries', icon: MessageSquare, roles: BOOKING },
    { label: 'Reserves & Sanctuaries', path: '/admin/destinations', icon: MapPin, roles: CONTENT },
    { label: 'Safari Packages', path: '/admin/safaris', icon: Compass, roles: CONTENT },
    { label: 'CMS & Brand Story', path: '/admin/cms', icon: FileEdit, roles: CONTENT },
    { label: 'Team Members', path: '/admin/team', icon: Users, roles: SUPER },
    { label: 'Travelers', path: '/admin/travelers', icon: UserCheck, roles: SUPER },
  ].filter(item => item.roles.includes(user.role));

  const currentNav = navItems.find(item => item.path === location.pathname) || navItems[0];

  return (
    <div className="min-h-screen bg-sand flex flex-col md:flex-row antialiased text-forest">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-forest text-sand px-4 py-3 flex items-center justify-between shadow-md z-30">
        <div className="flex items-center space-x-2">
          <img src="/assets/logo/nav-logo.svg" alt="Shutter And Stripes" className="h-7 w-auto object-contain rounded bg-sand-warm px-1.5 py-1" />
          <span className="font-serif font-bold text-sm tracking-wide">ADMIN CONSOLE</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-sand/80 hover:text-sand"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Dedicated Admin Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-forest text-sand flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen shrink-0 border-r border-gold/20 shadow-2xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Sidebar Header and Brand */}
        <div>
          <div className="p-6 border-b border-sand/10">
            <Link to="/admin" className="flex items-center space-x-3 group">
              <img 
                src="/assets/logo/nav-logo.svg" 
                alt="Shutter And Stripes Logo" 
                className="h-9 w-auto object-contain rounded bg-sand-warm px-2 py-1.5 group-hover:scale-105 transition-transform"
              />
              <div>
                <span className="font-serif font-bold text-base tracking-wider block text-sand leading-tight">
                  SHUTTER AND STRIPES
                </span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-gold block">
                  MANAGEMENT DESK
                </span>
              </div>
            </Link>

            {/* Admin User Badge */}
            <div className="mt-5 p-3.5 bg-white/5 rounded-2xl border border-sand/10 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gold text-forest flex items-center justify-center font-serif font-bold text-base shrink-0 shadow">
                {user.name.charAt(0)}
              </div>
              <div className="truncate flex-1">
                <div className="text-xs font-bold text-sand truncate leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] text-sand/60 truncate mt-0.5">
                  {user.email}
                </div>
                <span className="inline-block mt-1 px-2 py-0.2 rounded-md bg-gold/20 text-gold text-[9px] font-bold uppercase tracking-wider">
                  {user.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-sand/40 block px-3 py-2">
              Menu
            </span>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                    isActive
                      ? 'bg-gold text-forest font-bold shadow-md'
                      : 'text-sand/80 hover:bg-white/10 hover:text-sand'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-forest' : 'text-gold'}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Shortcuts */}
        <div className="p-4 border-t border-sand/10 space-y-2">
          <Link
            to={import.meta.env.PROD ? 'https://www.shutterandstripessafaris.com/' : '/'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-sand/80 hover:bg-white/10 hover:text-sand transition"
          >
            <div className="flex items-center space-x-2">
              <ArrowLeft className="w-3.5 h-3.5 text-gold" />
              <span>Visit Public Site</span>
            </div>
            <ExternalLink className="w-3 h-3 text-sand/40" />
          </Link>

          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs text-red-300 hover:bg-red-950/40 hover:text-red-200 transition font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* Main Admin Content Body */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* Top Desktop Bar */}
        <header className="bg-white border-b border-forest/10 px-6 sm:px-8 py-4 sticky top-0 z-20 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-forest leading-tight">
              {currentNav.label}
            </h1>
            <p className="text-forest/60 text-xs mt-0.5">
              Shutter and Stripes Admin Panel
            </p>
          </div>

          <div className="hidden sm:flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Online</span>
            </div>
          </div>
        </header>

        {/* Page Inner Content */}
        <main className="p-6 sm:p-8 flex-1">
          {children}
        </main>

      </div>

    </div>
  );
};

export default AdminLayout;
