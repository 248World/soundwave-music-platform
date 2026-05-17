import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaGlobe,
  FaImage,
  FaSave,
  FaUser,
} from 'react-icons/fa';
import api from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import SoundWaveLogo from '../components/SoundWaveLogo';
import soundwaveBackground from '../assets/soundwaveBackground.png';

function EditArtistProfile() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [artist, setArtist] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    country: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const loadArtistProfile = async () => {
      if (user?.role !== 'artist') {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');
        setMessage('');

        const response = await api.get('/artists/profile/me');
        const artistData = response.data.artist;

        setArtist(artistData);

        setFormData({
          display_name: artistData.display_name || '',
          bio: artistData.bio || '',
          country: artistData.country || '',
        });
      } catch (error) {
        const msg =
          error.response?.data?.message || 'Unable to load artist profile.';

        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    loadArtistProfile();
  }, [user?.role]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      setAvatarFile(file);
      setMessage('');
      setError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.display_name.trim()) {
      setError('Artist name is required.');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      setMessage('');

      const updateData = new FormData();

      updateData.append('display_name', formData.display_name.trim());
      updateData.append('bio', formData.bio || '');
      updateData.append('country', formData.country || '');

      if (avatarFile) {
        updateData.append('avatar', avatarFile);
      }

      const response = await api.put('/artists/profile/me', updateData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedArtist = response.data.artist;

      setArtist(updatedArtist);
      setAvatarFile(null);

      setFormData({
        display_name: updatedArtist.display_name || '',
        bio: updatedArtist.bio || '',
        country: updatedArtist.country || '',
      });

      setMessage(response.data.message || 'Artist profile updated successfully.');
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Unable to update artist profile.';

      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (user?.role !== 'artist') {
    return (
      <div
        className="min-h-screen text-slate-950 flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${soundwaveBackground})`,
        }}
      >
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[1px] pointer-events-none" />

        <div className="relative max-w-sm bg-white/90 border border-white/60 rounded-[1.5rem] p-6 text-center shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center mx-auto mb-4">
            <FaUser />
          </div>

          <h2 className="text-xl font-black mb-2">Artist access only</h2>

          <p className="text-slate-500 mb-5 text-sm">
            You need an artist account to edit an artist profile.
          </p>

          <Link
            to="/dashboard"
            className="inline-block px-5 py-2.5 rounded-full bg-slate-950 text-white hover:bg-slate-800 font-bold text-sm"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const avatarUrl =
    artist && artist.avatar_url
      ? `${API_BASE_URL}${artist.avatar_url}`
      : 'https://placehold.co/160x160/111827/ffffff?text=Artist';

  return (
    <div
      className="min-h-screen text-slate-950 overflow-x-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${soundwaveBackground})`,
      }}
    >
      <div className="fixed inset-0 bg-black/30 backdrop-blur-[1px] pointer-events-none" />

      <main className="relative min-h-screen px-3 sm:px-5 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 flex items-center justify-between gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white"
            >
              <FaArrowLeft />
              Back to dashboard
            </Link>

            <SoundWaveLogo size="sm" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] bg-white/90 backdrop-blur-xl rounded-[1.5rem] shadow-2xl overflow-hidden border border-white/60">
            <section className="relative bg-gradient-to-br from-slate-950/95 via-[#5a2a12]/90 to-orange-600/90 text-white p-5 min-h-[230px] flex flex-col justify-between overflow-hidden">
              <div className="absolute -right-24 -bottom-24 w-72 h-72 rounded-full bg-lime-300/25 blur-2xl" />
              <div className="absolute right-8 top-12 w-40 h-40 rounded-full bg-white/10 border border-white/20" />
              <div className="absolute inset-0 bg-black/10" />

              <div className="relative">
                <img
                  src={avatarUrl}
                  alt={formData.display_name || 'Artist avatar'}
                  className="w-20 h-20 rounded-[1.25rem] object-cover border-4 border-white/20 shadow-xl mb-5"
                />

                <p className="text-[10px] uppercase tracking-[0.3em] text-white/70 font-bold mb-3">
                  Artist Profile
                </p>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-3 break-words">
                  {formData.display_name || 'Edit your profile'}
                </h1>

                <p className="text-white/75 leading-6 text-sm max-w-sm">
                  Keep your artist identity updated with a clear name, country,
                  image, and bio.
                </p>
              </div>

              <div className="relative grid grid-cols-2 gap-3 mt-5">
                <div className="rounded-xl bg-white/10 backdrop-blur p-3">
                  <p className="text-lg font-black">
                    {artist?.total_tracks || 0}
                  </p>
                  <p className="text-[11px] text-white/60 mt-1">Tracks</p>
                </div>

                <div className="rounded-xl bg-white/10 backdrop-blur p-3">
                  <p className="text-lg font-black">
                    {artist?.follower_count || 0}
                  </p>
                  <p className="text-[11px] text-white/60 mt-1">Followers</p>
                </div>
              </div>
            </section>

            <section className="p-5 sm:p-6">
              <div className="mb-4">
                <p className="text-xs font-bold text-orange-700 mb-1">
                  Profile Settings
                </p>

                <h2 className="text-2xl font-black text-slate-950 mb-1.5">
                  Edit artist profile
                </h2>

                <p className="text-slate-500 text-sm leading-6">
                  Update the details shown on your public artist page.
                </p>
              </div>

              {isLoading && (
                <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 text-slate-500 text-sm">
                  Loading artist profile...
                </div>
              )}

              {!isLoading && (
                <>
                  {message && (
                    <div className="mb-3 rounded-2xl bg-green-100 border border-green-200 text-green-700 px-4 py-3 text-sm">
                      {message}
                    </div>
                  )}

                  {error && (
                    <div className="mb-3 rounded-2xl bg-red-100 border border-red-200 text-red-700 px-4 py-3 text-sm">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-4 items-start rounded-2xl bg-slate-100 border border-slate-200 p-3">
                      <img
                        src={avatarUrl}
                        alt={formData.display_name || 'Artist avatar'}
                        className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />

                      <div className="flex-1 w-full min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <FaImage className="text-slate-500" />
                          <label className="block text-sm text-slate-600">
                            Profile image
                          </label>
                        </div>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="w-full text-sm text-slate-600 file:mr-3 file:px-3 file:py-2 file:rounded-full file:border-0 file:bg-slate-950 file:text-white file:font-bold"
                        />

                        {avatarFile && (
                          <p className="text-xs text-slate-500 mt-2 break-words">
                            {avatarFile.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-slate-600 mb-1.5">
                        Artist name
                      </label>

                      <input
                        name="display_name"
                        type="text"
                        placeholder="Artist name"
                        value={formData.display_name}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400 text-slate-950"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-600 mb-1.5">
                        Country
                      </label>

                      <div className="relative">
                        <FaGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                        <input
                          name="country"
                          type="text"
                          placeholder="Country"
                          value={formData.country}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400 text-slate-950"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-slate-600 mb-1.5">
                        Bio
                      </label>

                      <textarea
                        name="bio"
                        rows="3"
                        placeholder="Write a short artist bio..."
                        value={formData.bio}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400 resize-none text-slate-950"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3 pt-1">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-slate-950 text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed font-bold text-sm"
                      >
                        <FaSave />
                        {isSaving ? 'Saving...' : 'Save Profile'}
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 font-bold text-sm"
                      >
                        Cancel
                      </button>

                      {artist?.id && (
                        <Link
                          to={`/artist/${artist.id}`}
                          className="px-5 py-2.5 rounded-full bg-lime-300 text-slate-950 hover:bg-lime-200 font-bold text-sm"
                        >
                          View Public Profile
                        </Link>
                      )}
                    </div>
                  </form>
                </>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EditArtistProfile;