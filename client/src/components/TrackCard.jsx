import { Link } from 'react-router-dom';
import { FaHeart, FaPlay } from 'react-icons/fa';
import DownloadButton from './DownloadButton';

function TrackCard({
  track,
  onPlay,
  onDownload,
  onLike,
  isLoggedIn,
  isLiked = false,
  user,
  showAddToPlaylist = true,
}) {
  const API_BASE_URL = 'http://localhost:5000';

  const coverUrl = track.cover_url
    ? `${API_BASE_URL}${track.cover_url}`
    : 'https://placehold.co/600x600/f97316/ffffff?text=SoundWave';

  return (
    <article className="group bg-white border border-slate-100 rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-xl transition">
      <div className="relative overflow-hidden">
        <Link to={`/track/${track.id}`}>
          <img
            src={coverUrl}
            alt={track.title}
            className="w-full h-40 object-cover group-hover:scale-105 transition duration-500"
          />
        </Link>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-90" />

        <button
          type="button"
          onClick={() => onPlay(track)}
          className="absolute left-3 bottom-3 w-10 h-10 rounded-full bg-lime-300 text-slate-950 flex items-center justify-center hover:bg-lime-200 shadow-lg transition"
          title="Play track"
          aria-label="Play track"
        >
          <FaPlay className="text-sm ml-0.5" />
        </button>

        <div className="absolute right-3 bottom-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onLike(track)}
            disabled={!isLoggedIn}
            title={isLiked ? 'Unlike track' : 'Like track'}
            aria-label={isLiked ? 'Unlike track' : 'Like track'}
            className={`w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition ${
              isLiked
                ? 'bg-red-100 text-red-600'
                : 'bg-white/90 text-slate-600 hover:text-red-600'
            }`}
          >
            <FaHeart className="text-sm" />
          </button>

          <DownloadButton onClick={() => onDownload(track)} />
        </div>
      </div>

      <div className="p-4">
        <Link to={`/track/${track.id}`}>
          <h3 className="text-lg font-black text-slate-950 hover:text-orange-700 line-clamp-1">
            {track.title}
          </h3>
        </Link>

        <p className="text-slate-500 text-sm mt-1 truncate">
          {track.artist_id ? (
            <Link
              to={`/artist/${track.artist_id}`}
              className="hover:text-orange-700"
            >
              {track.artist_name || 'Unknown artist'}
            </Link>
          ) : (
            track.artist_name || 'Unknown artist'
          )}
        </p>

        <p className="text-slate-400 text-xs mt-1">
          {track.genre_name || 'Unknown genre'}
        </p>

        {track.lyrics && (
          <p className="text-slate-500 text-sm leading-6 mt-3 line-clamp-2">
            {track.lyrics}
          </p>
        )}

        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          <div className="rounded-xl bg-slate-100 p-2">
            <p className="text-[11px] text-slate-500">Plays</p>
            <p className="font-black text-slate-950 text-sm">
              {track.play_count || 0}
            </p>
          </div>

          <div className="rounded-xl bg-slate-100 p-2">
            <p className="text-[11px] text-slate-500">Likes</p>
            <p className="font-black text-slate-950 text-sm">
              {track.like_count || 0}
            </p>
          </div>

          <div className="rounded-xl bg-slate-100 p-2">
            <p className="text-[11px] text-slate-500">Downloads</p>
            <p className="font-black text-slate-950 text-sm">
              {track.download_count || 0}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <Link
            to={`/track/${track.id}`}
            className="px-3.5 py-2 rounded-full bg-slate-950 text-white hover:bg-slate-800 font-bold text-xs"
          >
            Open
          </Link>

          <button
            type="button"
            onClick={() => onPlay(track)}
            className="px-3.5 py-2 rounded-full bg-lime-300 text-slate-950 hover:bg-lime-200 font-bold text-xs"
          >
            Play
          </button>

          {showAddToPlaylist && user?.role === 'listener' && (
            <Link
              to={`/track/${track.id}`}
              className="px-3.5 py-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs"
            >
              Add to Playlist
            </Link>
          )}
        </div>

        {!isLoggedIn && (
          <p className="text-xs text-slate-400 mt-3">
            Login to like tracks and save music.
          </p>
        )}
      </div>
    </article>
  );
}

export default TrackCard;