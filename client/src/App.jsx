import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import TrackPage from './pages/TrackPage';
import AdminDashboard from './pages/AdminDashboard';
import ArtistPage from './pages/ArtistPage';
import Artists from './pages/Artists';
import EditArtistProfile from './pages/EditArtistProfile';
import PlaylistPage from './pages/PlaylistPage';
import PublicPlaylists from './pages/PublicPlaylists';
import NotFound from './pages/NotFound';
import useAuthStore from './store/useAuthStore';

function ProtectedRoute({ children }) {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function ArtistRoute({ children }) {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'artist') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/artists" element={<Artists />} />

        <Route path="/playlists" element={<PublicPlaylists />} />

        <Route path="/track/:id" element={<TrackPage />} />

        <Route path="/artist/:id" element={<ArtistPage />} />

        <Route path="/playlist/:id" element={<PlaylistPage />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <ArtistRoute>
              <Upload />
            </ArtistRoute>
          }
        />

        <Route
          path="/artist-profile/edit"
          element={
            <ArtistRoute>
              <EditArtistProfile />
            </ArtistRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;