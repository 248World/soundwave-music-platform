import { Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

function Navbar({ title = 'SoundWave', showDashboard = true }) {
  const { user } = useAuthStore();

  return (
    <nav className="px-4 sm:px-6 lg:px-8 py-5 border-b border-slate-800">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Link to="/" className="text-2xl font-bold">
          {title}
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/"
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm sm:text-base"
          >
            Home
          </Link>

          <Link
            to="/artists"
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm sm:text-base"
          >
            Artists
          </Link>

          <Link
            to="/playlists"
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm sm:text-base"
          >
            Playlists
          </Link>

          {user ? (
            <>
              {showDashboard && (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-sm sm:text-base"
                >
                  Dashboard
                </Link>
              )}

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm sm:text-base"
                >
                  Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm sm:text-base"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-sm sm:text-base"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;