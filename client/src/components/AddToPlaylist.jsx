import { useEffect, useState } from 'react';
import api from '../api/axios';

function AddToPlaylist({ trackId, user }) {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');

  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const canUsePlaylists = user && user.role === 'listener';

  useEffect(() => {
    const loadPlaylists = async () => {
      if (!canUsePlaylists) {
        setPlaylists([]);
        setSelectedPlaylistId('');
        return;
      }

      try {
        setIsLoadingPlaylists(true);
        setError('');

        const response = await api.get('/playlists/me');

        const userPlaylists = response.data.playlists || [];

        setPlaylists(userPlaylists);

        if (userPlaylists.length > 0) {
          setSelectedPlaylistId(String(userPlaylists[0].id));
        }
      } catch {
        setError('Unable to load playlists.');
      } finally {
        setIsLoadingPlaylists(false);
      }
    };

    loadPlaylists();
  }, [canUsePlaylists]);

  const handleAddToPlaylist = async (event) => {
    event.preventDefault();

    if (!canUsePlaylists) {
      setError('Please login as a listener to add tracks to playlists.');
      return;
    }

    if (!trackId) {
      setError('Track not found.');
      return;
    }

    if (!selectedPlaylistId) {
      setError('Please select a playlist first.');
      return;
    }

    try {
      setIsAdding(true);
      setError('');
      setMessage('');

      const response = await api.post(`/playlists/${selectedPlaylistId}/tracks`, {
        track_id: trackId,
      });

      setMessage(response.data.message || 'Track added to playlist.');
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Unable to add track to playlist.';

      setError(msg);
    } finally {
      setIsAdding(false);
    }
  };

  if (!canUsePlaylists) {
    return null;
  }

  return (
    <div className="mt-4 border-t border-slate-800 pt-4">
      <p className="text-sm font-semibold mb-2">Add to Playlist</p>

      {message && (
        <div className="mb-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-300 px-3 py-2 text-sm">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {isLoadingPlaylists && (
        <div className="text-slate-400 bg-slate-800 rounded-lg px-3 py-2 text-sm">
          Loading playlists...
        </div>
      )}

      {!isLoadingPlaylists && playlists.length === 0 && (
        <div className="text-slate-400 bg-slate-800 rounded-lg px-3 py-2 text-sm">
          Create a playlist from your dashboard first.
        </div>
      )}

      {!isLoadingPlaylists && playlists.length > 0 && (
        <form onSubmit={handleAddToPlaylist} className="flex flex-col gap-3">
          <select
            value={selectedPlaylistId}
            onChange={(event) => setSelectedPlaylistId(event.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 outline-none focus:border-purple-500 text-sm"
          >
            {playlists.map((playlist) => (
              <option key={playlist.id} value={playlist.id}>
                {playlist.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={isAdding}
            className="w-full px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed font-semibold text-sm"
          >
            {isAdding ? 'Adding...' : 'Add'}
          </button>
        </form>
      )}
    </div>
  );
}

export default AddToPlaylist;