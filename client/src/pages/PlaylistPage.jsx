import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaDownload,
  FaHeart,
  FaLock,
  FaMusic,
  FaPen,
  FaPlay,
  FaRedoAlt,
  FaTrash,
  FaUnlock,
} from 'react-icons/fa';
import api from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import TrackCard from '../components/TrackCard';
import SoundWavePlayer from '../components/SoundWavePlayer';
import AppShell from '../components/AppShell';
import EmptyState from '../components/EmptyState';
import DownloadButton from '../components/DownloadButton';
import { SkeletonGrid } from '../components/SkeletonLoader';

function PlaylistPage() {
  const { id } = useParams();
  const { user } = useAuthStore();

  const [playlist, setPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [likedTrackIds, setLikedTrackIds] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);

  const [editMode, setEditMode] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    is_public: 'true',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingPlaylist, setIsUpdatingPlaylist] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [likeError, setLikeError] = useState('');
  const [editError, setEditError] = useState('');
  const [editMessage, setEditMessage] = useState('');

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        setIsLoading(true);
        setError('');
        setMessage('');

        const response = await api.get(`/playlists/${id}`);
        const playlistData = response.data.playlist;

        setPlaylist(playlistData);
        setTracks(response.data.tracks || []);

        setEditForm({
          name: playlistData.name || '',
          description: playlistData.description || '',
          is_public: playlistData.is_public ? 'true' : 'false',
        });

        if (user) {
          const likedResponse = await api.get('/tracks/liked-ids/me');
          setLikedTrackIds(likedResponse.data.likedTrackIds || []);
        } else {
          setLikedTrackIds([]);
        }
      } catch (error) {
        const msg =
          error.response?.data?.message || 'Unable to load playlist.';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlaylist();
  }, [id, user]);

  const refreshPlaylist = async () => {
    try {
      setIsLoading(true);
      setError('');
      setMessage('');
      setDownloadError('');
      setLikeError('');
      setEditError('');
      setEditMessage('');

      const response = await api.get(`/playlists/${id}`);
      const playlistData = response.data.playlist;

      setPlaylist(playlistData);
      setTracks(response.data.tracks || []);

      setEditForm({
        name: playlistData.name || '',
        description: playlistData.description || '',
        is_public: playlistData.is_public ? 'true' : 'false',
      });

      if (user) {
        const likedResponse = await api.get('/tracks/liked-ids/me');
        setLikedTrackIds(likedResponse.data.likedTrackIds || []);
      } else {
        setLikedTrackIds([]);
      }
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Unable to refresh playlist.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditError('');
    setEditMessage('');

    if (playlist) {
      setEditForm({
        name: playlist.name || '',
        description: playlist.description || '',
        is_public: playlist.is_public ? 'true' : 'false',
      });
    }
  };

  const handleUpdatePlaylist = async (event) => {
    event.preventDefault();

    if (!editForm.name.trim()) {
      setEditError('Playlist name is required.');
      return;
    }

    try {
      setIsUpdatingPlaylist(true);
      setEditError('');
      setEditMessage('');

      const response = await api.put(`/playlists/${id}`, {
        name: editForm.name,
        description: editForm.description,
        is_public: editForm.is_public === 'true',
      });

      setPlaylist((previousPlaylist) => ({
        ...previousPlaylist,
        ...response.data.playlist,
      }));

      setEditMode(false);
      setEditMessage(response.data.message || 'Playlist updated successfully.');
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Unable to update playlist.';
      setEditError(msg);
    } finally {
      setIsUpdatingPlaylist(false);
    }
  };

  const handlePlay = async (track) => {
    setCurrentTrack(track);

    try {
      const response = await api.patch(`/tracks/${track.id}/play`);

      if (response.data.success) {
        const updatedPlayCount = response.data.track.play_count;

        setTracks((previousTracks) =>
          previousTracks.map((item) =>
            item.id === track.id
              ? {
                  ...item,
                  play_count: updatedPlayCount,
                }
              : item
          )
        );
      }
    } catch {
      console.log('Could not update play count.');
    }
  };

  const handleDownload = async (track) => {
    try {
      setDownloadError('');

      const response = await api.patch(`/tracks/${track.id}/download`);

      if (!response.data.success) {
        setDownloadError('Download failed.');
        return;
      }

      const updatedDownloadCount = response.data.track.download_count;
      const downloadUrl = `${API_BASE_URL}${response.data.track.download_url}`;

      setTracks((previousTracks) =>
        previousTracks.map((item) =>
          item.id === track.id
            ? {
                ...item,
                download_count: updatedDownloadCount,
              }
            : item
        )
      );

      window.location.href = downloadUrl;
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Unable to download this track.';

      setDownloadError(msg);
    }
  };

  const handleLike = async (track) => {
    if (!user) {
      setLikeError('Please login to like tracks.');
      return;
    }

    try {
      setLikeError('');

      const response = await api.patch(`/tracks/${track.id}/like`);

      if (response.data.success) {
        const updatedLikeCount = response.data.track.like_count;
        const liked = response.data.liked;

        setTracks((previousTracks) =>
          previousTracks.map((item) =>
            item.id === track.id
              ? {
                  ...item,
                  like_count: updatedLikeCount,
                }
              : item
          )
        );

        setLikedTrackIds((previousIds) => {
          if (liked) {
            return previousIds.includes(track.id)
              ? previousIds
              : [...previousIds, track.id];
          }

          return previousIds.filter(
            (likedId) => Number(likedId) !== Number(track.id)
          );
        });
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Unable to like this track.';
      setLikeError(msg);
    }
  };

  const handleRemoveTrack = async (trackId) => {
    const confirmRemove = window.confirm(
      'Remove this track from the playlist?'
    );

    if (!confirmRemove) return;

    try {
      setMessage('');
      setError('');

      const response = await api.delete(`/playlists/${id}/tracks/${trackId}`);

      setTracks((previousTracks) =>
        previousTracks.filter((track) => track.id !== trackId)
      );

      setPlaylist((previousPlaylist) => ({
        ...previousPlaylist,
        total_tracks: Math.max((previousPlaylist?.total_tracks || 1) - 1, 0),
      }));

      setMessage(response.data.message || 'Track removed from playlist.');
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        'Unable to remove track from playlist.';

      setError(msg);
    }
  };

  const isTrackLiked = (trackId) => {
    return likedTrackIds.some((likedId) => Number(likedId) === Number(trackId));
  };

  const getTrackCoverUrl = (track) => {
    if (track?.cover_url) {
      return `${API_BASE_URL}${track.cover_url}`;
    }

    return 'https://placehold.co/600x600/f97316/ffffff?text=SoundWave';
  };

  const playlistTitle = playlist?.name || 'Playlist';

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return 'Unknown date';
    }

    return new Date(dateValue).toLocaleDateString();
  };

  const rightPanel = (
    <div className="rounded-[1.5rem] bg-slate-100/80 border border-slate-200 p-4">
      <div className="mb-4">
        <p className="text-xs text-slate-500 font-medium">Playlist</p>

        <h3 className="text-lg font-black text-slate-950 break-words leading-6">
          {playlistTitle}
        </h3>
      </div>

      <div className="relative rounded-[1.25rem] bg-gradient-to-br from-orange-500 via-slate-900 to-slate-950 min-h-[190px] p-4 text-white shadow-sm mb-4 flex flex-col justify-end overflow-hidden">
        <div className="absolute -right-14 -top-14 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -left-12 -bottom-16 w-36 h-36 rounded-full bg-lime-300/10" />

        <div className="relative">
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold mb-3">
            {playlist?.is_public ? 'Public Playlist' : 'Private Playlist'}
          </p>

          <h4 className="text-2xl font-black leading-tight break-words">
            {playlistTitle}
          </h4>

          <p className="text-white/70 text-sm mt-2 line-clamp-3">
            {playlist?.description || 'No description added yet.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl bg-white p-3 min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <FaMusic />
            <span>Tracks</span>
          </div>

          <p className="text-lg font-black text-slate-950">
            {playlist?.total_tracks || tracks.length || 0}
          </p>
        </div>

        <div className="rounded-xl bg-white p-3 min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            {playlist?.is_public ? <FaUnlock /> : <FaLock />}
            <span>Visibility</span>
          </div>

          <p className="text-lg font-black text-slate-950">
            {playlist?.is_public ? 'Public' : 'Private'}
          </p>
        </div>
      </div>

      {playlist?.created_at && (
        <div className="rounded-xl bg-white p-3 mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <FaCalendarAlt />
            <span>Created</span>
          </div>

          <p className="text-sm font-bold text-slate-700">
            {formatDate(playlist.created_at)}
          </p>
        </div>
      )}

      {tracks.length > 0 && (
        <div className="space-y-2">
          {tracks.slice(0, 4).map((track) => (
            <button
              key={track.id}
              type="button"
              onClick={() => handlePlay(track)}
              className="w-full flex items-center gap-3 text-left rounded-xl hover:bg-white p-2 transition"
            >
              <img
                src={getTrackCoverUrl(track)}
                alt={track.title}
                className="w-10 h-10 rounded-lg object-cover"
              />

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-slate-950 truncate">
                  {track.title}
                </p>

                <p className="text-xs text-slate-500 truncate">
                  {track.artist_name || 'Unknown artist'}
                </p>
              </div>

              <FaPlay className="text-xs text-slate-400 shrink-0" />
            </button>
          ))}
        </div>
      )}

      {playlist?.is_owner && (
        <button
          type="button"
          onClick={() => setEditMode(true)}
          className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-full bg-slate-950 text-white text-sm font-bold hover:bg-slate-800 transition"
        >
          <FaPen />
          Edit Playlist
        </button>
      )}
    </div>
  );

  return (
    <>
      <AppShell
        title={playlistTitle}
        subtitle="Playlist details and songs"
        activePage="playlists"
        rightPanel={rightPanel}
        showSearch={false}
      >
        <div className="space-y-6 pb-10">
          <Link
            to="/playlists"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-950"
          >
            <FaArrowLeft />
            Back to playlists
          </Link>

          {isLoading && (
            <div className="space-y-5">
              <div className="rounded-[1.5rem] bg-slate-100 p-6 animate-pulse">
                <div className="h-8 bg-slate-200 rounded w-56 mb-4" />
                <div className="h-4 bg-slate-200 rounded w-full max-w-xl mb-3" />
                <div className="h-4 bg-slate-200 rounded w-full max-w-md" />
              </div>

              <SkeletonGrid count={6} />
            </div>
          )}

          {(error ||
            message ||
            downloadError ||
            likeError ||
            editMessage ||
            editError) && (
            <div className="space-y-3">
              {error && (
                <div className="rounded-2xl bg-red-100 border border-red-200 text-red-700 px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              {message && (
                <div className="rounded-2xl bg-green-100 border border-green-200 text-green-700 px-4 py-3 text-sm">
                  {message}
                </div>
              )}

              {downloadError && (
                <div className="rounded-2xl bg-red-100 border border-red-200 text-red-700 px-4 py-3 text-sm">
                  {downloadError}
                </div>
              )}

              {likeError && (
                <div className="rounded-2xl bg-red-100 border border-red-200 text-red-700 px-4 py-3 text-sm">
                  {likeError}
                </div>
              )}

              {editMessage && (
                <div className="rounded-2xl bg-green-100 border border-green-200 text-green-700 px-4 py-3 text-sm">
                  {editMessage}
                </div>
              )}

              {editError && (
                <div className="rounded-2xl bg-red-100 border border-red-200 text-red-700 px-4 py-3 text-sm">
                  {editError}
                </div>
              )}
            </div>
          )}

          {!isLoading && playlist && (
            <>
              <section className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-[#341708] via-[#a84d1d] to-[#d98938] min-h-[220px] shadow-xl">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute -right-16 -bottom-24 w-72 h-72 rounded-full bg-lime-300/30 blur-2xl" />
                <div className="absolute right-12 top-10 w-44 h-44 rounded-full bg-white/10 border border-white/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

                <div className="relative p-5 sm:p-6 max-w-2xl text-white">
                  <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/75 mb-4">
                    {playlist.is_public ? 'Public Playlist' : 'Private Playlist'}
                  </p>

                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3 break-words">
                    {playlist.name}
                  </h1>

                  <p className="text-white/80 max-w-xl leading-6 mb-5 text-sm sm:text-base">
                    {playlist.description || 'No description added yet.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-white/85">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur">
                      <FaMusic />
                      {playlist.total_tracks || tracks.length || 0} tracks
                    </span>

                    <span className="inline-flex items-center gap-2">
                      {playlist.is_public ? <FaUnlock /> : <FaLock />}
                      {playlist.is_public ? 'Public' : 'Private'}
                    </span>

                    <span className="inline-flex items-center gap-2">
                      <FaCalendarAlt />
                      {formatDate(playlist.created_at)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-5">
                    {tracks[0] && (
                      <button
                        type="button"
                        onClick={() => handlePlay(tracks[0])}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-lime-300 text-slate-950 text-sm font-bold hover:bg-lime-200 transition"
                      >
                        <FaPlay />
                        Play Playlist
                      </button>
                    )}

                    {playlist.is_owner && (
                      <button
                        type="button"
                        onClick={() => setEditMode(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/15 text-white text-sm font-bold hover:bg-white/25 backdrop-blur transition"
                      >
                        <FaPen />
                        Edit Playlist
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={refreshPlaylist}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/15 text-white text-sm font-bold hover:bg-white/25 backdrop-blur transition"
                    >
                      <FaRedoAlt />
                      Refresh
                    </button>
                  </div>
                </div>
              </section>

              {editMode && playlist.is_owner && (
                <section className="rounded-[1.5rem] bg-white border border-slate-100 shadow-sm p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                    <div>
                      <h2 className="text-xl font-black text-slate-950">
                        Edit Playlist
                      </h2>

                      <p className="text-sm text-slate-500">
                        Update your playlist details.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-sm font-bold transition"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleUpdatePlaylist} className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-600 mb-2">
                        Playlist name
                      </label>

                      <input
                        name="name"
                        type="text"
                        value={editForm.name}
                        onChange={handleEditFormChange}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-600 mb-2">
                        Description
                      </label>

                      <textarea
                        name="description"
                        rows="3"
                        value={editForm.description}
                        onChange={handleEditFormChange}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-600 mb-2">
                        Visibility
                      </label>

                      <select
                        name="is_public"
                        value={editForm.is_public}
                        onChange={handleEditFormChange}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400"
                      >
                        <option value="true">Public</option>
                        <option value="false">Private</option>
                      </select>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="submit"
                        disabled={isUpdatingPlaylist}
                        className="px-4 py-2.5 rounded-full bg-slate-950 text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-bold transition"
                      >
                        {isUpdatingPlaylist ? 'Saving...' : 'Save Changes'}
                      </button>

                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-sm font-bold transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </section>
              )}

              <section>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-950">
                      Songs
                    </h2>

                    <p className="text-sm text-slate-500">
                      Tracks saved in this playlist.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={refreshPlaylist}
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-950"
                  >
                    <FaRedoAlt />
                    Refresh
                  </button>
                </div>

                {tracks.length === 0 ? (
                  <EmptyState
                    title="This playlist has no tracks yet"
                    message="Tracks added to this playlist will appear here."
                  />
                ) : (
                  <div className="space-y-2">
                    {tracks.slice(0, 8).map((track, index) => (
                      <div
                        key={track.id}
                        className="group rounded-2xl bg-white hover:bg-slate-100 border border-slate-100 px-3 py-2.5 transition"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => handlePlay(track)}
                              className="w-9 h-9 rounded-full bg-slate-950 text-white flex items-center justify-center group-hover:bg-lime-300 group-hover:text-slate-950 transition shrink-0"
                              title="Play track"
                              aria-label="Play track"
                            >
                              <FaPlay className="text-xs ml-0.5" />
                            </button>

                            <img
                              src={getTrackCoverUrl(track)}
                              alt={track.title}
                              className="w-11 h-11 rounded-xl object-cover shrink-0"
                            />

                            <div className="min-w-0 flex-1">
                              <Link to={`/track/${track.id}`}>
                                <h3 className="font-bold text-slate-950 hover:text-orange-700 truncate">
                                  {track.title}
                                </h3>
                              </Link>

                              <p className="text-xs text-slate-500 truncate">
                                {track.artist_name || 'Unknown artist'}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 text-xs text-slate-500">
                            <span>{track.play_count || 0} plays</span>

                            <span className="inline-flex items-center gap-1">
                              <FaDownload />
                              {track.download_count || 0}
                            </span>

                            <span>{track.like_count || 0} likes</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleLike(track)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                                isTrackLiked(track.id)
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-slate-100 text-slate-500 hover:text-red-600'
                              }`}
                              title={isTrackLiked(track.id) ? 'Unlike' : 'Like'}
                              aria-label={
                                isTrackLiked(track.id) ? 'Unlike' : 'Like'
                              }
                            >
                              <FaHeart className="text-sm" />
                            </button>

                            <DownloadButton onClick={() => handleDownload(track)} />

                            <span className="hidden sm:block text-xs text-slate-400 min-w-[20px] text-right">
                              {index + 1}
                            </span>
                          </div>
                        </div>

                        {playlist.is_owner && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTrack(track.id)}
                            className="mt-2 sm:ml-[5.7rem] inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 font-bold text-xs transition"
                          >
                            <FaTrash />
                            Remove from Playlist
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {tracks.length > 8 && (
                  <div className="mt-5">
                    <h3 className="text-lg font-black text-slate-950 mb-3">
                      More songs
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {tracks.slice(8).map((track) => (
                        <TrackCard
                          key={track.id}
                          track={track}
                          onPlay={handlePlay}
                          onDownload={handleDownload}
                          onLike={handleLike}
                          isLoggedIn={!!user}
                          isLiked={isTrackLiked(track.id)}
                          user={user}
                          showAddToPlaylist={false}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </AppShell>

      <SoundWavePlayer currentTrack={currentTrack} queue={tracks} />
    </>
  );
}

export default PlaylistPage;