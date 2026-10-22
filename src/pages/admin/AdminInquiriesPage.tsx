import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Plus,
  Save,
  ArrowRight,
  Search,
  Eye,
  X,
  CheckCircle2,
  FileText,
  Clock,
  Wallet,
  Copy,
  Share2,
  Sparkles,
  Link2,
  AlertCircle
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { WorkflowStepper } from '../../components/admin/WorkflowStepper';
import { crmService, adminService } from '../../services/api';
import { CrmInquiry, CrmBooking, CrmPackage, User } from '../../types';
import { useToast } from '../../components/common/Toast';
import {
  LEAD_STATUS_LABELS,
  LEAD_STATUS_ORDER,
  leadStatusClass,
  formatINR,
  advanceError,
  getWhatsAppUrl,
  generateWhatsAppInquiryGreeting,
  generateWhatsAppBookingSummary,
  getPackagePreset,
  getStepForStatus,
  activeLinkOf,
  linkExpiryLabel
} from '../../lib/crm';

type Detail = { inquiry: CrmInquiry; booking: CrmBooking | null; package: CrmPackage | null; missingFields: string[] };

const emptyPackage = {
  name: '',
  destinationName: '',
  travelStartDate: '',
  travelEndDate: '',
  adults: '1',
  children: '0',
  itinerary: '',
  accommodation: '',
  safariDetails: '',
  inclusions: '',
  exclusions: '',
  terms: '',
  totalPrice: ''
};

export const AdminInquiriesPage: React.FC = () => {
  const { error, success } = useToast();
  const [inquiries, setInquiries] = useState<CrmInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [detail, setDetail] = useState<Detail | null>(null);
  const [staff, setStaff] = useState<User[]>([]);
  const [noteDraft, setNoteDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [pkg, setPkg] = useState({ ...emptyPackage });

  // Step 3 Advance Payment Pop-up Window state
  const [showAdvancePopup, setShowAdvancePopup] = useState(false);
  const [advanceAmountInput, setAdvanceAmountInput] = useState('');
  const [activatingAdvance, setActivatingAdvance] = useState(false);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const data = await crmService.listInquiries({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchQuery || undefined
      });
      setInquiries(data);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to load enquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInquiries(); }, [statusFilter]);

  // Team list for assignment
  useEffect(() => {
    adminService.getUsers('team')
      .then(users => setStaff(users.filter(u => u.role !== 'content_manager')))
      .catch(() => {});
  }, []);

  const openDetail = async (id: string) => {
    try {
      setSaving(true);
      const d = await crmService.getInquiry(id);
      setDetail(d);
      setNoteDraft('');
      setShowAdvancePopup(false);
      setAdvanceAmountInput('');
      const existing = d.package;
      setShowPackageForm(!existing);
      setPkg(existing ? {
        name: existing.name || '',
        destinationName: existing.destinationName || '',
        travelStartDate: existing.travelStartDate || '',
        travelEndDate: existing.travelEndDate || '',
        adults: String(existing.guests?.adults ?? 1),
        children: String(existing.guests?.children ?? 0),
        itinerary: existing.itinerary || '',
        accommodation: existing.accommodation || '',
        safariDetails: existing.safariDetails || '',
        inclusions: (existing.inclusions || []).join('\n'),
        exclusions: (existing.exclusions || []).join('\n'),
        terms: existing.terms || '',
        totalPrice: String(existing.totalPrice ?? '')
      } : {
        ...emptyPackage,
        destinationName: d.inquiry.destination || '',
        travelStartDate: d.inquiry.travelDate || ''
      });
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to load the enquiry.');
    } finally {
      setSaving(false);
    }
  };

  const patchDetail = (patch: Partial<Detail>) => setDetail(d => (d ? { ...d, ...patch } : d));

  const applyPreset = (tier: 'Budget' | 'Mid-Range' | 'Luxury') => {
    const dest = pkg.destinationName || detail?.inquiry.destination || 'Central India Tiger Reserve';
    const preset = getPackagePreset(dest, tier);
    setPkg(prev => ({
      ...prev,
      name: prev.name || preset.name,
      destinationName: dest,
      accommodation: preset.accommodation,
      itinerary: preset.itinerary,
      safariDetails: preset.safariDetails,
      inclusions: preset.inclusions,
      exclusions: preset.exclusions,
      terms: preset.terms,
    }));
    success(`Applied ${tier} package template for ${dest}!`);
  };

  const handleStatus = async (status: string) => {
    if (!detail) return;
    try {
      const inquiry = await crmService.updateInquiry(detail.inquiry._id, { status });
      patchDetail({ inquiry });
      await fetchInquiries();
      success(`Status updated to ${LEAD_STATUS_LABELS[status as any] || status}`);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleAssign = async (assignedTo: string) => {
    if (!detail) return;
    try {
      const inquiry = await crmService.updateInquiry(detail.inquiry._id, { assignedTo: assignedTo || null });
      patchDetail({ inquiry });
      await fetchInquiries();
      success('Representative assigned successfully.');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to assign representative.');
    }
  };

  const handleAddNote = async () => {
    if (!detail || !noteDraft.trim()) return;
    try {
      const inquiry = await crmService.updateInquiry(detail.inquiry._id, { note: noteDraft.trim() });
      patchDetail({ inquiry });
      setNoteDraft('');
      success('Follow-up note logged.');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save the follow-up note.');
    }
  };

  const handleSavePackage = async () => {
    if (!detail) return;
    if (!pkg.name.trim() || !pkg.destinationName.trim() || !pkg.travelStartDate.trim()) {
      error('Package name, destination and travel start date are required.');
      return;
    }
    if (!(Number(pkg.totalPrice) > 0)) {
      error('Please set the manual package price.');
      return;
    }
    try {
      setSaving(true);
      const res = await crmService.savePackage(detail.inquiry._id, {
        name: pkg.name.trim(),
        destinationName: pkg.destinationName.trim(),
        travelStartDate: pkg.travelStartDate,
        travelEndDate: pkg.travelEndDate || undefined,
        guests: { adults: Number(pkg.adults) || 1, children: Number(pkg.children) || 0 },
        itinerary: pkg.itinerary.trim(),
        accommodation: pkg.accommodation.trim(),
        safariDetails: pkg.safariDetails.trim(),
        inclusions: pkg.inclusions.split('\n').map(s => s.trim()).filter(Boolean),
        exclusions: pkg.exclusions.split('\n').map(s => s.trim()).filter(Boolean),
        terms: pkg.terms.trim(),
        totalPrice: Number(pkg.totalPrice)
      } as Partial<CrmPackage>);
      patchDetail({ package: res.package, booking: res.booking, missingFields: res.missingFields });
      setShowPackageForm(false);
      success('Package created and booking registered in CRM! Advance payment option is now activated.');
      await fetchInquiries();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save the package.');
    } finally {
      setSaving(false);
    }
  };

  // Step 3: Trigger Advance Payment (Pop-up Window)
  const handleTriggerAdvancePayment = async () => {
    if (!detail?.booking) return;
    if (!Number(advanceAmountInput)) {
      error('Please enter a valid advance payment amount.');
      return;
    }
    if (advanceInvalid) {
      error(advanceInvalid);
      return;
    }

    try {
      setActivatingAdvance(true);
      await crmService.activateAdvance(detail.booking._id, Number(advanceAmountInput));
      success('Advance payment activated! 24-hour Razorpay link generated and emailed to traveler.');
      setShowAdvancePopup(false);
      
      // Refresh detail
      const refreshed = await crmService.getInquiry(detail.inquiry._id);
      setDetail(refreshed);
      await fetchInquiries();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to activate advance payment link.');
    } finally {
      setActivatingAdvance(false);
    }
  };

  const booking = detail?.booking as CrmBooking | null;
  const pkgSaved = detail?.package;
  // The completeness gate is the server's answer (detail.missingFields), so it
  // can never drift from the API.
  const missing = detail?.missingFields || [];
  const isPackageComplete = !!pkgSaved && missing.length === 0;
  // The typed advance must be payable before the button goes live, so the
  // inline error and the button always agree.
  const advanceInvalid = advanceAmountInput === ''
    ? null
    : advanceError(advanceAmountInput, Number(pkgSaved?.totalPrice || booking?.totalAmount || 0));
  const assignedName = (o: CrmInquiry['assignedTo']) =>
    typeof o === 'string' ? o : o?.name || '';

  const activeAdvanceLink = activeLinkOf(booking?.paymentLinks || [], 'advance');
  const hasAdvancePaid = (booking?.payments || []).some(p => p.type === 'advance' && p.status === 'captured');

  const currentStep = getStepForStatus(detail?.inquiry.status);

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    opts: { type?: string; area?: boolean; rows?: number; required?: boolean; suffix?: string } = {}
  ) => (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-wider text-forest/60">
        {label}{opts.required && <span className="text-red-500"> *</span>}
      </span>
      <div className="flex items-center gap-1 mt-0.5">
        {opts.suffix && <span className="text-forest/60 text-xs font-semibold">{opts.suffix}</span>}
        {opts.area ? (
          <textarea
            value={value}
            rows={opts.rows || 3}
            onChange={e => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-forest/20 rounded-xl bg-white text-forest text-xs focus:outline-none focus:ring-2 focus:ring-forest/20"
          />
        ) : (
          <input
            type={opts.type || 'text'}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-forest/20 rounded-xl bg-white text-forest text-xs focus:outline-none focus:ring-2 focus:ring-forest/20"
          />
        )}
      </div>
    </label>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header and Toolbar */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-forest/15 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sand/60 text-forest text-[11px] font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span>Steps 1 &amp; 2: Customer Enquiries &amp; Package Preparation</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-forest">
                Guest Enquiries &amp; Package CRM
              </h2>
              <p className="text-forest/60 text-xs">
                Manage inbound website enquiries, contact travelers, draft packages, and activate advance payments.
              </p>
            </div>

            <form
              onSubmit={e => { e.preventDefault(); fetchInquiries(); }}
              className="flex items-center gap-2"
            >
              <div className="relative">
                <Search className="w-4 h-4 text-forest/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enquiry ID, name, email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none focus:ring-2 focus:ring-forest/30 w-64"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-forest text-sand rounded-xl text-xs font-semibold uppercase tracking-wider">
                Search
              </button>
            </form>
          </div>

          {/* 5-Step Pipeline filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-forest/10 text-xs">
            {[
              { v: 'all', l: 'All Enquiries' },
              { v: 'new_enquiry', l: 'Step 1: New Leads' },
              { v: 'contacted', l: 'Step 1: Discussed' },
              { v: 'package_drafted', l: 'Step 2: Package Drafted' },
              { v: 'awaiting_advance_payment', l: 'Step 3: Awaiting Advance' },
              { v: 'advance_paid', l: 'Step 4: Advance Paid' },
              { v: 'completed', l: 'Step 5: Completed' }
            ].map(f => (
              <button
                key={f.v}
                onClick={() => setStatusFilter(f.v)}
                className={`px-3 py-1.5 rounded-lg uppercase tracking-wider font-semibold whitespace-nowrap transition ${
                  statusFilter === f.v ? 'bg-forest text-sand shadow-sm' : 'text-forest/70 hover:bg-sand/60'
                }`}
              >
                {f.l}
              </button>
            ))}
          </div>
        </div>

        {/* Leads table */}
        <div className="bg-white rounded-3xl border border-forest/15 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-forest/60 text-xs">Loading enquiries...</div>
          ) : inquiries.length === 0 ? (
            <div className="py-20 text-center text-forest/50 text-xs">No enquiries match the current filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="bg-sand/30 border-b border-forest/10 text-forest/60 uppercase tracking-wider text-[10px]">
                    <th className="p-4 font-semibold">Enquiry ID</th>
                    <th className="p-4 font-semibold">Received</th>
                    <th className="p-4 font-semibold">Traveler</th>
                    <th className="p-4 font-semibold">Target Reserve</th>
                    <th className="p-4 font-semibold">Representative</th>
                    <th className="p-4 font-semibold">Pipeline Step</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest/5 text-forest/80">
                  {inquiries.map(inq => {
                    const stepNum = getStepForStatus(inq.status);

                    return (
                      <tr key={inq._id} className="hover:bg-sand/10 transition">
                        <td className="p-4 font-mono font-bold text-forest">
                          {inq.enquiryId || '—'}
                        </td>
                        <td className="p-4 text-forest/60">
                          {new Date(inq.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <strong className="text-forest block">{inq.name}</strong>
                          <div className="text-forest/60 text-[11px]">{inq.email}</div>
                          <div className="text-forest/50 text-[10px]">{inq.phone || '—'}</div>
                        </td>
                        <td className="p-4 font-semibold text-forest">{inq.destination || 'Unspecified'}</td>
                        <td className="p-4 text-forest/70">{assignedName(inq.assignedTo) || 'Unassigned'}</td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <span className={`inline-block px-2.5 py-0.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${leadStatusClass(inq.status)}`}>
                              Step {stepNum}: {LEAD_STATUS_LABELS[inq.status] || inq.status}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {inq.phone && (
                              <a
                                href={getWhatsAppUrl(inq.phone, generateWhatsAppInquiryGreeting(inq.name, inq.destination))}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition shadow-sm"
                                title="Step 1: Discuss requirements on WhatsApp"
                              >
                                <span>WhatsApp</span>
                              </a>
                            )}
                            <button
                              onClick={() => openDetail(inq._id)}
                              className="px-3 py-1.5 rounded-lg bg-forest text-sand text-[11px] font-semibold flex items-center gap-1 hover:bg-forest/90 transition shadow-xs"
                              title="Open Dossier"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Manage</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Modal with 5-Step Pipeline */}
        {detail && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white max-w-3xl w-full rounded-3xl overflow-hidden shadow-2xl border border-forest/20 p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-forest/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-2xl font-bold text-forest">Enquiry Dossier</h3>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-sand font-bold text-forest">
                      {detail.inquiry.enquiryId || '—'}
                    </span>
                  </div>
                  <span className="text-xs text-forest/60">
                    Received {new Date(detail.inquiry.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
                <button onClick={() => setDetail(null)} className="p-1 rounded-full text-forest/40 hover:text-forest">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 5-Step Pipeline Stepper */}
              <WorkflowStepper status={detail.inquiry.status} />

              {/* STEP 1: Customer Enquiry & Requirements Discussion */}
              <div className="p-5 bg-sand/30 rounded-2xl border border-forest/10 space-y-4">
                <div className="flex items-center justify-between border-b border-forest/10 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-earth flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-gold" />
                    <span>Step 1: Customer Enquiry &amp; Discussion</span>
                  </span>
                  
                  {detail.inquiry.status === 'new_enquiry' && (
                    <button
                      type="button"
                      onClick={() => handleStatus('contacted')}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-blue-700 transition"
                    >
                      Mark Requirements Discussed &rarr;
                    </button>
                  )}
                </div>

                <div className="grid sm:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1 sm:col-span-2">
                    <span className="text-[10px] uppercase font-bold text-forest/50 block">Traveler Contact</span>
                    <div className="font-bold text-forest text-sm">{detail.inquiry.name}</div>
                    <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-forest/50" />{detail.inquiry.email}</div>
                    
                    {detail.inquiry.phone && (
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-forest/50" />{detail.inquiry.phone}</div>
                        <a
                          href={getWhatsAppUrl(detail.inquiry.phone, generateWhatsAppInquiryGreeting(detail.inquiry.name, detail.inquiry.destination))}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition shadow-sm"
                        >
                          <span>WhatsApp Traveler</span>
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="block">
                      <span className="text-[10px] uppercase font-bold text-forest/50 flex items-center gap-1">
                        <Users className="w-3 h-3" /> Assigned Representative
                      </span>
                      <select
                        value={typeof detail.inquiry.assignedTo === 'object' && detail.inquiry.assignedTo ? detail.inquiry.assignedTo._id : (detail.inquiry.assignedTo as string) || ''}
                        onChange={e => handleAssign(e.target.value)}
                        className="mt-1 w-full px-2.5 py-1.5 border border-forest/20 rounded-lg bg-white text-forest text-xs"
                      >
                        <option value="">Unassigned</option>
                        {staff.map(u => (
                          <option key={u._id || u.id} value={u._id || u.id}>{u.name}</option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-[10px] uppercase font-bold text-forest/50">Current Status</span>
                      <select
                        value={detail.inquiry.status}
                        onChange={e => handleStatus(e.target.value)}
                        className={`mt-1 w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${leadStatusClass(detail.inquiry.status)}`}
                      >
                        {LEAD_STATUS_ORDER.map(s => (
                          <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                {/* Requirements Summary */}
                <div className="p-3 bg-white/70 rounded-xl border border-forest/10 grid sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-forest/50 uppercase font-bold block">Target Reserve</span>
                    <strong className="text-forest text-xs">{detail.inquiry.destination || 'Open / Not Specified'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-forest/50 uppercase font-bold block">Preferred Dates</span>
                    <strong className="text-forest text-xs">{detail.inquiry.travelDate || 'Flexible'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-forest/50 uppercase font-bold block">Travelers / Guests</span>
                    <strong className="text-forest text-xs">{detail.inquiry.guests ? `${detail.inquiry.guests} guests` : 'Not specified'}</strong>
                  </div>
                </div>

                {detail.inquiry.message && (
                  <div className="p-3 bg-white/50 rounded-xl text-xs space-y-2">
                    <strong className="block text-forest text-[11px] font-semibold">Customer Requirements Message:</strong>
                    <p className="text-forest/80 italic whitespace-pre-wrap">{detail.inquiry.message}</p>
                    
                    {/* Structured Preference Pills from Custom Selectors */}
                    {(() => {
                      const msg = detail.inquiry.message || '';
                      const extract = (tag: string) => {
                        const match = msg.match(new RegExp(`\\[${tag}\\]:\\s*([^\\n]+)`));
                        return match ? match[1].trim() : null;
                      };
                      const style = extract('Style');
                      const stay = extract('Stay');
                      const vehicle = extract('Vehicle & Zones');
                      const transfer = extract('Transfer Hub');
                      const addons = extract('Add-ons');

                      if (!style && !stay && !vehicle && !transfer && !addons) return null;

                      return (
                        <div className="pt-2 border-t border-forest/10 space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-forest/50 block">Detected Customer Preferences:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {style && (
                              <span className="px-2.5 py-1 rounded-lg bg-gold/15 text-forest border border-gold/40 text-[10px] font-bold flex items-center gap-1 shadow-xs">
                                <span>📸</span> <span>{style}</span>
                              </span>
                            )}
                            {stay && (
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold flex items-center gap-1 shadow-xs">
                                <span>🏨</span> <span>{stay}</span>
                              </span>
                            )}
                            {vehicle && (
                              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-300 text-[10px] font-bold flex items-center gap-1 shadow-xs">
                                <span>🚙</span> <span>{vehicle}</span>
                              </span>
                            )}
                            {transfer && (
                              <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-300 text-[10px] font-bold flex items-center gap-1 shadow-xs">
                                <span>✈️</span> <span>{transfer.split('—')[0]}</span>
                              </span>
                            )}
                            {addons && (
                              <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-bold flex items-center gap-1 shadow-xs">
                                <span>⚡</span> <span>{addons}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Follow-up notes */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] uppercase font-bold text-forest/60 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-gold" /> Log Requirements &amp; Notes
                  </span>
                  {detail.inquiry.notes?.length ? (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {detail.inquiry.notes.map((n, i) => (
                        <div key={n._id || i} className="p-2 bg-white/80 rounded-lg text-[11px] border border-forest/5">
                          <span className="font-bold text-forest">{n.by || 'Team'}</span>
                          <span className="text-forest/50"> · {n.createdAt ? new Date(n.createdAt).toLocaleString('en-IN') : ''}</span>
                          <p className="text-forest/80">{n.note}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-forest/50 text-[11px]">No notes logged yet.</p>
                  )}
                  <div className="flex gap-2">
                    <input
                      value={noteDraft}
                      onChange={e => setNoteDraft(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                      placeholder="Discussed on call / WhatsApp (e.g. wants 4 core safaris at Tadoba)..."
                      className="flex-1 px-3 py-2 border border-forest/20 rounded-xl bg-white text-forest text-xs focus:outline-none focus:ring-2 focus:ring-forest/20"
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={saving || !noteDraft.trim()}
                      className="px-4 py-2 bg-forest text-sand rounded-xl text-xs font-semibold hover:bg-forest/90 transition disabled:opacity-50"
                    >
                      Log Note
                    </button>
                  </div>
                </div>
              </div>

              {/* STEP 2: Package Creation & Details */}
              <div className="border border-forest/15 rounded-2xl p-5 space-y-4 bg-white shadow-xs">
                <div className="flex items-center justify-between border-b border-forest/10 pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-earth flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-gold" />
                      <span>Step 2: Package Creation &amp; Pricing</span>
                    </span>
                    <p className="text-[11px] text-forest/60 mt-0.5">
                      Prepare a suitable package through the CRM. Once completed, advance payment is activated.
                    </p>
                  </div>

                  {pkgSaved && !showPackageForm && (
                    <button
                      onClick={() => setShowPackageForm(true)}
                      className="px-3.5 py-1.5 border border-forest/25 rounded-xl text-xs font-semibold hover:bg-sand transition"
                    >
                      Edit Package
                    </button>
                  )}
                </div>

                {!showPackageForm && pkgSaved ? (
                  <div className="p-4 bg-sand/30 rounded-2xl text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-forest text-base">{pkgSaved.name}</span>
                      <span className="font-serif font-bold text-forest text-lg">{formatINR(pkgSaved.totalPrice)}</span>
                    </div>
                    <div className="text-forest/70">{pkgSaved.destinationName} · {pkgSaved.travelStartDate}{pkgSaved.travelEndDate ? ` → ${pkgSaved.travelEndDate}` : ''}</div>
                    <div className="text-forest/70">{pkgSaved.guests?.adults} adult(s){pkgSaved.guests?.children ? `, ${pkgSaved.guests.children} child(ren)` : ''}</div>
                    {pkgSaved.accommodation && <div className="text-forest/70"><strong>Stay:</strong> {pkgSaved.accommodation}</div>}
                    {pkgSaved.safariDetails && <div className="text-forest/70"><strong>Safaris:</strong> {pkgSaved.safariDetails}</div>}
                    
                    {missing.length > 0 ? (
                      <p className="text-amber-700 pt-2 flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-4 h-4" />
                        Still needed to activate advance payment: {missing.join(', ')}.
                      </p>
                    ) : (
                      <p className="text-emerald-700 font-bold pt-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        All required details completed! Step 3 Advance Payment option is activated.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-sand/40 rounded-2xl space-y-4 text-xs">
                    {/* 1-Click Package Auto-Fill Bar */}
                    <div className="p-3 bg-amber-50/90 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div>
                        <span className="text-xs font-bold text-amber-950 block">⚡ Quick Auto-Fill Standard Template</span>
                        <span className="text-[11px] text-amber-800">Fill standard safari itinerary, stay, inclusions &amp; terms:</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => applyPreset('Budget')}
                          className="px-2.5 py-1 bg-white hover:bg-sand text-forest border border-forest/20 rounded-lg text-xs font-semibold shadow-xs transition"
                        >
                          Budget
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPreset('Mid-Range')}
                          className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
                        >
                          Mid-Range
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPreset('Luxury')}
                          className="px-2.5 py-1 bg-forest hover:bg-forest/90 text-gold rounded-lg text-xs font-bold shadow-xs transition"
                        >
                          Luxury
                        </button>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      {field('Package Name', pkg.name, v => setPkg({ ...pkg, name: v }), { required: true })}
                      {field('Reserve / Destination', pkg.destinationName, v => setPkg({ ...pkg, destinationName: v }), { required: true })}
                      {field('Travel Start Date', pkg.travelStartDate, v => setPkg({ ...pkg, travelStartDate: v }), { type: 'date', required: true })}
                      {field('Travel End Date', pkg.travelEndDate, v => setPkg({ ...pkg, travelEndDate: v }), { type: 'date' })}
                      {field('Adults', pkg.adults, v => setPkg({ ...pkg, adults: v }), { type: 'number', required: true })}
                      {field('Children', pkg.children, v => setPkg({ ...pkg, children: v }), { type: 'number' })}
                      {field('Manual Total Package Price', pkg.totalPrice, v => setPkg({ ...pkg, totalPrice: v }), { type: 'number', suffix: '₹', required: true })}
                    </div>
                    {/* Custom Selectors for Quick Content Filling */}
                    <div className="p-3 bg-white/70 rounded-xl border border-forest/10 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-forest/50 block">Quick Selector Inserts:</span>
                      
                      {/* Stay quick picks */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="text-forest/60 font-semibold mr-1">🏨 Stay:</span>
                        {[
                          { l: 'Ultra-Luxury Lodge', val: 'Ultra-Luxury Wilderness Lodge (Private Villa, Plunge Pool & Spa)' },
                          { l: 'Premium Boutique', val: 'Premium Boutique Jungle Resort (Spacious AC Cottages & Naturalist-led)' },
                          { l: 'Heritage Safari Camp', val: 'Heritage Safari Camp (Air-conditioned Wilderness Cottages)' }
                        ].map(s => (
                          <button
                            key={s.l}
                            type="button"
                            onClick={() => setPkg({ ...pkg, accommodation: s.val })}
                            className="px-2 py-0.5 bg-sand/60 hover:bg-gold text-forest rounded text-[10px] font-semibold transition"
                          >
                            + {s.l}
                          </button>
                        ))}
                      </div>

                      {/* Safari & Vehicle quick picks */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="text-forest/60 font-semibold mr-1">🚙 Safaris:</span>
                        {[
                          { l: 'Private Gypsy (Core)', val: 'Exclusive 4x4 Open Maruti Gypsy for all core forest game drives with registered senior naturalist.' },
                          { l: 'Core + Night Buffer', val: 'Core zone daytime safaris + 1 exclusive night safari drive in buffer zone with spotting spotlight.' },
                          { l: 'Photography Special', val: 'Custom Photography Gypsy equipped with swivel gimbal mounts, beanbags, and master photographer guide.' }
                        ].map(sf => (
                          <button
                            key={sf.l}
                            type="button"
                            onClick={() => setPkg({ ...pkg, safariDetails: sf.val })}
                            className="px-2 py-0.5 bg-sand/60 hover:bg-gold text-forest rounded text-[10px] font-semibold transition"
                          >
                            + {sf.l}
                          </button>
                        ))}
                      </div>

                      {/* Meal Plan quick picks */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="text-forest/60 font-semibold mr-1">🍽️ Meals:</span>
                        {[
                          { l: 'All Meals (AP)', item: 'All meals included: Early morning bed tea, safari breakfast, lunch, high tea, and multi-course dinner' },
                          { l: 'Half Board (MAP)', item: 'Breakfast and dinner included at resort restaurant' }
                        ].map(m => (
                          <button
                            key={m.l}
                            type="button"
                            onClick={() => {
                              const existing = pkg.inclusions ? pkg.inclusions.split('\n') : [];
                              if (!existing.includes(m.item)) {
                                setPkg({ ...pkg, inclusions: [...existing, m.item].filter(Boolean).join('\n') });
                              }
                            }}
                            className="px-2 py-0.5 bg-sand/60 hover:bg-gold text-forest rounded text-[10px] font-semibold transition"
                          >
                            + Add {m.l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {field('Accommodation & Resort', pkg.accommodation, v => setPkg({ ...pkg, accommodation: v }), { area: true, rows: 2, required: true })}
                    {field('Safari Details (Vehicles, Zones, Master Naturalist)', pkg.safariDetails, v => setPkg({ ...pkg, safariDetails: v }), { area: true, rows: 2, required: true })}
                    {field('Day-by-Day Itinerary', pkg.itinerary, v => setPkg({ ...pkg, itinerary: v }), { area: true, rows: 3, required: true })}
                    {field('Inclusions (One per line)', pkg.inclusions, v => setPkg({ ...pkg, inclusions: v }), { area: true, rows: 2, required: true })}
                    {field('Exclusions (One per line)', pkg.exclusions, v => setPkg({ ...pkg, exclusions: v }), { area: true, rows: 2, required: true })}
                    {field('Statutory Terms & Conditions', pkg.terms, v => setPkg({ ...pkg, terms: v }), { area: true, rows: 2, required: true })}

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleSavePackage}
                        disabled={saving}
                        className="px-5 py-2.5 bg-forest text-sand rounded-xl font-bold hover:bg-forest/90 transition shadow-sm flex items-center gap-1.5"
                      >
                        <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Package & Complete Step 2'}
                      </button>
                      {pkgSaved && (
                        <button
                          onClick={() => setShowPackageForm(false)}
                          className="px-4 py-2 border border-forest/25 rounded-xl font-semibold hover:bg-sand transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 3: Advance Payment Activation & Link */}
              {booking && (
                <div className="border border-forest/15 rounded-2xl p-5 space-y-3 bg-sand-warm/30 shadow-xs">
                  <div className="flex items-center justify-between border-b border-forest/10 pb-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-earth flex items-center gap-1.5">
                        <Wallet className="w-4 h-4 text-gold" />
                        <span>Step 3: Advance Payment Option</span>
                      </span>
                      <p className="text-[11px] text-forest/60">
                        Pop-up appears to set advance amount &bull; Automated email with 24h Razorpay link sent to customer.
                      </p>
                    </div>

                    <span className="font-mono text-xs font-bold text-forest">
                      Booking: #{booking.bookingRef}
                    </span>
                  </div>

                  {/* Advance status */}
                  {hasAdvancePaid ? (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Advance Payment Received! Customer received automated receipt email.</span>
                        </span>
                        <span className="font-serif font-bold text-emerald-900">{formatINR(booking.advanceAmount)}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-emerald-800">Ready for team confirmation &amp; remaining balance link:</span>
                        <Link
                          to={`/admin/bookings?search=${encodeURIComponent(booking.bookingRef)}`}
                          className="px-3.5 py-1.5 bg-forest text-sand rounded-lg font-bold text-[11px] flex items-center gap-1.5 shadow"
                        >
                          Proceed to Step 4: Confirm Booking <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ) : activeAdvanceLink ? (
                    <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-950">
                          Active Advance Payment Link (24 Hours)
                        </span>
                        <span className="text-blue-800 font-semibold">{linkExpiryLabel(activeAdvanceLink.expiresAt)}</span>
                      </div>
                      <div className="text-[11px] text-blue-900">
                        Automated email was sent to <strong>{detail.inquiry.email}</strong> with booking details and Razorpay link.
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-blue-300 text-blue-900 font-mono text-[11px] truncate max-w-sm">
                          <span className="truncate">{activeAdvanceLink.shortUrl}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(activeAdvanceLink.shortUrl!);
                              success('Copied payment link to clipboard!');
                            }}
                            className="p-1 hover:bg-blue-100 rounded text-blue-800"
                            title="Copy link"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const summary = generateWhatsAppBookingSummary(booking, pkgSaved, activeAdvanceLink.shortUrl);
                            navigator.clipboard.writeText(summary);
                            success('Copied WhatsApp summary to clipboard!');
                          }}
                          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>Copy WhatsApp Summary</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-forest/10">
                      <div>
                        <span className="font-bold text-forest text-xs block">
                          {isPackageComplete ? 'Advance Payment Option Activated' : 'Advance Payment Locked'}
                        </span>
                        <span className="text-[11px] text-forest/60">
                          {isPackageComplete 
                            ? 'Click below to open the advance payment pop-up and set the amount.'
                            : `Please complete required package information (${missing.join(', ')}) to activate advance payment.`}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowAdvancePopup(true)}
                        disabled={!isPackageComplete}
                        className="px-4 py-2 bg-forest text-sand rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-forest/90 transition shadow disabled:opacity-40 flex items-center gap-1.5 whitespace-nowrap shrink-0"
                      >
                        <Wallet className="w-3.5 h-3.5 text-gold" />
                        <span>Select Advance Payment &rarr;</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-2 border-t border-forest/10">
                <button
                  onClick={() => setDetail(null)}
                  className="px-6 py-2.5 bg-forest text-sand rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-forest/90 transition shadow"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 POP-UP WINDOW: Enter Advance Payment Amount */}
        {showAdvancePopup && detail?.booking && pkgSaved && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl border border-forest/20 p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between border-b border-forest/10 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gold block">
                    Step 3: Advance Payment
                  </span>
                  <h4 className="font-serif text-xl font-bold text-forest">
                    Enter Advance Payment Amount
                  </h4>
                </div>
                <button onClick={() => setShowAdvancePopup(false)} className="p-1 rounded-full text-forest/40 hover:text-forest">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-forest/70 leading-relaxed">
                Enter the advance payment amount for traveler <strong>{detail.inquiry.name}</strong>. An automated email with booking details and a 24-hour Razorpay link will be emailed immediately.
              </p>

              <div className="p-3.5 bg-sand/40 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-forest/70">Total Package Amount (Manual)</span>
                  <span className="font-serif font-bold text-forest text-base">{formatINR(pkgSaved.totalPrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-forest/70">Destination &amp; Start</span>
                  <span className="font-semibold text-forest">{pkgSaved.destinationName} &bull; {pkgSaved.travelStartDate}</span>
                </div>
              </div>

              {/* Advance Amount Input */}
              <label className="block text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest/70">
                  Advance Payment Amount <span className="text-red-500">*</span>
                </span>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-forest/60 font-bold">₹</span>
                  <input
                    type="number"
                    min={1}
                    max={pkgSaved.totalPrice}
                    value={advanceAmountInput}
                    onChange={e => setAdvanceAmountInput(e.target.value)}
                    autoFocus
                    placeholder="e.g. 35000"
                    className="w-full pl-8 pr-3 py-2.5 border border-forest/20 rounded-xl bg-white text-forest text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-forest/30"
                  />
                </div>
              </label>

              {/* Quick Percentage Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] text-forest/50 font-bold uppercase mr-1">Quick %:</span>
                {[
                  { label: '25%', frac: 0.25 },
                  { label: '33%', frac: 0.3333 },
                  { label: '50%', frac: 0.50 },
                  { label: 'Full 100%', frac: 1.0 }
                ].map(p => {
                  const val = Math.round(pkgSaved.totalPrice * p.frac);
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setAdvanceAmountInput(String(val))}
                      className="px-2.5 py-1 bg-sand/60 hover:bg-gold text-forest rounded-lg text-[11px] font-semibold transition shadow-xs"
                    >
                      {p.label} (₹{val.toLocaleString('en-IN')})
                    </button>
                  );
                })}
              </div>

              {/* Remaining balance preview */}
              <div className="flex items-center justify-between p-3 bg-forest/5 rounded-xl text-xs">
                <span className="text-forest/70">Remaining Balance (due at Step 4)</span>
                <span className="font-serif font-bold text-forest text-sm">
                  {formatINR(Math.max(0, pkgSaved.totalPrice - (Number(advanceAmountInput) || 0)))}
                </span>
              </div>

              {advanceInvalid && <p className="text-[11px] text-red-600 font-semibold">{advanceInvalid}</p>}

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleTriggerAdvancePayment}
                  disabled={activatingAdvance || !Number(advanceAmountInput) || !!advanceInvalid}
                  className="flex-1 px-4 py-2.5 bg-forest text-sand rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-forest/90 transition shadow disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  <Link2 className="w-3.5 h-3.5 text-gold" />
                  <span>{activatingAdvance ? 'Generating Link & Sending...' : 'Generate 24h Link & Send Email'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdvancePopup(false)}
                  className="px-4 py-2.5 border border-forest/25 rounded-xl text-xs font-semibold hover:bg-sand transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminInquiriesPage;
