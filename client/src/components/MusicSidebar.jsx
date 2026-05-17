import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import SoundWaveLogo from './SoundWaveLogo';

function SidebarLink({ to, label, active, onNavigate }) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={`block px-4 py-2.5 rounded-full text-sm font-semibold transition ${
        active
          ? 'bg-slate-950 text-white shadow-lg'
          : 'text-white/65 hover:text-white hover:bg-white/10'
      }`}
    >
      {label}
    </Link>
  );
}

function MusicSidebar({ activePage, isMobile = false, onNavigate }) {
  const location = useLocation();
  const { user } = useAuthStore();

  const pathname = location.pathname;

  const isActive = (page, path) => {
    if (activePage === page) return true;
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <aside
      className={`${
        isMobile ? 'flex' : 'hidden lg:flex'
      } h-full min-h-0 flex-col bg-[#4a4a4a] text-white px-5 py-6 overflow-y-auto`}
    >
      <div className="mb-8 shrink-0">
        <SoundWaveLogo size="lg" />
      </div>

      <div className="space-y-8 flex-1">
        <div>
          <p className="text-white/85 text-lg font-bold mb-3">Library</p>

          <nav className="space-y-2">
            <SidebarLink
              to="/"
              label="Browse"
              active={isActive('browse', '/')}
              onNavigate={onNavigate}
            />

            <SidebarLink
              to="/"
              label="Songs"
              active={activePage === 'songs'}
              onNavigate={onNavigate}
            />

            <SidebarLink
              to="/playlists"
              label="Albums"
              active={isActive('playlists', '/playlists')}
              onNavigate={onNavigate}
            />

            <SidebarLink
              to="/artists"
              label="Artists"
              active={isActive('artists', '/artists')}
              onNavigate={onNavigate}
            />
          </nav>
        </div>

        <div>
          <p className="text-white/85 text-lg font-bold mb-3">My music</p>

          <nav className="space-y-2">
            <SidebarLink
              to={user ? '/dashboard' : '/login'}
              label="Dashboard"
              active={isActive('dashboard', '/dashboard')}
              onNavigate={onNavigate}
            />

            <SidebarLink
              to={user ? '/dashboard' : '/login'}
              label="Favorite Songs"
              active={activePage === 'favorites'}
              onNavigate={onNavigate}
            />

            <SidebarLink
              to={user ? '/dashboard' : '/login'}
              label="My Playlists"
              active={activePage === 'my-playlists'}
              onNavigate={onNavigate}
            />
          </nav>
        </div>

        {user?.role === 'artist' && (
          <div>
            <p className="text-white/85 text-lg font-bold mb-3">Artist</p>

            <nav className="space-y-2">
              <SidebarLink
                to="/upload"
                label="Upload Track"
                active={isActive('upload', '/upload')}
                onNavigate={onNavigate}
              />

              <SidebarLink
                to="/artist-profile/edit"
                label="Edit Profile"
                active={isActive('artist-profile', '/artist-profile')}
                onNavigate={onNavigate}
              />
            </nav>
          </div>
        )}

        {user?.role === 'admin' && (
          <div>
            <p className="text-white/85 text-lg font-bold mb-3">Admin</p>

            <nav className="space-y-2">
              <SidebarLink
                to="/admin"
                label="Admin Dashboard"
                active={isActive('admin', '/admin')}
                onNavigate={onNavigate}
              />
            </nav>
          </div>
        )}
      </div>

      <div className="pt-6 mt-6 border-t border-white/10 shrink-0">
        {user ? (
          <Link
            to="/dashboard"
            onClick={onNavigate}
            className="block bg-white/10 hover:bg-white/15 rounded-2xl p-4 transition"
          >
            <p className="text-xs text-white/50 mb-1">Signed in</p>

            <p className="text-sm font-bold truncate">{user.email}</p>

            <p className="text-xs text-lime-300 capitalize mt-1">
              {user.role}
            </p>
          </Link>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/login"
              onClick={onNavigate}
              className="block bg-lime-300 text-slate-950 hover:bg-lime-200 rounded-2xl px-3 py-2.5 font-bold text-center text-sm transition"
            >
              Login
            </Link>

            <Link
              to="/register"
              onClick={onNavigate}
              className="block bg-white/10 text-white hover:bg-white/15 rounded-2xl px-3 py-2.5 font-bold text-center text-sm transition"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}

export default MusicSidebar;