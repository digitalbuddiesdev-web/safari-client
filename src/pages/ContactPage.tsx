import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Compass, 
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { cmsService } from '../services/api';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [enquiryId, setEnquiryId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid Phone / WhatsApp number (minimum 10 digits).');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await cmsService.submitInquiry(formData);
      setEnquiryId(res?.inquiry?.enquiryId || '');
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-sand min-h-screen pt-28 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-xs font-semibold uppercase tracking-widest mb-4">
            <Compass className="w-3.5 h-3.5 text-gold" />
            <span>Expedition Concierge</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-forest font-bold tracking-tight mb-4">
            Connect With Our Naturalist Desk
          </h1>
          <p className="text-forest/80 text-base sm:text-lg leading-relaxed font-sans">
            Whether you require assistance with multi-reserve itineraries, private photography open gypsies, or NTCA permit clarifications, our team is stationed on the ground in Jabalpur and Nagpur.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Contact Details Column (1 col) */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-white p-8 rounded-3xl border border-forest/15 shadow-sm space-y-6">
              <h2 className="font-serif text-2xl font-bold text-forest">Field Operations</h2>

              <div className="space-y-4 text-xs sm:text-sm text-forest/80 font-sans">
                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-forest/10 text-forest flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <strong className="text-forest block font-semibold">Central Hub (MP):</strong>
                    <span>Civil Lines, Jabalpur, Madhya Pradesh 482001 (Base for Kanha, Bandhavgarh, Panna)</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-forest/10 text-forest flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <strong className="text-forest block font-semibold">Western Hub (MH):</strong>
                    <span>392, At Moharli, Near Moharli Gate Core, Tadoba Road, Tadoba, Chandrapur, Maharashtra – 442404, India</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-forest/10 text-forest flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <strong className="text-forest block font-semibold">Email Correspondence:</strong>
                    <span>enquiries@shutterandstripessafaris.com</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-forest/10 text-forest flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <strong className="text-forest block font-semibold">Expedition Hotline:</strong>
                    <span>+91 90219 18758</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-forest/10 text-forest flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <strong className="text-forest block font-semibold">Desk Timing:</strong>
                    <span>06:00 AM – 09:00 PM IST (Daily)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Note */}
            <div className="bg-forest text-sand p-6 rounded-3xl border border-gold/20 text-xs leading-relaxed space-y-2">
              <span className="text-gold font-bold uppercase tracking-wider block">Permit Allocation Notice:</span>
              <p className="text-sand/80">
                Forest Department morning and afternoon permits open up to 120 days in advance and fill quickly. We advise inquiring early for prime core zones like Tala (Bandhavgarh), Kanha Meadows, or Moharli (Tadoba).
              </p>
            </div>

          </div>

          {/* Inquiry Form Column (2 cols) */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-forest/15 shadow-xl">
              
              {submitted ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-forest text-gold flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-3xl font-bold text-forest">Inquiry Received</h3>
                  <p className="text-forest/70 text-sm max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out to Shutter And Stripes. A lead naturalist has received your dispatch and will respond via email or phone within 4 business hours.
                  </p>
                  {enquiryId && (
                    <p className="inline-block px-4 py-2 rounded-xl bg-forest/10 border border-forest/20 text-forest text-xs font-mono font-semibold">
                      Enquiry ID: {enquiryId} — quote it in any follow-up.
                    </p>
                  )}
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setEnquiryId('');
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        message: ''
                      });
                    }}
                    className="px-6 py-2.5 bg-forest text-sand rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-forest/90 transition"
                  >
                    Submit Another Dispatch
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-forest mb-1">
                      Request Bespoke Expedition or Permit Assistance
                    </h2>
                    <p className="text-forest/60 text-xs">
                      Share a few details and our team will take it from there. We do not spam or share your contact details.
                    </p>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Dr. Anand Deshmukh"
                        className="w-full px-4 py-3 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none focus:ring-2 focus:ring-forest/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="anand@example.com"
                        className="w-full px-4 py-3 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none focus:ring-2 focus:ring-forest/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                        Phone / WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none focus:ring-2 focus:ring-forest/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                      Your Requirements and Notes *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your trip — reserve, dates, number of guests, or any special requests..."
                      className="w-full px-4 py-3 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none focus:ring-2 focus:ring-forest/30 resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-forest text-sand rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-forest/90 transition shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-sand border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-gold" />
                        <span>Transmit Dispatch to Concierge</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center space-x-2 text-[11px] text-forest/50 pt-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-forest" />
                    <span>Your contact details are encrypted and handled exclusively by our naturalists.</span>
                  </div>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
export default ContactPage;
