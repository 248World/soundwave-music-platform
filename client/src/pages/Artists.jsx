import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaGlobe,
  FaHeart,
  FaMusic,
  FaPlay,
  FaRedoAlt,
  FaSearch,
  FaUserMinus,
  FaUserPlus,
  FaUsers,
} from 'react-icons/fa';
import api from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import AppShell from '../components/AppShell';
import EmptyState from '../components/EmptyState';
import { SkeletonGrid } from '../components/SkeletonLoader';

function Artists() {
  const { user } = useAuthStore();

  const [artists, setArtists] = useState([]);
  const [followedArtistIds, setFollowedArtistIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [followingArtistId, setFollowingArtistId] = useState(null);

  const [error, setError] = useState('');
  const [followError, setFollowError] = useState('');
  const [followMessage, setFollowMessage] = useState('');

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const loadArtists = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await api.get('/artists');

        setArtists(response.data.artists || []);

        if (user) {
          const followedResponse = await api.get('/artists/following/me');
          const followedArtists = followedResponse.data.artists || [];

          setFollowedArtistIds(
            followedArtists.map((artist) => Number(artist.id))
          );
        } else {
          setFollowedArtistIds([]);
        }
      } catch (error) {
        const message =
          error.response?.data?.message || 'Unable to load artists.';

        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadArtists();
  }, [user]);

  const refreshArtists = async () => {
    try {
      setIsLoading(true);
      setError('');
      setFollowError('');
      setFollowMessage('');

      const response = await api.get('/artists');

      setArtists(response.data.artists || []);

      if (user) {
        const followedResponse = await api.get('/artists/following/me');
        const followedArtists = followedResponse.data.artists || [];

        setFollowedArtistIds(
          followedArtists.map((artist) => Number(artist.id))
        );
      } else {
        setFollowedArtistIds([]);
      }
    } catch (error) {
      const message =
        error.response?.data?.message || 'Unable to refresh artists.';

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const normalizeSearchText = (value) => {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const filteredArtists = useMemo(() => {
    const query = normalizeSearchText(searchQuery);

    if (!query) {
      return artists;
    }

    return artists.filter((artist) => {
      const searchableText = normalizeSearchText(
        [
          artist.display_name,
          artist.country,
          artist.email,
          artist.bio,
          artist.total_tracks,
          artist.follower_count,
          artist.total_plays,
          artist.total_likes,
        ].join(' ')
      );

      return searchableText.includes(query);
    });
  }, [artists, searchQuery]);

  const isArtistFollowed = (artistId) => {
    return followedArtistIds.some((id) => Number(id) === Number(artistId));
  };

  const getArtistAvatarUrl = (artist) => {
    if (artist?.avatar_url) {
      return `${API_BASE_URL}${artist.avatar_url}`;
    }

    return 'https://placehold.co/600x600/111827/ffffff?text=Artist';
  };

  const handleFollowArtist = async (artist) => {
    if (!user) {
      setFollowError('Please login to follow artists.');
      return;
    }

    if (user.role !== 'listener') {
      setFollowError('Only listeners can follow artists.');
      return;
    }

    try {
      setFollowingArtistId(artist.id);
      setFollowError('');
      setFollowMessage('');

      const response = await api.post(`/artists/${artist.id}/follow`);

      if (response.data.success) {
        const following = response.data.following;
        const updatedFollowerCount = response.data.artist.follower_count;

        setArtists((previousArtists) =>
          previousArtists.map((item) =>
            Number(item.id) === Number(artist.id)
              ? {
                  ...item,
                  follower_count: updatedFollowerCount,
                }
              : item
          )
        );

        setFollowedArtistIds((previousIds) => {
          if (following) {
            return previousIds.includes(Number(artist.id))
              ? previousIds
              : [...previousIds, Number(artist.id)];
          }

          return previousIds.filter((id) => Number(id) !== Number(artist.id));
        });

        setFollowMessage(
          response.data.message || 'Artist follow status updated.'
        );
      }
    } catch (error) {
      const message =
        error.response?.data?.message || 'Unable to update follow status.';

      setFollowError(message);
    } finally {
      setFollowingArtistId(null);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const featuredArtist = filteredArtists[0] || artists[0];

  const totalTracks = artists.reduce(
    (total, artist) => total + Number(artist.total_tracks || 0),
    0
  );

  const totalPlays = artists.reduce(
    (total, artist) => total + Number(artist.total_plays || 0),
    0
  );

  const totalFollowers = artists.reduce(
    (total, artist) => total + Number(artist.follower_count || 0),
    0
  );

  const rightPanel = (
    <div className="rounded-[1.5rem] bg-slate-100/80 border border-slate-200 p-4">
      <div className="mb-4">
        <p className="text-xs text-slate-500 font-medium">Artist Spotlight</p>

        <h3 className="text-lg font-black text-slate-950 break-words leading-6">
          {featuredArtist?.display_name || 'No artist selected'}
        </h3>
      </div>

      <div className="relative rounded-[1.25rem] overflow-hidden bg-white shadow-sm mb-4">
        <img
          src={
            featuredArtist
              ? getArtistAvatarUrl(featuredArtist)
              : 'https://placehold.co/600x600/111827/ffffff?text=Artist'
          }
          alt={featuredArtist?.display_name || 'Artist spotlight'}
          className="w-full h-48 object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

        <div className="absolute left-4 right-4 bottom-4 text-white">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-bold">
            Featured Artist
          </p>

          <h4 className="text-xl font-black break-words leading-6">
            {featuredArtist?.display_name || 'SoundWave Artist'}
          </h4>

          {featuredArtist?.country && (
            <p className="inline-flex items-center gap-2 text-xs text-white/75 mt-1">
              <FaGlobe />
              {featuredArtist.country}
            </p>
          )}
        </div>
      </div>

      <p className="text-slate-500 text-sm leading-6 mb-4 line-clamp-4">
        {featuredArtist?.bio ||
          'Discover artists, follow your favorites, and explore their published tracks on SoundWave.'}
      </p>

      {featuredArtist && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl bg-white p-3 min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <FaMusic />
              <span>Tracks</span>
            </div>

            <p className="text-lg font-black text-slate-950">
              {featuredArtist.total_tracks || 0}
            </p>
          </div>

          <div className="rounded-xl bg-white p-3 min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <FaUsers />
              <span>Followers</span>
            </div>

            <p className="text-lg font-black text-slate-950">
              {featuredArtist.follower_count || 0}
            </p>
          </div>

          <div className="rounded-xl bg-white p-3 min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <FaPlay />
              <span>Plays</span>
            </div>

            <p className="text-lg font-black text-slate-950">
              {featuredArtist.total_plays || 0}
            </p>
          </div>

          <div className="rounded-xl bg-white p-3 min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <FaHeart />
              <span>Likes</span>
            </div>

            <p className="text-lg font-black text-slate-950">
              {featuredArtist.total_likes || 0}
            </p>
          </div>
        </div>
      )}

      {featuredArtist && (
        <Link
          to={`/artist/${featuredArtist.id}`}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-full bg-slate-950 text-white text-sm font-bold hover:bg-slate-800 transition"
        >
          Open Artist
          <FaArrowRight />
        </Link>
      )}
    </div>
  );

  return (
    <AppShell
      title="Artists"
      subtitle="Discover creators and follow your favorite SoundWave artists"
      activePage="artists"
      rightPanel={rightPanel}
      searchValue={searchQuery}
      onSearchChange={(event) => setSearchQuery(event.target.value)}
      onSearchSubmit={(value) => setSearchQuery(value)}
      searchPlaceholder="Search artists by name, country, bio, or email..."
    >
      <div className="space-y-6 pb-10">
        <section className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-slate-950 via-slate-800 to-[#5a3a1e] min-h-[220px] shadow-xl">
          <div className="absolute inset-0 bg-black/10" />

          {featuredArtist && (
            <img
              src={getArtistAvatarUrl(featuredArtist)}
              alt={featuredArtist.display_name}
              className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-40"
            />
          )}

          <div className="absolute -right-20 -bottom-24 w-72 h-72 rounded-full bg-lime-300/20 blur-2xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />

          <div className="relative p-5 sm:p-6 max-w-2xl text-white">
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/75 mb-4">
              Discover Artists
            </p>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
              SoundWave Artists
            </h1>

            <p className="text-white/80 max-w-xl leading-6 mb-5 text-sm sm:text-base">
              Browse artists, open their profiles, follow your favorites, and
              discover their published tracks.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-sm text-white/85">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur">
                <FaUsers />
                {artists.length} artists
              </span>

              <span>{followedArtistIds.length} followed</span>

              <span>{totalTracks} tracks</span>

              <span>{totalPlays} plays</span>
            </div>

            <div className="flex flex-wrap gap-3 mt-5">
              <button
                type="button"
                onClick={refreshArtists}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-lime-300 text-slate-950 text-sm font-bold hover:bg-lime-200 transition"
              >
                <FaRedoAlt />
                Refresh Artists
              </button>

              {user?.role === 'artist' && (
                <Link
                  to="/artist-profile/edit"
                  className="px-4 py-2.5 rounded-full bg-white/15 text-white text-sm font-bold hover:bg-white/25 backdrop-blur transition"
                >
                  Edit My Profile
                </Link>
              )}

              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="px-4 py-2.5 rounded-full bg-white/15 text-white text-sm font-bold hover:bg-white/25 backdrop-blur transition"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        </section>

        {(followMessage || followError || error) && (
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

            {error && (
              <div className="rounded-2xl bg-red-100 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {searchQuery && !isLoading && artists.length > 0 && (
          <section className="rounded-[1.5rem] bg-white border border-slate-100 shadow-sm p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                <FaSearch className="text-sm" />
              </div>

              <div>
                <p className="text-xs font-bold text-orange-700 mb-1">
                  Search Results
                </p>

                <h2 className="text-xl sm:text-2xl font-black text-slate-950">
                  Results for “{searchQuery}”
                </h2>

                <p className="text-slate-500 mt-1 text-sm">
                  Showing {filteredArtists.length} artist
                  {filteredArtists.length === 1 ? '' : 's'}.
                </p>
              </div>
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Popular Artists
              </h2>

              <p className="text-sm text-slate-500">
                Explore creators publishing music on SoundWave.
              </p>

              {!isLoading && artists.length > 0 && (
                <p className="text-xs text-slate-400 mt-1">
                  {artists.length} artists · {totalFollowers} total followers
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={refreshArtists}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition"
            >
              <FaRedoAlt />
              Refresh
            </button>
          </div>

          {isLoading && <SkeletonGrid type="artist" count={6} />}

          {!isLoading && !error && artists.length === 0 && (
            <EmptyState
              title="No artists available yet"
              message="Artist profiles will appear here when artist accounts are created."
            />
          )}

          {!isLoading &&
            !error &&
            artists.length > 0 &&
            filteredArtists.length === 0 && (
              <EmptyState
                title="No artists found"
                message={`No artists found for “${searchQuery}”. Try another name, country, bio, or email.`}
              />
            )}

          {!isLoading && !error && filteredArtists.length > 0 && (
            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 items-stretch">
              {filteredArtists.map((artist) => {
                const followed = isArtistFollowed(artist.id);
                const isProcessing =
                  Number(followingArtistId) === Number(artist.id);

                return (
                  <article
                    key={artist.id}
                    className="group bg-white border border-slate-100 rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-xl transition flex flex-col min-h-[360px]"
                  >
                    <div className="relative min-h-[135px] bg-gradient-to-br from-slate-950 via-slate-800 to-orange-700 overflow-hidden">
                      <img
                        src={getArtistAvatarUrl(artist)}
                        alt={artist.display_name}
                        className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition duration-500"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                      <div className="absolute left-4 right-4 bottom-4">
                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">
                          Artist
                        </p>

                        <Link to={`/artist/${artist.id}`}>
                          <h3 className="text-2xl font-black text-white hover:text-lime-200 line-clamp-2 break-words">
                            {artist.display_name || 'Unnamed Artist'}
                          </h3>
                        </Link>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-4">
                        <img
                          src={getArtistAvatarUrl(artist)}
                          alt={artist.display_name}
                          className="w-14 h-14 rounded-xl object-cover border-4 border-white shadow -mt-10 relative z-10 shrink-0"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="inline-flex items-center gap-2 text-sm text-slate-500 break-words">
                            <FaGlobe className="shrink-0" />
                            {artist.country || 'Country not added'}
                          </p>

                          <p className="text-xs text-slate-400 break-words mt-1">
                            {artist.email || 'SoundWave artist'}
                          </p>
                        </div>
                      </div>

                      <p className="text-slate-500 text-sm leading-6 line-clamp-3 min-h-[72px]">
                        {artist.bio || 'No bio added yet.'}
                      </p>

                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="rounded-xl bg-slate-100 p-3 min-w-0">
                          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                            <FaMusic />
                            <span>Tracks</span>
                          </div>

                          <p className="text-lg font-black text-slate-950">
                            {artist.total_tracks || 0}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-100 p-3 min-w-0">
                          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                            <FaUsers />
                            <span>Followers</span>
                          </div>

                          <p className="text-lg font-black text-slate-950">
                            {artist.follower_count || 0}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-100 p-3 min-w-0">
                          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                            <FaPlay />
                            <span>Plays</span>
                          </div>

                          <p className="text-lg font-black text-slate-950">
                            {artist.total_plays || 0}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-100 p-3 min-w-0">
                          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                            <FaHeart />
                            <span>Likes</span>
                          </div>

                          <p className="text-lg font-black text-slate-950">
                            {artist.total_likes || 0}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 mt-4">
                        <Link
                          to={`/artist/${artist.id}`}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-slate-950 text-white hover:bg-slate-800 text-sm font-bold transition"
                        >
                          Open Profile
                          <FaArrowRight />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleFollowArtist(artist)}
                          disabled={
                            !user || user.role !== 'listener' || isProcessing
                          }
                          className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold transition ${
                            followed
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-lime-300 text-slate-950 hover:bg-lime-200'
                          }`}
                        >
                          {followed ? <FaUserMinus /> : <FaUserPlus />}

                          {isProcessing
                            ? 'Updating...'
                            : followed
                              ? 'Unfollow'
                              : 'Follow'}
                        </button>
                      </div>

                      {!user && (
                        <p className="text-slate-400 text-xs mt-3">
                          Login as a listener to follow artists.
                        </p>
                      )}

                      {user && user.role !== 'listener' && (
                        <p className="text-slate-400 text-xs mt-3">
                          Only listener accounts can follow artists.
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

export default Artists;