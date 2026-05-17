import { useEffect, useMemo, useReducer, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  FaHeart,
  FaListUl,
  FaPause,
  FaPlay,
  FaStepBackward,
  FaStepForward,
  FaTimes,
} from 'react-icons/fa';
import api from '../api/axios';
import useAuthStore from '../store/useAuthStore';

const initialState = {
  activeTrack: null,
  isVisible: false,
  isPlaying: false,
  showDetails: false,
  isLiked: false,
  likeCount: 0,
  likeError: '',
  duration: '0:00',
  currentTime: '0:00',
  progress: 0,
};

function playerReducer(state, action) {
  switch (action.type) {
    case 'OPEN_PLAYER':
      return {
        ...state,
        activeTrack: action.track,
        isVisible: true,
        isPlaying: false,
        showDetails: false,
        likeError: '',
        duration: '0:00',
        currentTime: '0:00',
        progress: 0,
        likeCount: Number(action.track?.like_count || 0),
      };

    case 'SET_ACTIVE_TRACK':
      return {
        ...state,
        activeTrack: action.track,
        isVisible: true,
        isPlaying: false,
        showDetails: false,
        likeError: '',
        duration: '0:00',
        currentTime: '0:00',
        progress: 0,
        likeCount: Number(action.track?.like_count || 0),
      };

    case 'UPDATE_ACTIVE_TRACK':
      return {
        ...state,
        activeTrack: {
          ...state.activeTrack,
          ...action.updates,
        },
      };

    case 'CLOSE_PLAYER':
      return {
        ...state,
        isVisible: false,
        isPlaying: false,
        showDetails: false,
      };

    case 'SET_PLAYING':
      return {
        ...state,
        isPlaying: action.value,
      };

    case 'TOGGLE_DETAILS':
      return {
        ...state,
        showDetails: !state.showDetails,
      };

    case 'SET_LIKED':
      return {
        ...state,
        isLiked: action.value,
      };

    case 'SET_LIKE_COUNT':
      return {
        ...state,
        likeCount: Number(action.value || 0),
      };

    case 'SET_LIKE_ERROR':
      return {
        ...state,
        likeError: action.value,
      };

    case 'RESET_TIME':
      return {
        ...state,
        duration: '0:00',
        currentTime: '0:00',
        progress: 0,
      };

    case 'SET_DURATION':
      return {
        ...state,
        duration: action.value,
      };

    case 'SET_CURRENT_TIME':
      return {
        ...state,
        currentTime: action.value,
      };

    case 'SET_PROGRESS':
      return {
        ...state,
        progress: action.value,
      };

    default:
      return state;
  }
}

function SoundWavePlayer({ currentTrack, queue = [] }) {
  const audioRef = useRef(null);
  const { user } = useAuthStore();

  const [state, dispatch] = useReducer(playerReducer, initialState);

  const API_BASE_URL = 'http://localhost:5000';
  const track = state.activeTrack;

  const normalizedQueue = useMemo(() => {
    const safeQueue = Array.isArray(queue) ? queue.filter(Boolean) : [];

    if (!track && safeQueue.length === 0) {
      return [];
    }

    const trackExists = safeQueue.some(
      (item) => Number(item.id) === Number(track?.id)
    );

    if (track && !trackExists) {
      return [track, ...safeQueue];
    }

    return safeQueue;
  }, [queue, track]);

  const currentIndex = useMemo(() => {
    if (!track) {
      return -1;
    }

    return normalizedQueue.findIndex(
      (item) => Number(item.id) === Number(track.id)
    );
  }, [normalizedQueue, track]);

  const canGoPrevious = normalizedQueue.length > 1;
  const canGoNext = normalizedQueue.length > 1;

  const formatTime = (seconds) => {
    if (!seconds || Number.isNaN(seconds)) {
      return '0:00';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const audioUrl = track?.audio_url ? `${API_BASE_URL}${track.audio_url}` : '';

  const coverUrl = track?.cover_url
    ? `${API_BASE_URL}${track.cover_url}`
    : 'https://placehold.co/120x120/111827/ffffff?text=SW';

  const markTrackAsPlayed = async (nextTrack) => {
    if (!nextTrack?.id) {
      return;
    }

    try {
      const response = await api.patch(`/tracks/${nextTrack.id}/play`);

      if (response.data.success) {
        dispatch({
          type: 'UPDATE_ACTIVE_TRACK',
          updates: {
            play_count: response.data.track.play_count,
          },
        });
      }
    } catch {
      console.log('Could not update play count.');
    }
  };

  const loadLikedStatus = async (nextTrack) => {
    if (!nextTrack || !user) {
      dispatch({
        type: 'SET_LIKED',
        value: false,
      });

      return;
    }

    try {
      const response = await api.get('/tracks/liked-ids/me');
      const likedIds = response.data.likedTrackIds || [];

      const alreadyLiked = likedIds.some(
        (id) => Number(id) === Number(nextTrack.id)
      );

      dispatch({
        type: 'SET_LIKED',
        value: alreadyLiked,
      });
    } catch {
      dispatch({
        type: 'SET_LIKED',
        value: false,
      });
    }
  };

  useEffect(() => {
    if (!currentTrack) {
      return;
    }

    dispatch({
      type: 'OPEN_PLAYER',
      track: currentTrack,
    });

    loadLikedStatus(currentTrack);
  }, [currentTrack, user]);

  useEffect(() => {
    if (!track || !audioRef.current || !state.isVisible) {
      return;
    }

    audioRef.current.load();

    const startAudio = async () => {
      try {
        await audioRef.current.play();

        dispatch({
          type: 'SET_PLAYING',
          value: true,
        });
      } catch {
        dispatch({
          type: 'SET_PLAYING',
          value: false,
        });
      }
    };

    startAudio();
  }, [track?.id, state.isVisible]);

  const playSelectedTrack = async (nextTrack) => {
    if (!nextTrack) {
      return;
    }

    dispatch({
      type: 'SET_ACTIVE_TRACK',
      track: nextTrack,
    });

    await loadLikedStatus(nextTrack);
    await markTrackAsPlayed(nextTrack);
  };

  const playNextTrack = async () => {
    if (!canGoNext || currentIndex === -1) {
      return;
    }

    const nextIndex =
      currentIndex + 1 >= normalizedQueue.length ? 0 : currentIndex + 1;

    await playSelectedTrack(normalizedQueue[nextIndex]);
  };

  const playPreviousTrack = async () => {
    if (!canGoPrevious || currentIndex === -1) {
      return;
    }

    const previousIndex =
      currentIndex - 1 < 0 ? normalizedQueue.length - 1 : currentIndex - 1;

    await playSelectedTrack(normalizedQueue[previousIndex]);
  };

  const togglePlay = async () => {
    if (!audioRef.current) {
      return;
    }

    if (audioRef.current.paused) {
      try {
        await audioRef.current.play();

        dispatch({
          type: 'SET_PLAYING',
          value: true,
        });
      } catch {
        dispatch({
          type: 'SET_PLAYING',
          value: false,
        });
      }
    } else {
      audioRef.current.pause();

      dispatch({
        type: 'SET_PLAYING',
        value: false,
      });
    }
  };

  const closePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    dispatch({
      type: 'CLOSE_PLAYER',
    });
  };

  const toggleDetails = () => {
    dispatch({
      type: 'TOGGLE_DETAILS',
    });
  };

  const toggleLike = async () => {
    if (!track) {
      return;
    }

    if (!user) {
      dispatch({
        type: 'SET_LIKE_ERROR',
        value: 'Login to like this track.',
      });

      return;
    }

    try {
      dispatch({
        type: 'SET_LIKE_ERROR',
        value: '',
      });

      const response = await api.patch(`/tracks/${track.id}/like`);

      if (response.data.success) {
        dispatch({
          type: 'SET_LIKED',
          value: response.data.liked,
        });

        dispatch({
          type: 'SET_LIKE_COUNT',
          value: response.data.track.like_count || 0,
        });

        dispatch({
          type: 'UPDATE_ACTIVE_TRACK',
          updates: {
            like_count: response.data.track.like_count || 0,
          },
        });
      }
    } catch (error) {
      dispatch({
        type: 'SET_LIKE_ERROR',
        value: error.response?.data?.message || 'Unable to like this track.',
      });
    }
  };

  const handleLoadedMetadata = () => {
    const totalDuration = audioRef.current?.duration || 0;

    dispatch({
      type: 'SET_DURATION',
      value: formatTime(totalDuration),
    });
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const current = audio.currentTime || 0;
    const total = audio.duration || 0;

    dispatch({
      type: 'SET_CURRENT_TIME',
      value: formatTime(current),
    });

    if (total > 0) {
      dispatch({
        type: 'SET_PROGRESS',
        value: (current / total) * 100,
      });
    }
  };

  const handleEnded = async () => {
    dispatch({
      type: 'SET_PLAYING',
      value: false,
    });

    dispatch({
      type: 'RESET_TIME',
    });

    if (normalizedQueue.length > 1) {
      await playNextTrack();
    }
  };

  const handleSeek = (event) => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const nextProgress = Number(event.target.value);
    const total = audio.duration || 0;

    if (total > 0) {
      audio.currentTime = (nextProgress / 100) * total;

      dispatch({
        type: 'SET_PROGRESS',
        value: nextProgress,
      });
    }
  };

  if (!track || !state.isVisible) {
    return null;
  }

  const player = (
    <div className="relative w-full">
      {state.showDetails && (
        <div className="absolute right-0 bottom-[76px] w-full sm:w-80 rounded-[1.25rem] bg-[#4a4747]/95 backdrop-blur-xl text-white shadow-2xl border border-white/10 p-3">
          <div className="flex items-center gap-3">
            <img
              src={coverUrl}
              alt={track.title || 'Track cover'}
              className="w-14 h-14 rounded-xl object-cover"
            />

            <div className="min-w-0 flex-1">
              <p className="text-xs text-white/50">Now playing</p>

              <h3 className="font-black text-base truncate">
                {track.title || 'Unknown track'}
              </h3>

              <p className="text-xs text-white/60 truncate">
                {track.artist_name || 'Unknown artist'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="rounded-xl bg-white/10 p-2">
              <p className="text-[11px] text-white/50">Plays</p>
              <p className="font-black text-sm">{track.play_count || 0}</p>
            </div>

            <div className="rounded-xl bg-white/10 p-2">
              <p className="text-[11px] text-white/50">Likes</p>
              <p className="font-black text-sm">{state.likeCount}</p>
            </div>

            <div className="rounded-xl bg-white/10 p-2">
              <p className="text-[11px] text-white/50">Queue</p>
              <p className="font-black text-sm">
                {currentIndex >= 0
                  ? `${currentIndex + 1}/${normalizedQueue.length}`
                  : '1/1'}
              </p>
            </div>
          </div>

          {state.likeError && (
            <p className="mt-3 text-xs text-red-300">{state.likeError}</p>
          )}
        </div>
      )}

      <div className="w-full rounded-[1.35rem] bg-[#4a4747]/95 backdrop-blur-xl text-white shadow-2xl border border-white/10 px-3 sm:px-4 py-2.5">
        <audio
          ref={audioRef}
          src={audioUrl}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 min-w-0 w-[130px] sm:w-[210px]">
            <img
              src={coverUrl}
              alt={track.title || 'Track cover'}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover shrink-0"
            />

            <div className="min-w-0">
              <p className="text-[11px] text-white/60 truncate">
                {track.artist_name || 'Unknown artist'}
              </p>

              <p className="font-bold text-xs sm:text-sm truncate">
                {track.title || 'Unknown track'}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              onClick={playPreviousTrack}
              disabled={!canGoPrevious}
              className="text-white/80 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Previous track"
              aria-label="Previous track"
            >
              <FaStepBackward />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-lime-300 text-slate-950 flex items-center justify-center hover:bg-lime-200"
              title={state.isPlaying ? 'Pause' : 'Play'}
              aria-label={state.isPlaying ? 'Pause' : 'Play'}
            >
              {state.isPlaying ? (
                <FaPause className="text-sm" />
              ) : (
                <FaPlay className="text-sm ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={playNextTrack}
              disabled={!canGoNext}
              className="text-white/80 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next track"
              aria-label="Next track"
            >
              <FaStepForward />
            </button>
          </div>

          <button
            type="button"
            onClick={togglePlay}
            className="sm:hidden w-9 h-9 rounded-full bg-lime-300 text-slate-950 flex items-center justify-center hover:bg-lime-200 shrink-0"
            title={state.isPlaying ? 'Pause' : 'Play'}
            aria-label={state.isPlaying ? 'Pause' : 'Play'}
          >
            {state.isPlaying ? (
              <FaPause className="text-sm" />
            ) : (
              <FaPlay className="text-sm ml-0.5" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="hidden md:flex items-center gap-[2px] h-8 overflow-hidden">
              {Array.from({ length: 52 }).map((_, index) => {
                const height = 8 + ((index * 17) % 24);
                const active = index < Math.floor(state.progress / 1.95);

                return (
                  <span
                    key={index}
                    className={`w-[3px] rounded-full ${
                      active ? 'bg-lime-300' : 'bg-white/20'
                    }`}
                    style={{ height: `${height}px` }}
                  />
                );
              })}
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={state.progress}
              onChange={handleSeek}
              className="md:hidden w-full accent-lime-300"
              aria-label="Seek track"
            />
          </div>

          <span className="hidden sm:block text-xs text-white/80 min-w-[38px] text-right">
            {state.duration}
          </span>

          <div className="flex items-center gap-2 sm:gap-3 text-white/75">
            <button
              type="button"
              onClick={toggleDetails}
              className={`hover:text-white ${
                state.showDetails ? 'text-lime-300' : ''
              }`}
              title="Track details"
              aria-label="Track details"
            >
              <FaListUl />
            </button>

            <button
              type="button"
              onClick={toggleLike}
              className={`hover:text-white ${
                state.isLiked ? 'text-lime-300' : ''
              }`}
              title={state.isLiked ? 'Unlike track' : 'Like track'}
              aria-label={state.isLiked ? 'Unlike track' : 'Like track'}
            >
              <FaHeart />
            </button>

            <button
              type="button"
              onClick={closePlayer}
              className="hover:text-white"
              title="Close player"
              aria-label="Close player"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="mt-1.5 md:hidden flex items-center justify-between text-[11px] text-white/60">
          <span>{state.currentTime}</span>
          <span>{state.duration}</span>
        </div>
      </div>
    </div>
  );

  const slot = document.getElementById('soundwave-floating-player-slot');

  if (slot) {
    return createPortal(player, slot);
  }

  return (
    <div className="fixed left-1/2 bottom-4 -translate-x-1/2 w-[calc(100%-1.25rem)] max-w-4xl z-50">
      {player}
    </div>
  );
}

export default SoundWavePlayer;