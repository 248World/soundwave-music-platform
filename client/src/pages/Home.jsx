import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaPlay } from 'react-icons/fa';
import api from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import TrackCard from '../components/TrackCard';
import SoundWavePlayer from '../components/SoundWavePlayer';
import AppShell from '../components/AppShell';
import EmptyState from '../components/EmptyState';
import DownloadButton from '../components/DownloadButton';
import { SkeletonGrid } from '../components/SkeletonLoader';

const API_BASE_URL = 'http://localhost:5000';

const normalizeSearchText = (value) => {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const compactSearchText = (value) => {
  return normalizeSearchText(value).replace(/\s+/g, '');
};

const textMatchesSearch = (query, fields) => {
  const normalQuery = normalizeSearchText(query);
  const compactQuery = compactSearchText(query);

  if (!normalQuery && !compactQuery) {
    return true;
  }

  return fields.some((field) => {
    const normalField = normalizeSearchText(field);
    const compactField = compactSearchText(field);

    return (
      normalField.includes(normalQuery) ||
      compactField.includes(compactQuery)
    );
  });
};

const removeDuplicateTracks = (items) => {
  const seenIds = new Set();

  return items.filter((item) => {
    if (!item?.id) return false;

    const id = Number(item.id);

    if (seenIds.has(id)) {
      return false;
    }

    seenIds.add(id);
    return true;
  });
};

function Home() {
  const { user } = useAuthStore();

  const [tracks, setTracks] = useState([]);
  const [likedTrackIds, setLikedTrackIds] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);

  const [topArtists, setTopArtists] = useState([]);
  const [popularPlaylists, setPopularPlaylists] = useState([]);
  const [mostPlayedTracks, setMostPlayedTracks] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDiscovery, setIsLoadingDiscovery] = useState(true);

  const [error, setError] = useState('');
  const [discoveryError, setDiscoveryError] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [likeError, setLikeError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadTracks = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await api.get('/tracks');
        setTracks(response.data.tracks || []);
      } catch {
        setError('Unable to load tracks.');
      } finally {
        setIsLoading(false);
      }
    };

    const loadLikedTrackIds = async () => {
      if (!user) {
        setLikedTrackIds([]);
        return;
      }

      try {
        const response = await api.get('/tracks/liked-ids/me');
        setLikedTrackIds(response.data.likedTrackIds || []);
      } catch {
        setLikedTrackIds([]);
      }
    };

    const loadHomeDiscovery = async () => {
      try {
        setIsLoadingDiscovery(true);
        setDiscoveryError('');

        const response = await api.get('/discover/home');

        setTopArtists(response.data.topArtists || []);
        setPopularPlaylists(response.data.popularPlaylists || []);
        setMostPlayedTracks(response.data.mostPlayedTracks || []);
      } catch {
        setDiscoveryError('Unable to load featured sections.');
      } finally {
        setIsLoadingDiscovery(false);
      }
    };

    loadTracks();
    loadLikedTrackIds();
    loadHomeDiscovery();
  }, [user]);

  const allSearchableTracks = useMemo(() => {
    return removeDuplicateTracks([...tracks, ...mostPlayedTracks]);
  }, [tracks, mostPlayedTracks]);

  const searchTrackResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return allSearchableTracks;
    }

    return allSearchableTracks.filter((track) => {
      return textMatchesSearch(searchQuery, [
        track.title,
        track.artist_name,
        track.artist_display_name,
        track.genre_name,
        track.lyrics,
        track.description,
        track.country,
        track.artist_country,
        track.artistCountry,
        track.album_name,
        track.playlist_name,
      ]);
    });
  }, [allSearchableTracks, searchQuery]);

  const searchArtistResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return topArtists;
    }

    return topArtists.filter((artist) => {
      return textMatchesSearch(searchQuery, [
        artist.display_name,
        artist.name,
        artist.country,
        artist.bio,
        artist.email,
      ]);
    });
  }, [topArtists, searchQuery]);

  const searchPlaylistResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return popularPlaylists;
    }

    return popularPlaylists.filter((playlist) => {
      return textMatchesSearch(searchQuery, [
        playlist.name,
        playlist.description,
        playlist.owner_email,
        playlist.owner_name,
        playlist.country,
      ]);
    });
  }, [popularPlaylists, searchQuery]);

  const featuredPlaylist = popularPlaylists[0];
  const heroTrack = mostPlayedTracks[0] || tracks[0];
  const isSearching = searchQuery.trim().length > 0;

  const playerQueue = isSearching ? searchTrackResults : allSearchableTracks;

  const refreshTracks = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await api.get('/tracks');
      setTracks(response.data.tracks || []);

      if (user) {
        const likedResponse = await api.get('/tracks/liked-ids/me');
        setLikedTrackIds(likedResponse.data.likedTrackIds || []);
      } else {
        setLikedTrackIds([]);
      }
    } catch {
      setError('Unable to load tracks.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDiscovery = async () => {
    try {
      setIsLoadingDiscovery(true);
      setDiscoveryError('');

      const response = await api.get('/discover/home');

      setTopArtists(response.data.topArtists || []);
      setPopularPlaylists(response.data.popularPlaylists || []);
      setMostPlayedTracks(response.data.mostPlayedTracks || []);
    } catch {
      setDiscoveryError('Unable to refresh featured sections.');
    } finally {
      setIsLoadingDiscovery(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
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

        setMostPlayedTracks((previousTracks) =>
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

      setMostPlayedTracks((previousTracks) =>
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

        setMostPlayedTracks((previousTracks) =>
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

          return previousIds.filter((id) => Number(id) !== Number(track.id));
        });
      }
    } catch (error) {
      const message =
        error.response?.data?.message || 'Unable to like this track.';

      setLikeError(message);
    }
  };

  const isTrackLiked = (trackId) => {
    return likedTrackIds.some((id) => Number(id) === Number(trackId));
  };

  const getTrackCoverUrl = (track) => {
    if (track?.cover_url) {
      return `${API_BASE_URL}${track.cover_url}`;
    }

    return 'https://placehold.co/600x600/f97316/ffffff?text=SoundWave';
  };

  const getArtistAvatarUrl = (artist) => {
    if (artist?.avatar_url) {
      return `${API_BASE_URL}${artist.avatar_url}`;
    }

    return 'https://placehold.co/300x300/111827/ffffff?text=Artist';
  };

  const rightPanelTracks = isSearching
    ? searchTrackResults
    : mostPlayedTracks.length > 0
      ? mostPlayedTracks
      : tracks;

  const rightPanelTrack = currentTrack || rightPanelTracks[0] || heroTrack;

  const rightPanel = (
    <div className="rounded-[1.5rem] bg-slate-100/80 border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <p className="text-xs text-slate-500 font-medium">
            {isSearching ? 'Search Preview' : 'Now Playing'}
          </p>

          <h3 className="text-lg font-bold text-slate-950 break-words leading-6">
            {rightPanelTrack?.title || 'No track selected'}
          </h3>
        </div>

        <span className="w-9 h-9 rounded-xl bg-white shadow flex items-center justify-center shrink-0">
          ♫
        </span>
      </div>

      <div className="rounded-[1.25rem] overflow-hidden bg-white shadow-sm mb-4">
        <img
          src={getTrackCoverUrl(rightPanelTrack)}
          alt={rightPanelTrack?.title || 'Now playing'}
          className="w-full h-44 object-cover"
        />
      </div>

      <div className="mb-4">
        <h4 className="font-bold text-slate-950 break-words">
          {rightPanelTrack?.title || 'Choose a track'}
        </h4>

        <p className="text-sm text-slate-500 break-words">
          {rightPanelTrack?.artist_name || 'SoundWave'}
        </p>
      </div>

      <div className="space-y-2">
        {rightPanelTracks.slice(0, 4).map((track) => (
          <button
            key={track.id}
            type="button"
            onClick={() => handlePlay(track)}
            className="w-full flex items-center gap-3 text-left rounded-xl hover:bg-white p-2 transition"
          >
            <img
              src={getTrackCoverUrl(track)}
              alt={track.title}
              className="w-10 h-10 rounded-lg object-cover shrink-0"
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
    </div>
  );

  return (
    <>
      <AppShell
        title="Top 2026"
        subtitle="Browse new music, playlists, and artists"
        activePage="browse"
        rightPanel={rightPanel}
        searchValue={searchQuery}
        onSearchChange={(event) => setSearchQuery(event.target.value)}
        onSearchSubmit={(value) => setSearchQuery(value)}
        searchPlaceholder="Search songs, artists, countries, lyrics, playlists..."
      >
        <div className="space-y-6 pb-10">
          {(downloadError || likeError || discoveryError || error) && (
            <div className="space-y-3">
              {downloadError && (
                <div className="text-red-700 bg-red-100 border border-red-200 rounded-2xl p-4">
                  {downloadError}
                </div>
              )}

              {likeError && (
                <div className="text-red-700 bg-red-100 border border-red-200 rounded-2xl p-4">
                  {likeError}
                </div>
              )}

              {discoveryError && (
                <div className="text-red-700 bg-red-100 border border-red-200 rounded-2xl p-4">
                  {discoveryError}
                </div>
              )}

              {error && (
                <div className="text-red-700 bg-red-100 border border-red-200 rounded-2xl p-4">
                  {error}
                </div>
              )}
            </div>
          )}

          {isSearching && (
            <section className="rounded-[1.5rem] bg-white border border-slate-100 shadow-sm p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs font-bold text-orange-700 mb-2">
                    Search Results
                  </p>

                  <h2 className="text-2xl font-black text-slate-950 break-words">
                    Results for “{searchQuery}”
                  </h2>

                  <p className="text-slate-500 mt-2 text-sm">
                    {searchTrackResults.length} song
                    {searchTrackResults.length === 1 ? '' : 's'},{' '}
                    {searchArtistResults.length} artist
                    {searchArtistResults.length === 1 ? '' : 's'}, and{' '}
                    {searchPlaylistResults.length} playlist
                    {searchPlaylistResults.length === 1 ? '' : 's'} found.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={clearSearch}
                  className="px-4 py-2.5 rounded-full bg-slate-950 text-white hover:bg-slate-800 text-sm font-bold"
                >
                  Clear Search
                </button>
              </div>

              {searchTrackResults.length === 0 &&
                searchArtistResults.length === 0 &&
                searchPlaylistResults.length === 0 && (
                  <EmptyState
                    title="No results found"
                    message={`No songs, artists, countries, playlists, or lyrics matched “${searchQuery}”. Try another word.`}
                  />
                )}

              {searchTrackResults.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-black text-slate-950 mb-3">
                    Songs
                  </h3>

                  <div className="space-y-2">
                    {searchTrackResults.slice(0, 10).map((track, index) => (
                      <div
                        key={track.id}
                        className="group flex items-center gap-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 px-3 py-2.5 transition"
                      >
                        <button
                          type="button"
                          onClick={() => handlePlay(track)}
                          className="w-9 h-9 rounded-full bg-slate-950 text-white flex items-center justify-center group-hover:bg-lime-300 group-hover:text-slate-950 shrink-0"
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

                        <div className="hidden md:flex items-center gap-4 text-xs text-slate-500">
                          <span>{track.genre_name || 'Unknown'}</span>
                          <span>{track.play_count || 0} plays</span>
                          <span>{track.like_count || 0} likes</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleLike(track)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isTrackLiked(track.id)
                                ? 'bg-red-100 text-red-600'
                                : 'bg-slate-100 text-slate-500 hover:text-red-600'
                            }`}
                            title={isTrackLiked(track.id) ? 'Unlike' : 'Like'}
                            aria-label={isTrackLiked(track.id) ? 'Unlike' : 'Like'}
                          >
                            <FaHeart className="text-sm" />
                          </button>

                          <DownloadButton onClick={() => handleDownload(track)} />
                        </div>

                        <span className="hidden sm:block text-xs text-slate-400">
                          {index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchArtistResults.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-black text-slate-950 mb-3">
                    Artists
                  </h3>

                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {searchArtistResults.map((artist) => (
                      <Link
                        key={artist.id}
                        to={`/artist/${artist.id}`}
                        className="group min-w-[110px] text-center"
                      >
                        <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-slate-200 shadow-sm group-hover:scale-105 transition">
                          <img
                            src={getArtistAvatarUrl(artist)}
                            alt={artist.display_name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <p className="font-bold text-slate-950 text-sm mt-2 truncate">
                          {artist.display_name}
                        </p>

                        <p className="text-xs text-slate-500 truncate">
                          {artist.country || 'SoundWave'}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {searchPlaylistResults.length > 0 && (
                <div>
                  <h3 className="text-lg font-black text-slate-950 mb-3">
                    Playlists
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {searchPlaylistResults.map((playlist, index) => (
                      <Link
                        key={playlist.id}
                        to={`/playlist/${playlist.id}`}
                        className={`relative min-h-[130px] rounded-[1.5rem] text-white p-4 overflow-hidden shadow-sm hover:shadow-xl transition ${
                          index % 3 === 0
                            ? 'bg-gradient-to-br from-slate-950 via-orange-900 to-orange-500'
                            : index % 3 === 1
                              ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-orange-700'
                              : 'bg-gradient-to-br from-[#4a4a4a] via-slate-900 to-lime-700'
                        }`}
                      >
                        <div className="absolute -right-10 -bottom-12 w-36 h-36 rounded-full bg-white/10" />

                        <div className="relative">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-bold mb-2">
                            Playlist
                          </p>

                          <h4 className="text-xl font-black line-clamp-2">
                            {playlist.name}
                          </h4>

                          <p className="text-white/70 text-sm mt-2 line-clamp-2">
                            {playlist.description || 'No description added.'}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {!isSearching && (
            <>
              <section className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-[#8b3f17] via-[#b85b21] to-[#30170d] min-h-[220px] shadow-xl">
                <div className="absolute inset-0 bg-black/10" />

                {heroTrack && (
                  <img
                    src={getTrackCoverUrl(heroTrack)}
                    alt={heroTrack.title}
                    className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-65"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/15 to-transparent" />

                <div className="relative p-5 sm:p-6 max-w-xl text-white">
                  <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/80 mb-4">
                    Curated Playlist
                  </p>

                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
                    {featuredPlaylist?.name || 'Songs'}
                  </h1>

                  <p className="text-white/80 max-w-md mb-5 text-sm sm:text-base leading-6">
                    {featuredPlaylist?.description ||
                      'Enjoy vivid emotions with a stunning music collection built for SoundWave listeners.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-white/85">
                    <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur">
                      ♥ {featuredPlaylist?.total_likes || heroTrack?.like_count || 0}{' '}
                      likes
                    </span>

                    <span>
                      {featuredPlaylist?.total_tracks || tracks.length || 0} songs
                    </span>

                    <span>
                      {featuredPlaylist?.total_plays || heroTrack?.play_count || 0}{' '}
                      plays
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-5">
                    {heroTrack && (
                      <button
                        type="button"
                        onClick={() => handlePlay(heroTrack)}
                        className="px-4 py-2.5 rounded-full bg-lime-300 text-slate-950 text-sm font-bold hover:bg-lime-200"
                      >
                        Play Featured
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={refreshDiscovery}
                      className="px-4 py-2.5 rounded-full bg-white/15 text-white text-sm font-bold hover:bg-white/25 backdrop-blur"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-black text-slate-950">
                      Popular artists
                    </h2>

                    <p className="text-sm text-slate-500">
                      Artists trending on SoundWave.
                    </p>
                  </div>

                  <Link
                    to="/artists"
                    className="text-sm font-bold text-slate-500 hover:text-slate-950"
                  >
                    See all
                  </Link>
                </div>

                {isLoadingDiscovery ? (
                  <SkeletonGrid type="artist" count={3} />
                ) : topArtists.length === 0 ? (
                  <EmptyState
                    title="No artists yet"
                    message="Artists will appear here once profiles are created."
                    actionText="Browse Artists"
                    actionTo="/artists"
                  />
                ) : (
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {topArtists.slice(0, 6).map((artist) => (
                      <Link
                        key={artist.id}
                        to={`/artist/${artist.id}`}
                        className="group min-w-[105px] text-center"
                      >
                        <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-slate-200 shadow-sm group-hover:scale-105 transition">
                          <img
                            src={getArtistAvatarUrl(artist)}
                            alt={artist.display_name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <p className="font-bold text-slate-950 text-sm mt-2 truncate">
                          {artist.display_name}
                        </p>

                        <p className="text-xs text-slate-500 truncate">
                          {artist.country || 'SoundWave'}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-black text-slate-950">
                      Recently played
                    </h2>

                    <p className="text-sm text-slate-500">
                      Latest tracks uploaded to the platform.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={refreshTracks}
                    className="text-sm font-bold text-slate-500 hover:text-slate-950"
                  >
                    Refresh
                  </button>
                </div>

                {isLoading && <SkeletonGrid count={6} />}

                {!isLoading && !error && tracks.length === 0 && (
                  <EmptyState
                    title="No tracks uploaded yet"
                    message="When artists upload songs, the latest tracks will appear here."
                    actionText={user?.role === 'artist' ? 'Upload Track' : undefined}
                    actionTo={user?.role === 'artist' ? '/upload' : undefined}
                  />
                )}

                {!isLoading && !error && tracks.length > 0 && (
                  <div className="space-y-2">
                    {tracks.slice(0, 8).map((track, index) => (
                      <div
                        key={track.id}
                        className="group flex items-center gap-3 rounded-2xl bg-white hover:bg-slate-100 border border-slate-100 px-3 py-2.5 transition"
                      >
                        <button
                          type="button"
                          onClick={() => handlePlay(track)}
                          className="w-9 h-9 rounded-full bg-slate-950 text-white flex items-center justify-center group-hover:bg-lime-300 group-hover:text-slate-950 shrink-0"
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

                        <div className="hidden md:flex items-center gap-4 text-xs text-slate-500">
                          <span>{track.genre_name || 'Unknown'}</span>
                          <span>{track.play_count || 0} plays</span>
                          <span>{track.like_count || 0} likes</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleLike(track)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isTrackLiked(track.id)
                                ? 'bg-red-100 text-red-600'
                                : 'bg-slate-100 text-slate-500 hover:text-red-600'
                            }`}
                            title={isTrackLiked(track.id) ? 'Unlike' : 'Like'}
                            aria-label={isTrackLiked(track.id) ? 'Unlike' : 'Like'}
                          >
                            <FaHeart className="text-sm" />
                          </button>

                          <DownloadButton onClick={() => handleDownload(track)} />
                        </div>

                        <span className="hidden sm:block text-xs text-slate-400">
                          {index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {!isLoading && !error && tracks.length > 8 && (
                  <div className="mt-5">
                    <h3 className="text-lg font-black text-slate-950 mb-3">
                      More tracks
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

      <SoundWavePlayer currentTrack={currentTrack} queue={playerQueue} />
    </>
  );
}

export default Home;