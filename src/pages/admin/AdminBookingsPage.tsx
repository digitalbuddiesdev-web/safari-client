import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Eye, 
  X, 
  ShieldCheck, 
  Printer,
  Wallet,
  BadgeCheck,
  Send,
  Link2,
  Phone,
  Share2,
  Copy
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { WorkflowStepper } from '../../components/admin/WorkflowStepper';
import { bookingService, destinationService, crmService } from '../../services/api';
import { Booking, Destination, CrmBooking, CrmPackage, CrmEmailLog } from '../../types';
import { useToast } from '../../components/common/Toast';
import { packagesOf } from '../../lib/site';
import {
  LEAD_STATUS_LABELS,
  LEAD_STATUS_ORDER,
  leadStatusClass,
  formatINR,
  advanceError,
  outstanding,
  totalPaidOf,
  activeLinkOf,
  linkExpiryLabel,
  getWhatsAppUrl,
  generateWhatsAppBookingSummary
} from '../../lib/crm';

type CrmDetail = {
  booking: CrmBooking;
  package: CrmPackage | null;
  emails: CrmEmailLog[];
  outstanding: number;
  totalPaid: number;
  missingFields: string[];
};

export const AdminBookingsPage: React.FC = () => {
  const { info, success, error } = useToast();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  // Alternative reserve/package counter-offer form
  const [suggesting, setSuggesting] = useState(false);
  const [sugDestSlug, setSugDestSlug] = useState('');
  const [sugPackage, setSugPackage] = useState('');
  const [sugMessage, setSugMessage] = useState('');
  // CRM payment workflow
  const [crm, setCrm] = useState<CrmDetail | null>(null);
  const [crmLoading, setCrmLoading] = useState(false);
  const [showAdvance, setShowAdvance] = useState(false);
  const [advanceAmt, setAdvanceAmt] = useState('');
  const [crmBusy, setCrmBusy] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getAllAdmin({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchQuery || undefined
      });
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  useEffect(() => {
    destinationService.getAll().then(setDestinations).catch(console.error);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleStatusUpdate = async (id: string, bookingStatus?: string, paymentStatus?: string) => {
    try {
      setUpdatingId(id);
      await bookingService.updateStatus(id, { bookingStatus, paymentStatus });
      await fetchBookings();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update booking status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const openBooking = (b: Booking) => {
    setSelectedBooking(b);
    setSuggesting(false);
    setSugDestSlug(b.suggestion?.destinationSlug || '');
    setSugPackage(b.suggestion?.packageLabel || '');
    setSugMessage(b.suggestion?.message || '');
    setShowAdvance(false);
    setCrm(null);
    setCrmLoading(true);
    crmService.getBooking(b._id)
      .then(setCrm)
      .catch(() => setCrm(null)) // a permit-only booking has no pipeline record yet
      .finally(() => setCrmLoading(false));
  };

  const refreshCrm = async (id: string) => {
    try { setCrm(await crmService.getBooking(id)); } catch { /* keep what we have */ }
    await fetchBookings();
  };

  // Every CRM action funnels through here: one busy label, one toast, one refresh.
  const act = async (busyLabel: string, okMsg: string, fn: () => Promise<void>) => {
    if (!selectedBooking) return;
    setCrmBusy(busyLabel);
    try {
      await fn();
      await refreshCrm(selectedBooking._id);
      success(okMsg);
    } catch (err: any) {
      error(err.response?.data?.message || 'Action failed.');
    } finally {
      setCrmBusy('');
    }
  };

  const handleRequestAdvance = () => {
    if (advanceInvalid) { error(advanceInvalid); return; }
    act('advance', 'Advance payment link emailed to the traveler.',
      async () => { await crmService.activateAdvance(selectedBooking!._id, Number(advanceAmt)); setShowAdvance(false); setAdvanceAmt(''); });
  };

  const handleConfirm = () => act('confirm', 'Booking confirmed. Balance link and confirmation email sent.',
    async () => { await crmService.confirmBooking(selectedBooking!._id); });

  const handleFinalLink = () => act('final', 'Balance payment link emailed to the traveler.',
    async () => { await crmService.generateFinal(selectedBooking!._id); });

  const handleComplete = () => act('complete', 'Booking marked as completed.',
    async () => { await crmService.completeBooking(selectedBooking!._id); });

  const handleResend = (event: string) => act('resend', 'Email resent to the traveler.',
    async () => { await crmService.resendEmail(selectedBooking!._id, event); });

  const handleSuggest = async () => {
    if (!selectedBooking) return;
    const dest = destinations.find(d => d.slug === sugDestSlug);
    if (!dest) {
      info('Pick an alternative reserve.');
      return;
    }
    try {
      setUpdatingId(selectedBooking._id);
      const updated = await bookingService.updateStatus(selectedBooking._id, {
        bookingStatus: 'alternative_suggested',
        suggestion: {
          destinationName: dest.name,
          destinationSlug: dest.slug,
          packageLabel: sugPackage || undefined,
          message: sugMessage || undefined,
        },
      });
      setSelectedBooking(updated);
      setSuggesting(false);
      await fetchBookings();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to send the suggestion.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearSuggestion = async () => {
    if (!selectedBooking) return;
    try {
      setUpdatingId(selectedBooking._id);
      const updated = await bookingService.updateStatus(selectedBooking._id, {
        bookingStatus: 'under_review',
        suggestion: null,
      });
      setSelectedBooking(updated);
      setSuggesting(false);
      await fetchBookings();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to withdraw the suggestion.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCopyWhatsAppSummary = () => {
    if (!selectedBooking) return;
    const activeLink = activeLinkOf(crmLinks, 'advance')?.shortUrl || activeLinkOf(crmLinks, 'final')?.shortUrl;
    const summary = generateWhatsAppBookingSummary(selectedBooking, crmPkg, activeLink);
    navigator.clipboard.writeText(summary);
    success('Copied Safari Booking Summary to clipboard! Ready to paste into WhatsApp.');
  };

  // Derived pipeline gates — same rules the API enforces, so the buttons never
  // promise an action the server will refuse. The completeness list comes from
  // the server (crm.missingFields), so it can never drift from the API.
  const crmBooking = crm?.booking as CrmBooking | undefined;
  const crmPkg = crm?.package || null;
  const crmMissing = crm?.missingFields || [];
  const crmPayments = crmBooking?.payments || [];
  const crmLinks = crmBooking?.paymentLinks || [];
  const hasAdvance = crmPayments.some(p => p.type === 'advance' && p.status === 'captured');
  const crmStatus = crmBooking?.crmStatus;
  const canRequestAdvance = !!crm && crmMissing.length === 0 && !hasAdvance;
  const canConfirm = crmStatus === 'advance_paid';
  const canFinalLink = (crmStatus === 'booking_confirmed' || crmStatus === 'awaiting_final_payment')
    && (crm?.outstanding ?? 0) > 0.5;
  const canComplete = crmStatus === 'fully_paid';
  // The typed advance must be payable before the button goes live, so the
  // inline error and the button always agree.
  const advanceInvalid = advanceAmt === '' ? null : advanceError(advanceAmt, crmPkg?.totalPrice || 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header and Toolbar */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-forest/15 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-forest">
                Booking Leads &amp; Safari Permits
              </h2>
              <p className="text-forest/60 text-xs">
                Lead requests under review, alternative suggestions, and permit allotment
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-4 h-4 text-forest/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ref #, traveler name, phone..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none focus:ring-2 focus:ring-forest/30 w-64"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-forest text-sand rounded-xl text-xs font-semibold uppercase tracking-wider"
              >
                Search
              </button>
            </form>
          </div>

          {/* Filter Pills with 5-Step Pipeline Mapping */}
          <div className="flex items-center space-x-2 overflow-x-auto pt-2 border-t border-forest/10 text-xs">
            {[
              { id: 'all', label: 'All Bookings' },
              { id: 'under_review', label: 'Step 3: Awaiting Advance' },
              { id: 'pending', label: 'Step 4: Advance Paid' },
              { id: 'confirmed', label: 'Step 4: Confirmed' },
              { id: 'paid', label: 'Step 5: Fully Paid' },
              { id: 'completed', label: 'Step 5: Completed' },
              { id: 'cancelled', label: 'Cancelled' }
            ].map(st => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-lg uppercase tracking-wider font-semibold transition whitespace-nowrap ${
                  statusFilter === st.id 
                    ? 'bg-forest text-sand shadow-xs' 
                    : 'text-forest/70 hover:bg-sand/60'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-3xl border border-forest/15 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-forest/60 text-xs">
              <div className="w-8 h-8 border-4 border-forest border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading permit registers...
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-20 text-center text-forest/50 text-xs">
              No safari permits match the current criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="bg-sand/30 border-b border-forest/10 text-forest/60 uppercase tracking-wider text-[10px]">
                    <th className="p-4 font-semibold">Ref #</th>
                    <th className="p-4 font-semibold">Traveler and ID</th>
                    <th className="p-4 font-semibold">Destination / Safari</th>
                    <th className="p-4 font-semibold">Date and Zone</th>
                    <th className="p-4 font-semibold">Tariff</th>
                    <th className="p-4 font-semibold">Booking Status</th>
                    <th className="p-4 font-semibold">Payment</th>
                    <th className="p-4 font-semibold">Pipeline</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest/5 text-forest/80">
                  {bookings.map(b => (
                    <tr key={b._id} className="hover:bg-sand/10 transition">
                      <td className="p-4 font-mono font-bold text-forest">
                        {b.bookingRef}
                      </td>
                      <td className="p-4">
                        <strong className="text-forest block">{b.customerInfo.fullName}</strong>
                        <div className="text-forest/60 text-[11px]">{b.customerInfo.email}</div>
                        <div className="text-forest/50 text-[10px]">{b.customerInfo.idType}: {b.customerInfo.idNumber}</div>
                      </td>
                      <td className="p-4">
                        <strong className="text-forest block">{b.destinationName}</strong>
                        <span className="text-earth text-[11px] font-medium">{b.safariName}</span>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold">{new Date(b.safariDate).toLocaleDateString()}</div>
                        <div className="text-forest/60 text-[11px]">{b.slot} • {b.zone}</div>
                        <div className="text-forest/50 text-[10px]">{b.guests.adults}A, {b.guests.children}C</div>
                      </td>
                      <td className="p-4 font-serif font-bold text-sm text-forest">
                        ₹{b.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        <select
                          disabled={updatingId === b._id}
                          value={b.bookingStatus}
                          onChange={e => handleStatusUpdate(b._id, e.target.value, undefined)}
                          className="px-2.5 py-1 rounded-lg border border-forest/20 text-xs font-semibold bg-white text-forest focus:outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="under_review">Under Review</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="alternative_suggested">Alternative Sent</option>
                          <option value="payment_pending">Payment Pending</option>
                          <option value="paid">Paid</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="completed">Completed</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="p-4">
                        {(() => {
                          const cs = (b as CrmBooking).crmStatus;
                          return cs ? (
                            <span className={`inline-block px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${leadStatusClass(cs)}`}>
                              {LEAD_STATUS_LABELS[cs] || cs}
                            </span>
                          ) : (
                            <span className="text-forest/40 text-[10px] uppercase">—</span>
                          );
                        })()}
                      </td>
                      <td className="p-4">
                        <select
                          disabled={updatingId === b._id}
                          value={b.paymentStatus}
                          onChange={e => handleStatusUpdate(b._id, undefined, e.target.value)}
                          className="px-2.5 py-1 rounded-lg border border-forest/20 text-xs font-semibold bg-white text-forest focus:outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.customerInfo.phone && (
                            <a
                              href={getWhatsAppUrl(b.customerInfo.phone, `Hello ${b.customerInfo.fullName.split(' ')[0]}! This is Sachin from Shutter & Stripes regarding your booking #${b.bookingRef} for ${b.destinationName}.`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition shadow-sm"
                              title="Chat on WhatsApp"
                            >
                              <span>WhatsApp</span>
                            </a>
                          )}
                          <button
                            onClick={() => openBooking(b)}
                            className="p-1.5 rounded-lg bg-sand hover:bg-forest hover:text-sand text-forest transition"
                            title="View Full Application"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Inspection Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div id="permit-receipt" className="bg-white max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl border border-forest/20 p-8 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-forest/10 pb-4">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-forest">Permit Application Dossier</h3>
                  <span className="font-mono text-xs text-forest/60">Booking Reference: {selectedBooking.bookingRef}</span>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-1 rounded-full text-forest/40 hover:text-forest print:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 5-Step Pipeline Progress Stepper */}
              <WorkflowStepper status={crmStatus || selectedBooking.bookingStatus} />

              <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                <div className="p-4 bg-sand/30 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-forest/50 block">Customer Information</span>
                  <div className="font-bold text-forest text-sm">{selectedBooking.customerInfo.fullName}</div>
                  <div>Email: {selectedBooking.customerInfo.email}</div>
                  <div className="flex items-center justify-between">
                    <div>Phone: {selectedBooking.customerInfo.phone}</div>
                    {selectedBooking.customerInfo.phone && (
                      <a
                        href={getWhatsAppUrl(selectedBooking.customerInfo.phone, `Hello ${selectedBooking.customerInfo.fullName.split(' ')[0]}! This is Sachin from Shutter & Stripes regarding your booking #${selectedBooking.bookingRef} for ${selectedBooking.destinationName}.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition shadow-sm"
                      >
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                  <div>Country: {selectedBooking.customerInfo.country}</div>
                  <div>ID Type: {selectedBooking.customerInfo.idType}</div>
                  <div>ID Number: <strong>{selectedBooking.customerInfo.idNumber}</strong></div>
                </div>

                <div className="p-4 bg-sand/30 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-forest/50 block">Expedition Details</span>
                  <div className="font-bold text-forest text-sm">{selectedBooking.destinationName}</div>
                  <div>Safari: {selectedBooking.safariName}</div>
                  <div>Dates: {new Date(selectedBooking.safariDate).toDateString()}{selectedBooking.endDate ? ` – ${new Date(selectedBooking.endDate).toDateString()}` : ''}</div>
                  <div>Slot: {selectedBooking.slot}</div>
                  <div>Zone: {selectedBooking.zone}</div>
                  <div>Vehicle: {selectedBooking.vehicleType}</div>
                  <div>Guests: {selectedBooking.guests.adults} Adults, {selectedBooking.guests.children} Children</div>
                </div>
              </div>

              {selectedBooking.specialRequests && (
                <div className="p-4 bg-sand/20 rounded-xl text-xs">
                  <strong className="block text-forest mb-1 font-semibold">Special Requests / Photo Gear Notes:</strong>
                  <p className="text-forest/80 italic">{selectedBooking.specialRequests}</p>
                </div>
              )}

              {/* Counter-offer when the requested reserve/package is unavailable */}
              {selectedBooking.suggestion?.destinationSlug && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-1">
                  <strong className="block text-blue-900">Alternative sent to traveler</strong>
                  <div>Reserve: {selectedBooking.suggestion.destinationName}</div>
                  {selectedBooking.suggestion.packageLabel && <div>Package: {selectedBooking.suggestion.packageLabel}</div>}
                  {selectedBooking.suggestion.message && <p className="italic text-blue-900/80">{selectedBooking.suggestion.message}</p>}
                  <button
                    onClick={handleClearSuggestion}
                    disabled={updatingId === selectedBooking._id}
                    className="mt-2 px-3 py-1.5 border border-blue-300 text-blue-900 rounded-lg font-semibold hover:bg-blue-100 transition disabled:opacity-50"
                  >
                    Withdraw & Return to Review
                  </button>
                </div>
              )}

              {!suggesting ? (
                <button
                  onClick={() => setSuggesting(true)}
                  className="px-4 py-2 bg-sand border border-forest/25 text-forest rounded-xl text-xs font-semibold hover:bg-gold transition"
                >
                  Suggest Alternative Reserve / Package
                </button>
              ) : (
                <div className="p-4 bg-sand/40 rounded-xl space-y-3 text-xs">
                  <strong className="block text-forest">Suggest an Alternative</strong>
                  <select
                    value={sugDestSlug}
                    onChange={e => { setSugDestSlug(e.target.value); setSugPackage(''); }}
                    className="w-full px-3 py-2 border border-forest/20 rounded-lg bg-white text-forest"
                  >
                    <option value="">Pick a reserve...</option>
                    {destinations.map(d => (
                      <option key={d.slug} value={d.slug}>{d.name}</option>
                    ))}
                  </select>
                  <select
                    value={sugPackage}
                    onChange={e => setSugPackage(e.target.value)}
                    className="w-full px-3 py-2 border border-forest/20 rounded-lg bg-white text-forest"
                  >
                    <option value="">Any package</option>
                    {packagesOf(destinations.find(d => d.slug === sugDestSlug) ?? { packages: [] }).map(p => (
                      <option key={p.label} value={p.label}>{p.label}</option>
                    ))}
                  </select>
                  <textarea
                    value={sugMessage}
                    onChange={e => setSugMessage(e.target.value)}
                    rows={3}
                    placeholder="Note for the traveler (e.g. your date is full; this reserve has permits open)."
                    className="w-full px-3 py-2 border border-forest/20 rounded-lg bg-white text-forest"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSuggest}
                      disabled={updatingId === selectedBooking._id}
                      className="px-4 py-2 bg-forest text-sand rounded-lg font-semibold hover:bg-forest/90 transition disabled:opacity-50"
                    >
                      Send Suggestion
                    </button>
                    <button
                      onClick={() => setSuggesting(false)}
                      className="px-4 py-2 border border-forest/20 rounded-lg font-semibold hover:bg-sand transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* ---- Payment workflow (enquiry-to-completed pipeline) ---- */}
              <div className="border-t border-forest/10 pt-4 space-y-4 print:hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-forest/60 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5" /> Payment Workflow
                  </span>
                  {crmLoading ? (
                    <span className="text-[11px] text-forest/50">Loading pipeline...</span>
                  ) : crmStatus ? (
                    <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${leadStatusClass(crmStatus)}`}>
                      {LEAD_STATUS_LABELS[crmStatus] || crmStatus}
                    </span>
                  ) : (
                    <span className="text-[11px] text-forest/50">No enquiry pipeline on this booking</span>
                  )}
                </div>

                {crmLoading ? null : crm && crmBooking ? (
                  <div className="space-y-4 text-xs">
                    {/* Package the price came from */}
                    {crmPkg ? (
                      <div className="p-4 bg-sand/30 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-forest text-sm">{crmPkg.name}</span>
                          <span className="font-serif font-bold text-forest">{formatINR(crmPkg.totalPrice)}</span>
                        </div>
                        <div className="text-forest/70">
                          {crmPkg.packageRef} · {crmPkg.destinationName} · {crmPkg.travelStartDate}
                          {crmPkg.travelEndDate ? ` → ${crmPkg.travelEndDate}` : ''}
                        </div>
                        {crmMissing.length > 0 ? (
                          <p className="text-amber-700 pt-1">
                            Advance payment is locked until the package is complete: {crmMissing.join(', ')}.
                          </p>
                        ) : (
                          <p className="text-emerald-700 font-semibold pt-1 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Package complete.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                        No package has been drafted for this enquiry yet — open the enquiry to draft one.
                      </div>
                    )}

                    {/* Money ledger */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-3 bg-sand/40 rounded-xl">
                        <div className="text-[10px] uppercase text-forest/50 font-bold">Package</div>
                        <div className="font-serif font-bold text-forest">{formatINR(crmBooking.totalAmount)}</div>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-xl">
                        <div className="text-[10px] uppercase text-emerald-700 font-bold">Received</div>
                        <div className="font-serif font-bold text-emerald-800">{formatINR(totalPaidOf(crmPayments))}</div>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-xl">
                        <div className="text-[10px] uppercase text-amber-700 font-bold">Balance</div>
                        <div className="font-serif font-bold text-amber-800">{formatINR(outstanding(crmBooking.totalAmount, crmPayments))}</div>
                      </div>
                    </div>

                    {/* Payments received */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-forest/60 block mb-1.5">Payments Received</span>
                      {crmPayments.length === 0 ? (
                        <p className="text-forest/50 text-[11px]">Nothing captured yet — verification happens on the webhook, never in the browser.</p>
                      ) : (
                        <div className="border border-forest/10 rounded-xl overflow-hidden">
                          <table className="w-full text-[11px] text-left">
                            <thead className="bg-sand/40 text-forest/60 uppercase text-[9px]">
                              <tr>
                                <th className="p-2">Instalment</th>
                                <th className="p-2">Amount</th>
                                <th className="p-2">Method</th>
                                <th className="p-2">Paid</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-forest/5 text-forest/80">
                              {crmPayments.map((p, i) => (
                                <tr key={p.paymentId || i}>
                                  <td className="p-2 font-semibold capitalize">{p.type}</td>
                                  <td className="p-2 font-bold text-forest">{formatINR(p.amount)}</td>
                                  <td className="p-2 uppercase">{p.method || '—'}</td>
                                  <td className="p-2 text-forest/60">{p.paidAt ? new Date(p.paidAt).toLocaleString() : '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Payment links, with the 24h expiry made visible */}
                    {crmLinks.length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-forest/60 block mb-1.5">Payment Links (24h)</span>
                        <div className="space-y-1.5">
                          {crmLinks.map((l, i) => (
                            <div key={l.linkId || i} className="flex items-center justify-between gap-2 p-2.5 bg-sand/30 rounded-lg">
                              <div className="min-w-0">
                                <span className="font-semibold uppercase text-forest">{l.type}</span>{' '}
                                <span className="text-forest/70">{formatINR(l.amount)}</span>
                                <div className="text-[10px] text-forest/50 truncate flex items-center gap-1.5 mt-0.5">
                                  <span className="truncate">{l.shortUrl}</span>
                                  {l.shortUrl && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(l.shortUrl!);
                                        success('Copied payment link to clipboard!');
                                      }}
                                      className="p-0.5 hover:bg-forest/10 rounded text-forest/60 hover:text-forest transition"
                                      title="Copy payment link"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${
                                  l.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                  : l.status === 'active' ? 'bg-blue-50 text-blue-700 border-blue-300'
                                  : 'bg-sand text-forest/60 border-forest/20'}`}>
                                  {l.status}
                                </span>
                                {l.status === 'active' && (
                                  <div className="text-[9px] text-forest/50">{linkExpiryLabel(l.expiresAt)}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 5-Step Operational Actions (Steps 3, 4, 5) */}
                    <div className="space-y-3 pt-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-forest/70 flex items-center justify-between">
                        <span>Workflow Operations</span>
                        <span className="text-[10px] text-forest/50 font-normal">Aligned with 5-Step Website Flow</span>
                      </div>

                      {/* Step 3 Card: Advance Payment */}
                      <div className={`p-4 rounded-2xl border transition ${
                        hasAdvance 
                          ? 'bg-emerald-50/60 border-emerald-200' 
                          : canRequestAdvance 
                          ? 'bg-white border-forest/20 shadow-xs' 
                          : 'bg-sand/20 border-forest/10 opacity-80'
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                hasAdvance ? 'bg-emerald-600 text-white' : 'bg-forest/10 text-forest'
                              }`}>
                                {hasAdvance ? '✓' : '3'}
                              </span>
                              <h5 className="font-bold text-forest text-sm">Step 3: Advance Payment</h5>
                              {hasAdvance && (
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                  Advance Paid
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-forest/70 max-w-md">
                              {hasAdvance 
                                ? 'Advance received and verified by Razorpay webhook. Payment receipt automatically emailed to customer.'
                                : crmMissing.length > 0
                                ? `Package incomplete: please complete ${crmMissing.join(', ')} before requesting advance.`
                                : 'Manually set the advance amount in the pop-up. Customer receives booking details & 24h Razorpay link via email.'}
                            </p>
                          </div>

                          {!hasAdvance && (
                            <button
                              onClick={() => setShowAdvance(true)}
                              disabled={crmBusy !== '' || !canRequestAdvance}
                              className="shrink-0 px-4 py-2.5 bg-forest text-sand rounded-xl font-bold text-xs hover:bg-forest/90 transition disabled:opacity-40 flex items-center gap-1.5 shadow-sm"
                            >
                              <Link2 className="w-3.5 h-3.5" />
                              {crmBusy === 'advance' ? 'Issuing...' : 'Set Advance & Send Link'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Step 4 Card: Booking Confirmation */}
                      <div className={`p-4 rounded-2xl border transition ${
                        crmStatus === 'booking_confirmed' || crmStatus === 'awaiting_final_payment' || crmStatus === 'fully_paid' || crmStatus === 'completed'
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : canConfirm
                          ? 'bg-gold/15 border-gold/40 shadow-xs'
                          : 'bg-sand/20 border-forest/10 opacity-70'
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                crmStatus === 'booking_confirmed' || crmStatus === 'awaiting_final_payment' || crmStatus === 'fully_paid' || crmStatus === 'completed'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-forest/10 text-forest'
                              }`}>
                                {crmStatus === 'booking_confirmed' || crmStatus === 'awaiting_final_payment' || crmStatus === 'fully_paid' || crmStatus === 'completed' ? '✓' : '4'}
                              </span>
                              <h5 className="font-bold text-forest text-sm">Step 4: Booking Confirmation</h5>
                              {(crmStatus === 'booking_confirmed' || crmStatus === 'awaiting_final_payment') && (
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                  Confirmed by Team
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-forest/70 max-w-md">
                              {canConfirm
                                ? 'Advance received! Confirming will lock the safari, trigger the update email, and generate a 24h Razorpay link for remaining balance.'
                                : (crmStatus === 'booking_confirmed' || crmStatus === 'awaiting_final_payment')
                                ? 'Booking confirmed by team. Update email & balance payment link have been dispatched to customer.'
                                : 'Requires advance payment to be completed first before confirmation.'}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {canConfirm && (
                              <button
                                onClick={handleConfirm}
                                disabled={crmBusy !== ''}
                                className="px-4 py-2.5 bg-gold text-forest rounded-xl font-bold text-xs hover:brightness-95 transition disabled:opacity-40 flex items-center gap-1.5 shadow-sm"
                              >
                                <BadgeCheck className="w-3.5 h-3.5" />
                                {crmBusy === 'confirm' ? 'Confirming...' : 'Confirm Booking'}
                              </button>
                            )}

                            {canFinalLink && (
                              <button
                                onClick={handleFinalLink}
                                disabled={crmBusy !== ''}
                                title="Generate a fresh 24h link for the outstanding balance"
                                className="px-3.5 py-2 bg-sand border border-forest/25 text-forest rounded-xl font-semibold text-xs hover:bg-gold transition disabled:opacity-40 flex items-center gap-1.5"
                              >
                                <Send className="w-3.5 h-3.5" />
                                {crmBusy === 'final' ? 'Sending...' : 'Resend Balance Link'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Step 5 Card: Final Payment and Booking Details */}
                      <div className={`p-4 rounded-2xl border transition ${
                        crmStatus === 'fully_paid' || crmStatus === 'completed'
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : 'bg-sand/20 border-forest/10 opacity-70'
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                crmStatus === 'fully_paid' || crmStatus === 'completed' ? 'bg-emerald-600 text-white' : 'bg-forest/10 text-forest'
                              }`}>
                                {crmStatus === 'completed' ? '✓' : '5'}
                              </span>
                              <h5 className="font-bold text-forest text-sm">Step 5: Final Payment & Documents</h5>
                              {crmStatus === 'fully_paid' && (
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                  100% Paid
                                </span>
                              )}
                              {crmStatus === 'completed' && (
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-forest text-sand">
                                  Safari Completed
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-forest/70 max-w-md">
                              {crmStatus === 'fully_paid' || crmStatus === 'completed'
                                ? 'Final payment completed. Traveler has received final email with full booking details, documents, and final receipt.'
                                : 'Pending balance payment. Once paid via Razorpay, traveler automatically receives final email with itinerary and receipts.'}
                            </p>
                          </div>

                          {canComplete && (
                            <button
                              onClick={handleComplete}
                              disabled={crmBusy !== ''}
                              className="shrink-0 px-4 py-2.5 bg-forest text-sand rounded-xl font-bold text-xs hover:bg-forest/90 transition disabled:opacity-40 shadow-sm"
                            >
                              {crmBusy === 'complete' ? 'Saving...' : 'Mark Safari Completed'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Resend past emails without touching payments */}
                    <div className="flex items-end gap-2 pt-1 border-t border-forest/10">
                      <label className="block flex-1">
                        <span className="text-[10px] uppercase font-bold text-forest/60 block mb-1">Resend Email</span>
                        <select
                          id="resend-event"
                          defaultValue=""
                          className="w-full px-3 py-2 border border-forest/20 rounded-lg bg-white text-forest"
                        >
                          <option value="" disabled>Choose an email...</option>
                          <option value="advance_payment_request">Advance payment request</option>
                          <option value="booking_confirmation">Booking confirmation</option>
                          <option value="final_payment_confirmation">Final payment confirmation</option>
                        </select>
                      </label>
                      <button
                        onClick={() => {
                          const sel = document.getElementById('resend-event') as HTMLSelectElement | null;
                          if (!sel?.value) { error('Choose an email to resend.'); return; }
                          handleResend(sel.value);
                        }}
                        disabled={crmBusy !== ''}
                        className="px-4 py-2 border border-forest/25 text-forest rounded-lg font-semibold hover:bg-sand transition disabled:opacity-40"
                      >
                        {crmBusy === 'resend' ? 'Sending...' : 'Resend'}
                      </button>
                    </div>

                    {crm.emails?.length > 0 && (
                      <p className="text-[10px] text-forest/50">
                        {crm.emails.length} email(s) logged for this booking (duplicates are suppressed by dedupe key).
                      </p>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-forest/10 text-xs">
                <div>
                  <span className="text-forest/60 block">Total Tariff:</span>
                  <span className="font-serif text-2xl font-bold text-forest">₹{selectedBooking.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 print:hidden">
                  <button
                    onClick={handleCopyWhatsAppSummary}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 transition shadow"
                    title="Copy full safari details formatted for WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Copy WhatsApp Summary</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2 border border-forest/20 text-forest rounded-xl font-semibold hover:bg-sand transition flex items-center space-x-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="px-4 py-2 bg-forest text-sand rounded-xl font-bold uppercase tracking-wider hover:bg-forest/90 transition shadow"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Advance amount dialog: package amount, advance in, balance out */}
        {showAdvance && crmPkg && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl border border-forest/20 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-forest/10 pb-3">
                <div>
                  <h4 className="font-serif text-xl font-bold text-forest">Request Advance Payment</h4>
                  <span className="text-forest/60 text-[11px]">A 24-hour Razorpay link is emailed to the traveler.</span>
                </div>
                <button onClick={() => setShowAdvance(false)} className="p-1 rounded-full text-forest/40 hover:text-forest">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-sand/40 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-forest/70">Package amount</span>
                  <span className="font-serif font-bold text-forest text-base">{formatINR(crmPkg.totalPrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-forest/70">Already received</span>
                  <span className="font-semibold text-emerald-800">{formatINR(totalPaidOf(crmPayments))}</span>
                </div>
              </div>

              <label className="block text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest/60">Advance amount <span className="text-red-500">*</span></span>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-forest/60">₹</span>
                  <input
                    type="number"
                    min={1}
                    value={advanceAmt}
                    onChange={e => setAdvanceAmt(e.target.value)}
                    autoFocus
                    placeholder="e.g. 50000"
                    className="w-full pl-7 pr-3 py-2.5 border border-forest/20 rounded-xl bg-white text-forest focus:outline-none focus:ring-2 focus:ring-forest/30"
                  />
                </div>
              </label>

              {/* Quick % Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-forest/50 font-bold uppercase mr-1">Quick %:</span>
                {[
                  { label: '25%', frac: 0.25 },
                  { label: '33%', frac: 0.3333 },
                  { label: '50%', frac: 0.50 },
                  { label: 'Full', frac: 1.0 }
                ].map(p => {
                  const val = Math.round(crmPkg.totalPrice * p.frac);
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setAdvanceAmt(String(val))}
                      className="px-2.5 py-1 bg-sand/60 hover:bg-gold text-forest rounded-lg text-[11px] font-semibold transition shadow-xs"
                    >
                      {p.label} (₹{val.toLocaleString('en-IN')})
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between p-3 bg-forest/5 rounded-xl text-xs">
                <span className="text-forest/70">Remaining balance after advance</span>
                <span className="font-serif font-bold text-forest text-base">
                  {formatINR(Math.max(0, (Number(advanceAmt) > 0 ? crmPkg.totalPrice - Number(advanceAmt) : crmPkg.totalPrice)))}
                </span>
              </div>

              <p className="text-[11px] text-forest/60">
                Advance must be greater than ₹0 and cannot exceed the package amount. Payment is confirmed by webhook only — booking confirmation stays a separate team action.
              </p>

              {advanceInvalid && <p className="text-[11px] text-red-600 font-semibold">{advanceInvalid}</p>}

              <div className="flex gap-2 justify-end pt-2 border-t border-forest/10">
                <button
                  onClick={() => setShowAdvance(false)}
                  className="px-4 py-2 border border-forest/20 text-forest rounded-xl font-semibold hover:bg-sand transition text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestAdvance}
                  disabled={crmBusy !== '' || advanceAmt === '' || !!advanceInvalid}
                  className="px-5 py-2 bg-forest text-sand rounded-xl font-bold uppercase tracking-wider text-xs disabled:opacity-40"
                >
                  {crmBusy === 'advance' ? 'Issuing link...' : 'Generate & Email Link'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
export default AdminBookingsPage;
