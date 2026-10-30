import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  RotateCcw, 
  ExternalLink, 
  Film, 
  Sparkles, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  ArrowUp,
  ArrowDown,
  X,
  Play
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import InstagramIcon from '../../components/InstagramIcon';
import { cmsService } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { useConfirm } from '../../components/common/ConfirmDialog';
import { 
  ClientStory, 
  ClientStoriesData, 
  DEFAULT_CLIENT_STORIES_DATA, 
  normalizeClientStoriesData 
} from '../../lib/clientStories';

export const AdminClientStoriesPage: React.FC = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ClientStoriesData>(DEFAULT_CLIENT_STORIES_DATA);
  const [activeTab, setActiveTab] = useState<'stories' | 'featured' | 'settings'>('stories');
  
  // Modal / Editor State
  const [editingStory, setEditingStory] = useState<ClientStory | null>(null);
  const [isNewStory, setIsNewStory] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const res = await cmsService.getContent('client_stories');
      if (res) {
        setData(normalizeClientStoriesData(res));
      } else {
        setData(DEFAULT_CLIENT_STORIES_DATA);
      }
    } catch (err) {
      toast.info('Using default client stories data');
      setData(DEFAULT_CLIENT_STORIES_DATA);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await cmsService.updateContent('client_stories', data);
      toast.success('Client stories & Instagram reels published live!');
    } catch (err) {
      toast.error('Failed to save client stories. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = async () => {
    const ok = await confirm({
      title: 'Reset to Curated Defaults?',
      message: 'This will reset all client stories, video reels, and quotes to the curated default set. Any unsaved custom additions will be replaced.',
      confirmText: 'Reset to Defaults',
      danger: true
    });
    if (!ok) return;

    setData(DEFAULT_CLIENT_STORIES_DATA);
    toast.info('Reset to defaults. Click "Save & Publish" to update live website.');
  };

  const handleOpenAddModal = () => {
    setIsNewStory(true);
    setEditingStory({
      id: `story-${Date.now()}`,
      name: '',
      location: '',
      reserve: 'Tadoba-Andhari Tiger Reserve',
      safariType: 'Full-Day Photographic Expedition',
      quote: '',
      rating: 5,
      mediaType: 'reel',
      instagramUrl: 'https://www.instagram.com/shutterandstripes/reel/De1yY0hzcIc/',
      imageUrl: '/assets/img/instagram/reel-De1yY0hzcIc.webp',
      duration: '1:53',
      isFeatured: false,
      tag: 'Tiger Encounter',
      date: 'Recent Expedition'
    });
  };

  const handleSaveStoryModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory) return;

    if (!editingStory.name.trim() || !editingStory.quote.trim()) {
      toast.error('Please enter both the guest name and testimonial quote.');
      return;
    }

    if (isNewStory) {
      setData(prev => ({
        ...prev,
        stories: [editingStory, ...prev.stories]
      }));
      toast.success('New client story added. Remember to save changes!');
    } else {
      setData(prev => ({
        ...prev,
        stories: prev.stories.map(s => s.id === editingStory.id ? editingStory : s),
        featuredReel: prev.featuredReel?.id === editingStory.id ? editingStory : prev.featuredReel
      }));
      toast.success('Client story updated.');
    }

    setEditingStory(null);
  };

  const handleDeleteStory = async (id: string, name: string) => {
    const ok = await confirm({
      title: 'Delete Client Story?',
      message: `Are you sure you want to remove the story from "${name}"?`,
      confirmText: 'Delete Story',
      danger: true
    });
    if (!ok) return;

    setData(prev => {
      const updated = prev.stories.filter(s => s.id !== id);
      return {
        ...prev,
        stories: updated,
        featuredReel: prev.featuredReel?.id === id ? updated[0] : prev.featuredReel
      };
    });
    toast.info('Story removed.');
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= data.stories.length) return;

    const newStories = [...data.stories];
    const [moved] = newStories.splice(index, 1);
    newStories.splice(targetIndex, 0, moved);

    setData(prev => ({
      ...prev,
      stories: newStories
    }));
  };

  const handleSetFeatured = (story: ClientStory) => {
    setData(prev => ({
      ...prev,
      featuredReel: story,
      stories: prev.stories.map(s => ({
        ...s,
        isFeatured: s.id === story.id
      }))
    }));
    toast.success(`"${story.name}" is now the featured spotlight reel!`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-forest/15 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shadow">
                <InstagramIcon className="w-4 h-4" />
              </span>
              <h1 className="font-serif text-2xl font-bold text-forest">Client Stories & Instagram Reels</h1>
            </div>
            <p className="text-xs text-forest/70 mt-1">
              Manage guest testimonials, video reels, Instagram redirections, and homepage spotlight features.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleResetToDefaults}
              className="px-4 py-2.5 bg-sand/60 hover:bg-sand text-forest text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 border border-forest/15"
              title="Reset to initial curated stories"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Defaults</span>
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-forest text-sand text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-forest/90 transition shadow flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-gold" />
              <span>{saving ? 'Publishing...' : 'Save & Publish Live'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-forest/10 pb-2">
          {[
            { id: 'stories', label: `All Stories & Reels (${data.stories.length})`, icon: Film },
            { id: 'featured', label: 'Featured Reel Spotlight', icon: Sparkles },
            { id: 'settings', label: 'Section Headlines & Copy', icon: Edit3 }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-forest text-sand shadow-sm'
                    : 'bg-white text-forest/70 hover:bg-forest/5 border border-forest/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-gold" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: ALL STORIES & REELS LIST */}
        {activeTab === 'stories' && (
          <div className="space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-forest/70">
                Stories Displayed on Homepage and /client-stories
              </span>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-forest text-sand text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-forest/90 transition shadow flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-gold" />
                <span>Add Story / Reel</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.stories.map((story, index) => {
                const isFeatured = data.featuredReel?.id === story.id || story.isFeatured;
                return (
                  <div
                    key={story.id}
                    className={`bg-white rounded-2xl border p-5 shadow-sm transition flex flex-col justify-between space-y-4 ${
                      isFeatured ? 'border-gold ring-2 ring-gold/30 bg-gold/[0.02]' : 'border-forest/15'
                    }`}
                  >
                    {/* Card Header & Media preview */}
                    <div className="space-y-3">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-forest-deep group">
                        <img 
                          src={story.imageUrl} 
                          alt={story.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition" 
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <a
                            href={story.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white/90 rounded-full text-forest hover:bg-white transition shadow"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                        {isFeatured && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-gold text-forest text-[10px] font-bold uppercase tracking-wider shadow">
                            Homepage Spotlight
                          </span>
                        )}
                        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono">
                          {story.duration || '0:45'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-earth">
                          {story.reserve}
                        </span>
                        <div className="flex items-center text-gold">
                          {[...Array(story.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-gold" />
                          ))}
                        </div>
                      </div>

                      <h3 className="font-serif font-bold text-forest text-base leading-snug">
                        {story.name}
                      </h3>
                      <p className="text-[11px] text-forest/50 uppercase tracking-wider">
                        {story.location} &bull; {story.safariType}
                      </p>

                      <p className="text-xs text-forest/80 italic font-serif line-clamp-3 bg-sand/30 p-2.5 rounded-xl border border-forest/5">
                        "{story.quote}"
                      </p>

                      <div className="text-[11px] text-forest/60 truncate flex items-center gap-1.5">
                        <InstagramIcon className="w-3.5 h-3.5 text-[#e1306c] shrink-0" />
                        <span className="truncate">{story.instagramUrl}</span>
                      </div>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="pt-3 border-t border-forest/10 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 text-forest/50 hover:text-forest disabled:opacity-20 transition"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === data.stories.length - 1}
                          className="p-1.5 text-forest/50 hover:text-forest disabled:opacity-20 transition"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        {!isFeatured && (
                          <button
                            type="button"
                            onClick={() => handleSetFeatured(story)}
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-gold/15 text-forest rounded-lg hover:bg-gold/30 transition ml-1"
                            title="Make featured spotlight reel"
                          >
                            Set Spotlight
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsNewStory(false);
                            setEditingStory({ ...story });
                          }}
                          className="p-1.5 bg-forest/5 hover:bg-forest/10 text-forest rounded-lg transition"
                          title="Edit Story"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStory(story.id, story.name)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                          title="Delete Story"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 2: FEATURED REEL SPOTLIGHT */}
        {activeTab === 'featured' && (
          <div className="bg-white rounded-3xl border border-forest/15 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="max-w-2xl">
              <span className="text-xs uppercase tracking-widest text-earth font-bold block">
                Primary Hero Feature
              </span>
              <h2 className="font-serif text-2xl font-bold text-forest mt-1">
                Spotlight Instagram Reel & Story
              </h2>
              <p className="text-xs text-forest/70 mt-1 leading-relaxed">
                This reel is showcased prominently in the 9:16 vertical video player on the homepage and at the top of the Client Stories page.
              </p>
            </div>

            {data.featuredReel && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-forest/10">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                    Guest Name / Group
                  </label>
                  <input
                    type="text"
                    value={data.featuredReel.name}
                    onChange={e => setData({
                      ...data,
                      featuredReel: { ...data.featuredReel!, name: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                    Location / City
                  </label>
                  <input
                    type="text"
                    value={data.featuredReel.location}
                    onChange={e => setData({
                      ...data,
                      featuredReel: { ...data.featuredReel!, location: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                    Tiger Reserve / Sanctuary
                  </label>
                  <input
                    type="text"
                    value={data.featuredReel.reserve}
                    onChange={e => setData({
                      ...data,
                      featuredReel: { ...data.featuredReel!, reserve: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                    Safari Expedition Type
                  </label>
                  <input
                    type="text"
                    value={data.featuredReel.safariType}
                    onChange={e => setData({
                      ...data,
                      featuredReel: { ...data.featuredReel!, safariType: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                    Instagram Reel URL (Target Redirection)
                  </label>
                  <input
                    type="url"
                    value={data.featuredReel.instagramUrl}
                    onChange={e => setData({
                      ...data,
                      featuredReel: { ...data.featuredReel!, instagramUrl: e.target.value }
                    })}
                    placeholder="https://www.instagram.com/reel/..."
                    className="w-full px-4 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                    Poster / Video Cover Image URL
                  </label>
                  <input
                    type="text"
                    value={data.featuredReel.imageUrl}
                    onChange={e => setData({
                      ...data,
                      featuredReel: { ...data.featuredReel!, imageUrl: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                    Spotlight Testimonial Quote
                  </label>
                  <textarea
                    rows={4}
                    value={data.featuredReel.quote}
                    onChange={e => setData({
                      ...data,
                      featuredReel: { ...data.featuredReel!, quote: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: HEADLINES & SECTION COPY */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl border border-forest/15 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-forest">Section Headlines & Framing</h2>
              <p className="text-xs text-forest/70 mt-1">
                Customize the titles and descriptions presented to visitors on both the homepage section and the dedicated stories page.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-forest/10">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                  Eyebrow Label
                </label>
                <input
                  type="text"
                  value={data.eyebrow || ''}
                  onChange={e => setData({ ...data, eyebrow: e.target.value })}
                  placeholder="Field Encounters & Traveler Stories"
                  className="w-full px-4 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                  Main Heading
                </label>
                <input
                  type="text"
                  value={data.heading || ''}
                  onChange={e => setData({ ...data, heading: e.target.value })}
                  placeholder="In Their Own Words"
                  className="w-full px-4 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                  Subheading / Narrative Paragraph
                </label>
                <textarea
                  rows={3}
                  value={data.subheading || ''}
                  onChange={e => setData({ ...data, subheading: e.target.value })}
                  placeholder="Authentic moments, raw tiger encounters, and live reels captured in the field..."
                  className="w-full px-4 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT STORY */}
        {editingStory && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-forest/20 max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
              
              <div className="flex items-center justify-between border-b border-forest/10 pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-forest">
                    {isNewStory ? 'Add New Client Story / Reel' : 'Edit Client Story'}
                  </h3>
                  <p className="text-xs text-forest/60">
                    Enter the details, quote, and Instagram reel redirection link.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingStory(null)}
                  className="p-2 text-forest/50 hover:text-forest rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveStoryModal} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                      Guest Name(s) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Vikram & Radhika Roy"
                      value={editingStory.name}
                      onChange={e => setEditingStory({ ...editingStory, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                      Location / City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bengaluru, India"
                      value={editingStory.location}
                      onChange={e => setEditingStory({ ...editingStory, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                      Tiger Reserve / Park
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tadoba-Andhari Tiger Reserve"
                      value={editingStory.reserve}
                      onChange={e => setEditingStory({ ...editingStory, reserve: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                      Safari Type
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Full-Day Photographic Safari"
                      value={editingStory.safariType}
                      onChange={e => setEditingStory({ ...editingStory, safariType: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                      Instagram Reel URL *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://www.instagram.com/reel/..."
                      value={editingStory.instagramUrl}
                      onChange={e => setEditingStory({ ...editingStory, instagramUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                      Cover / Poster Image URL
                    </label>
                    <input
                      type="text"
                      placeholder="/assets/img/instagram/Tadoba-Andhari.webp"
                      value={editingStory.imageUrl}
                      onChange={e => setEditingStory({ ...editingStory, imageUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                      Tag / Category Badge
                    </label>
                    <input
                      type="text"
                      placeholder="Tiger Encounter, Masterclass, etc."
                      value={editingStory.tag || ''}
                      onChange={e => setEditingStory({ ...editingStory, tag: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                      Star Rating (1 - 5)
                    </label>
                    <select
                      value={editingStory.rating}
                      onChange={e => setEditingStory({ ...editingStory, rating: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none"
                    >
                      <option value={5}>5 Stars - Exceptional</option>
                      <option value={4}>4 Stars - Great</option>
                      <option value={3}>3 Stars - Good</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">
                    Traveler Testimonial / Story *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe their safari experience, sightings, and memorable moments..."
                    value={editingStory.quote}
                    onChange={e => setEditingStory({ ...editingStory, quote: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-sand/30 border border-forest/15 rounded-xl text-xs text-forest focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-forest/10">
                  <button
                    type="button"
                    onClick={() => setEditingStory(null)}
                    className="px-5 py-2.5 bg-sand/50 text-forest text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-sand transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-forest text-sand text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-forest/90 transition shadow"
                  >
                    {isNewStory ? 'Add Story to List' : 'Apply Changes'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminClientStoriesPage;
