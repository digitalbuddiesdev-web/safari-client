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
  Search,
  Users,
  UserCheck,
  ChevronRight,
  Sparkles
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
  const [searchQuery, setSearchQuery] = useState('');

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

  // Organized navigation groups for maximum clarity
  const navSections = [
    {
      group: 'Daily Operations',
      items: [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, roles: STAFF, desc: 'Overview & alerts' },
        { label: 'Inquiries & Leads', path: '/admin/inquiries', icon: MessageSquare, roles: BOOKING, desc: 'Guest inquiries & quotes' },
        { label: 'Bookings & Payments', path: '/admin/bookings', icon: BookOpen, roles: BOOKING, desc: 'Permits, advance & tracking' },
      ]
    },
    {
      group: 'Parks & Expeditions',
      items: [
        { label: 'Reserves & Sanctuaries', path: '/admin/destinations', icon: MapPin, roles: CONTENT, desc: '17 reserves & zones' },
        { label: 'Safari Packages', path: '/admin/safaris', icon: Compass, roles: CONTENT, desc: 'Pricing tiers & inclusions' },
        { label: 'Client Stories & Reels', path: '/admin/stories', icon: Sparkles, roles: CONTENT, desc: 'Reels, videos & reviews' },
        { label: 'Website CMS & Story', path: '/admin/cms', icon: FileEdit, roles: CONTENT, desc: 'Founders story & ethics' },
      ]
    },
    {
      group: 'Team & Directory',
      items: [
        { label: 'Team Members', path: '/admin/team', icon: Users, roles: SUPER, desc: 'Staff roles & access' },
        { label: 'Traveler Accounts', path: '/admin/travelers', icon: UserCheck, roles: SUPER, desc: 'Registered guests' },
      ]
    }
  ];

  const allNavItems = navSections.flatMap(s => s.items).filter(item => item.roles.includes(user.role));
  const currentNav = allNavItems.find(item => item.path === location.pathname) || allNavItems[0];

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/admin/bookings?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const roleLabels: Record<string, string> = {
    super_admin: 'Founder / Super Admin',
    booking_manager: 'Booking & Operations Lead',
    content_manager: 'Content & Field Naturalist'
  };

  return (
    <div className="min-h-screen bg-sand flex flex-col md:flex-row antialiased text-forest">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-forest text-sand px-4 py-3 flex items-center justify-between shadow-md z-30 sticky top-0">
        <div className="flex items-center space-x-2">
          <img src="/assets/logo/nav-logo.svg" alt="Shutter And Stripes" className="h-7 w-auto object-contain rounded bg-sand-warm px-1.5 py-1" />
          <span className="font-serif font-bold text-sm tracking-wide">SHUTTER & STRIPES</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-sand/80 hover:text-sand"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity"
        />
      )}

      {/* Dedicated Admin Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-forest text-sand flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen shrink-0 border-r border-gold/20 shadow-2xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Sidebar Header and Brand */}
        <div className="overflow-y-auto flex-1">
          <div className="p-5 border-b border-sand/10">
            <Link to="/admin" className="flex items-center space-x-3 group">
              <img 
                src="/assets/logo/nav-logo.svg" 
                alt="Shutter And Stripes Logo" 
                className="h-9 w-auto object-contain rounded bg-sand-warm px-2 py-1.5 group-hover:scale-105 transition-transform"
              />
              <div>
                <span className="font-serif font-bold text-base tracking-wider block text-sand leading-tight">
                  SHUTTER & STRIPES
                </span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-gold block">
                  TEAM MANAGEMENT DESK
                </span>
              </div>
            </Link>

            {/* Admin User Badge */}
            <div className="mt-4 p-3 bg-white/5 rounded-2xl border border-sand/10 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gold text-forest flex items-center justify-center font-serif font-bold text-base shrink-0 shadow">
                {user.name.charAt(0)}
              </div>
              <div className="truncate flex-1">
                <div className="text-xs font-bold text-sand truncate leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] text-sand/60 truncate mt-0.5">
                  {roleLabels[user.role] || user.role}
                </div>
              </div>
            </div>
          </div>

          {/* Grouped Navigation Items */}
          <nav className="p-3.5 space-y-4">
            {navSections.map(section => {
              const visibleItems = section.items.filter(item => item.roles.includes(user.role));
              if (visibleItems.length === 0) return null;

              return (
                <div key={section.group} className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gold/80 block px-3 pt-1 pb-1">
                    {section.group}
                  </span>
                  {visibleItems.map(item => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition ${
                          isActive
                            ? 'bg-gold text-forest font-bold shadow-md'
                            : 'text-sand/85 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3 truncate">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-forest' : 'text-gold'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-forest shrink-0 ml-1" />}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Shortcuts */}
        <div className="p-3.5 border-t border-sand/10 space-y-2 bg-black/10 shrink-0">
          <Link
            to={import.meta.env.PROD ? 'https://www.shutterandstripessafaris.com/' : '/'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-sand/80 hover:bg-white/10 hover:text-sand transition"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>Visit Live Website</span>
            </div>
            <ExternalLink className="w-3 h-3 text-sand/40" />
          </Link>

          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-red-300 hover:bg-red-950/40 hover:text-red-200 transition font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* Main Admin Content Body */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* Top Desktop Bar with Quick Search */}
        <header className="bg-white border-b border-forest/10 px-6 sm:px-8 py-3.5 sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-forest leading-tight">
              {currentNav.label}
            </h1>
            <p className="text-forest/60 text-xs">
              {currentNav.desc || 'Shutter and Stripes Management Console'}
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            {/* Quick search input */}
            <form onSubmit={handleQuickSearch} className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-forest/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search booking ref, phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-sand/40 border border-forest/15 rounded-xl text-forest placeholder:text-forest/40 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:bg-white transition"
              />
            </form>

            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Console</span>
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
