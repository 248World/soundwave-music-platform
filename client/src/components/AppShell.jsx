import { useState } from 'react';
import MusicSidebar from './MusicSidebar';
import MusicTopbar from './MusicTopbar';
import soundwaveBackground from '../assets/soundwaveBackground.png';

function AppShell({
  children,
  rightPanel,
  title = 'SoundWave',
  subtitle,
  activePage = 'browse',
  showSearch = true,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search music, artists, playlists...',
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const openMobileSidebar = () => {
    setIsMobileSidebarOpen(true);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div
      className="h-screen text-slate-950 overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${soundwaveBackground})`,
      }}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={closeMobileSidebar}
            className="absolute inset-0 bg-black/50"
            aria-label="Close sidebar overlay"
          />

          <div className="relative h-full w-[285px] max-w-[85vw]">
            <MusicSidebar
              activePage={activePage}
              isMobile
              onNavigate={closeMobileSidebar}
            />
          </div>
        </div>
      )}

      <div className="relative h-full px-3 sm:px-6 lg:px-10 py-4 sm:py-6 z-10">
        <div className="mx-auto max-w-[1500px] h-full">
          <div className="h-full bg-white/85 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden border border-white/60">
            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] h-full min-h-0">
              <MusicSidebar activePage={activePage} />

              <div className="min-w-0 min-h-0 flex flex-col">
                <MusicTopbar
                  title={title}
                  subtitle={subtitle}
                  showSearch={showSearch}
                  searchValue={searchValue}
                  onSearchChange={onSearchChange}
                  searchPlaceholder={searchPlaceholder}
                  onOpenSidebar={openMobileSidebar}
                />

                <div
                  className={`min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 lg:px-8 pb-32 ${
                    rightPanel
                      ? 'grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]'
                      : 'grid grid-cols-1'
                  }`}
                >
                  <main className="min-w-0 py-2">{children}</main>

                  {rightPanel && (
                    <aside className="hidden xl:block min-w-0 py-2">
                      <div className="sticky top-2">{rightPanel}</div>
                    </aside>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed left-1/2 bottom-5 -translate-x-1/2 w-[calc(100%-2rem)] max-w-5xl pointer-events-none z-40">
        <div
          id="soundwave-floating-player-slot"
          className="pointer-events-auto"
        />
      </div>
    </div>
  );
}

export default AppShell;