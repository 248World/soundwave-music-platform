import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaCalendarAlt,
  FaGlobe,
  FaMusic,
  FaRedoAlt,
  FaUser,
} from 'react-icons/fa';
import api from '../api/axios';
import AppShell from '../components/AppShell';
import EmptyState from '../components/EmptyState';
import { SkeletonGrid } from '../components/SkeletonLoader';

function PublicPlaylists() {
  const [playlists, setPlaylists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInitialPublicPlaylists = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await api.get('/playlists/public');

        setPlaylists(response.data.playlists || []);
      } catch (error) {
        const message =
          error.response?.data?.message || 'Unable to load public playlists.';

        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialPublicPlaylists();
  }, []);

  const refreshPlaylists = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await api.get('/playlists/public');

      setPlaylists(response.data.playlists || []);
    } catch (error) {
      const message =
        error.response?.data?.message || 'Unable to refresh public playlists.';

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

  const filteredPlaylists = useMemo(() => {
    const query = normalizeSearchText(searchQuery);

    if (!query) {
      return playlists;
    }

    return playlists.filter((playlist) => {
      const searchableText = normalizeSearchText(
        [
          playlist.name,
          playlist.description,
          playlist.owner_email,
          playlist.owner_name,
          playlist.total_tracks,
          playlist.is_public ? 'public' : 'private',
        ].join(' ')
      );

      return searchableText.includes(query);
    });
  }, [playlists, searchQuery]);

  const featuredPlaylist = filteredPlaylists[0] || playlists[0];

  const totalTracks = playlists.reduce(
    (total, playlist) => total + Number(playlist.total_tracks || 0),
    0
  );

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return 'Unknown';
    }

    return new Date(dateValue).toLocaleDateString();
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const getGradientClass = (index) => {
    const gradients = [
      'from-[#5a220b] via-[#b55320] to-[#f08a24]',
      'from-slate-950 via-[#4a2418] to-orange-600',
      'from-[#4a4a4a] via-slate-900 to-lime-700',
      'from-slate-950 via-purple-950 to-orange-800',
      'from-[#321407] via-[#7b3514] to-[#d26b20]',
      'from-slate-900 via-slate-700 to-[#4a4a4a]',
    ];

    return gradients[index % gradients.length];
  };

  const rightPanel = (
    <div className="rounded-[1.5rem] bg-slate-100/80 border border-slate-200 p-4">
      <div className="mb-4">
        <p className="text-xs text-slate-500 font-medium">
          Featured Collection
        </p>

        <h3 className="text-lg font-black text-slate-950 break-words leading-6">
          {featuredPlaylist?.name || 'No playlist selected'}
        </h3>
      </div>

      <div
        className={`relative rounded-[1.25rem] bg-gradient-to-br ${
          featuredPlaylist ? getGradientClass(1) : 'from-slate-300 to-slate-500'
        } min-h-[185px] p-4 text-white shadow-sm mb-4 flex flex-col justify-end overflow-hidden`}
      >
        <div className="absolute -right-14 -top-14 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -left-10 -bottom-16 w-32 h-32 rounded-full bg-white/10" />

        <div className="relative">
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold mb-3">
            Public Playlist
          </p>

          <h4 className="text-2xl font-black leading-tight break-words">
            {featuredPlaylist?.name || 'SoundWave Mix'}
          </h4>

          <p className="text-white/75 text-sm mt-2 line-clamp-3">
            {featuredPlaylist?.description ||
              'Public playlists created by SoundWave listeners will appear here.'}
          </p>
        </div>
      </div>

      {featuredPlaylist ? (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl bg-white p-3 min-w-0">
              <p className="text-xs text-slate-500">Tracks</p>

              <p className="text-lg font-black text-slate-950">
                {featuredPlaylist.total_tracks || 0}
              </p>
            </div>

            <div className="rounded-xl bg-white p-3 min-w-0">
              <p className="text-xs text-slate-500">Visibility</p>

              <p className="text-lg font-black text-slate-950">Public</p>
            </div>
          </div>

          <div className="rounded-xl bg-white p-3 mb-4">
            <p className="text-xs text-slate-500 mb-1">Owner</p>

            <p className="text-sm font-bold text-slate-700 break-words">
              {featuredPlaylist.owner_email || 'Unknown owner'}
            </p>
          </div>

          <Link
            to={`/playlist/${featuredPlaylist.id}`}
            className="block w-full text-center px-4 py-2.5 rounded-full bg-slate-950 text-white text-sm font-bold hover:bg-slate-800 transition"
          >
            Open Playlist
          </Link>
        </>
      ) : (
        <p className="text-slate-500 text-sm">
          Public playlists will appear here once they are created.
        </p>
      )}
    </div>
  );

  return (
    <AppShell
      title="Playlists"
      subtitle="Browse public playlists created by SoundWave listeners"
      activePage="playlists"
      rightPanel={rightPanel}
      searchValue={searchQuery}
      onSearchChange={(event) => setSearchQuery(event.target.value)}
      onSearchSubmit={(value) => setSearchQuery(value)}
      searchPlaceholder="Search playlists by name, description, or owner..."
    >
      <div className="space-y-6 pb-10">
        <section className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-[#341708] via-[#a84d1d] to-[#d98938] min-h-[210px] shadow-xl">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -right-16 -bottom-24 w-72 h-72 rounded-full bg-lime-300/30 blur-2xl" />
          <div className="absolute right-12 top-10 w-44 h-44 rounded-full bg-white/10 border border-white/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/15 to-transparent" />

          <div className="relative p-5 sm:p-6 max-w-2xl text-white">
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/75 mb-4">
              Discover Playlists
            </p>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
              Public Playlists
            </h1>

            <p className="text-white/80 max-w-xl leading-6 mb-5 text-sm sm:text-base">
              Browse playlists created by SoundWave listeners and discover
              tracks grouped by moods, genres, and collections.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-sm text-white/85">
              <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur">
                {playlists.length} playlists
              </span>

              <span>{totalTracks} tracks</span>

              <span>Public collections</span>
            </div>

            <div className="flex flex-wrap gap-3 mt-5">
              <button
                type="button"
                onClick={refreshPlaylists}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-lime-300 text-slate-950 text-sm font-bold hover:bg-lime-200 transition"
              >
                <FaRedoAlt />
                Refresh
              </button>

              <Link
                to="/"
                className="px-4 py-2.5 rounded-full bg-white/15 text-white text-sm font-bold hover:bg-white/25 backdrop-blur transition"
              >
                Browse Songs
              </Link>

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

        {error && (
          <div className="rounded-2xl bg-red-100 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {searchQuery && !isLoading && playlists.length > 0 && (
          <section className="rounded-[1.5rem] bg-white border border-slate-100 shadow-sm p-4 sm:p-5">
            <p className="text-xs font-bold text-orange-700 mb-1">
              Search Results
            </p>

            <h2 className="text-xl sm:text-2xl font-black text-slate-950">
              Results for “{searchQuery}”
            </h2>

            <p className="text-slate-500 mt-1 text-sm">
              Showing {filteredPlaylists.length} playlist
              {filteredPlaylists.length === 1 ? '' : 's'}.
            </p>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Playlist Library
              </h2>

              <p className="text-sm text-slate-500">
                Explore public collections from the SoundWave community.
              </p>
            </div>

            <button
              type="button"
              onClick={refreshPlaylists}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition"
            >
              <FaRedoAlt />
              Refresh
            </button>
          </div>

          {isLoading && <SkeletonGrid count={6} />}

          {!isLoading && !error && playlists.length === 0 && (
            <EmptyState
              title="No public playlists yet"
              message="When listeners create public playlists, they will appear here."
            />
          )}

          {!isLoading &&
            !error &&
            playlists.length > 0 &&
            filteredPlaylists.length === 0 && (
              <EmptyState
                title="No playlists found"
                message={`No playlists found for “${searchQuery}”. Try another name, description, or owner.`}
              />
            )}

          {!isLoading && !error && filteredPlaylists.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4 items-stretch">
              {filteredPlaylists.map((playlist, index) => (
                <article
                  key={playlist.id}
                  className="bg-white border border-slate-100 rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-xl transition flex flex-col min-h-[340px]"
                >
                  <div
                    className={`relative min-h-[125px] bg-gradient-to-br ${getGradientClass(
                      index
                    )} p-4 text-white overflow-hidden`}
                  >
                    <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-white/10" />
                    <div className="absolute right-8 bottom-8 w-20 h-20 rounded-full bg-black/10" />

                    <div className="relative">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-white/70 font-bold mb-3">
                        Public Playlist
                      </p>

                      <Link to={`/playlist/${playlist.id}`}>
                        <h3 className="text-2xl font-black leading-tight line-clamp-2 hover:text-lime-200 transition break-words">
                          {playlist.name || 'Untitled playlist'}
                        </h3>
                      </Link>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-1 min-w-0">
                    <div className="mb-4">
                      <div className="flex items-start gap-2 text-slate-500">
                        <FaUser className="mt-1 shrink-0 text-sm" />

                        <p className="text-sm leading-6 break-words min-w-0">
                          <span className="font-bold text-slate-700">
                            Owner:
                          </span>{' '}
                          {playlist.owner_email || 'Unknown owner'}
                        </p>
                      </div>

                      <p className="text-slate-500 text-sm leading-6 mt-3 line-clamp-3 min-h-[72px]">
                        {playlist.description || 'No description added.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="rounded-xl bg-slate-100 p-3 min-w-0">
                        <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                          <FaMusic />
                          <span>Tracks</span>
                        </div>

                        <p className="font-black text-slate-950 text-lg">
                          {playlist.total_tracks || 0}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-100 p-3 min-w-0">
                        <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                          <FaCalendarAlt />
                          <span>Created</span>
                        </div>

                        <p className="font-black text-slate-950 text-sm break-words">
                          {formatDate(playlist.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 mt-auto">
                      <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-500">
                        <FaGlobe />
                        Public
                      </div>

                      <Link
                        to={`/playlist/${playlist.id}`}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-slate-950 text-white hover:bg-slate-800 text-sm font-bold transition shrink-0"
                      >
                        Open
                        <FaArrowRight />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

export default PublicPlaylists;