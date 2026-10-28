import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileEdit, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Compass, 
  Sparkles 
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { cmsService } from '../../services/api';
import { useToast } from '../../components/common/Toast';

export const AdminOurStoryCMSPage: React.FC = () => {
  const { error } = useToast();
  const [selectedKey, setSelectedKey] = useState<'our_story' | 'home_hero' | 'ethical_code' | 'client_stories'>('our_story');
  const [contentData, setContentData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const fetchContent = async (key: string) => {
    try {
      setLoading(true);
      const data = await cmsService.getContent(key);
      setContentData(data || {});
    } catch (err) {
      console.error(err);
      setContentData({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent(selectedKey);
  }, [selectedKey]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await cmsService.updateContent(selectedKey, contentData);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch (err) {
      error('Failed to save CMS content.');
    } finally {
      setSaving(false);
    }
  };

  const stories: any[] = contentData.stories || [];

  const updateStory = (index: number, patch: Record<string, string>) => {
    setContentData({ ...contentData, stories: stories.map((s, i) => (i === index ? { ...s, ...patch } : s)) });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-forest/15 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-forest">
              Content Management and Brand Narrative
            </h2>
            <p className="text-forest/60 text-xs">
              Live updates to the Our Story page, homepage highlights, and conservation statements
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-sand/60 p-1.5 rounded-xl border border-forest/10 text-xs">
            <button
              onClick={() => setSelectedKey('our_story')}
              className={`px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider transition ${
                selectedKey === 'our_story' ? 'bg-forest text-sand' : 'text-forest/70 hover:text-forest'
              }`}
            >
              Our Story
            </button>
            <button
              onClick={() => setSelectedKey('home_hero')}
              className={`px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider transition ${
                selectedKey === 'home_hero' ? 'bg-forest text-sand' : 'text-forest/70 hover:text-forest'
              }`}
            >
              Home Hero
            </button>
            <button
              onClick={() => setSelectedKey('ethical_code')}
              className={`px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider transition ${
                selectedKey === 'ethical_code' ? 'bg-forest text-sand' : 'text-forest/70 hover:text-forest'
              }`}
            >
              Ethical Code
            </button>
            <button
              onClick={() => setSelectedKey('client_stories')}
              className={`px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider transition ${
                selectedKey === 'client_stories' ? 'bg-forest text-sand' : 'text-forest/70 hover:text-forest'
              }`}
            >
              Client Stories
            </button>
          </div>
        </div>

        {/* Editor Form */}
        <div className="bg-white p-8 rounded-3xl border border-forest/15 shadow-sm">
          {savedMsg && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>CMS section '{selectedKey}' successfully updated and synchronized.</span>
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center text-forest/60 text-xs">Loading CMS buffer...</div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              
              {selectedKey === 'our_story' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                      Main Story Headline
                    </label>
                    <input
                      type="text"
                      value={contentData.headline || 'Born in the Dust and Sal Valleys of Central India'}
                      onChange={e => setContentData({ ...contentData, headline: e.target.value })}
                      className="w-full px-4 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                      Guiding Tenet / Quotation
                    </label>
                    <input
                      type="text"
                      value={contentData.quote || 'The jungle reveals its secrets only to those who possess the patience to listen.'}
                      onChange={e => setContentData({ ...contentData, quote: e.target.value })}
                      className="w-full px-4 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                      Genesis Narrative (Paragraph 1)
                    </label>
                    <textarea
                      rows={4}
                      value={contentData.genesis || 'We are not a booking aggregator. We are wildlife chroniclers, naturalists, and photographers dedicated to the living legacy of the Royal Bengal Tiger across Madhya Pradesh and Maharashtra.'}
                      onChange={e => setContentData({ ...contentData, genesis: e.target.value })}
                      className="w-full px-4 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                </>
              )}

              {selectedKey === 'home_hero' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                      Hero Badge Text
                    </label>
                    <input
                      type="text"
                      value={contentData.badge || 'Premium Indian Wildlife Safari and Booking Platform'}
                      onChange={e => setContentData({ ...contentData, badge: e.target.value })}
                      className="w-full px-4 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                      Main Catchphrase
                    </label>
                    <input
                      type="text"
                      value={contentData.catchphrase || 'In the Realm of the Striped Monarch'}
                      onChange={e => setContentData({ ...contentData, catchphrase: e.target.value })}
                      className="w-full px-4 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                      Hero Description Copy
                    </label>
                    <textarea
                      rows={3}
                      value={contentData.description || 'Discover, explore, and book official tiger reserve permits across Madhya Pradesh and Maharashtra. Guided by certified local naturalists.'}
                      onChange={e => setContentData({ ...contentData, description: e.target.value })}
                      className="w-full px-4 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                </>
              )}

              {selectedKey === 'ethical_code' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                      Minimum Stand-off Buffer
                    </label>
                    <input
                      type="text"
                      value={contentData.standoff || '20 meters minimum from any moving predator'}
                      onChange={e => setContentData({ ...contentData, standoff: e.target.value })}
                      className="w-full px-4 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                      Engine Policy
                    </label>
                    <input
                      type="text"
                      value={contentData.enginePolicy || 'Engines cut off immediately upon stopping at animal sightings'}
                      onChange={e => setContentData({ ...contentData, enginePolicy: e.target.value })}
                      className="w-full px-4 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none"
                    />
                  </div>
                </>
              )}

              {selectedKey === 'client_stories' && (
                <>
                  <div className="p-4 bg-gold/10 border border-gold/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-serif font-bold text-forest text-sm">Dedicated Client Stories & Reels Manager</h4>
                      <p className="text-xs text-forest/70">Manage video reels, Instagram redirection links, and spotlight cards with rich previews.</p>
                    </div>
                    <Link
                      to="/admin/stories"
                      className="px-4 py-2 bg-forest text-sand rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-forest/90 transition shadow shrink-0 self-start sm:self-auto"
                    >
                      Open Reels & Stories Studio &rarr;
                    </Link>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                      Section Label
                    </label>
                    <input
                      type="text"
                      value={contentData.eyebrow || 'Client Stories'}
                      onChange={e => setContentData({ ...contentData, eyebrow: e.target.value })}
                      className="w-full px-4 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                      Section Heading
                    </label>
                    <input
                      type="text"
                      value={contentData.heading || 'In Their Own Words'}
                      onChange={e => setContentData({ ...contentData, heading: e.target.value })}
                      className="w-full px-4 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-forest/70">
                        Stories
                      </label>
                      <button
                        type="button"
                        onClick={() => setContentData({ ...contentData, stories: [...stories, { name: '', location: '', quote: '', imageUrl: '' }] })}
                        className="px-3 py-1.5 bg-forest text-sand rounded-lg font-bold uppercase tracking-wider text-[11px] hover:bg-forest/90 transition"
                      >
                        Add Story
                      </button>
                    </div>

                    {stories.map((story, i) => (
                      <div key={i} className="p-4 bg-sand/30 border border-forest/15 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-forest/60">Story {i + 1}</span>
                          <button
                            type="button"
                            onClick={() => setContentData({ ...contentData, stories: stories.filter((_, j) => j !== i) })}
                            className="text-[11px] font-semibold uppercase tracking-wider text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Client name"
                          value={story.name || ''}
                          onChange={e => updateStory(i, { name: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-forest/15 rounded-xl text-xs text-forest focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Location (optional)"
                          value={story.location || ''}
                          onChange={e => updateStory(i, { location: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-forest/15 rounded-xl text-xs text-forest focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Image URL (optional)"
                          value={story.imageUrl || ''}
                          onChange={e => updateStory(i, { imageUrl: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-forest/15 rounded-xl text-xs text-forest focus:outline-none"
                        />
                        <input
                          type="url"
                          placeholder="Instagram Reel URL (e.g. https://www.instagram.com/reel/...)"
                          value={story.instagramUrl || ''}
                          onChange={e => updateStory(i, { instagramUrl: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-forest/15 rounded-xl text-xs text-forest focus:outline-none"
                        />
                        <textarea
                          rows={3}
                          placeholder="Their story / quote"
                          value={story.quote || ''}
                          onChange={e => updateStory(i, { quote: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-forest/15 rounded-xl text-xs text-forest focus:outline-none resize-none leading-relaxed"
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-forest/10 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-forest text-sand rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-forest/90 transition shadow flex items-center space-x-2"
                >
                  <Save className="w-4 h-4 text-gold" />
                  <span>{saving ? 'Publishing Changes...' : 'Save and Publish Live'}</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </AdminLayout>
  );
};
export default AdminOurStoryCMSPage;
