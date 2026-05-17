import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-purple-400 font-semibold mb-4">404</p>

          <h1 className="text-4xl sm:text-5xl font-bold mb-5">
            Page not found
          </h1>

          <p className="text-slate-400 mb-8">
            The page you are looking for does not exist, may have been moved, or
            the URL is incorrect.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/"
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 font-semibold"
            >
              Go Home
            </Link>

            <Link
              to="/artists"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold"
            >
              Browse Artists
            </Link>

            <Link
              to="/playlists"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold"
            >
              Browse Playlists
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default NotFound;