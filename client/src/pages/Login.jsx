import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import SoundWaveLogo from '../components/SoundWaveLogo';
import soundwaveBackground from '../assets/soundwaveBackground.png';

function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = await login(formData);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div
      className="min-h-screen text-slate-950 overflow-x-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${soundwaveBackground})`,
      }}
    >
      <div className="fixed inset-0 bg-black/25 backdrop-blur-[1px] pointer-events-none" />

      <main className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-5xl min-h-[560px] bg-white/90 backdrop-blur-xl rounded-[1.75rem] shadow-2xl overflow-hidden border border-white/60 grid grid-cols-1 lg:grid-cols-[1fr_1.05fr]">
          <section className="relative hidden lg:flex bg-gradient-to-br from-slate-950/95 via-[#5a2a12]/90 to-orange-600/90 text-white p-8 flex-col justify-between overflow-hidden">
            <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-lime-300/25 blur-2xl" />
            <div className="absolute right-10 top-16 w-56 h-56 rounded-full bg-white/10 border border-white/20" />
            <div className="absolute inset-0 bg-black/10" />

            <div className="relative">
              <SoundWaveLogo size="lg" />
            </div>

            <div className="relative max-w-lg">
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/70 font-bold mb-5">
                Welcome Back
              </p>

              <h2 className="text-4xl font-black tracking-tight leading-tight mb-5">
                Continue your SoundWave experience.
              </h2>

              <p className="text-white/75 leading-7 text-base max-w-md">
                Access your playlists, favorite artists, music library, and
                account dashboard from one place.
              </p>

              <div className="grid grid-cols-3 gap-3 mt-8 max-w-md">
                <div className="rounded-2xl bg-white/10 backdrop-blur p-4">
                  <p className="text-xl font-black">♫</p>
                  <p className="text-xs text-white/60 mt-2">Music</p>
                </div>

                <div className="rounded-2xl bg-white/10 backdrop-blur p-4">
                  <p className="text-xl font-black">★</p>
                  <p className="text-xs text-white/60 mt-2">Artists</p>
                </div>

                <div className="rounded-2xl bg-white/10 backdrop-blur p-4">
                  <p className="text-xl font-black">♥</p>
                  <p className="text-xs text-white/60 mt-2">Favorites</p>
                </div>
              </div>
            </div>

            <div className="relative text-sm text-white/60">
              Stream, discover, and manage your music.
            </div>
          </section>

          <section className="p-6 sm:p-8 lg:p-10 flex items-center">
            <div className="w-full max-w-md mx-auto">
              <div className="mb-7 lg:hidden">
                <SoundWaveLogo size="lg" />
              </div>

              <div className="mb-7">
                <p className="text-sm font-bold text-orange-700 mb-2">
                  Sign In
                </p>

                <h2 className="text-3xl sm:text-4xl font-black text-slate-950 mb-3">
                  Welcome back
                </h2>

                <p className="text-slate-500 leading-7 text-base">
                  Enter your account details to continue.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl bg-red-100 border border-red-200 text-red-700 px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm text-slate-600 mb-2">
                    Email address
                  </label>

                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400 text-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-2">
                    Password
                  </label>

                  <input
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-100 border border-slate-200 outline-none focus:border-slate-400 text-slate-950"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-full bg-slate-950 text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed font-bold text-base"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <p className="text-slate-500 mt-6 text-base">
                New to SoundWave?{' '}
                <Link to="/register" className="text-orange-700 font-bold">
                  Create an account
                </Link>
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Login;