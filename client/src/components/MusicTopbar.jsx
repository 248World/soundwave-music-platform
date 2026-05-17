import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaSearch, FaTimes } from 'react-icons/fa';
import useAuthStore from '../store/useAuthStore';

function MusicTopbar({
  title = 'SoundWave',
  subtitle,
  showSearch = true,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  onOpenSidebar,
  onSearchSubmit,
}) {
  const { user } = useAuthStore();
  const searchInputRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (onSearchSubmit) {
      onSearchSubmit(searchValue);
    }

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSearchButtonClick = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    if (onSearchSubmit) {
      onSearchSubmit(searchValue);
    }
  };

  const handleClearSearch = () => {
    if (onSearchChange) {
      onSearchChange({
        target: {
          value: '',
        },
      });
    }

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <header className="px-3 sm:px-5 lg:px-6 pt-4 pb-3 shrink-0">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onOpenSidebar}
              className="lg:hidden w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-950 font-bold transition"
              aria-label="Open menu"
              title="Open menu"
            >
              <FaBars className="text-sm" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mb-0.5">
                <Link to="/" className="hover:text-slate-950 truncate">
                  SoundWave
                </Link>

                <span>›</span>

                <span className="text-slate-700 truncate">{title}</span>
              </div>

              {subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 truncate max-w-[520px]">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to="/"
              className="hidden md:inline-flex text-sm font-bold text-slate-700 hover:text-slate-950"
            >
              New Releases
            </Link>

            <Link
              to="/artists"
              className="hidden md:inline-flex text-sm font-bold text-slate-700 hover:text-slate-950"
            >
              Artists
            </Link>

            <Link
              to="/playlists"
              className="hidden md:inline-flex text-sm font-bold text-slate-700 hover:text-slate-950"
            >
              Playlists
            </Link>

            {!user && (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-full bg-slate-950 text-white text-sm font-bold hover:bg-slate-800 transition"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="hidden sm:inline-flex px-3.5 py-2 rounded-full bg-lime-300 text-slate-950 text-sm font-bold hover:bg-lime-200 transition"
                >
                  Register
                </Link>
              </div>
            )}

            {user && (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-full bg-slate-950 text-white pl-1.5 pr-3 py-1.5 hover:bg-slate-800 transition"
              >
                <span className="w-8 h-8 rounded-full bg-lime-300 text-slate-950 flex items-center justify-center text-sm font-black shrink-0">
                  {userInitial}
                </span>

                <span className="hidden sm:inline text-sm font-bold">
                  Dashboard
                </span>
              </Link>
            )}
          </div>
        </div>

        {showSearch && (
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 w-full"
          >
            <div className="relative w-full max-w-3xl">
              <button
                type="button"
                onClick={handleSearchButtonClick}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-950 transition"
                aria-label="Search"
                title="Search"
              >
                <FaSearch className="text-sm" />
              </button>

              <input
                ref={searchInputRef}
                type="text"
                value={searchValue}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
                className="w-full h-12 pl-11 pr-11 rounded-2xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400 focus:bg-white text-slate-900 placeholder:text-slate-400 transition"
              />

              {searchValue && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-950 transition"
                  aria-label="Clear search"
                  title="Clear search"
                >
                  <FaTimes className="text-sm" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="hidden sm:inline-flex h-12 px-5 rounded-2xl bg-slate-950 text-white text-sm font-bold hover:bg-slate-800 transition items-center justify-center"
            >
              Search
            </button>
          </form>
        )}
      </div>
    </header>
  );
}

export default MusicTopbar;