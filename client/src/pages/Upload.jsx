import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaImage,
  FaMusic,
  FaSave,
  FaUpload,
} from 'react-icons/fa';
import api from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import SoundWaveLogo from '../components/SoundWaveLogo';
import soundwaveBackground from '../assets/soundwaveBackground.png';

function Upload() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    title: '',
    genre_id: '1',
    lyrics: '',
    is_downloadable: 'true',
  });

  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const genres = [
    { id: 1, name: 'Pop' },
    { id: 2, name: 'Hip-Hop' },
    { id: 3, name: 'R&B' },
    { id: 4, name: 'Electronic' },
    { id: 5, name: 'Rock' },
    { id: 6, name: 'Jazz' },
    { id: 7, name: 'Afrobeats' },
    { id: 8, name: 'Reggae' },
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleAudioChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      setAudioFile(file);
      setMessage('');
      setError('');
    }
  };

  const handleCoverChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      setCoverFile(file);
      setMessage('');
      setError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage('');
    setError('');

    if (!formData.title.trim()) {
      setError('Track title is required.');
      return;
    }

    if (!audioFile) {
      setError('Audio file is required.');
      return;
    }

    try {
      setIsLoading(true);

      const uploadData = new FormData();

      uploadData.append('title', formData.title.trim());
      uploadData.append('genre_id', formData.genre_id);
      uploadData.append('lyrics', formData.lyrics || '');
      uploadData.append('is_downloadable', formData.is_downloadable);
      uploadData.append('audio', audioFile);

      if (coverFile) {
        uploadData.append('cover', coverFile);
      }

      const response = await api.post('/tracks/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage(response.data.message || 'Track uploaded successfully.');

      setFormData({
        title: '',
        genre_id: '1',
        lyrics: '',
        is_downloadable: 'true',
      });

      setAudioFile(null);
      setCoverFile(null);

      setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Upload failed. Please try again.';

      setError(errorMessage);
    } finally {
      setIsLoading(false);
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
            <FaMusic />
          </div>

          <h2 className="text-xl font-black mb-2">Artist access only</h2>

          <p className="text-slate-500 mb-5 text-sm">
            You need an artist account to upload music.
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
                <div className="w-11 h-11 rounded-2xl bg-lime-300 text-slate-950 flex items-center justify-center font-black mb-5">
                  <FaUpload />
                </div>

                <p className="text-[10px] uppercase tracking-[0.3em] text-white/70 font-bold mb-3">
                  Artist Studio
                </p>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-3">
                  Upload your track.
                </h1>

                <p className="text-white/75 leading-6 text-sm max-w-sm">
                  Add your music, choose a genre, set download access, and share
                  it with SoundWave listeners.
                </p>
              </div>

              <div className="relative grid grid-cols-2 gap-3 mt-5">
                <div className="rounded-xl bg-white/10 backdrop-blur p-3">
                  <p className="text-lg font-black">Audio</p>
                  <p className="text-[11px] text-white/60 mt-1">Required</p>
                </div>

                <div className="rounded-xl bg-white/10 backdrop-blur p-3">
                  <p className="text-lg font-black">Cover</p>
                  <p className="text-[11px] text-white/60 mt-1">Optional</p>
                </div>
              </div>
            </section>

            <section className="p-5 sm:p-6">
              <div className="mb-4">
                <p className="text-xs font-bold text-orange-700 mb-1">
                  New Track
                </p>

                <h2 className="text-2xl font-black text-slate-950 mb-1.5">
                  Track details
                </h2>

                <p className="text-slate-500 text-sm leading-6">
                  Complete the information below and upload your audio file.
                </p>
              </div>

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
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">
                    Track title
                  </label>

                  <input
                    name="title"
                    type="text"
                    placeholder="Track title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400 text-slate-950"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1.5">
                      Genre
                    </label>

                    <select
                      name="genre_id"
                      value={formData.genre_id}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400 text-slate-950"
                    >
                      {genres.map((genre) => (
                        <option key={genre.id} value={genre.id}>
                          {genre.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-600 mb-1.5">
                      Download access
                    </label>

                    <select
                      name="is_downloadable"
                      value={formData.is_downloadable}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400 text-slate-950"
                    >
                      <option value="true">Allow downloads</option>
                      <option value="false">Streaming only</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">
                    Lyrics / Description
                  </label>

                  <textarea
                    name="lyrics"
                    rows="3"
                    placeholder="Write lyrics or a short description..."
                    value={formData.lyrics}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400 resize-none text-slate-950"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-100 border border-slate-200 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <FaMusic className="text-slate-500" />
                      <label className="block text-sm text-slate-600">
                        Audio file
                      </label>
                    </div>

                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioChange}
                      className="w-full text-sm text-slate-600 file:mr-3 file:px-3 file:py-2 file:rounded-full file:border-0 file:bg-slate-950 file:text-white file:font-bold"
                    />

                    {audioFile && (
                      <p className="text-xs text-slate-500 mt-2 break-words">
                        {audioFile.name}
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl bg-slate-100 border border-slate-200 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <FaImage className="text-slate-500" />
                      <label className="block text-sm text-slate-600">
                        Cover image
                      </label>
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="w-full text-sm text-slate-600 file:mr-3 file:px-3 file:py-2 file:rounded-full file:border-0 file:bg-slate-950 file:text-white file:font-bold"
                    />

                    {coverFile && (
                      <p className="text-xs text-slate-500 mt-2 break-words">
                        {coverFile.name}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-slate-950 text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed font-bold text-sm"
                >
                  <FaSave />
                  {isLoading ? 'Uploading...' : 'Upload Track'}
                </button>
              </form>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Upload;