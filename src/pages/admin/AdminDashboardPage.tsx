import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  MapPin, 
  Compass, 
  MessageSquare, 
  IndianRupee, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  Mail,
  ExternalLink,
  Sparkles,
  Calendar
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Booking, CrmInquiry } from '../../types';
import { getWhatsAppUrl, generateWhatsAppInquiryGreeting } from '../../lib/crm';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const canSeeBookings = ['super_admin', 'booking_manager'].includes(user?.role || '');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const statsData = await adminService.getStats();
        setStats(statsData.stats);
        setRecentBookings(statsData.recentBookings || []);
        setRecentInquiries(statsData.recentInquiries || []);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Standardize stats properties across API formats
  const totalBookings = stats?.totalBookings ?? stats?.bookings?.total ?? 0;
  const confirmedBookings = stats?.confirmedBookings ?? stats?.bookings?.confirmed ?? 0;
  const pendingBookings = stats?.pendingBookings ?? stats?.bookings?.pending ?? 0;
  const totalRevenue = stats?.totalRevenue ?? stats?.bookings?.revenue ?? 0;
  const totalInquiries = stats?.totalInquiries ?? stats?.inquiries?.total ?? stats?.inquiries?.new ?? 0;
  const totalDestinations = stats?.totalDestinations ?? stats?.destinations ?? 17;

  const todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const shortcuts = [
    { 
      to: '/admin/inquiries', 
      roles: ['super_admin', 'booking_manager'], 
      title: 'Guest Inquiries & Leads', 
      desc: 'Respond to new inquiries, draft custom tour packages, send quotes',
      badge: totalInquiries > 0 ? `${totalInquiries} New` : undefined,
      badgeColor: 'bg-amber-500'
    },
    { 
      to: '/admin/bookings', 
      roles: ['super_admin', 'booking_manager'], 
      title: 'Permits & Advance Payments', 
      desc: 'Verify traveler IDs, dispatch Razorpay advance links, confirm bookings',
      badge: pendingBookings > 0 ? `${pendingBookings} Review` : undefined,
      badgeColor: 'bg-blue-600'
    },
    { 
      to: '/admin/destinations', 
      roles: ['super_admin', 'content_manager'], 
      title: 'Reserves & Capacities', 
      desc: 'Review 17 reserves, core & buffer zones, pricing tiers and seasons' 
    },
  ].filter(s => s.roles.includes(user?.role || ''));

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-forest via-forest-light to-forest text-sand p-6 sm:p-8 rounded-3xl border border-gold/30 shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-gold text-[11px] font-semibold tracking-wider uppercase">
              <Calendar className="w-3.5 h-3.5" />
              <span>{todayStr}</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Team'}
            </h2>
            <p className="text-sand/80 text-xs sm:text-sm leading-relaxed">
              Here is your daily operational summary across Maharashtra and Madhya Pradesh tiger reserves.
            </p>
          </div>

          <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none hidden sm:block">
            <Compass className="w-48 h-48 text-gold" />
          </div>
        </div>

        {/* Action Needed Alerts */}
        {(totalInquiries > 0 || pendingBookings > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {totalInquiries > 0 && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                      {totalInquiries} Guest {totalInquiries === 1 ? 'Inquiry' : 'Inquiries'} Awaiting Quote
                    </h4>
                    <p className="text-[11px] text-amber-800">
                      Reach out on WhatsApp or email to draft their safari package.
                    </p>
                  </div>
                </div>
                <Link
                  to="/admin/inquiries"
                  className="px-3.5 py-1.5 bg-amber-600 text-white font-bold text-xs rounded-xl hover:bg-amber-700 transition shadow shrink-0"
                >
                  Reply Now &rarr;
                </Link>
              </div>
            )}

            {pendingBookings > 0 && (
              <div className="bg-blue-50 border border-blue-300 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wide">
                      {pendingBookings} Booking {pendingBookings === 1 ? 'Action' : 'Actions'} Pending
                    </h4>
                    <p className="text-[11px] text-blue-800">
                      Review permits, activate advance links, or confirm bookings.
                    </p>
                  </div>
                </div>
                <Link
                  to="/admin/bookings"
                  className="px-3.5 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition shadow shrink-0"
                >
                  View Bookings &rarr;
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 5-Step Website Operational Pipeline Overview */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-forest/15 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-forest/10 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold/15 text-forest text-[10px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-gold" />
                <span>End-to-End Workflow</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-forest">
                Website Enquiry, Booking &amp; Payment Flow
              </h3>
              <p className="text-forest/60 text-xs">
                The standard 5-step operational pipeline connecting travelers from first inquiry to completed safari
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/admin/inquiries"
                className="px-3.5 py-1.5 bg-forest text-sand text-xs font-semibold rounded-xl hover:bg-forest/90 transition"
              >
                Steps 1–2 CRM &rarr;
              </Link>
              <Link
                to="/admin/bookings"
                className="px-3.5 py-1.5 bg-sand text-forest text-xs font-semibold rounded-xl hover:bg-gold transition"
              >
                Steps 3–5 Permits &rarr;
              </Link>
            </div>
          </div>

          {/* 5-Step Pipeline Grid with Live Operational Counts */}
          {(() => {
            const pipe = stats?.pipeline || {
              step1: totalInquiries,
              step2: 0,
              step3: pendingBookings,
              step4: confirmedBookings,
              step5: 0
            };

            return (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-sand/30 border border-forest/10 flex flex-col justify-between space-y-3 hover:border-gold/50 transition">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-full bg-forest text-sand text-xs font-bold flex items-center justify-center">1</span>
                      <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        {pipe.step1} {pipe.step1 === 1 ? 'Lead' : 'Leads'}
                      </span>
                    </div>
                    <h4 className="font-bold text-forest text-sm">Customer Enquiry</h4>
                    <p className="text-[11px] text-forest/70 leading-relaxed">
                      Inbound website submissions &amp; preferences. Automated emails dispatched. Representative calls / WhatsApp chats.
                    </p>
                  </div>
                  <Link
                    to="/admin/inquiries"
                    className="text-[11px] font-bold text-forest hover:text-gold flex items-center justify-between pt-2 border-t border-forest/10"
                  >
                    <span>View Leads ({pipe.step1})</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-sand/30 border border-forest/10 flex flex-col justify-between space-y-3 hover:border-gold/50 transition">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-full bg-forest text-sand text-xs font-bold flex items-center justify-center">2</span>
                      <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                        {pipe.step2} {pipe.step2 === 1 ? 'Draft' : 'Drafts'}
                      </span>
                    </div>
                    <h4 className="font-bold text-forest text-sm">Package Creation</h4>
                    <p className="text-[11px] text-forest/70 leading-relaxed">
                      Custom package drafted with stay tier, safari zones &amp; manual pricing. Complete package activates advance.
                    </p>
                  </div>
                  <Link
                    to="/admin/inquiries"
                    className="text-[11px] font-bold text-forest hover:text-gold flex items-center justify-between pt-2 border-t border-forest/10"
                  >
                    <span>Draft Packages ({pipe.step2})</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-sand/30 border border-forest/10 flex flex-col justify-between space-y-3 hover:border-gold/50 transition">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-full bg-forest text-sand text-xs font-bold flex items-center justify-center">3</span>
                      <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300">
                        {pipe.step3} Pending
                      </span>
                    </div>
                    <h4 className="font-bold text-forest text-sm">Advance Payment</h4>
                    <p className="text-[11px] text-forest/70 leading-relaxed">
                      Pop-up sets manual advance amount. Automated email with 24h Razorpay link sent. Automated receipt upon capture.
                    </p>
                  </div>
                  <Link
                    to="/admin/bookings"
                    className="text-[11px] font-bold text-forest hover:text-gold flex items-center justify-between pt-2 border-t border-forest/10"
                  >
                    <span>Manage Links ({pipe.step3})</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-2xl bg-sand/30 border border-forest/10 flex flex-col justify-between space-y-3 hover:border-gold/50 transition">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-full bg-gold text-forest text-xs font-bold flex items-center justify-center">4</span>
                      <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-gold/25 text-forest font-bold border border-gold/40">
                        {pipe.step4} Confirmed
                      </span>
                    </div>
                    <h4 className="font-bold text-forest text-sm">Booking Confirmation</h4>
                    <p className="text-[11px] text-forest/70 leading-relaxed">
                      Representative confirms booking. CRM emails confirmed itinerary update and a Razorpay link for the balance.
                    </p>
                  </div>
                  <Link
                    to="/admin/bookings"
                    className="text-[11px] font-bold text-forest hover:text-gold flex items-center justify-between pt-2 border-t border-forest/10"
                  >
                    <span>Permits ({pipe.step4})</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Step 5 */}
                <div className="p-4 rounded-2xl bg-sand/30 border border-forest/10 flex flex-col justify-between space-y-3 hover:border-gold/50 transition">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">5</span>
                      <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {pipe.step5} Completed
                      </span>
                    </div>
                    <h4 className="font-bold text-forest text-sm">Final Payment &amp; Docs</h4>
                    <p className="text-[11px] text-forest/70 leading-relaxed">
                      Remaining balance paid. Traveler automatically receives final email with itinerary, trip documents, and official receipt.
                    </p>
                  </div>
                  <Link
                    to="/admin/bookings"
                    className="text-[11px] font-bold text-forest hover:text-gold flex items-center justify-between pt-2 border-t border-forest/10"
                  >
                    <span>Safaris ({pipe.step5})</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })()}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-forest/15 shadow-sm space-y-2 hover:border-gold/50 transition">
            <span className="text-[10px] uppercase font-bold text-forest/60 tracking-widest block">
              Total Safari Permits
            </span>
            <div className="flex items-center justify-between">
              <span className="font-serif text-3xl font-bold text-forest">
                {totalBookings}
              </span>
              <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center text-forest">
                <BookOpen className="w-5 h-5 text-gold" />
              </div>
            </div>
            <div className="text-[11px] text-forest/70 pt-1 flex items-center space-x-1.5">
              <span className="text-emerald-700 font-bold">{confirmedBookings} Confirmed</span>
              <span>•</span>
              <span className="text-amber-700 font-bold">{pendingBookings} Action Needed</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-forest/15 shadow-sm space-y-2 hover:border-gold/50 transition">
            <span className="text-[10px] uppercase font-bold text-forest/60 tracking-widest block">
              Total Safari Revenue
            </span>
            <div className="flex items-center justify-between">
              <span className="font-serif text-3xl font-bold text-forest">
                ₹{Number(totalRevenue || 0).toLocaleString('en-IN')}
              </span>
              <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center text-forest">
                <IndianRupee className="w-5 h-5 text-gold" />
              </div>
            </div>
            <span className="text-[11px] text-forest/60 block pt-1">
              Confirmed and paid bookings across all reserves
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-forest/15 shadow-sm space-y-2 hover:border-gold/50 transition">
            <span className="text-[10px] uppercase font-bold text-forest/60 tracking-widest block">
              Tiger Reserves Active
            </span>
            <div className="flex items-center justify-between">
              <span className="font-serif text-3xl font-bold text-forest">
                {totalDestinations}
              </span>
              <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center text-forest">
                <MapPin className="w-5 h-5 text-gold" />
              </div>
            </div>
            <span className="text-[11px] text-forest/60 block pt-1">
              8 Maharashtra • 9 Madhya Pradesh
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-forest/15 shadow-sm space-y-2 hover:border-gold/50 transition">
            <span className="text-[10px] uppercase font-bold text-forest/60 tracking-widest block">
              Customer Leads
            </span>
            <div className="flex items-center justify-between">
              <span className="font-serif text-3xl font-bold text-forest">
                {totalInquiries}
              </span>
              <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center text-forest">
                <MessageSquare className="w-5 h-5 text-gold" />
              </div>
            </div>
            <span className="text-[11px] text-amber-800 font-bold block pt-1">
              Direct website & WhatsApp enquiries
            </span>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {shortcuts.map(s => (
            <Link
              key={s.to}
              to={s.to}
              className="bg-white p-5 rounded-2xl border border-forest/10 shadow-sm hover:border-gold/60 hover:shadow-md transition group flex items-center justify-between"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-serif text-base font-bold text-forest group-hover:text-gold transition">
                    {s.title}
                  </h3>
                  {s.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold text-white uppercase tracking-wider ${s.badgeColor || 'bg-gold'}`}>
                      {s.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-forest/60 mt-1 leading-relaxed">{s.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-forest/30 group-hover:text-gold group-hover:translate-x-1 transition shrink-0 ml-3" />
            </Link>
          ))}
        </div>

        {/* Operational Streams: Recent Inquiries + Recent Bookings */}
        {canSeeBookings && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Column 1: Recent Inquiries & WhatsApp Shortcuts */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-forest/15 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-forest/10 pb-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-forest flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gold" />
                    <span>Latest Guest Inquiries</span>
                  </h3>
                  <p className="text-forest/60 text-xs">Direct traveler requests needing quotes</p>
                </div>
                <Link
                  to="/admin/inquiries"
                  className="text-xs font-bold text-forest hover:text-gold transition flex items-center gap-1"
                >
                  <span>All Inquiries</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {loading ? (
                <div className="py-8 text-center text-forest/60 text-xs">Loading inquiries...</div>
              ) : recentInquiries.length === 0 ? (
                <div className="py-8 text-center text-forest/50 text-xs">No pending inquiries. All caught up!</div>
              ) : (
                <div className="space-y-3">
                  {recentInquiries.map((inq: any) => {
                    const waUrl = getWhatsAppUrl(
                      inq.phone,
                      generateWhatsAppInquiryGreeting(inq.name, inq.destinationName, user?.name)
                    );

                    return (
                      <div key={inq._id} className="p-3.5 rounded-2xl bg-sand/30 border border-forest/10 hover:border-gold/40 transition flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-forest">{inq.name}</span>
                            <span className="text-[10px] font-semibold text-forest/50">
                              {new Date(inq.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="text-xs text-forest/80 font-medium">
                            {inq.destinationName || inq.subject || 'Safari Expedition'}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-forest/60">
                            {inq.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-forest/40" />
                                <span>{inq.phone}</span>
                              </span>
                            )}
                            {inq.email && (
                              <span className="flex items-center gap-1 truncate max-w-[180px]">
                                <Mail className="w-3 h-3 text-forest/40" />
                                <span className="truncate">{inq.email}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {inq.phone && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition shadow-sm"
                              title="Chat with traveler on WhatsApp"
                            >
                              <span>WhatsApp</span>
                            </a>
                          )}
                          <Link
                            to={`/admin/inquiries`}
                            className="px-2.5 py-1 bg-forest/10 hover:bg-forest hover:text-sand text-forest rounded-lg text-[10px] font-semibold transition"
                          >
                            Draft Quote
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Column 2: Recent Bookings Stream */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-forest/15 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-forest/10 pb-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-forest flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-gold" />
                    <span>Recent Safari Bookings</span>
                  </h3>
                  <p className="text-forest/60 text-xs">Live permit stream and payment status</p>
                </div>
                <Link
                  to="/admin/bookings"
                  className="text-xs font-bold text-forest hover:text-gold transition flex items-center gap-1"
                >
                  <span>All Bookings</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {loading ? (
                <div className="py-8 text-center text-forest/60 text-xs">Loading bookings stream...</div>
              ) : recentBookings.length === 0 ? (
                <div className="py-8 text-center text-forest/50 text-xs">No bookings recorded yet.</div>
              ) : (
                <div className="space-y-3">
                  {recentBookings.slice(0, 5).map(b => (
                    <div key={b._id} className="p-3.5 rounded-2xl bg-sand/30 border border-forest/10 hover:border-gold/40 transition flex items-center justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-forest">#{b.bookingRef}</span>
                          <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold uppercase ${
                            b.bookingStatus === 'confirmed' || b.bookingStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.bookingStatus === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {b.bookingStatus}
                          </span>
                        </div>
                        
                        <div className="text-xs font-semibold text-forest">
                          {b.customerInfo.fullName} &bull; <span className="font-normal text-forest/70">{b.destinationName}</span>
                        </div>

                        <div className="text-[11px] text-forest/60">
                          {new Date(b.safariDate).toLocaleDateString()} &bull; ₹{b.totalAmount.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div className="shrink-0">
                        <Link
                          to={`/admin/bookings?search=${b.bookingRef}`}
                          className="px-3 py-1.5 bg-forest text-sand hover:bg-forest/90 rounded-xl text-xs font-semibold transition shadow-sm inline-block"
                        >
                          Review
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
