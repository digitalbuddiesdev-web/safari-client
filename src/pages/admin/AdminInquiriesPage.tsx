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
  FileText
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { crmService, adminService } from '../../services/api';
import { CrmInquiry, CrmBooking, CrmPackage, User } from '../../types';
import { useToast } from '../../components/common/Toast';
import {
  LEAD_STATUS_LABELS,
  LEAD_STATUS_ORDER,
  leadStatusClass,
  formatINR,
  missingPackageFields
} from '../../lib/crm';

type Detail = { inquiry: CrmInquiry; booking: CrmBooking | null; package: CrmPackage | null };

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

  // Team list for assignment; only booking authority may own a lead.
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

  const handleStatus = async (status: string) => {
    if (!detail) return;
    try {
      const inquiry = await crmService.updateInquiry(detail.inquiry._id, { status });
      patchDetail({ inquiry });
      await fetchInquiries();
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
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to assign.');
    }
  };

  const handleAddNote = async () => {
    if (!detail || !noteDraft.trim()) return;
    try {
      const inquiry = await crmService.updateInquiry(detail.inquiry._id, { note: noteDraft.trim() });
      patchDetail({ inquiry });
      setNoteDraft('');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save the follow-up note.');
    }
  };

  const handleSavePackage = async () => {
    if (!detail) return;
    // Client mirrors the server's hard requirements so the rep sees the reason
    // before a round-trip; the completeness gate is checked at payment time.
    if (!pkg.name.trim() || !pkg.destinationName.trim() || !pkg.travelStartDate.trim()) {
      error('Package name, destination and travel start date are required.');
      return;
    }
    if (!(Number(pkg.totalPrice) > 0)) {
      error('Enter the total package price.');
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
      patchDetail({ package: res.package, booking: res.booking });
      setShowPackageForm(false);
      success('Package saved.');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save the package.');
    } finally {
      setSaving(false);
    }
  };

  const booking = detail?.booking as CrmBooking | null;
  const pkgSaved = detail?.package;
  const missing = missingPackageFields(pkgSaved);
  const isReady = !!pkgSaved && missing.length === 0;
  const assignedName = (o: CrmInquiry['assignedTo']) =>
    typeof o === 'string' ? o : o?.name || '';

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
      <div className="flex items-center gap-1">
        {opts.suffix && <span className="text-forest/60 text-xs">{opts.suffix}</span>}
        {opts.area ? (
          <textarea
            value={value}
            rows={opts.rows || 3}
            onChange={e => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-forest/20 rounded-lg bg-white text-forest text-xs focus:outline-none focus:ring-2 focus:ring-forest/20"
          />
        ) : (
          <input
            type={opts.type || 'text'}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-forest/20 rounded-lg bg-white text-forest text-xs focus:outline-none focus:ring-2 focus:ring-forest/20"
          />
        )}
      </div>
    </label>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-forest/15 shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-forest">Enquiry Pipeline</h2>
            <p className="text-forest/60 text-xs mt-1">
              New enquiry → contacted → package drafted → advance → confirmation → final payment → completed
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

        {/* Pipeline filter pills */}
        <div className="bg-white rounded-3xl border border-forest/15 shadow-sm px-4 py-3 flex items-center gap-2 overflow-x-auto text-xs">
          {[{ v: 'all', l: 'All' }, ...LEAD_STATUS_ORDER.map(s => ({ v: s, l: LEAD_STATUS_LABELS[s] }))].map(f => (
            <button
              key={f.v}
              onClick={() => setStatusFilter(f.v)}
              className={`px-3 py-1.5 rounded-lg uppercase tracking-wider font-semibold whitespace-nowrap transition ${
                statusFilter === f.v ? 'bg-forest text-sand' : 'text-forest/70 hover:bg-sand/60'
              }`}
            >
              {f.l}
            </button>
          ))}
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
                    <th className="p-4 font-semibold">Enquiry</th>
                    <th className="p-4 font-semibold">Received</th>
                    <th className="p-4 font-semibold">Traveler</th>
                    <th className="p-4 font-semibold">Target Reserve</th>
                    <th className="p-4 font-semibold">Assigned Rep</th>
                    <th className="p-4 font-semibold">Pipeline Status</th>
                    <th className="p-4 font-semibold text-right">Open</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest/5 text-forest/80">
                  {inquiries.map(inq => (
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
                        <span className={`inline-block px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${leadStatusClass(inq.status)}`}>
                          {LEAD_STATUS_LABELS[inq.status] || inq.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => openDetail(inq._id)}
                          className="p-1.5 rounded-lg bg-sand hover:bg-forest hover:text-sand text-forest transition"
                          title="Open enquiry"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail modal */}
        {detail && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white max-w-3xl w-full rounded-3xl overflow-hidden shadow-2xl border border-forest/20 p-6 sm:p-8 space-y-5 max-h-[92vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-forest/10 pb-4">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-forest">Enquiry Dossier</h3>
                  <span className="font-mono text-xs text-forest/60">
                    {detail.inquiry.enquiryId || '—'} · received {new Date(detail.inquiry.createdAt).toLocaleString()}
                  </span>
                </div>
                <button onClick={() => setDetail(null)} className="p-1 rounded-full text-forest/40 hover:text-forest">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contact + routing */}
              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="p-4 bg-sand/30 rounded-xl space-y-1 sm:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-forest/50 block">Traveler</span>
                  <div className="font-bold text-forest text-sm">{detail.inquiry.name}</div>
                  <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{detail.inquiry.email}</div>
                  {detail.inquiry.phone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{detail.inquiry.phone}</div>}
                  {detail.inquiry.destination && <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{detail.inquiry.destination}</div>}
                  {detail.inquiry.travelDate && <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{detail.inquiry.travelDate}</div>}
                </div>

                <div className="p-4 bg-sand/30 rounded-xl space-y-3">
                  <label className="block">
                    <span className="text-[10px] uppercase font-bold text-forest/50 flex items-center gap-1"><Users className="w-3 h-3" /> Assigned Rep</span>
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
                    <span className="text-[10px] uppercase font-bold text-forest/50">Pipeline Status</span>
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

              {detail.inquiry.message && (
                <div className="p-4 bg-sand/20 rounded-xl text-xs">
                  <strong className="block text-forest mb-1 font-semibold">Full Dispatch Message:</strong>
                  <p className="text-forest/80 italic whitespace-pre-wrap">{detail.inquiry.message}</p>
                </div>
              )}

              {/* Follow-up notes */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-forest/60 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Follow-up Notes
                </span>
                {detail.inquiry.notes?.length ? (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {detail.inquiry.notes.map((n, i) => (
                      <div key={n._id || i} className="p-2.5 bg-sand/30 rounded-lg text-[11px]">
                        <span className="font-bold text-forest">{n.by || 'System'}</span>
                        <span className="text-forest/50"> · {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</span>
                        <p className="text-forest/80">{n.note}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-forest/50 text-[11px]">No follow-ups logged yet.</p>
                )}
                <div className="flex gap-2">
                  <input
                    value={noteDraft}
                    onChange={e => setNoteDraft(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                    placeholder="Log a call, WhatsApp or email touch..."
                    className="flex-1 px-3 py-2 border border-forest/20 rounded-lg bg-white text-forest text-xs"
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={saving || !noteDraft.trim()}
                    className="px-4 py-2 bg-sand border border-forest/25 text-forest rounded-lg text-xs font-semibold hover:bg-gold transition disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Package */}
              <div className="border-t border-forest/10 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-forest/60 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Package Quote
                    {pkgSaved && <span className="text-forest/40 font-mono normal-case">· {pkgSaved.packageRef}</span>}
                  </span>
                  {pkgSaved && !showPackageForm && (
                    <button
                      onClick={() => setShowPackageForm(true)}
                      className="px-3 py-1.5 border border-forest/25 rounded-lg text-[11px] font-semibold hover:bg-sand transition"
                    >
                      Edit Package
                    </button>
                  )}
                </div>

                {!showPackageForm && pkgSaved ? (
                  <div className="p-4 bg-sand/30 rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-forest text-sm">{pkgSaved.name}</span>
                      <span className="font-serif font-bold text-forest">{formatINR(pkgSaved.totalPrice)}</span>
                    </div>
                    <div className="text-forest/70">{pkgSaved.destinationName} · {pkgSaved.travelStartDate}{pkgSaved.travelEndDate ? ` → ${pkgSaved.travelEndDate}` : ''}</div>
                    <div className="text-forest/70">{pkgSaved.guests?.adults} adult(s){pkgSaved.guests?.children ? `, ${pkgSaved.guests.children} child(ren)` : ''}</div>
                    {pkgSaved.safariDetails && <div className="text-forest/70">Safari: {pkgSaved.safariDetails}</div>}
                    {missing.length > 0 ? (
                      <p className="text-amber-700 pt-1">
                        Still needed before advance payment: {missing.join(', ')}.
                      </p>
                    ) : (
                      <p className="text-emerald-700 font-semibold pt-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready for advance payment.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-sand/40 rounded-xl space-y-3 text-xs">
                    <div className="grid sm:grid-cols-2 gap-3">
                      {field('Package name', pkg.name, v => setPkg({ ...pkg, name: v }), { required: true })}
                      {field('Reserve / destination', pkg.destinationName, v => setPkg({ ...pkg, destinationName: v }), { required: true })}
                      {field('Travel start date', pkg.travelStartDate, v => setPkg({ ...pkg, travelStartDate: v }), { type: 'date', required: true })}
                      {field('Travel end date', pkg.travelEndDate, v => setPkg({ ...pkg, travelEndDate: v }), { type: 'date' })}
                      {field('Adults', pkg.adults, v => setPkg({ ...pkg, adults: v }), { type: 'number', required: true })}
                      {field('Children', pkg.children, v => setPkg({ ...pkg, children: v }), { type: 'number' })}
                      {field('Total package price', pkg.totalPrice, v => setPkg({ ...pkg, totalPrice: v }), { type: 'number', suffix: '₹', required: true })}
                    </div>
                    {field('Accommodation', pkg.accommodation, v => setPkg({ ...pkg, accommodation: v }), { area: true, rows: 2 })}
                    {field('Safari details (vehicles, zones, drives)', pkg.safariDetails, v => setPkg({ ...pkg, safariDetails: v }), { area: true, rows: 2 })}
                    {field('Day-by-day itinerary', pkg.itinerary, v => setPkg({ ...pkg, itinerary: v }), { area: true, rows: 4 })}
                    {field('Inclusions (one per line)', pkg.inclusions, v => setPkg({ ...pkg, inclusions: v }), { area: true, rows: 3 })}
                    {field('Exclusions (one per line)', pkg.exclusions, v => setPkg({ ...pkg, exclusions: v }), { area: true, rows: 3 })}
                    {field('Terms and conditions', pkg.terms, v => setPkg({ ...pkg, terms: v }), { area: true, rows: 3 })}

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleSavePackage}
                        disabled={saving}
                        className="px-4 py-2 bg-forest text-sand rounded-lg font-semibold hover:bg-forest/90 transition disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Package'}
                      </button>
                      {pkgSaved && (
                        <button
                          onClick={() => setShowPackageForm(false)}
                          className="px-4 py-2 border border-forest/25 rounded-lg font-semibold hover:bg-sand transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Next step */}
              {booking && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-emerald-900 block">Booking {booking.bookingRef} created</span>
                    <span className="text-emerald-800/80">
                      {isReady
                        ? 'Package is complete — request the advance payment from the booking.'
                        : 'Complete the package to enable advance payment.'}
                    </span>
                  </div>
                  <Link
                    to={`/admin/bookings?search=${encodeURIComponent(booking.bookingRef)}`}
                    className="px-4 py-2 bg-forest text-sand rounded-lg font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5 whitespace-nowrap"
                  >
                    Open Booking <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-forest/10">
                <button
                  onClick={() => setDetail(null)}
                  className="px-5 py-2 bg-forest text-sand rounded-xl font-bold uppercase tracking-wider text-xs"
                >
                  Close
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
