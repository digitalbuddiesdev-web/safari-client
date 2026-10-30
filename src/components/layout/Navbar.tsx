import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Compass,
  Menu,
  X
} from 'lucide-react';

// --- Types and Navigation Config ---
interface NavLinkItem {
  name: string;
  path: string;
}

// Kept deliberately short — everything else lives in the Footer.
const PRIMARY_LINKS: NavLinkItem[] = [
  { name: 'Reserves', path: '/destinations' },
  { name: 'Upcoming Tours', path: '/upcoming-tours' },
  { name: 'Our Story', path: '/our-story' },
  { name: 'Safari Map', path: '/map' },
  { name: 'Journal', path: '/journal' },
  { name: "Client Stories", path: "/client-stories" },  
  { name: 'Gallery', path: '/gallery' },
];

export const Navbar: React.FC = () => {
  const location = useLocation();

  // State
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll detection for sticky header transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock background scroll while the mobile drawer is open, else the page
  // scrolls behind it and the fixed header draws over content mid-read.
  // ponytail: scrollingElement is <html>, not <body> — locking body alone is a no-op.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-forest border-b-2 border-gold/40 ${
        isScrolled ? 'shadow-lg py-3' : 'py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6">

          {/* Brand Identity / Logo */}
          <Link to="/" className="flex items-center group shrink-0">
            <img
              src="/assets/logo/nav-logo.svg"
              alt="Shutter and Stripes Emblem"
              className="h-10 lg:h-14 w-auto object-contain group-hover:scale-105 transition-transform duration-300 shrink-0"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7">
            {PRIMARY_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-xs font-semibold uppercase tracking-wider transition-colors relative py-1.5 ${
                    isActive
                      ? 'text-gold font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gold'
                      : 'text-sand/80 hover:text-sand'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center space-x-3">

            {/* Primary CTA: Track Your Booking */}
            <Link
              to="/track"
              className="px-5 py-2.5 bg-gold text-forest text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gold-light transition shadow-md flex items-center space-x-2 group"
            >
              <Compass className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
              <span>Track Your Booking</span>
            </Link>

          </div>

          {/* Mobile Menu Action Toggle */}
          <div className="flex items-center space-x-2 lg:hidden">
            <Link
              to="/track"
              className="px-3 py-1.5 bg-gold text-forest text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm"
            >
              Track
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-sand hover:bg-sand/10 focus:outline-none"
              aria-label="Toggle Navigation Drawer"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-drawer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer (Responsive Overlay) */}
      {mobileMenuOpen && (
        <div id="mobile-nav-drawer" className="lg:hidden bg-forest border-b-2 border-gold/40 px-4 pt-3 pb-6 shadow-2xl animate-fadeIn max-h-[85vh] overflow-y-auto">
          <nav className="flex flex-col space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold/60 px-3 pt-1 pb-1">
              Explore
            </span>
            {PRIMARY_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="px-3 py-2 rounded-xl text-sm font-semibold text-sand hover:bg-sand/10 transition"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
