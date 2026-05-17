import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  FaDownload,
  FaHeart,
  FaPlay,
  FaRedoAlt,
  FaTrash,
} from 'react-icons/fa';
import api from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import SoundWavePlayer from '../components/SoundWavePlayer';
import AppShell from '../components/AppShell';

function TrackPage() {
  const { id } = useParams();
  const { user } = useAuthStore();

  const [track, setTrack] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);

  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isAddingToPlaylist, setIsAddingToPlaylist] = useState(false);

  const [commentBody, setCommentBody] = useState('');

  const [error, setError] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [likeError, setLikeError] = useState('');
  const [likeMessage, setLikeMessage] = useState('');
  const [commentError, setCommentError] = useState('');
  const [commentMessage, setCommentMessage] = useState('');
  const [playlistError, setPlaylistError] = useState('');
  const [playlistMessage, setPlaylistMessage] = useState('');

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const loadTrack = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await api.get(`/tracks/${id}`);

        setTrack(response.data.track);

        if (user) {
          const likedResponse = await api.get('/tracks/liked-ids/me');
          const likedIds = likedResponse.data.likedTrackIds || [];

          const alreadyLiked = likedIds.some(
            (likedId) => Number(likedId) === Number(id)
          );

          setIsLiked(alreadyLiked);
        } else {
          setIsLiked(false);
        }
      } catch (error) {
        const message =
          error.response?.data?.message || 'Unable to load this track.';

        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    const loadComments = async () => {
      try {
        setIsLoadingComments(true);
        setCommentError('');

        const response = await api.get(`/tracks/${id}/comments`);

        setComments(response.data.comments || []);
      } catch {
        setCommentError('Unable to load comments.');
      } finally {
        setIsLoadingComments(false);
      }
    };

    const loadPlaylists = async () => {
      if (!user || user.role === 'artist' || user.role === 'admin') {
        setPlaylists([]);
        return;
      }

      try {
        setPlaylistError('');

        const response = await api.get('/playlists/me');

        const userPlaylists = response.data.playlists || [];
        setPlaylists(userPlaylists);

        if (userPlaylists.length > 0) {
          setSelectedPlaylistId(String(userPlaylists[0].id));
        }
      } catch {
        setPlaylistError('Unable to load your playlists.');
      }
    };

    loadTrack();
    loadComments();
    loadPlaylists();
  }, [id, user]);

  const refreshComments = async () => {
    try {
      setIsLoadingComments(true);
      setCommentError('');

      const response = await api.get(`/tracks/${id}/comments`);

      setComments(response.data.comments || []);
    } catch {
      setCommentError('Unable to load comments.');
    } finally {
      setIsLoadingComments(false);
    }
  };

  const refreshPlaylists = async () => {
    if (!user || user.role === 'artist' || user.role === 'admin') {
      setPlaylists([]);
      return;
    }

    try {
      setPlaylistError('');

      const response = await api.get('/playlists/me');

      const userPlaylists = response.data.playlists || [];
      setPlaylists(userPlaylists);

      if (userPlaylists.length > 0 && !selectedPlaylistId) {
        setSelectedPlaylistId(String(userPlaylists[0].id));
      }
    } catch {
      setPlaylistError('Unable to load your playlists.');
    }
  };

  const handlePlay = async () => {
    if (!track) return;

    setCurrentTrack(track);

    try {
      const response = await api.patch(`/tracks/${track.id}/play`);

      if (response.data.success) {
        const updatedPlayCount = response.data.track.play_count;

        setTrack((previousTrack) => ({
          ...previousTrack,
          play_count: updatedPlayCount,
        }));
      }
    } catch {
      console.log('Could not update play count.');
    }
  };

  const handleDownload = async () => {
    if (!track) return;

    try {
      setDownloadError('');

      const response = await api.patch(`/tracks/${track.id}/download`);

      if (!response.data.success) {
        setDownloadError('Download failed.');
        return;
      }

      const updatedDownloadCount = response.data.track.download_count;
      const downloadUrl = `${API_BASE_URL}${response.data.track.download_url}`;

      setTrack((previousTrack) => ({
        ...previousTrack,
        download_count: updatedDownloadCount,
      }));

      window.location.href = downloadUrl;
    } catch (error) {
      const message =
        error.response?.data?.message || 'Unable to download this track.';

      setDownloadError(message);
    }
  };

  const handleLike = async () => {
    if (!track) return;

    if (!user) {
      setLikeError('Please login to like this track.');
      return;
    }

    try {
      setLikeError('');
      setLikeMessage('');

      const response = await api.patch(`/tracks/${track.id}/like`);

      if (response.data.success) {
        const updatedLikeCount = response.data.track.like_count;

        setTrack((previousTrack) => ({
          ...previousTrack,
          like_count: updatedLikeCount,
        }));

        setIsLiked(response.data.liked);
        setLikeMessage(response.data.message || 'Like updated.');
      }
    } catch (error) {
      const message =
        error.response?.data?.message || 'Unable to like this track.';

      setLikeError(message);
    }
  };

  const handleAddToPlaylist = async (event) => {
    event.preventDefault();

    if (!user) {
      setPlaylistError('Please login to add tracks to a playlist.');
      return;
    }

    if (!track) {
      setPlaylistError('Track not loaded yet.');
      return;
    }

    if (!selectedPlaylistId) {
      setPlaylistError('Please select a playlist first.');
      return;
    }

    try {
      setIsAddingToPlaylist(true);
      setPlaylistError('');
      setPlaylistMessage('');

      const response = await api.post(`/playlists/${selectedPlaylistId}/tracks`, {
        track_id: track.id,
      });

      setPlaylistMessage(
        response.data.message || 'Track added to playlist successfully.'
      );
    } catch (error) {
      const message =
        error.response?.data?.message || 'Unable to add track to playlist.';

      setPlaylistError(message);
    } finally {
      setIsAddingToPlaylist(false);
    }
  };

  const handleSubmitComment = async (event) => {
    event.preventDefault();

    if (!user) {
      setCommentError('Please login to comment.');
      return;
    }

    if (!commentBody.trim()) {
      setCommentError('Comment cannot be empty.');
      return;
    }

    try {
      setIsSubmittingComment(true);
      setCommentError('');
      setCommentMessage('');

      const response = await api.post(`/tracks/${id}/comments`, {
        body: commentBody,
      });

      setComments((previousComments) => [
        response.data.comment,
        ...previousComments,
      ]);

      setCommentBody('');
      setCommentMessage('Comment added successfully.');
    } catch (error) {
      const message =
        error.response?.data?.message || 'Unable to add comment.';

      setCommentError(message);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this comment?'
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setCommentError('');
      setCommentMessage('');

      const response = await api.delete(`/tracks/comments/${commentId}`);

      setComments((previousComments) =>
        previousComments.filter((comment) => comment.id !== commentId)
      );

      setCommentMessage(response.data.message || 'Comment deleted.');
    } catch (error) {
      const message =
        error.response?.data?.message || 'Unable to delete comment.';

      setCommentError(message);
    }
  };

  const coverUrl =
    track && track.cover_url
      ? `${API_BASE_URL}${track.cover_url}`
      : 'https://placehold.co/700x700/111827/ffffff?text=SoundWave';

  const rightPanel = (
    <div className="rounded-[1.5rem] bg-slate-100/80 border border-slate-200 p-4">
      <div className="mb-4">
        <p className="text-xs text-slate-500 font-medium">Now Playing</p>

        <h3 className="text-lg font-black text-slate-950 break-words leading-6">
          {track?.title || 'Loading track...'}
        </h3>
      </div>

      <div className="rounded-[1.25rem] overflow-hidden bg-white shadow-sm mb-4">
        <img
          src={coverUrl}
          alt={track?.title || 'Track cover'}
          className="w-full h-48 object-cover"
        />
      </div>

      <div className="mb-4">
        <p className="font-bold text-slate-950 break-words">
          {track?.title || 'Track title'}
        </p>

        <p className="text-sm text-slate-500 break-words">
          {track?.artist_name || 'Unknown artist'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl bg-white p-3">
          <p className="text-xs text-slate-500">Plays</p>
          <p className="text-lg font-black text-slate-950">
            {track?.play_count || 0}
          </p>
        </div>

        <div className="rounded-xl bg-white p-3">
          <p className="text-xs text-slate-500">Likes</p>
          <p className="text-lg font-black text-slate-950">
            {track?.like_count || 0}
          </p>
        </div>

        <div className="rounded-xl bg-white p-3">
          <p className="text-xs text-slate-500">Downloads</p>
          <p className="text-lg font-black text-slate-950">
            {track?.download_count || 0}
          </p>
        </div>

        <div className="rounded-xl bg-white p-3">
          <p className="text-xs text-slate-500">Type</p>
          <p className="text-sm font-black text-slate-950">
            {track?.is_downloadable ? 'Download' : 'Stream'}
          </p>
        </div>
      </div>

      <button
        onClick={handlePlay}
        disabled={!track}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-full bg-lime-300 text-slate-950 text-sm font-bold hover:bg-lime-200 disabled:opacity-50"
      >
        <FaPlay />
        Play Track
      </button>
    </div>
  );

  return (
    <>
      <AppShell
        title={track?.title || 'Track'}
        subtitle="Track details, comments, playlists, and playback"
        activePage="songs"
        rightPanel={rightPanel}
        showSearch={false}
      >
        <div className="space-y-6 pb-10">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-slate-950"
          >
            ← Back to home
          </Link>

          {isLoading && (
            <div className="rounded-[1.5rem] bg-slate-100 p-6 animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-56 mb-4" />
              <div className="h-4 bg-slate-200 rounded w-full max-w-xl mb-3" />
              <div className="h-4 bg-slate-200 rounded w-full max-w-md" />
            </div>
          )}

          {error && (
            <div className="rounded-2xl bg-red-100 border border-red-200 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {!isLoading && !error && track && (
            <>
              <section className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-slate-950 via-slate-800 to-[#6b3514] min-h-[240px] shadow-xl">
                <img
                  src={coverUrl}
                  alt={track.title}
                  className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-50"
                />

                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />

                <div className="relative p-5 sm:p-6 max-w-2xl text-white">
                  <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/75 mb-4">
                    {track.genre_name || 'Unknown Genre'}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
                    <img
                      src={coverUrl}
                      alt={track.title}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] object-cover border-4 border-white/20 shadow-xl"
                    />

                    <div className="min-w-0">
                      <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 break-words">
                        {track.title}
                      </h1>

                      <p className="text-white/75 text-sm">
                        By{' '}
                        {track.artist_id ? (
                          <Link
                            to={`/artist/${track.artist_id}`}
                            className="hover:text-lime-200 font-bold"
                          >
                            {track.artist_name}
                          </Link>
                        ) : (
                          track.artist_name
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-white/85 mb-5">
                    <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur">
                      {track.play_count || 0} plays
                    </span>

                    <span>{track.download_count || 0} downloads</span>
                    <span>{track.like_count || 0} likes</span>
                    <span>
                      {track.is_downloadable ? 'Downloadable' : 'Streaming only'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handlePlay}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-lime-300 text-slate-950 text-sm font-bold hover:bg-lime-200"
                    >
                      <FaPlay />
                      Play Track
                    </button>

                    {track.is_downloadable ? (
                      <button
                        onClick={handleDownload}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/15 text-white text-sm font-bold hover:bg-white/25 backdrop-blur"
                      >
                        <FaDownload />
                        Download
                      </button>
                    ) : (
                      <span className="px-4 py-2.5 rounded-full bg-white/10 text-white/60 text-sm font-bold">
                        Downloads disabled
                      </span>
                    )}

                    <button
                      onClick={handleLike}
                      disabled={!user}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold ${
                        isLiked
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur'
                      }`}
                    >
                      <FaHeart />
                      {isLiked ? 'Unlike' : 'Like'}
                    </button>
                  </div>
                </div>
              </section>

              {(downloadError || likeError || likeMessage) && (
                <div className="space-y-3">
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

                  {likeMessage && (
                    <div className="rounded-2xl bg-green-100 border border-green-200 text-green-700 px-4 py-3 text-sm">
                      {likeMessage}
                    </div>
                  )}
                </div>
              )}

              <section className="rounded-[1.5rem] bg-white border border-slate-100 shadow-sm p-4 sm:p-5">
                <h2 className="text-xl font-black text-slate-950 mb-3">
                  Lyrics / Description
                </h2>

                {track.lyrics ? (
                  <p className="text-slate-600 leading-7 whitespace-pre-line text-sm sm:text-base">
                    {track.lyrics}
                  </p>
                ) : (
                  <p className="text-slate-500 text-sm">
                    No lyrics or description added for this track.
                  </p>
                )}
              </section>

              {user?.role === 'listener' && (
                <section className="rounded-[1.5rem] bg-white border border-slate-100 shadow-sm p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-950">
                        Add to Playlist
                      </h2>

                      <p className="text-sm text-slate-500">
                        Save this track inside one of your playlists.
                      </p>
                    </div>

                    <button
                      onClick={refreshPlaylists}
                      className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-sm font-bold"
                    >
                      Refresh
                    </button>
                  </div>

                  {playlistMessage && (
                    <div className="mb-4 rounded-2xl bg-green-100 border border-green-200 text-green-700 px-4 py-3 text-sm">
                      {playlistMessage}
                    </div>
                  )}

                  {playlistError && (
                    <div className="mb-4 rounded-2xl bg-red-100 border border-red-200 text-red-700 px-4 py-3 text-sm">
                      {playlistError}
                    </div>
                  )}

                  {playlists.length === 0 ? (
                    <div className="text-slate-500 bg-slate-100 rounded-2xl p-4 text-sm">
                      You have no playlists yet. Create one from your dashboard
                      first.
                    </div>
                  ) : (
                    <form
                      onSubmit={handleAddToPlaylist}
                      className="flex flex-col sm:flex-row gap-3"
                    >
                      <select
                        value={selectedPlaylistId}
                        onChange={(event) =>
                          setSelectedPlaylistId(event.target.value)
                        }
                        className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400"
                      >
                        {playlists.map((playlist) => (
                          <option key={playlist.id} value={playlist.id}>
                            {playlist.name}
                          </option>
                        ))}
                      </select>

                      <button
                        type="submit"
                        disabled={isAddingToPlaylist}
                        className="px-4 py-2.5 rounded-full bg-slate-950 text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-bold"
                      >
                        {isAddingToPlaylist ? 'Adding...' : 'Add to Playlist'}
                      </button>
                    </form>
                  )}
                </section>
              )}

              <section className="rounded-[1.5rem] bg-white border border-slate-100 shadow-sm p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-xl font-black text-slate-950">
                      Comments
                    </h2>

                    <p className="text-sm text-slate-500">
                      Share your thoughts about this track.
                    </p>
                  </div>

                  <button
                    onClick={refreshComments}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-sm font-bold"
                  >
                    <FaRedoAlt />
                    Refresh
                  </button>
                </div>

                {commentMessage && (
                  <div className="mb-4 rounded-2xl bg-green-100 border border-green-200 text-green-700 px-4 py-3 text-sm">
                    {commentMessage}
                  </div>
                )}

                {commentError && (
                  <div className="mb-4 rounded-2xl bg-red-100 border border-red-200 text-red-700 px-4 py-3 text-sm">
                    {commentError}
                  </div>
                )}

                {user ? (
                  <form onSubmit={handleSubmitComment} className="mb-5">
                    <textarea
                      rows="3"
                      placeholder="Write a comment..."
                      value={commentBody}
                      onChange={(event) => setCommentBody(event.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400 resize-none"
                    />

                    <button
                      type="submit"
                      disabled={isSubmittingComment}
                      className="mt-3 px-4 py-2.5 rounded-full bg-slate-950 text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-bold"
                    >
                      {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </form>
                ) : (
                  <div className="mb-5 text-slate-500 bg-slate-100 rounded-2xl p-4 text-sm">
                    Please login to add a comment.
                  </div>
                )}

                {isLoadingComments && (
                  <div className="text-slate-500 bg-slate-100 rounded-2xl p-4 text-sm">
                    Loading comments...
                  </div>
                )}

                {!isLoadingComments && comments.length === 0 && (
                  <div className="text-slate-500 bg-slate-100 rounded-2xl p-4 text-sm">
                    No comments yet. Be the first to comment.
                  </div>
                )}

                {!isLoadingComments && comments.length > 0 && (
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-slate-100 border border-slate-200 rounded-2xl p-4"
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <p className="font-bold text-slate-950">
                              {comment.author_name}
                            </p>

                            <p className="text-xs text-slate-500">
                              {new Date(comment.created_at).toLocaleString()}
                            </p>
                          </div>

                          {user && user.id === comment.user_id && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 text-xs font-bold"
                            >
                              <FaTrash />
                              Delete
                            </button>
                          )}
                        </div>

                        <p className="text-slate-600 whitespace-pre-line text-sm leading-6">
                          {comment.body}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </AppShell>

      <SoundWavePlayer currentTrack={currentTrack} />
    </>
  );
}

export default TrackPage;