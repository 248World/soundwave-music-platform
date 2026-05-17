import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaDownload,
  FaGlobe,
  FaHeart,
  FaMusic,
  FaPlay,
  FaRedoAlt,
  FaUserMinus,
  FaUserPlus,
  FaUsers,
} from 'react-icons/fa';
import api from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import TrackCard from '../components/TrackCard';
import SoundWavePlayer from '../components/SoundWavePlayer';
import AppShell from '../components/AppShell';
import EmptyState from '../components/EmptyState';
import DownloadButton from '../components/DownloadButton';
import { SkeletonGrid } from '../components/SkeletonLoader';

function ArtistPage() {
  const { id } = useParams();
  const { user } = useAuthStore();

  const [artist, setArtist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [likedTrackIds, setLikedTrackIds] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [likeError, setLikeError] = useState('');
  const [followError, setFollowError] = useState('');
  const [followMessage, setFollowMessage] = useState('');

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const loadArtist = async () => {
      try {
        setIsLoading(true);
        setError('');

        const [artistResponse, tracksResponse] = await Promise.all([
          api.get(`/artists/${id}`),
          api.get(`/artists/${id}/tracks`),
        ]);

        setArtist(artistResponse.data.artist);
        setTracks(tracksResponse.data.tracks || []);

        if (user) {
          const [followedResponse, likedResponse] = await Promise.all([
            api.get('/artists/following/me'),
            api.get('/tracks/liked-ids/me'),
          ]);

          const followedArtists = followedResponse.data.artists || [];
          const likedIds = likedResponse.data.likedTrackIds || [];

          const alreadyFollowing = followedArtists.some(
            (followedArtist) => Number(followedArtist.id) === Number(id)
          );

          setIsFollowing(alreadyFollowing);
          setLikedTrackIds(likedIds);
        } else {
          setIsFollowing(false);
          setLikedTrackIds([]);
        }
      } catch (error) {
        const message =
          error.response?.data?.message || 'Unable to load artist profile.';

        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadArtist();
  }, [id, user]);

  const refreshArtistPage = async () => {
    try {
      setIsLoading(true);
      setError('');
      setDownloadError('');
      setLikeError('');
      setFollowError('');
      setFollowMessage('');

      const [artistResponse, tracksResponse] = await Promise.all([
        api.get(`/artists/${id}`),
        api.get(`/artists/${id}/tracks`),
      ]);

      setArtist(artistResponse.data.artist);
      setTracks(tracksResponse.data.tracks || []);

      if (user) {
        const [followedResponse, likedResponse] = await Promise.all([
          api.get('/artists/following/me'),
          api.get('/tracks/liked-ids/me'),
        ]);

        const followedArtists = followedResponse.data.artists || [];
        const likedIds = likedResponse.data.likedTrackIds || [];

        const alreadyFollowing = followedArtists.some(
          (followedArtist) => Number(followedArtist.id) === Number(id)
        );

        setIsFollowing(alreadyFollowing);
        setLikedTrackIds(likedIds);
      } else {
        setIsFollowing(false);
        setLikedTrackIds([]);
      }
    } catch (error) {
      const message =
        error.response?.data?.message || 'Unable to refresh artist profile.';

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getArtistAvatarUrl = () => {
    if (artist?.avatar_url) {
      return `${API_BASE_URL}${artist.avatar_url}`;
    }

    return 'https://placehold.co/600x600/111827/ffffff?text=Artist';
  };

  const getTrackCoverUrl = (track) => {
    if (track?.cover_url) {
      return `${API_BASE_URL}${track.cover_url}`;
    }

    return 'https://placehold.co/600x600/f97316/ffffff?text=SoundWave';
  };

  const handleFollowArtist = async () => {
    if (!user) {
      setFollowError('Please login to follow this artist.');
      return;
    }

    try {
      setFollowError('');
      setFollowMessage('');

      const response = await api.post(`/artists/${id}/follow`);

      if (response.data.success) {
        setArtist((previousArtist) => ({
          ...previousArtist,
          follower_count: response.data.artist.follower_count,
        }));

        setIsFollowing(response.data.following);
        setFollowMessage(response.data.message || 'Follow status updated.');
      }
    } catch (error) {
      const message =
        error.response?.data?.message || 'Unable to follow this artist.';

      setFollowError(message);
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
      const message =
        error.response?.data?.message || 'Unable to download this track.';

      setDownloadError(message);
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
      const message =
        error.response?.data?.message || 'Unable to like this track.';

      setLikeError(message);
    }
  };

  const isTrackLiked = (trackId) => {
    return likedTrackIds.some((likedId) => Number(likedId) === Number(trackId));
  };

  const artistName = artist?.display_name || 'Artist Profile';

  const rightPanel = (
    <div className="rounded-[1.5rem] bg-slate-100/80 border border-slate-200 p-4">
      <div className="mb-4">
        <p className="text-xs text-slate-500 font-medium">Artist Profile</p>

        <h3 className="text-lg font-black text-slate-950 break-words leading-6">
          {artist?.display_name || 'Loading artist...'}
        </h3>
      </div>

      <div className="relative rounded-[1.25rem] overflow-hidden bg-white shadow-sm mb-4">
        <img
          src={getArtistAvatarUrl()}
          alt={artist?.display_name || 'Artist'}
          className="w-full h-48 object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        <div className="absolute left-4 bottom-4 text-white">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-bold">
            SoundWave Artist
          </p>

          <h4 className="text-xl font-black break-words leading-6">
            {artist?.display_name || 'Artist'}
          </h4>
        </div>
      </div>

      <p className="text-slate-500 text-sm leading-6 mb-4 line-clamp-4">
        {artist?.bio ||
          'This artist has not added a bio yet. Their published tracks will appear on this profile.'}
      </p>

      {artist && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl bg-white p-3 min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <FaMusic />
              <span>Tracks</span>
            </div>

            <p className="text-lg font-black text-slate-950">
              {artist.total_tracks || tracks.length || 0}
            </p>
          </div>

          <div className="rounded-xl bg-white p-3 min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <FaUsers />
              <span>Followers</span>
            </div>

            <p className="text-lg font-black text-slate-950">
              {artist.follower_count || 0}
            </p>
          </div>

          <div className="rounded-xl bg-white p-3 min-w-0">
            <p className="text-xs text-slate-500">Plays</p>

            <p className="text-lg font-black text-slate-950">
              {artist.total_plays || 0}
            </p>
          </div>

          <div className="rounded-xl bg-white p-3 min-w-0">
            <p className="text-xs text-slate-500">Likes</p>

            <p className="text-lg font-black text-slate-950">
              {artist.total_likes || 0}
            </p>
          </div>
        </div>
      )}

      {artist && (
        <button
          type="button"
          onClick={handleFollowArtist}
          disabled={!user}
          className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-full text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition ${
            isFollowing
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-lime-300 text-slate-950 hover:bg-lime-200'
          }`}
        >
          {isFollowing ? <FaUserMinus /> : <FaUserPlus />}
          {isFollowing ? 'Unfollow Artist' : 'Follow Artist'}
        </button>
      )}
    </div>
  );

  return (
    <>
      <AppShell
        title={artistName}
        subtitle="Artist profile, stats, and published tracks"
        activePage="artists"
        rightPanel={rightPanel}
        showSearch={false}
      >
        <div className="space-y-6 pb-10">
          <Link
            to="/artists"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-950"
          >
            <FaArrowLeft />
            Back to artists
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

          {error && (
            <div className="rounded-2xl bg-red-100 border border-red-200 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {!isLoading && !error && artist && (
            <>
              <section className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-slate-950 via-slate-800 to-[#6b3514] min-h-[240px] shadow-xl">
                <img
                  src={getArtistAvatarUrl()}
                  alt={artist.display_name}
                  className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-45"
                />

                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />

                <div className="relative p-5 sm:p-6 max-w-2xl text-white">
                  <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/75 mb-4">
                    Artist Profile
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
                    <img
                      src={getArtistAvatarUrl()}
                      alt={artist.display_name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] object-cover border-4 border-white/20 shadow-xl"
                    />

                    <div className="min-w-0">
                      <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 break-words">
                        {artist.display_name}
                      </h1>

                      <p className="inline-flex items-center gap-2 text-white/75 text-sm">
                        <FaGlobe />
                        {artist.country || 'Country not added'}
                      </p>
                    </div>
                  </div>

                  <p className="text-white/80 max-w-xl leading-6 mb-5 text-sm sm:text-base">
                    {artist.bio ||
                      'This artist has not added a bio yet, but their SoundWave tracks are available below.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-white/85">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur">
                      <FaMusic />
                      {artist.total_tracks || tracks.length || 0} tracks
                    </span>

                    <span>{artist.follower_count || 0} followers</span>
                    <span>{artist.total_plays || 0} plays</span>
                    <span>{artist.total_likes || 0} likes</span>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-5">
                    <button
                      type="button"
                      onClick={handleFollowArtist}
                      disabled={!user}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold transition ${
                        isFollowing
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-lime-300 text-slate-950 hover:bg-lime-200'
                      }`}
                    >
                      {isFollowing ? <FaUserMinus /> : <FaUserPlus />}
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </button>

                    <button
                      type="button"
                      onClick={refreshArtistPage}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/15 text-white text-sm font-bold hover:bg-white/25 backdrop-blur transition"
                    >
                      <FaRedoAlt />
                      Refresh
                    </button>
                  </div>
                </div>
              </section>

              {(followMessage ||
                followError ||
                downloadError ||
                likeError) && (
                <div className="space-y-3">
                  {followMessage && (
                    <div className="rounded-2xl bg-green-100 border border-green-200 text-green-700 px-4 py-3 text-sm">
                      {followMessage}
                    </div>
                  )}

                  {followError && (
                    <div className="rounded-2xl bg-red-100 border border-red-200 text-red-700 px-4 py-3 text-sm">
                      {followError}
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
                </div>
              )}

              <section>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-950">
                      Published Tracks
                    </h2>

                    <p className="text-sm text-slate-500">
                      Songs uploaded by {artist.display_name}.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={refreshArtistPage}
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-950"
                  >
                    <FaRedoAlt />
                    Refresh
                  </button>
                </div>

                {tracks.length === 0 ? (
                  <EmptyState
                    title="No published tracks yet"
                    message="This artist has no published tracks yet."
                  />
                ) : (
                  <div className="space-y-2">
                    {tracks.slice(0, 6).map((track, index) => (
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
                                {track.genre_name || artist.display_name}
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
                      </div>
                    ))}
                  </div>
                )}

                {tracks.length > 6 && (
                  <div className="mt-5">
                    <h3 className="text-lg font-black text-slate-950 mb-3">
                      More from {artist.display_name}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {tracks.slice(6).map((track) => (
                        <TrackCard
                          key={track.id}
                          track={track}
                          onPlay={handlePlay}
                          onDownload={handleDownload}
                          onLike={handleLike}
                          isLoggedIn={!!user}
                          isLiked={isTrackLiked(track.id)}
                          user={user}
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

export default ArtistPage;