import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaChartLine,
  FaCheck,
  FaClock,
  FaEye,
  FaEyeSlash,
  FaListUl,
  FaMusic,
  FaRedoAlt,
  FaSearch,
  FaTimes,
  FaTrash,
  FaUserEdit,
  FaUsers,
} from 'react-icons/fa';
import api from '../api/axios';
import AppShell from '../components/AppShell';
import EmptyState from '../components/EmptyState';

function StatCard({ label, value, icon }) {
  return (
    <div className="relative overflow-hidden rounded-[1.25rem] bg-white border border-slate-100 shadow-sm p-4 min-h-[105px]">
      <div className="absolute right-3 top-3 w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center text-sm">
        {icon}
      </div>

      <div className="pr-12">
        <p className="text-sm text-slate-500 font-bold leading-5 break-words">
          {label}
        </p>

        <p className="text-xl font-black text-slate-950 break-words mt-5">
          {value ?? 0}
        </p>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-[1.5rem] bg-white border border-slate-100 shadow-sm p-4 animate-pulse min-h-[120px]">
      <div className="h-4 bg-slate-100 rounded w-24 mb-7" />
      <div className="h-8 bg-slate-100 rounded w-14" />
    </div>
  );
}

function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100">
      <table className="w-full text-left min-w-[760px]">
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-slate-100">
              {Array.from({ length: columns }).map((__, columnIndex) => (
                <td key={columnIndex} className="py-2.5 px-4">
                  <div className="h-4 bg-slate-100 rounded animate-pulse w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentTracks, setRecentTracks] = useState([]);

  const [users, setUsers] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  const [activeTab, setActiveTab] = useState('overview');

  const [userSearch, setUserSearch] = useState('');
  const [trackSearch, setTrackSearch] = useState('');
  const [playlistSearch, setPlaylistSearch] = useState('');

  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalForm, setUserModalForm] = useState({
    email: '',
    role: 'listener',
    is_active: false,
  });

  const [isSavingUser, setIsSavingUser] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadOverview = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await api.get('/admin/stats');

      setStats(response.data.stats);
      setRecentUsers(response.data.recentUsers || []);
      setRecentTracks(response.data.recentTracks || []);
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Unable to load admin overview.';

      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      setError('');

      const response = await api.get('/admin/users');

      setUsers(response.data.users || []);
    } catch (error) {
      const msg = error.response?.data?.message || 'Unable to load users.';

      setError(msg);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadTracks = async () => {
    try {
      setIsLoadingTracks(true);
      setError('');

      const response = await api.get('/admin/tracks');

      setTracks(response.data.tracks || []);
    } catch (error) {
      const msg = error.response?.data?.message || 'Unable to load tracks.';

      setError(msg);
    } finally {
      setIsLoadingTracks(false);
    }
  };

  const loadPlaylists = async () => {
    try {
      setIsLoadingPlaylists(true);
      setError('');

      const response = await api.get('/admin/playlists');

      setPlaylists(response.data.playlists || []);
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Unable to load playlists.';

      setError(msg);
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  useEffect(() => {
    const fetchOverview = async () => {
      await loadOverview();
    };

    void fetchOverview();
  }, []);

  useEffect(() => {
    const fetchTabData = async () => {
      if (activeTab === 'users') {
        await loadUsers();
      }

      if (activeTab === 'tracks') {
        await loadTracks();
      }

      if (activeTab === 'playlists') {
        await loadPlaylists();
      }
    };

    void fetchTabData();
  }, [activeTab]);

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) => {
      const email = user.email?.toLowerCase() || '';
      const role = user.role?.toLowerCase() || '';
      const status = user.is_active
        ? 'approved active'
        : 'pending approval disabled hold';

      return (
        email.includes(query) ||
        role.includes(query) ||
        status.includes(query)
      );
    });
  }, [users, userSearch]);

  const filteredTracks = useMemo(() => {
    const query = trackSearch.trim().toLowerCase();

    if (!query) {
      return tracks;
    }

    return tracks.filter((track) => {
      const title = track.title?.toLowerCase() || '';
      const artist = track.artist_name?.toLowerCase() || '';
      const genre = track.genre_name?.toLowerCase() || '';
      const status = track.is_published ? 'published' : 'hidden';

      return (
        title.includes(query) ||
        artist.includes(query) ||
        genre.includes(query) ||
        status.includes(query)
      );
    });
  }, [tracks, trackSearch]);

  const filteredPlaylists = useMemo(() => {
    const query = playlistSearch.trim().toLowerCase();

    if (!query) {
      return playlists;
    }

    return playlists.filter((playlist) => {
      const name = playlist.name?.toLowerCase() || '';
      const description = playlist.description?.toLowerCase() || '';
      const owner = playlist.owner_email?.toLowerCase() || '';
      const visibility = playlist.is_public ? 'public' : 'private';

      return (
        name.includes(query) ||
        description.includes(query) ||
        owner.includes(query) ||
        visibility.includes(query)
      );
    });
  }, [playlists, playlistSearch]);

  const openUserModal = (user) => {
    setSelectedUser(user);

    setUserModalForm({
      email: user.email || '',
      role: user.role || 'listener',
      is_active: Boolean(user.is_active),
    });

    setMessage('');
    setError('');
  };

  const closeUserModal = () => {
    setSelectedUser(null);

    setUserModalForm({
      email: '',
      role: 'listener',
      is_active: false,
    });

    setIsSavingUser(false);
  };

  const handleUserModalChange = (event) => {
    const { name, value } = event.target;

    setUserModalForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleUserApprovalChange = (event) => {
    setUserModalForm((previousForm) => ({
      ...previousForm,
      is_active: event.target.value === 'approved',
    }));
  };

  const updateUserInState = (updatedUser) => {
    setUsers((previousUsers) =>
      previousUsers.map((user) =>
        Number(user.id) === Number(updatedUser.id) ? updatedUser : user
      )
    );

    setRecentUsers((previousUsers) =>
      previousUsers.map((user) =>
        Number(user.id) === Number(updatedUser.id)
          ? {
              ...user,
              email: updatedUser.email,
              role: updatedUser.role,
              is_active: updatedUser.is_active,
            }
          : user
      )
    );

    setSelectedUser(updatedUser);

    setUserModalForm({
      email: updatedUser.email || '',
      role: updatedUser.role || 'listener',
      is_active: Boolean(updatedUser.is_active),
    });
  };

  const handleSaveUser = async (event) => {
    event.preventDefault();

    if (!selectedUser) {
      return;
    }

    if (!userModalForm.email.trim()) {
      setError('Email is required.');
      return;
    }

    try {
      setIsSavingUser(true);
      setMessage('');
      setError('');

      const response = await api.patch(`/admin/users/${selectedUser.id}`, {
        email: userModalForm.email.trim(),
        role: userModalForm.role,
        is_active: userModalForm.is_active,
      });

      updateUserInState(response.data.user);

      setMessage(response.data.message || 'User account updated successfully.');

      await loadOverview();
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Unable to update user account.';

      setError(msg);
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      setMessage('');
      setError('');

      const response = await api.patch(`/admin/users/${userId}/status`);

      updateUserInState(response.data.user);

      setMessage(response.data.message || 'User approval status updated.');

      await loadOverview();
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Unable to update user status.';

      setError(msg);
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${user.email}? This action cannot be undone.`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingUserId(user.id);
      setMessage('');
      setError('');

      const response = await api.delete(`/admin/users/${user.id}`);

      setUsers((previousUsers) =>
        previousUsers.filter((item) => Number(item.id) !== Number(user.id))
      );

      setRecentUsers((previousUsers) =>
        previousUsers.filter((item) => Number(item.id) !== Number(user.id))
      );

      if (selectedUser && Number(selectedUser.id) === Number(user.id)) {
        closeUserModal();
      }

      setMessage(response.data.message || 'User account deleted successfully.');

      await loadOverview();
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Unable to delete user account.';

      setError(msg);
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleToggleTrackPublished = async (trackId) => {
    try {
      setMessage('');
      setError('');

      const response = await api.patch(`/admin/tracks/${trackId}/published`);

      setMessage(response.data.message || 'Track status updated.');

      setTracks((previousTracks) =>
        previousTracks.map((track) =>
          Number(track.id) === Number(trackId)
            ? {
                ...track,
                is_published: response.data.track.is_published,
              }
            : track
        )
      );

      await loadOverview();
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Unable to update track status.';

      setError(msg);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this playlist as admin?'
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setMessage('');
      setError('');

      const response = await api.delete(`/admin/playlists/${playlistId}`);

      setMessage(response.data.message || 'Playlist deleted successfully.');

      setPlaylists((previousPlaylists) =>
        previousPlaylists.filter(
          (playlist) => Number(playlist.id) !== Number(playlistId)
        )
      );

      await loadOverview();
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Unable to delete playlist.';

      setError(msg);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats?.total_users, icon: <FaUsers /> },
    { label: 'Artists', value: stats?.total_artists, icon: <FaUserEdit /> },
    { label: 'Listeners', value: stats?.total_listeners, icon: <FaUsers /> },
    { label: 'Approved Users', value: stats?.active_users, icon: <FaCheck /> },
    { label: 'Pending Users', value: stats?.disabled_users, icon: <FaClock /> },
    { label: 'Tracks', value: stats?.total_tracks, icon: <FaMusic /> },
    { label: 'Published Tracks', value: stats?.published_tracks, icon: <FaEye /> },
    { label: 'Hidden Tracks', value: stats?.hidden_tracks, icon: <FaEyeSlash /> },
    { label: 'Total Plays', value: stats?.total_plays, icon: <FaChartLine /> },
    { label: 'Downloads', value: stats?.total_downloads, icon: <FaMusic /> },
    { label: 'Likes', value: stats?.total_likes, icon: <FaCheck /> },
    { label: 'Comments', value: stats?.total_comments, icon: <FaListUl /> },
    { label: 'Playlists', value: stats?.total_playlists, icon: <FaListUl /> },
    { label: 'Public Playlists', value: stats?.public_playlists, icon: <FaEye /> },
  ];

  const tabItems = [
    { key: 'overview', label: 'Overview', icon: <FaChartLine /> },
    { key: 'users', label: 'Users', icon: <FaUsers /> },
    { key: 'tracks', label: 'Tracks', icon: <FaMusic /> },
    { key: 'playlists', label: 'Playlists', icon: <FaListUl /> },
  ];

  const rightPanel = (
    <div className="rounded-[1.5rem] bg-slate-100/80 border border-slate-200 p-4">
      <div className="mb-4">
        <p className="text-xs text-slate-500 font-medium">Admin Control</p>

        <h3 className="text-lg font-black text-slate-950 break-words">
          SoundWave Admin
        </h3>
      </div>

      <div className="relative rounded-[1.25rem] bg-gradient-to-br from-slate-950 via-orange-900 to-orange-500 min-h-[190px] p-4 text-white shadow-sm mb-4 flex flex-col justify-end overflow-hidden">
        <div className="absolute -right-14 -top-14 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -left-12 -bottom-16 w-36 h-36 rounded-full bg-lime-300/10" />

        <div className="relative">
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-bold mb-3">
            Platform Monitor
          </p>

          <h4 className="text-xl font-black leading-tight">
            Admin Dashboard
          </h4>

          <p className="text-white/70 text-sm mt-3">
            Manage users, tracks, playlists, and platform activity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl bg-white p-3 min-w-0 min-h-[78px] overflow-hidden">
          <p className="text-xs text-slate-500">Users</p>
          <p className="text-xl font-black text-slate-950">
            {stats?.total_users || 0}
          </p>
        </div>

        <div className="rounded-xl bg-white p-3 min-w-0 min-h-[78px] overflow-hidden">
          <p className="text-xs text-slate-500">Tracks</p>
          <p className="text-xl font-black text-slate-950">
            {stats?.total_tracks || 0}
          </p>
        </div>

        <div className="rounded-xl bg-white p-3 min-w-0 min-h-[78px] overflow-hidden">
          <p className="text-xs text-slate-500">Pending</p>
          <p className="text-xl font-black text-slate-950">
            {stats?.disabled_users || 0}
          </p>
        </div>

        <div className="rounded-xl bg-white p-3 min-w-0 min-h-[78px] overflow-hidden">
          <p className="text-xs text-slate-500">Playlists</p>
          <p className="text-xl font-black text-slate-950">
            {stats?.total_playlists || 0}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={loadOverview}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-full bg-slate-950 text-white text-sm font-bold hover:bg-slate-800 transition"
      >
        <FaRedoAlt />
        Refresh Overview
      </button>
    </div>
  );

  return (
    <>
      <AppShell
        title="Admin Dashboard"
        subtitle="Monitor users, tracks, playlists, and platform activity"
        activePage="admin"
        rightPanel={rightPanel}
        showSearch={false}
      >
        <div className="space-y-6 pb-10 overflow-hidden text-[15px]">
          <section className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-slate-950 via-slate-800 to-[#6b3514] min-h-[190px] shadow-xl">
            <div className="absolute -right-16 -bottom-24 w-72 h-72 rounded-full bg-lime-300/30 blur-2xl" />
            <div className="absolute right-12 top-10 w-44 h-44 rounded-full bg-white/10 border border-white/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />

            <div className="relative p-5 sm:p-5 max-w-3xl text-white">
              <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/75 mb-4">
                SoundWave Admin
              </p>

              <h1 className="text-3xl sm:text-xl font-black tracking-tight mb-3">
                Admin Dashboard
              </h1>

              <p className="text-white/80 max-w-2xl leading-7 mb-6">
                Review accounts, approve or disable users, manage tracks, and
                monitor playlists from one place.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={loadOverview}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-lime-300 text-slate-950 text-sm font-bold hover:bg-lime-200 transition"
                >
                  <FaRedoAlt />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('users')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/15 text-white text-sm font-bold hover:bg-white/25 backdrop-blur transition"
                >
                  <FaUsers />
                  Manage Users
                </button>
              </div>
            </div>
          </section>

          <div className="flex flex-wrap gap-2">
            {tabItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition ${
                  activeTab === item.key
                    ? 'bg-slate-950 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-100'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          {(message || error) && (
            <div className="space-y-3">
              {message && (
                <div className="rounded-2xl bg-green-100 border border-green-200 text-green-700 px-4 py-3">
                  {message}
                </div>
              )}

              {error && (
                <div className="rounded-2xl bg-red-100 border border-red-200 text-red-700 px-4 py-3">
                  {error}
                </div>
              )}
            </div>
          )}

          {activeTab === 'overview' && (
            <section>
              {isLoading && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4 mb-6">
                    {Array.from({ length: 12 }).map((_, index) => (
                      <StatCardSkeleton key={index} />
                    ))}
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-100 rounded-[1.5rem] p-5">
                      <div className="h-6 bg-slate-100 rounded w-40 mb-5 animate-pulse" />
                      <TableSkeleton rows={5} columns={3} />
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[1.5rem] p-5">
                      <div className="h-6 bg-slate-100 rounded w-40 mb-5 animate-pulse" />
                      <TableSkeleton rows={5} columns={3} />
                    </div>
                  </div>
                </>
              )}

              {!isLoading && stats && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4 mb-6">
                    {statCards.map((stat) => (
                      <StatCard
                        key={stat.label}
                        label={stat.label}
                        value={stat.value}
                        icon={stat.icon}
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-100 rounded-[1.5rem] p-5 shadow-sm">
                      <h2 className="text-xl font-black text-slate-950 mb-4">
                        Recent Users
                      </h2>

                      {recentUsers.length === 0 ? (
                        <EmptyState
                          title="No recent users"
                          message="Newly registered users will appear here."
                        />
                      ) : (
                        <div className="overflow-x-auto rounded-2xl border border-slate-100">
                          <table className="w-full text-left min-w-[560px] text-sm">
                            <thead className="bg-slate-50">
                              <tr className="border-b border-slate-100 text-slate-500">
                                <th className="py-2.5 px-4">Email</th>
                                <th className="py-2.5 px-4">Role</th>
                                <th className="py-2.5 px-4">Status</th>
                              </tr>
                            </thead>

                            <tbody>
                              {recentUsers.map((user) => (
                                <tr
                                  key={user.id}
                                  onClick={() => openUserModal(user)}
                                  className="border-b border-slate-100 cursor-pointer hover:bg-slate-50"
                                >
                                  <td className="py-2.5 px-4 break-all font-bold text-slate-950">
                                    {user.email}
                                  </td>

                                  <td className="py-2.5 px-4 text-slate-500 capitalize">
                                    {user.role}
                                  </td>

                                  <td className="py-2.5 px-4">
                                    {user.is_active ? (
                                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold whitespace-nowrap">
                                        Approved
                                      </span>
                                    ) : (
                                      <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold whitespace-nowrap">
                                        Pending / On hold
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[1.5rem] p-5 shadow-sm">
                      <h2 className="text-xl font-black text-slate-950 mb-4">
                        Recent Tracks
                      </h2>

                      {recentTracks.length === 0 ? (
                        <EmptyState
                          title="No recent tracks"
                          message="Recently uploaded tracks will appear here."
                        />
                      ) : (
                        <div className="overflow-x-auto rounded-2xl border border-slate-100">
                          <table className="w-full text-left min-w-[560px] text-sm">
                            <thead className="bg-slate-50">
                              <tr className="border-b border-slate-100 text-slate-500">
                                <th className="py-2.5 px-4">Title</th>
                                <th className="py-2.5 px-4">Artist</th>
                                <th className="py-2.5 px-4">Status</th>
                              </tr>
                            </thead>

                            <tbody>
                              {recentTracks.map((track) => (
                                <tr
                                  key={track.id}
                                  className="border-b border-slate-100 hover:bg-slate-50"
                                >
                                  <td className="py-2.5 px-4">
                                    <Link
                                      to={`/track/${track.id}`}
                                      className="font-bold text-slate-950 hover:text-orange-700"
                                    >
                                      {track.title}
                                    </Link>
                                  </td>

                                  <td className="py-2.5 px-4 text-slate-500">
                                    {track.artist_name}
                                  </td>

                                  <td className="py-2.5 px-4">
                                    {track.is_published ? (
                                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold whitespace-nowrap">
                                        Published
                                      </span>
                                    ) : (
                                      <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold whitespace-nowrap">
                                        Hidden
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </section>
          )}

          {activeTab === 'users' && (
            <section className="bg-white border border-slate-100 rounded-[1.5rem] p-5 shadow-sm overflow-hidden">
              <div className="mb-5">
                <h2 className="text-xl font-black text-slate-950 mb-2">
                  Users
                </h2>

                <p className="text-slate-500 max-w-3xl leading-7">
                  Review pending users, approve accounts, disable accounts,
                  delete accounts, and update user information.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-3 mb-5">
                <div className="relative w-full">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400"
                  />
                </div>

                {userSearch && (
                  <button
                    type="button"
                    onClick={() => setUserSearch('')}
                    className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-sm font-bold whitespace-nowrap"
                  >
                    Clear
                  </button>
                )}

                <button
                  type="button"
                  onClick={loadUsers}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-slate-950 text-white hover:bg-slate-800 text-sm font-bold whitespace-nowrap"
                >
                  <FaRedoAlt />
                  Refresh
                </button>
              </div>

              {userSearch && !isLoadingUsers && users.length > 0 && (
                <p className="text-slate-500 mb-4">
                  Showing {filteredUsers.length} result
                  {filteredUsers.length === 1 ? '' : 's'} for “{userSearch}”.
                </p>
              )}

              {isLoadingUsers && <TableSkeleton rows={8} columns={5} />}

              {!isLoadingUsers && filteredUsers.length === 0 && (
                <EmptyState
                  title="No users found"
                  message="Registered users will appear here."
                />
              )}

              {!isLoadingUsers && filteredUsers.length > 0 && (
                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full text-left min-w-[900px] text-sm">
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-100 text-slate-500">
                        <th className="py-2.5 px-4">Email</th>
                        <th className="py-2.5 px-4">Role</th>
                        <th className="py-2.5 px-4">Approval</th>
                        <th className="py-2.5 px-4">Joined</th>
                        <th className="py-2.5 px-4">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredUsers.map((item) => {
                        const isDeleting =
                          Number(deletingUserId) === Number(item.id);

                        return (
                          <tr
                            key={item.id}
                            className="border-b border-slate-100 hover:bg-slate-50"
                          >
                            <td
                              onClick={() => openUserModal(item)}
                              className="py-2.5 px-4 break-all cursor-pointer font-bold text-slate-950 hover:text-orange-700"
                            >
                              {item.email}
                            </td>

                            <td className="py-2.5 px-4 text-slate-500 capitalize">
                              {item.role}
                            </td>

                            <td className="py-2.5 px-4">
                              {item.is_active ? (
                                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold whitespace-nowrap">
                                  Approved
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold whitespace-nowrap">
                                  Pending / On hold
                                </span>
                              )}
                            </td>

                            <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                              {item.created_at
                                ? new Date(item.created_at).toLocaleDateString()
                                : 'Unknown'}
                            </td>

                            <td className="py-2.5 px-4">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => openUserModal(item)}
                                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold whitespace-nowrap"
                                >
                                  <FaUserEdit />
                                  View/Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleUserStatus(item.id)
                                  }
                                  disabled={item.role === 'admin'}
                                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${
                                    item.is_active
                                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                                  }`}
                                >
                                  {item.is_active ? <FaClock /> : <FaCheck />}
                                  {item.is_active ? 'Disable' : 'Approve'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(item)}
                                  disabled={item.role === 'admin' || isDeleting}
                                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold whitespace-nowrap"
                                >
                                  <FaTrash />
                                  {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activeTab === 'tracks' && (
            <section className="bg-white border border-slate-100 rounded-[1.5rem] p-5 shadow-sm overflow-hidden">
              <h2 className="text-xl font-black text-slate-950 mb-2">
                Tracks
              </h2>

              <p className="text-slate-500 mb-5">
                Manage published and hidden tracks.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3 mb-5">
                <input
                  type="text"
                  placeholder="Search tracks..."
                  value={trackSearch}
                  onChange={(event) => setTrackSearch(event.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400"
                />

                <button
                  type="button"
                  onClick={loadTracks}
                  className="px-4 py-2.5 rounded-full bg-slate-950 text-white text-sm font-bold whitespace-nowrap"
                >
                  Refresh
                </button>
              </div>

              {isLoadingTracks && <TableSkeleton rows={8} columns={8} />}

              {!isLoadingTracks && filteredTracks.length === 0 && (
                <EmptyState
                  title="No tracks found"
                  message="Uploaded tracks will appear here."
                />
              )}

              {!isLoadingTracks && filteredTracks.length > 0 && (
                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full text-left min-w-[900px] text-sm">
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-100 text-slate-500">
                        <th className="py-2.5 px-4">Title</th>
                        <th className="py-2.5 px-4">Artist</th>
                        <th className="py-2.5 px-4">Genre</th>
                        <th className="py-2.5 px-4">Plays</th>
                        <th className="py-2.5 px-4">Downloads</th>
                        <th className="py-2.5 px-4">Likes</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredTracks.map((track) => (
                        <tr
                          key={track.id}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="py-2.5 px-4">
                            <Link
                              to={`/track/${track.id}`}
                              className="font-bold text-slate-950 hover:text-orange-700"
                            >
                              {track.title}
                            </Link>
                          </td>

                          <td className="py-2.5 px-4 text-slate-500">
                            {track.artist_name}
                          </td>

                          <td className="py-2.5 px-4 text-slate-500">
                            {track.genre_name || 'Unknown'}
                          </td>

                          <td className="py-2.5 px-4 text-slate-500">
                            {track.play_count || 0}
                          </td>

                          <td className="py-2.5 px-4 text-slate-500">
                            {track.download_count || 0}
                          </td>

                          <td className="py-2.5 px-4 text-slate-500">
                            {track.like_count || 0}
                          </td>

                          <td className="py-2.5 px-4">
                            {track.is_published ? (
                              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold whitespace-nowrap">
                                Published
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold whitespace-nowrap">
                                Hidden
                              </span>
                            )}
                          </td>

                          <td className="py-2.5 px-4">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleTrackPublished(track.id)
                              }
                              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap ${
                                track.is_published
                                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {track.is_published ? <FaEyeSlash /> : <FaEye />}
                              {track.is_published ? 'Hide' : 'Publish'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activeTab === 'playlists' && (
            <section className="bg-white border border-slate-100 rounded-[1.5rem] p-5 shadow-sm overflow-hidden">
              <h2 className="text-xl font-black text-slate-950 mb-2">
                Playlists
              </h2>

              <p className="text-slate-500 mb-5">
                Monitor and manage user-created playlists.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3 mb-5">
                <input
                  type="text"
                  placeholder="Search playlists..."
                  value={playlistSearch}
                  onChange={(event) => setPlaylistSearch(event.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400"
                />

                <button
                  type="button"
                  onClick={loadPlaylists}
                  className="px-4 py-2.5 rounded-full bg-slate-950 text-white text-sm font-bold whitespace-nowrap"
                >
                  Refresh
                </button>
              </div>

              {isLoadingPlaylists && <TableSkeleton rows={8} columns={6} />}

              {!isLoadingPlaylists && filteredPlaylists.length === 0 && (
                <EmptyState
                  title="No playlists found"
                  message="User-created playlists will appear here."
                />
              )}

              {!isLoadingPlaylists && filteredPlaylists.length > 0 && (
                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full text-left min-w-[760px] text-sm">
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-100 text-slate-500">
                        <th className="py-2.5 px-4">Name</th>
                        <th className="py-2.5 px-4">Owner</th>
                        <th className="py-2.5 px-4">Visibility</th>
                        <th className="py-2.5 px-4">Tracks</th>
                        <th className="py-2.5 px-4">Created</th>
                        <th className="py-2.5 px-4">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredPlaylists.map((playlist) => (
                        <tr
                          key={playlist.id}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="py-2.5 px-4">
                            <Link
                              to={`/playlist/${playlist.id}`}
                              className="font-bold text-slate-950 hover:text-orange-700"
                            >
                              {playlist.name}
                            </Link>
                          </td>

                          <td className="py-2.5 px-4 text-slate-500 break-all">
                            {playlist.owner_email}
                          </td>

                          <td className="py-2.5 px-4">
                            {playlist.is_public ? (
                              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold whitespace-nowrap">
                                Public
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold whitespace-nowrap">
                                Private
                              </span>
                            )}
                          </td>

                          <td className="py-2.5 px-4 text-slate-500">
                            {playlist.total_tracks || 0}
                          </td>

                          <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                            {playlist.created_at
                              ? new Date(
                                  playlist.created_at
                                ).toLocaleDateString()
                              : 'Unknown'}
                          </td>

                          <td className="py-2.5 px-4">
                            <button
                              type="button"
                              onClick={() =>
                                handleDeletePlaylist(playlist.id)
                              }
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 text-xs font-bold whitespace-nowrap"
                            >
                              <FaTrash />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </div>
      </AppShell>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white border border-slate-100 rounded-[1.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 p-5 border-b border-slate-100">
              <div className="min-w-0">
                <p className="text-orange-700 font-bold mb-2">
                  User Account
                </p>

                <h2 className="text-xl font-black text-slate-950 break-all">
                  {selectedUser.email}
                </h2>

                <p className="text-slate-500 mt-2 text-sm">
                  Created:{' '}
                  {selectedUser.created_at
                    ? new Date(selectedUser.created_at).toLocaleString()
                    : 'Unknown'}
                </p>
              </div>

              <button
                type="button"
                onClick={closeUserModal}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center shrink-0"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-5">
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={userModalForm.email}
                  onChange={handleUserModalChange}
                  disabled={selectedUser.role === 'admin'}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  Role
                </label>

                {selectedUser.role === 'admin' ? (
                  <div className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500">
                    Admin role is locked
                  </div>
                ) : (
                  <select
                    name="role"
                    value={userModalForm.role}
                    onChange={handleUserModalChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400"
                  >
                    <option value="listener">Listener</option>
                    <option value="artist">Artist</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  Approval Status
                </label>

                {selectedUser.role === 'admin' ? (
                  <div className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500">
                    Admin account cannot be disabled here
                  </div>
                ) : (
                  <select
                    value={userModalForm.is_active ? 'approved' : 'pending'}
                    onChange={handleUserApprovalChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending / On hold</option>
                  </select>
                )}
              </div>

              <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4">
                <p className="text-slate-500 text-sm mb-2">Current Status</p>

                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 rounded-full bg-white text-slate-700 text-xs font-bold capitalize">
                    {selectedUser.role}
                  </span>

                  {selectedUser.is_active ? (
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                      Approved
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
                      Pending / On hold
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3">
                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={isSavingUser || selectedUser.role === 'admin'}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-950 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
                  >
                    <FaCheck />
                    {isSavingUser ? 'Saving...' : 'Save Changes'}
                  </button>

                  {selectedUser.role !== 'admin' && (
                    <button
                      type="button"
                      onClick={() => handleToggleUserStatus(selectedUser.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold ${
                        selectedUser.is_active
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {selectedUser.is_active ? <FaClock /> : <FaCheck />}
                      {selectedUser.is_active ? 'Disable' : 'Approve'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={closeUserModal}
                    className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-sm font-bold"
                  >
                    Close
                  </button>
                </div>

                {selectedUser.role !== 'admin' && (
                  <button
                    type="button"
                    onClick={() => handleDeleteUser(selectedUser)}
                    disabled={
                      Number(deletingUserId) === Number(selectedUser.id)
                    }
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
                  >
                    <FaTrash />
                    {Number(deletingUserId) === Number(selectedUser.id)
                      ? 'Deleting...'
                      : 'Delete User'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminDashboard;