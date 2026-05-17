import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaArrowRight,
  FaEdit,
  FaEye,
  FaHeart,
  FaListUl,
  FaLock,
  FaMusic,
  FaPlay,
  FaRedoAlt,
  FaSignOutAlt,
  FaTrash,
  FaUnlock,
  FaUpload,
  FaUser,
  FaUsers,
} from 'react-icons/fa';
import api from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import AppShell from '../components/AppShell';
import EmptyState from '../components/EmptyState';
import { SkeletonGrid } from '../components/SkeletonLoader';

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [myTracks, setMyTracks] = useState([]);
  const [likedTracks, setLikedTracks] = useState([]);
  const [followedArtists, setFollowedArtists] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [isLoadingLikedTracks, setIsLoadingLikedTracks] = useState(false);
  const [isLoadingFollowedArtists, setIsLoadingFollowedArtists] =
    useState(false);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);

  const [trackError, setTrackError] = useState('');
  const [trackMessage, setTrackMessage] = useState('');

  const [likedError, setLikedError] = useState('');
  const [likedMessage, setLikedMessage] = useState('');

  const [followedError, setFollowedError] = useState('');
  const [followedMessage, setFollowedMessage] = useState('');

  const [playlistError, setPlaylistError] = useState('');
  const [playlistMessage, setPlaylistMessage] = useState('');

  const [editingTrack, setEditingTrack] = useState(null);
  const [editCoverFile, setEditCoverFile] = useState(null);

  const [editForm, setEditForm] = useState({
    title: '',
    genre_id: '1',
    lyrics: '',
    is_downloadable: 'true',
    is_published: 'true',
  });

  const [playlistForm, setPlaylistForm] = useState({
    name: '',
    description: '',
    is_public: 'true',
  });

  const API_BASE_URL = 'http://localhost:5000';

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

  useEffect(() => {
    const loadMyTracks = async () => {
      if (user?.role !== 'artist') return;

      try {
        setIsLoadingTracks(true);
        setTrackError('');

        const response = await api.get('/tracks/my-tracks');
        setMyTracks(response.data.tracks || []);
      } catch {
        setTrackError('Unable to load your tracks.');
      } finally {
        setIsLoadingTracks(false);
      }
    };

    const loadLikedTracks = async () => {
      if (!user || user.role === 'artist' || user.role === 'admin') return;

      try {
        setIsLoadingLikedTracks(true);
        setLikedError('');

        const response = await api.get('/tracks/liked/me');
        setLikedTracks(response.data.tracks || []);
      } catch {
        setLikedError('Unable to load your liked tracks.');
      } finally {
        setIsLoadingLikedTracks(false);
      }
    };

    const loadFollowedArtists = async () => {
      if (!user || user.role === 'artist' || user.role === 'admin') return;

      try {
        setIsLoadingFollowedArtists(true);
        setFollowedError('');

        const response = await api.get('/artists/following/me');
        setFollowedArtists(response.data.artists || []);
      } catch {
        setFollowedError('Unable to load followed artists.');
      } finally {
        setIsLoadingFollowedArtists(false);
      }
    };

    const loadPlaylists = async () => {
      if (!user || user.role === 'artist' || user.role === 'admin') return;

      try {
        setIsLoadingPlaylists(true);
        setPlaylistError('');

        const response = await api.get('/playlists/me');
        setPlaylists(response.data.playlists || []);
      } catch {
        setPlaylistError('Unable to load playlists.');
      } finally {
        setIsLoadingPlaylists(false);
      }
    };

    loadMyTracks();
    loadLikedTracks();
    loadFollowedArtists();
    loadPlaylists();
  }, [user]);

  const refreshMyTracks = async () => {
    if (user?.role !== 'artist') return;

    try {
      setIsLoadingTracks(true);
      setTrackError('');

      const response = await api.get('/tracks/my-tracks');
      setMyTracks(response.data.tracks || []);
    } catch {
      setTrackError('Unable to load your tracks.');
    } finally {
      setIsLoadingTracks(false);
    }
  };

  const refreshLikedTracks = async () => {
    if (!user || user.role === 'artist' || user.role === 'admin') return;

    try {
      setIsLoadingLikedTracks(true);
      setLikedError('');

      const response = await api.get('/tracks/liked/me');
      setLikedTracks(response.data.tracks || []);
    } catch {
      setLikedError('Unable to load your liked tracks.');
    } finally {
      setIsLoadingLikedTracks(false);
    }
  };

  const refreshFollowedArtists = async () => {
    if (!user || user.role === 'artist' || user.role === 'admin') return;

    try {
      setIsLoadingFollowedArtists(true);
      setFollowedError('');

      const response = await api.get('/artists/following/me');
      setFollowedArtists(response.data.artists || []);
    } catch {
      setFollowedError('Unable to load followed artists.');
    } finally {
      setIsLoadingFollowedArtists(false);
    }
  };

  const refreshPlaylists = async () => {
    if (!user || user.role === 'artist' || user.role === 'admin') return;

    try {
      setIsLoadingPlaylists(true);
      setPlaylistError('');

      const response = await api.get('/playlists/me');
      setPlaylists(response.data.playlists || []);
    } catch {
      setPlaylistError('Unable to load playlists.');
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleStartEdit = (track) => {
    setEditingTrack(track);
    setEditCoverFile(null);

    setEditForm({
      title: track.title || '',
      genre_id: track.genre_id ? String(track.genre_id) : '1',
      lyrics: track.lyrics || '',
      is_downloadable: track.is_downloadable ? 'true' : 'false',
      is_published: track.is_published ? 'true' : 'false',
    });

    setTrackMessage('');
    setTrackError('');
  };

  const handleCancelEdit = () => {
    setEditingTrack(null);
    setEditCoverFile(null);

    setEditForm({
      title: '',
      genre_id: '1',
      lyrics: '',
      is_downloadable: 'true',
      is_published: 'true',
    });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleCoverChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      setEditCoverFile(file);
    }
  };

  const handlePlaylistFormChange = (event) => {
    const { name, value } = event.target;

    setPlaylistForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleCreatePlaylist = async (event) => {
    event.preventDefault();

    if (!playlistForm.name.trim()) {
      setPlaylistError('Playlist name is required.');
      return;
    }

    try {
      setIsCreatingPlaylist(true);
      setPlaylistMessage('');
      setPlaylistError('');

      const response = await api.post('/playlists', {
        name: playlistForm.name,
        description: playlistForm.description,
        is_public: playlistForm.is_public === 'true',
      });

      setPlaylists((previousPlaylists) => [
        response.data.playlist,
        ...previousPlaylists,
      ]);

      setPlaylistForm({
        name: '',
        description: '',
        is_public: 'true',
      });

      setPlaylistMessage(
        response.data.message || 'Playlist created successfully.'
      );
    } catch (error) {
      const message =
        error.response?.data?.message || 'Unable to create playlist.';

      setPlaylistError(message);
    } finally {
      setIsCreatingPlaylist(false);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this playlist?'
    );

    if (!confirmDelete) return;

    try {
      setPlaylistMessage('');
      setPlaylistError('');

      const response = await api.delete(`/playlists/${playlistId}`);

      setPlaylists((previousPlaylists) =>
        previousPlaylists.filter((playlist) => playlist.id !== playlistId)
      );

      setPlaylistMessage(response.data.message || 'Playlist deleted.');
    } catch (error) {
      const message =
        error.response?.data?.message || 'Unable to delete playlist.';

      setPlaylistError(message);
    }
  };

  const handleUpdateTrack = async (event) => {
    event.preventDefault();

    if (!editingTrack) return;

    if (!editForm.title.trim()) {
      setTrackError('Track title is required.');
      return;
    }

    try {
      setTrackMessage('');
      setTrackError('');

      const updateData = new FormData();

      updateData.append('title', editForm.title);
      updateData.append('genre_id', editForm.genre_id);
      updateData.append('lyrics', editForm.lyrics);
      updateData.append('is_downloadable', editForm.is_downloadable);
      updateData.append('is_published', editForm.is_published);

      if (editCoverFile) {
        updateData.append('cover', editCoverFile);
      }

      const response = await api.put(`/tracks/${editingTrack.id}`, updateData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setTrackMessage(response.data.message || 'Track updated successfully.');

      setMyTracks((previousTracks) =>
        previousTracks.map((track) =>
          track.id === editingTrack.id ? response.data.track : track
        )
      );

      handleCancelEdit();
    } catch (error) {
      const message =
        error.response?.data?.message || 'Unable to update this track.';

      setTrackError(message);
    }
  };

  const handleDeleteTrack = async (trackId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this track?'
    );

    if (!confirmDelete) return;

    try {
      setTrackMessage('');
      setTrackError('');

      const response = await api.delete(`/tracks/${trackId}`);

      setTrackMessage(response.data.message || 'Track deleted successfully.');

      setMyTracks((previousTracks) =>
        previousTracks.filter((track) => track.id !== trackId)
      );

      if (editingTrack?.id === trackId) {
        handleCancelEdit();
      }
    } catch (error) {
      const message =
        error.response?.data?.message || 'Unable to delete this track.';

      setTrackError(message);
    }
  };

  const handleUnlikeTrack = async (trackId) => {
    try {
      setLikedMessage('');
      setLikedError('');

      const response = await api.patch(`/tracks/${trackId}/like`);

      if (response.data.success) {
        setLikedTracks((previousTracks) =>
          previousTracks.filter((track) => track.id !== trackId)
        );

        setLikedMessage('Track removed from your liked songs.');
      }
    } catch (error) {
      const message =
        error.response?.data?.message || 'Unable to remove this liked track.';

      setLikedError(message);
    }
  };

  const handleUnfollowArtist = async (artistId) => {
    try {
      setFollowedMessage('');
      setFollowedError('');

      const response = await api.post(`/artists/${artistId}/follow`);

      if (response.data.success) {
        setFollowedArtists((previousArtists) =>
          previousArtists.filter((artist) => artist.id !== artistId)
        );

        setFollowedMessage('Artist removed from your followed artists.');
      }
    } catch (error) {
      const message =
        error.response?.data?.message || 'Unable to unfollow this artist.';

      setFollowedError(message);
    }
  };

  const getTrackCoverUrl = (track) => {
    if (track?.cover_url) {
      return `${API_BASE_URL}${track.cover_url}`;
    }

    return 'https://placehold.co/400x400/111827/ffffff?text=SW';
  };

  const getArtistAvatarUrl = (artist) => {
    if (artist?.avatar_url) {
      return `${API_BASE_URL}${artist.avatar_url}`;
    }

    return 'https://placehold.co/400x400/111827/ffffff?text=Artist';
  };

  const currentCoverUrl =
    editingTrack && editingTrack.cover_url
      ? `${API_BASE_URL}${editingTrack.cover_url}`
      : 'https://placehold.co/120x120/111827/ffffff?text=SW';

  const dashboardStats = useMemo(() => {
    if (user?.role === 'artist') {
      return [
        {
          label: 'Uploaded Tracks',
          value: myTracks.length,
          icon: <FaMusic />,
        },
        {
          label: 'Published',
          value: myTracks.filter((track) => track.is_published).length,
          icon: <FaEye />,
        },
        {
          label: 'Total Plays',
          value: myTracks.reduce(
            (total, track) => total + Number(track.play_count || 0),
            0
          ),
          icon: <FaPlay />,
        },
        {
          label: 'Total Likes',
          value: myTracks.reduce(
            (total, track) => total + Number(track.like_count || 0),
            0
          ),
          icon: <FaHeart />,
        },
      ];
    }

    if (user?.role === 'listener') {
      return [
        {
          label: 'Playlists',
          value: playlists.length,
          icon: <FaListUl />,
        },
        {
          label: 'Liked Songs',
          value: likedTracks.length,
          icon: <FaHeart />,
        },
        {
          label: 'Followed Artists',
          value: followedArtists.length,
          icon: <FaUsers />,
        },
        {
          label: 'Public Playlists',
          value: playlists.filter((playlist) => playlist.is_public).length,
          icon: <FaUnlock />,
        },
      ];
    }

    return [
      {
        label: 'Role',
        value: user?.role || 'User',
        icon: <FaUser />,
      },
      {
        label: 'Status',
        value: 'Active',
        icon: <FaEye />,
      },
      {
        label: 'Access',
        value: 'Dashboard',
        icon: <FaMusic />,
      },
      {
        label: 'SoundWave',
        value: 'Ready',
        icon: <FaMusic />,
      },
    ];
  }, [user, myTracks, playlists, likedTracks, followedArtists]);

  const rightPanel = (
    <div className="rounded-[2rem] bg-slate-100/80 border border-slate-200 p-5">
      <div className="mb-5">
        <p className="text-sm text-slate-500 font-medium">Account</p>

        <h3 className="text-lg font-black text-slate-950 break-words leading-6">
          {user?.email || 'SoundWave User'}
        </h3>

        <p className="text-sm text-slate-500 capitalize mt-1">
          {user?.role || 'user'}
        </p>
      </div>

      <div className="relative rounded-[1.5rem] bg-gradient-to-br from-slate-950 via-orange-900 to-orange-500 min-h-[230px] p-5 text-white shadow-sm mb-5 flex flex-col justify-end overflow-hidden">
        <div className="absolute -right-14 -top-14 w-44 h-44 rounded-full bg-white/10" />
        <div className="absolute -left-12 -bottom-16 w-40 h-40 rounded-full bg-lime-300/10" />

        <div className="relative">
          <p className="text-xs uppercase tracking-[0.25em] text-white/60 font-bold mb-3">
            Dashboard
          </p>

          <h4 className="text-3xl font-black leading-tight">Welcome back</h4>

          <p className="text-white/70 text-sm mt-3">
            Manage your SoundWave account, music, playlists, and activity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {dashboardStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-white p-4 min-h-[92px] min-w-0"
          >
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              {stat.icon}
              <span>{stat.label}</span>
            </div>

            <p className="text-lg font-black text-slate-950 leading-6 break-words">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {user?.role === 'admin' && (
          <Link
            to="/admin"
            className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-full bg-slate-950 text-white font-bold hover:bg-slate-800 transition"
          >
            Open Admin
            <FaArrowRight />
          </Link>
        )}

        {user?.role === 'artist' && (
          <>
            <Link
              to="/upload"
              className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-full bg-lime-300 text-slate-950 font-bold hover:bg-lime-200 transition"
            >
              <FaUpload />
              Upload Track
            </Link>

            <Link
              to="/artist-profile/edit"
              className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-full bg-white text-slate-950 font-bold hover:bg-slate-50 transition"
            >
              <FaEdit />
              Edit Profile
            </Link>
          </>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-full bg-red-100 text-red-700 font-bold hover:bg-red-200 transition"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <AppShell
      title="Dashboard"
      subtitle="Manage your SoundWave account and activity"
      activePage="dashboard"
      rightPanel={rightPanel}
      showSearch={false}
    >
      <div className="space-y-8 pb-8">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-slate-950 via-slate-800 to-[#6b3514] min-h-[280px] shadow-xl">
          <div className="absolute -right-16 -bottom-24 w-80 h-80 rounded-full bg-lime-300/30 blur-2xl" />
          <div className="absolute right-12 top-10 w-52 h-52 rounded-full bg-white/10 border border-white/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />

          <div className="relative p-6 sm:p-8 max-w-2xl text-white">
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-white/75 mb-5">
              SoundWave Dashboard
            </p>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
              Welcome back
            </h1>

            <p className="text-white/80 max-w-xl leading-7 mb-8 break-words">
              Manage your music, playlists, liked songs, and account activity
              from one place.
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl">
              {dashboardStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-white/15 backdrop-blur px-4 py-3 min-w-0"
                >
                  <div className="flex items-center gap-2 text-white/70 text-xs mb-2">
                    {stat.icon}
                    <span className="truncate">{stat.label}</span>
                  </div>

                  <p className="text-xl font-black break-words">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-lime-300 text-slate-950 font-bold hover:bg-lime-200 transition"
                >
                  Open Admin Dashboard
                  <FaArrowRight />
                </Link>
              )}

              {user?.role === 'artist' && (
                <>
                  <Link
                    to="/upload"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-lime-300 text-slate-950 font-bold hover:bg-lime-200 transition"
                  >
                    <FaUpload />
                    Upload New Track
                  </Link>

                  <Link
                    to="/artist-profile/edit"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/15 text-white font-bold hover:bg-white/25 backdrop-blur transition"
                  >
                    <FaEdit />
                    Edit Artist Profile
                  </Link>
                </>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/15 text-white font-bold hover:bg-white/25 backdrop-blur transition"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>
        </section>

        {user?.role === 'admin' && (
          <section className="rounded-[2rem] bg-white border border-slate-100 shadow-sm p-5 sm:p-7">
            <h2 className="text-2xl font-black text-slate-950 mb-2">
              Admin tools
            </h2>

            <p className="text-slate-500 mb-5">
              Manage users, tracks, playlists, and platform statistics.
            </p>

            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-slate-950 text-white hover:bg-slate-800 font-bold transition"
            >
              Open Admin Dashboard
              <FaArrowRight />
            </Link>
          </section>
        )}

        {user?.role === 'artist' && (
          <section className="space-y-8">
            {editingTrack && (
              <div className="rounded-[2rem] bg-white border border-orange-200 shadow-sm p-5 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-950">
                      Edit Track
                    </h3>

                    <p className="text-slate-500 break-words">
                      Editing: {editingTrack.title}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 font-bold transition"
                  >
                    Cancel
                  </button>
                </div>

                <form
                  onSubmit={handleUpdateTrack}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                  <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 items-start">
                    <img
                      src={currentCoverUrl}
                      alt={editingTrack.title}
                      className="w-28 h-28 rounded-2xl object-cover border border-slate-200"
                    />

                    <div className="flex-1 w-full">
                      <label className="block text-sm text-slate-600 mb-2">
                        Change cover image
                      </label>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600"
                      />

                      {editCoverFile && (
                        <p className="text-sm text-slate-500 mt-2 break-words">
                          New cover selected: {editCoverFile.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      Track title
                    </label>

                    <input
                      name="title"
                      type="text"
                      value={editForm.title}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      Genre
                    </label>

                    <select
                      name="genre_id"
                      value={editForm.genre_id}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400"
                    >
                      {genres.map((genre) => (
                        <option key={genre.id} value={genre.id}>
                          {genre.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      Download option
                    </label>

                    <select
                      name="is_downloadable"
                      value={editForm.is_downloadable}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400"
                    >
                      <option value="true">Allow downloads</option>
                      <option value="false">Streaming only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      Publish status
                    </label>

                    <select
                      name="is_published"
                      value={editForm.is_published}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400"
                    >
                      <option value="true">Published</option>
                      <option value="false">Draft / Hidden</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-slate-600 mb-2">
                      Lyrics / Description
                    </label>

                    <textarea
                      name="lyrics"
                      rows="4"
                      value={editForm.lyrics}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400 resize-none"
                    />
                  </div>

                  <div className="md:col-span-2 flex flex-wrap gap-3">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-slate-950 text-white hover:bg-slate-800 font-bold transition"
                    >
                      <FaEdit />
                      Save Changes
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-5 py-3 rounded-full bg-slate-100 hover:bg-slate-200 font-bold transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="rounded-[2rem] bg-white border border-slate-100 shadow-sm p-5 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-950">
                    My Uploaded Tracks
                  </h3>

                  <p className="text-slate-500">
                    Manage the tracks you uploaded to SoundWave.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={refreshMyTracks}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 font-bold transition"
                >
                  <FaRedoAlt />
                  Refresh
                </button>
              </div>

              {trackMessage && (
                <div className="mb-4 rounded-2xl bg-green-100 border border-green-200 text-green-700 px-4 py-3">
                  {trackMessage}
                </div>
              )}

              {trackError && (
                <div className="mb-4 rounded-2xl bg-red-100 border border-red-200 text-red-700 px-4 py-3">
                  {trackError}
                </div>
              )}

              {isLoadingTracks && <SkeletonGrid count={3} />}

              {!isLoadingTracks && myTracks.length === 0 && (
                <EmptyState
                  title="No uploaded tracks yet"
                  message="Upload your first track and it will appear here for management."
                  actionText="Upload Track"
                  actionTo="/upload"
                />
              )}

              {!isLoadingTracks && myTracks.length > 0 && (
                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full text-left min-w-[980px]">
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-3 px-4">Track</th>
                        <th className="py-3 px-4">Genre</th>
                        <th className="py-3 px-4">Plays</th>
                        <th className="py-3 px-4">Downloads</th>
                        <th className="py-3 px-4">Likes</th>
                        <th className="py-3 px-4">Download</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {myTracks.map((track) => {
                        const coverUrl = getTrackCoverUrl(track);

                        return (
                          <tr
                            key={track.id}
                            className="border-b border-slate-100 hover:bg-slate-50"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={coverUrl}
                                  alt={track.title}
                                  className="w-14 h-14 rounded-2xl object-cover shrink-0"
                                />

                                <p className="font-bold text-slate-950 break-words">
                                  {track.title}
                                </p>
                              </div>
                            </td>

                            <td className="py-3 px-4 text-slate-500">
                              {track.genre_name || 'Unknown'}
                            </td>

                            <td className="py-3 px-4 text-slate-500">
                              {track.play_count || 0}
                            </td>

                            <td className="py-3 px-4 text-slate-500">
                              {track.download_count || 0}
                            </td>

                            <td className="py-3 px-4 text-slate-500">
                              {track.like_count || 0}
                            </td>

                            <td className="py-3 px-4">
                              {track.is_downloadable ? (
                                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold">
                                  Allowed
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-bold">
                                  Off
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              {track.is_published ? (
                                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold">
                                  Published
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-bold">
                                  Draft
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(track)}
                                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-sm font-bold transition"
                                >
                                  <FaEdit />
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteTrack(track.id)}
                                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-red-100 hover:bg-red-200 text-red-700 text-sm font-bold transition"
                                >
                                  <FaTrash />
                                  Delete
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
          </section>
        )}

        {user?.role === 'listener' && (
          <section className="space-y-6 min-w-0 overflow-hidden">
            <div className="rounded-[2rem] bg-white border border-slate-100 shadow-sm p-5 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-950">
                    My Playlists
                  </h3>

                  <p className="text-slate-500">
                    Create and manage your music playlists.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={refreshPlaylists}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 font-bold transition"
                >
                  <FaRedoAlt />
                  Refresh
                </button>
              </div>

              {playlistMessage && (
                <div className="mb-4 rounded-2xl bg-green-100 border border-green-200 text-green-700 px-4 py-3">
                  {playlistMessage}
                </div>
              )}

              {playlistError && (
                <div className="mb-4 rounded-2xl bg-red-100 border border-red-200 text-red-700 px-4 py-3">
                  {playlistError}
                </div>
              )}

              <form
                onSubmit={handleCreatePlaylist}
                className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 min-w-0"
              >
                <input
                  name="name"
                  type="text"
                  placeholder="Playlist name"
                  value={playlistForm.name}
                  onChange={handlePlaylistFormChange}
                  className="min-w-0 px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400"
                />

                <input
                  name="description"
                  type="text"
                  placeholder="Description"
                  value={playlistForm.description}
                  onChange={handlePlaylistFormChange}
                  className="min-w-0 px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400"
                />

                <select
                  name="is_public"
                  value={playlistForm.is_public}
                  onChange={handlePlaylistFormChange}
                  className="min-w-0 px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400"
                >
                  <option value="true">Public</option>
                  <option value="false">Private</option>
                </select>

                <button
                  type="submit"
                  disabled={isCreatingPlaylist}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-slate-950 text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-bold transition"
                >
                  <FaListUl />
                  {isCreatingPlaylist ? 'Creating...' : 'Create Playlist'}
                </button>
              </form>

              {isLoadingPlaylists && <SkeletonGrid count={3} />}

              {!isLoadingPlaylists && playlists.length === 0 && (
                <EmptyState
                  title="No playlists yet"
                  message="Create your first playlist and start saving your favorite tracks."
                />
              )}

              {!isLoadingPlaylists && playlists.length > 0 && (
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
                  {playlists.map((playlist, index) => (
                    <article
                      key={playlist.id}
                      className="group rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition overflow-hidden flex flex-col min-h-[310px]"
                    >
                      <div
                        className={`relative min-h-[145px] p-5 text-white flex flex-col justify-end overflow-hidden ${
                          index % 3 === 0
                            ? 'bg-gradient-to-br from-slate-950 via-orange-900 to-orange-500'
                            : index % 3 === 1
                              ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-orange-700'
                              : 'bg-gradient-to-br from-[#4a4a4a] via-slate-900 to-lime-700'
                        }`}
                      >
                        <div className="absolute -right-10 -bottom-12 w-40 h-40 rounded-full bg-white/10 group-hover:scale-125 transition duration-500" />

                        <div className="relative">
                          <p className="text-xs uppercase tracking-[0.2em] text-white/60 font-bold mb-2">
                            {playlist.is_public ? 'Public' : 'Private'} Playlist
                          </p>

                          <Link to={`/playlist/${playlist.id}`}>
                            <h4 className="text-3xl font-black hover:text-lime-200 line-clamp-2 break-words">
                              {playlist.name}
                            </h4>
                          </Link>
                        </div>
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-4">
                          <span className="inline-flex items-center gap-2">
                            {playlist.is_public ? <FaUnlock /> : <FaLock />}
                            {playlist.is_public ? 'Public' : 'Private'}
                          </span>

                          <span className="inline-flex items-center gap-2">
                            <FaMusic />
                            {playlist.total_tracks || 0} tracks
                          </span>
                        </div>

                        <p className="text-slate-500 text-sm line-clamp-3 min-h-[64px]">
                          {playlist.description || 'No description added.'}
                        </p>

                        <div className="flex flex-wrap gap-3 mt-auto pt-5">
                          <Link
                            to={`/playlist/${playlist.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950 text-white hover:bg-slate-800 font-bold transition"
                          >
                            Open
                            <FaArrowRight />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDeletePlaylist(playlist.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 font-bold transition"
                          >
                            <FaTrash />
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[2rem] bg-white border border-slate-100 shadow-sm p-5 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-950">
                    Followed Artists
                  </h3>

                  <p className="text-slate-500">
                    Artists you follow on SoundWave.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={refreshFollowedArtists}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 font-bold transition"
                >
                  <FaRedoAlt />
                  Refresh
                </button>
              </div>

              {followedMessage && (
                <div className="mb-4 rounded-2xl bg-green-100 border border-green-200 text-green-700 px-4 py-3">
                  {followedMessage}
                </div>
              )}

              {followedError && (
                <div className="mb-4 rounded-2xl bg-red-100 border border-red-200 text-red-700 px-4 py-3">
                  {followedError}
                </div>
              )}

              {isLoadingFollowedArtists && (
                <SkeletonGrid type="artist" count={3} />
              )}

              {!isLoadingFollowedArtists && followedArtists.length === 0 && (
                <EmptyState
                  title="No followed artists yet"
                  message="Follow artists from the Artists page and they will appear here."
                  actionText="Browse Artists"
                  actionTo="/artists"
                />
              )}

              {!isLoadingFollowedArtists && followedArtists.length > 0 && (
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
                  {followedArtists.map((artist) => (
                    <article
                      key={artist.id}
                      className="rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition p-5 flex flex-col min-h-[270px]"
                    >
                      <div className="flex gap-4 items-start mb-4">
                        <img
                          src={getArtistAvatarUrl(artist)}
                          alt={artist.display_name}
                          className="w-20 h-20 rounded-2xl object-cover border border-slate-100 shrink-0"
                        />

                        <div className="min-w-0 flex-1">
                          <Link to={`/artist/${artist.id}`}>
                            <h4 className="text-xl font-black text-slate-950 hover:text-orange-700 break-words">
                              {artist.display_name}
                            </h4>
                          </Link>

                          <p className="text-slate-500 text-sm break-words">
                            {artist.country || 'Country not added'}
                          </p>
                        </div>
                      </div>

                      <p className="text-slate-500 text-sm line-clamp-3 min-h-[64px]">
                        {artist.bio || 'No bio added yet.'}
                      </p>

                      <div className="grid grid-cols-3 gap-2 text-sm text-slate-500 mt-4">
                        <span>{artist.total_tracks || 0} tracks</span>
                        <span>{artist.total_plays || 0} plays</span>
                        <span>{artist.total_likes || 0} likes</span>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-auto pt-5">
                        <Link
                          to={`/artist/${artist.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950 text-white hover:bg-slate-800 font-bold transition"
                        >
                          Open
                          <FaArrowRight />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleUnfollowArtist(artist.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 font-bold transition"
                        >
                          <FaTrash />
                          Unfollow
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[2rem] bg-white border border-slate-100 shadow-sm p-5 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-950">
                    Liked Songs
                  </h3>

                  <p className="text-slate-500">
                    Tracks you have liked on SoundWave.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={refreshLikedTracks}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 font-bold transition"
                >
                  <FaRedoAlt />
                  Refresh
                </button>
              </div>

              {likedMessage && (
                <div className="mb-4 rounded-2xl bg-green-100 border border-green-200 text-green-700 px-4 py-3">
                  {likedMessage}
                </div>
              )}

              {likedError && (
                <div className="mb-4 rounded-2xl bg-red-100 border border-red-200 text-red-700 px-4 py-3">
                  {likedError}
                </div>
              )}

              {isLoadingLikedTracks && <SkeletonGrid count={3} />}

              {!isLoadingLikedTracks && likedTracks.length === 0 && (
                <EmptyState
                  title="No liked songs yet"
                  message="Like tracks from the homepage or track pages and they will appear here."
                  actionText="Explore Tracks"
                  actionTo="/"
                />
              )}

              {!isLoadingLikedTracks && likedTracks.length > 0 && (
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
                  {likedTracks.map((track) => (
                    <article
                      key={track.id}
                      className="rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition overflow-hidden flex flex-col min-h-[380px]"
                    >
                      <Link to={`/track/${track.id}`}>
                        <img
                          src={getTrackCoverUrl(track)}
                          alt={track.title}
                          className="w-full h-48 object-cover"
                        />
                      </Link>

                      <div className="p-5 flex flex-col flex-1">
                        <Link to={`/track/${track.id}`}>
                          <h4 className="text-xl font-black text-slate-950 hover:text-orange-700 break-words">
                            {track.title}
                          </h4>
                        </Link>

                        <p className="text-slate-500 text-sm mt-1">
                          Artist:{' '}
                          {track.artist_id ? (
                            <Link
                              to={`/artist/${track.artist_id}`}
                              className="hover:text-orange-700"
                            >
                              {track.artist_name}
                            </Link>
                          ) : (
                            track.artist_name
                          )}
                        </p>

                        <p className="text-slate-400 text-sm mt-1">
                          Genre: {track.genre_name || 'Unknown'}
                        </p>

                        <div className="grid grid-cols-3 gap-2 text-sm text-slate-500 mt-4">
                          <span>{track.play_count || 0} plays</span>
                          <span>{track.download_count || 0} downloads</span>
                          <span>{track.like_count || 0} likes</span>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-auto pt-5">
                          <Link
                            to={`/track/${track.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950 text-white hover:bg-slate-800 font-bold transition"
                          >
                            Open
                            <FaArrowRight />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleUnlikeTrack(track.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 font-bold transition"
                          >
                            <FaHeart />
                            Unlike
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

export default Dashboard;