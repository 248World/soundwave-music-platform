import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-4 sm:px-6 lg:px-8 py-8 text-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div>
          <Link to="/" className="text-2xl font-bold">
            SoundWave
          </Link>

          <p className="text-slate-400 mt-2">
            Stream, discover, and support independent artists.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/"
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-sm"
          >
            Home
          </Link>

          <Link
            to="/artists"
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-sm"
          >
            Artists
          </Link>

          <Link
            to="/playlists"
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-sm"
          >
            Playlists
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-slate-800 text-slate-500 text-sm">
        © {currentYear} SoundWave. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;