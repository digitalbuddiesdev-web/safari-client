import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './components/layout/PublicLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastProvider } from './components/common/Toast';
import { ConfirmProvider } from './components/common/ConfirmDialog';
import { ScrollToTopButton } from './components/ScrollToTopButton';

// Pages
import HomePage from './pages/HomePage';
import DestinationsPage from './pages/DestinationsPage';
import DestinationDetailPage from './pages/DestinationDetailPage';
import ComparePage from './pages/ComparePage';
import CorridorMapPage from './pages/CorridorMapPage';
import OurStoryPage from './pages/OurStoryPage';
import AboutPage from './pages/AboutPage';
import HowItWorksPage from './pages/HowItWorksPage';
import GalleryPage from './pages/GalleryPage';
import JournalPage from './pages/JournalPage';
import JournalDetailPage from './pages/JournalDetailPage';
import ResponsibleTourismPage from './pages/ResponsibleTourismPage';
import ClientStoriesPage from './pages/ClientStoriesPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import UpcomingTourPage from './pages/UpcomingTourPage';
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/LoginPage';
import TrackBookingPage from './pages/TrackBookingPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages (Rendered with dedicated AdminLayout, NO public navbar/footer)
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminDestinationsPage from './pages/admin/AdminDestinationsPage';
import AdminSafarisPage from './pages/admin/AdminSafarisPage';
import AdminInquiriesPage from './pages/admin/AdminInquiriesPage';
import AdminOurStoryCMSPage from './pages/admin/AdminOurStoryCMSPage';
import AdminClientStoriesPage from './pages/admin/AdminClientStoriesPage';
import AdminTeamPage from './pages/admin/AdminTeamPage';
import AdminTravelersPage from './pages/admin/AdminTravelersPage';

// Scroll to top helper on navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Redirect admin subdomain root to /admin
const AdminHostRedirect: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const host = window.location.hostname;
    if (host.startsWith('admin.')) {
      if (pathname === '/' || pathname === '') {
        window.location.replace('/admin');
      }
    }
  }, [pathname]);
  return null;
};

// Helper component to wrap public pages with PublicLayout (Navbar + Footer)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <PublicLayout>{children}</PublicLayout>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
      <ConfirmProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AdminHostRedirect />
        <ErrorBoundary>
        <Routes>
          {/* Consumer Facing Pages (With Public Navbar and Footer) */}
          <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
          <Route path="/destinations" element={<PublicRoute><DestinationsPage /></PublicRoute>} />
          <Route path="/destinations/:slug" element={<PublicRoute><DestinationDetailPage /></PublicRoute>} />
          <Route path="/compare" element={<PublicRoute><ComparePage /></PublicRoute>} />
          <Route path="/map" element={<PublicRoute><CorridorMapPage /></PublicRoute>} />
          <Route path="/our-story" element={<PublicRoute><OurStoryPage /></PublicRoute>} />
          <Route path="/about" element={<PublicRoute><AboutPage /></PublicRoute>} />
          <Route path="/how-it-works" element={<PublicRoute><HowItWorksPage /></PublicRoute>} />
          <Route path="/gallery" element={<PublicRoute><GalleryPage /></PublicRoute>} />
          <Route path="/journal" element={<PublicRoute><JournalPage /></PublicRoute>} />
          <Route path="/journal/:slug" element={<PublicRoute><JournalDetailPage /></PublicRoute>} />
          <Route path="/responsible-tourism" element={<PublicRoute><ResponsibleTourismPage /></PublicRoute>} />
          <Route path="/client-stories" element={<PublicRoute><ClientStoriesPage /></PublicRoute>} />
          <Route path="/faqs" element={<PublicRoute><FAQPage /></PublicRoute>} />
          <Route path="/contact" element={<PublicRoute><ContactPage /></PublicRoute>} />
          <Route path="/upcoming-tours" element={<PublicRoute><UpcomingTourPage /></PublicRoute>} />
          <Route path="/upcoming-tours/:slug" element={<PublicRoute><UpcomingTourPage /></PublicRoute>} />

          {/* Booking and Tracking (admin auth lives at /login) */}
          <Route path="/booking" element={<PublicRoute><BookingPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/admin/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/track" element={<PublicRoute><TrackBookingPage /></PublicRoute>} />

          {/* DEDICATED ADMIN PANEL ROUTES (ZERO PUBLIC NAVBAR, ZERO PUBLIC FOOTER) */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          <Route path="/admin/destinations" element={<AdminDestinationsPage />} />
          <Route path="/admin/safaris" element={<AdminSafarisPage />} />
          <Route path="/admin/inquiries" element={<AdminInquiriesPage />} />
          <Route path="/admin/stories" element={<AdminClientStoriesPage />} />
          <Route path="/admin/cms" element={<AdminOurStoryCMSPage />} />
          <Route path="/admin/team" element={<AdminTeamPage />} />
          <Route path="/admin/travelers" element={<AdminTravelersPage />} />

          {/* Fallback */}
          <Route path="*" element={<PublicRoute><NotFoundPage /></PublicRoute>} />
        </Routes>
        <ScrollToTopButton />
        </ErrorBoundary>
      </BrowserRouter>
      </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
