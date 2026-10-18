import { useEffect, useRef, useState } from "react";
import {
  Home,
  Compass,
  Library,
  Search,
  Sun,
  Moon,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
  MoreHorizontal,
  Volume2,
  ListMusic,
  Clock3,
  Sparkles,
  Music2,
  Plus,
  ExternalLink,
  Trash2,
} from "lucide-react";
import "./index.css";

type Track = {
  title: string;
  artist: string;
  album: string;
  cover: string;
  audioSrc: string;
};

type CustomPlaylist = {
  id: string;
  name: string;
  trackSources: string[];
};

const tracks: Track[] = [
  {
    title: "Track 1",
    artist: "Your music",
    album: "CarryOn Library",
    cover:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=500&q=85",
    audioSrc: "/audio/track-1.mp3",
  },
  {
    title: "Track 2",
    artist: "Your music",
    album: "CarryOn Library",
    cover:
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=500&q=85",
    audioSrc: "/audio/track-2.mp3",
  },
  {
    title: "Track 3",
    artist: "Your music",
    album: "CarryOn Library",
    cover:
      "https://images.unsplash.com/photo-1470252649378-9c29740a9a8?auto=format&fit=crop&w=500&q=85",
    audioSrc: "/audio/track-3.mp3",
  },
  {
    title: "Track 4",
    artist: "Your music",
    album: "CarryOn Library",
    cover:
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=500&q=85",
    audioSrc: "/audio/track-4.mp3",
  },
  {
    title: "Track 5",
    artist: "Your music",
    album: "CarryOn Library",
    cover:
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=500&q=85",
    audioSrc: "/audio/track-5.mp3",
  },
];

const playlists = [
  {
    title: "Late Night Drive",
    description: "For the long way home",
    cover:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "Soft Focus",
    description: "A little calm, a little clarity",
    cover:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "Golden Hour",
    description: "Warm sounds for slow evenings",
    cover:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "CarryOn Replay",
    description: "Your year, on repeat",
    cover:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=700&q=85",
  },
];

const spotifyPlaylists = [
  { title: "Playlist 1", id: "46MShcdr9VVn2nLSL6YETX" },
  { title: "Playlist 2", id: "2QpGxS20H9pAjmjsMHuHew" },
  { title: "Playlist 3", id: "4FNy78mv64qBzBZxW5u0Fx" },
];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function readSavedPlaylists(): CustomPlaylist[] {
  try {
    const saved = localStorage.getItem("carryon-playlists");
    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is CustomPlaylist =>
        item !== null &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        Array.isArray(item.trackSources) &&
        item.trackSources.every((src: unknown) => typeof src === "string")
    );
  } catch {
    return [];
  }
}

function App() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return localStorage.getItem("carryon-theme") === "light"
      ? "light"
      : "dark";
  });

  const [currentTrack, setCurrentTrack] = useState<Track>(tracks[0]);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [search, setSearch] = useState("");
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const [likedTracks, setLikedTracks] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("carryon-liked") || "[]");
    } catch {
      return [];
    }
  });

  const [recentTracks, setRecentTracks] = useState<string[]>([]);

  // Custom playlists are loaded from localStorage when the app starts.
  const [customPlaylists, setCustomPlaylists] =
    useState<CustomPlaylist[]>(readSavedPlaylists);

  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    null
  );

  const liked = likedTracks.includes(currentTrack.audioSrc);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("carryon-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("carryon-liked", JSON.stringify(likedTracks));
  }, [likedTracks]);

  useEffect(() => {
    localStorage.setItem(
      "carryon-playlists",
      JSON.stringify(customPlaylists)
    );
  }, [customPlaylists]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

    if (playing) {
      audio.play().catch((error: unknown) => {
        console.error("Could not play audio:", error);
        setPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [playing, currentTrack, volume]);

  const filteredTracks = tracks.filter((track) => {
    const term = search.toLowerCase().trim();

    return (
      track.title.toLowerCase().includes(term) ||
      track.artist.toLowerCase().includes(term) ||
      track.album.toLowerCase().includes(term)
    );
  });

  const selectedPlaylist = customPlaylists.find(
    (playlist) => playlist.id === selectedPlaylistId
  );

  const selectedPlaylistTracks = selectedPlaylist
    ? selectedPlaylist.trackSources
        .map((src) => tracks.find((track) => track.audioSrc === src))
        .filter((track): track is Track => Boolean(track))
    : [];

  function playTrack(track: Track) {
    if (track.audioSrc === currentTrack.audioSrc) {
      setPlaying(true);
      return;
    }

    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(0);
    setPlaying(true);

    setRecentTracks((previous) => [
      track.audioSrc,
      ...previous.filter((src) => src !== track.audioSrc),
    ]);
  }

  function skipTrack(direction: "next" | "previous") {
    const currentIndex = tracks.findIndex(
      (track) => track.audioSrc === currentTrack.audioSrc
    );

    let nextIndex: number;

    if (shuffle && direction === "next" && tracks.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * tracks.length);
      } while (nextIndex === currentIndex);
    } else {
      nextIndex =
        direction === "next"
          ? (currentIndex + 1) % tracks.length
          : (currentIndex - 1 + tracks.length) % tracks.length;
    }

    playTrack(tracks[nextIndex]);
  }

  function togglePlay() {
    const audio = audioRef.current;

    if (playing) {
      setPlaying(false);
    } else {
      if (audio?.ended) audio.currentTime = 0;
      setPlaying(true);
    }
  }

  function handleSeek(value: number) {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(value)) return;

    audio.currentTime = value;
    setCurrentTime(value);
  }

  function toggleLiked(track: Track) {
    setLikedTracks((previous) =>
      previous.includes(track.audioSrc)
        ? previous.filter((src) => src !== track.audioSrc)
        : [...previous, track.audioSrc]
    );
  }

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  function handleEnded() {
    if (repeat) {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => setPlaying(false));
      }
      return;
    }

    skipTrack("next");
  }

  // Create a playlist and select it.
  function createPlaylist() {
    const name = window.prompt("What would you like to name your playlist?");
    if (!name || !name.trim()) return;

    const newPlaylist: CustomPlaylist = {
      id: crypto.randomUUID(),
      name: name.trim(),
      trackSources: [],
    };

    setCustomPlaylists((previous) => [...previous, newPlaylist]);
    setSelectedPlaylistId(newPlaylist.id);
  }

  // Add a track to a playlist, without adding duplicates.
  function addTrackToPlaylist(playlistId: string, track: Track) {
    setCustomPlaylists((previous) =>
      previous.map((playlist) => {
        if (playlist.id !== playlistId) return playlist;

        if (playlist.trackSources.includes(track.audioSrc)) {
          return playlist;
        }

        return {
          ...playlist,
          trackSources: [...playlist.trackSources, track.audioSrc],
        };
      })
    );
  }

  // Remove a track from a playlist.
  function removeTrackFromPlaylist(playlistId: string, trackSrc: string) {
    setCustomPlaylists((previous) =>
      previous.map((playlist) =>
        playlist.id === playlistId
          ? {
              ...playlist,
              trackSources: playlist.trackSources.filter(
                (src) => src !== trackSrc
              ),
            }
          : playlist
      )
    );
  }

  function deletePlaylist(playlistId: string) {
    const playlist = customPlaylists.find((item) => item.id === playlistId);
    if (!playlist) return;

    const confirmed = window.confirm(`Delete "${playlist.name}"?`);
    if (!confirmed) return;

    setCustomPlaylists((previous) =>
      previous.filter((item) => item.id !== playlistId)
    );

    if (selectedPlaylistId === playlistId) {
      setSelectedPlaylistId(null);
    }
  }

  return (
    <div className="app-shell">
      <audio
        ref={audioRef}
        src={currentTrack.audioSrc}
        preload="metadata"
        onTimeUpdate={(event) =>
          setCurrentTime(event.currentTarget.currentTime)
        }
        onLoadedMetadata={(event) =>
          setDuration(event.currentTarget.duration)
        }
        onEnded={handleEnded}
        onError={() => {
          setPlaying(false);
          console.error(`Unable to load ${currentTrack.audioSrc}`);
        }}
      />

      <aside className="sidebar">
        <a className="brand" href="#" aria-label="CarryOn home">
          <span className="brand-mark">
            <Music2 size={21} strokeWidth={2.5} />
          </span>
          <span>
            carry<span className="brand-accent">on</span>
          </span>
        </a>

        <div className="sidebar-section">
          <p className="sidebar-label">MENU</p>
          <button className="nav-item active">
            <Home size={18} />
            <span>Home</span>
          </button>
          <button
            className="nav-item"
            onClick={() =>
              document
                .querySelector(".spotify-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <Compass size={18} />
            <span>Explore</span>
          </button>
          <button
            className="nav-item"
            onClick={() =>
              document
                .querySelector<HTMLInputElement>(".search-box input")
                ?.focus()
            }
          >
            <Search size={18} />
            <span>Search</span>
          </button>
          <button
            className="nav-item"
            onClick={() =>
              document
                .querySelector(".track-list")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <Library size={18} />
            <span>Your library</span>
          </button>
        </div>

        <div className="sidebar-section playlist-nav">
          <div className="sidebar-label-row">
            <p className="sidebar-label">YOUR PLAYLISTS</p>
            <button
              className="icon-button small"
              aria-label="Create playlist"
              title="Create playlist"
              onClick={createPlaylist}
            >
              <Plus size={16} />
            </button>
          </div>

          {customPlaylists.length === 0 ? (
            <p className="playlist-empty-hint">Create your first playlist</p>
          ) : (
            customPlaylists.map((playlist) => (
              <button
                className={`playlist-nav-item ${
                  selectedPlaylistId === playlist.id ? "selected" : ""
                }`}
                key={playlist.id}
                onClick={() => setSelectedPlaylistId(playlist.id)}
              >
                <span className="playlist-dot" />
                <span className="playlist-nav-name">{playlist.name}</span>
              </button>
            ))
          )}
        </div>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <Sparkles size={17} />
            <div>
              <strong>Make it yours</strong>
              <p>Your sound, your space.</p>
            </div>
          </div>

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </button>

          <div className="profile">
            <div className="avatar">C</div>
            <div className="profile-info">
              <strong>Music lover</strong>
              <span>Local library</span>
            </div>
            <MoreHorizontal size={20} />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="search-box">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search songs, artists, albums..."
              aria-label="Search music"
            />
            {search && (
              <button
                className="clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="topbar-actions">
            <span className="topbar-note">Your soundtrack, your way.</span>
            <button
              className="top-theme-button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title="Toggle dark/light mode"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">YOUR MUSIC, YOUR MOMENT</p>
              <h1>
                Find your <span>flow.</span>
              </h1>
              <p className="welcome-subtitle">
                A little music goes a long way. Pick up where your mood takes you.
              </p>
            </div>

            <div className="welcome-orb" aria-hidden="true">
              <div className="orb-ring ring-one" />
              <div className="orb-ring ring-two" />
              <div className="orb-core">
                <Music2 size={34} />
              </div>
            </div>
          </section>

          <section className="section-block">
            <div className="section-heading">
              <div>
                <p className="eyebrow">MADE FOR YOU</p>
                <h2>Pick up the vibe</h2>
              </div>
              <button className="text-button">
                See all <span>↗</span>
              </button>
            </div>

            <div className="playlist-grid">
              {playlists.map((playlist, index) => (
                <button
                  className={`playlist-card playlist-card-${index}`}
                  key={playlist.title}
                  onClick={() => playTrack(tracks[index % tracks.length])}
                >
                  <img src={playlist.cover} alt="" />
                  <div className="playlist-card-overlay" />
                  <div className="playlist-card-info">
                    <span className="playlist-kicker">
                      {index === 3 ? "YOUR YEAR IN SOUND" : "CURATED FOR YOU"}
                    </span>
                    <strong>{playlist.title}</strong>
                    <span>{playlist.description}</span>
                  </div>
                  <span className="card-play">
                    <Play size={17} fill="currentColor" />
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="section-block spotify-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">FROM SPOTIFY</p>
                <h2>Featured playlists</h2>
              </div>
              <span className="spotify-note">Spotify embeds</span>
            </div>

            <div className="spotify-grid">
              {spotifyPlaylists.map((playlist, index) => (
                <article className="spotify-card" key={playlist.id}>
                  <div className="spotify-card-heading">
                    <span className="spotify-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3>{playlist.title}</h3>
                    <a
                      href={`https://open.spotify.com/playlist/${playlist.id}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${playlist.title} on Spotify`}
                      title="Open on Spotify"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                  <iframe
                    title={playlist.title}
                    src={`https://open.spotify.com/embed/playlist/${playlist.id}?utm_source=generator`}
                    width="100%"
                    height="352"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                </article>
              ))}
            </div>
          </section>

          <section className="section-block">
            <div className="section-heading">
              <div>
                <p className="eyebrow">YOUR LOCAL LIBRARY</p>
                <h2>Tracks</h2>
              </div>
              <span className="spotify-note">{filteredTracks.length} tracks</span>
            </div>

            <div className="track-list">
              {filteredTracks.length === 0 ? (
                <div className="empty-state">
                  No matches. Try another song, artist, or album.
                </div>
              ) : (
                filteredTracks.map((track, index) => (
                  <div
                    className={`track-row ${
                      currentTrack.audioSrc === track.audioSrc
                        ? "current-track"
                        : ""
                    }`}
                    key={track.audioSrc}
                  >
                    <span className="track-number">
                      {currentTrack.audioSrc === track.audioSrc && playing ? (
                        <span className="playing-bars">
                          <i />
                          <i />
                          <i />
                        </span>
                      ) : (
                        String(index + 1).padStart(2, "0")
                      )}
                    </span>

                    <button
                      className="track-cover-button"
                      onClick={() => playTrack(track)}
                      aria-label={`Play ${track.title}`}
                    >
                      <img className="track-cover" src={track.cover} alt="" />
                    </button>

                    <button
                      className="track-title-button"
                      onClick={() => playTrack(track)}
                    >
                      <strong>{track.title}</strong>
                      <span>{track.artist}</span>
                    </button>

                    <span className="track-album">{track.album}</span>

                    <button
                      className={`icon-button like-button ${
                        likedTracks.includes(track.audioSrc) ? "liked" : ""
                      }`}
                      onClick={() => toggleLiked(track)}
                      aria-label={
                        likedTracks.includes(track.audioSrc)
                          ? `Unlike ${track.title}`
                          : `Like ${track.title}`
                      }
                    >
                      <Heart
                        size={17}
                        fill={
                          likedTracks.includes(track.audioSrc)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>

                    <span className="track-duration">
                      {currentTrack.audioSrc === track.audioSrc && duration
                        ? formatTime(duration)
                        : "—"}
                    </span>

                    <select
                      className="playlist-add-select"
                      aria-label={`Add ${track.title} to a playlist`}
                      value=""
                      onChange={(event) => {
                        if (event.target.value) {
                          addTrackToPlaylist(event.target.value, track);
                        }
                      }}
                      title="Add to custom playlist"
                    >
                      <option value="">+ Playlist</option>
                      {customPlaylists.map((playlist) => (
                        <option key={playlist.id} value={playlist.id}>
                          {playlist.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))
              )}
            </div>
          </section>

          {selectedPlaylist && (
            <section className="section-block custom-playlist-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">YOUR CUSTOM PLAYLIST</p>
                  <h2>{selectedPlaylist.name}</h2>
                  <span className="spotify-note">
                    {selectedPlaylistTracks.length}{" "}
                    {selectedPlaylistTracks.length === 1 ? "track" : "tracks"}
                  </span>
                </div>

                <div className="custom-playlist-actions">
                  <button
                    className="text-button"
                    onClick={() => deletePlaylist(selectedPlaylist.id)}
                    title="Delete this playlist"
                  >
                    <Trash2 size={16} />
                    Delete playlist
                  </button>
                  <button
                    className="text-button"
                    onClick={() => setSelectedPlaylistId(null)}
                  >
                    Close
                  </button>
                </div>
              </div>

              {selectedPlaylistTracks.length === 0 ? (
                <div className="empty-state">
                  This playlist is empty. Use the “+ Playlist” menu beside a
                  track to add songs here.
                </div>
              ) : (
                <div className="track-list">
                  {selectedPlaylistTracks.map((track, index) => (
                    <div className="track-row" key={track.audioSrc}>
                      <span className="track-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <button
                        className="track-cover-button"
                        onClick={() => playTrack(track)}
                        aria-label={`Play ${track.title}`}
                      >
                        <img className="track-cover" src={track.cover} alt="" />
                      </button>

                      <button
                        className="track-title-button"
                        onClick={() => playTrack(track)}
                      >
                        <strong>{track.title}</strong>
                        <span>{track.artist}</span>
                      </button>

                      <span className="track-album">{track.album}</span>

                      <button
                        className="icon-button"
                        onClick={() =>
                          removeTrackFromPlaylist(
                            selectedPlaylist.id,
                            track.audioSrc
                          )
                        }
                        aria-label={`Remove ${track.title} from ${selectedPlaylist.name}`}
                        title="Remove from playlist"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          <section className="replay-banner">
            <div className="replay-art">
              <span>carryon</span>
              <strong>REPLAY</strong>
              <div className="replay-art-shape" />
            </div>

            <div className="replay-copy">
              <p className="eyebrow">A LITTLE LOOK BACK</p>
              <h2>
                Your year. <span>Your sound.</span>
              </h2>
              <p>
                Your CarryOn local library is ready to play. Listening history
                is tracked during this session.
              </p>
              <button
                className="replay-button"
                onClick={() =>
                  document
                    .querySelector(".track-list")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <Sparkles size={16} />
                Browse your tracks
              </button>
            </div>
          </section>
        </div>
      </main>

      <footer className="player">
        <div className="player-track">
          <img src={currentTrack.cover} alt="" />
          <div className="player-track-info">
            <strong>{currentTrack.title}</strong>
            <span>{currentTrack.artist}</span>
          </div>
          <button
            className={`icon-button player-like ${liked ? "liked" : ""}`}
            onClick={() => toggleLiked(currentTrack)}
            aria-label={liked ? "Unlike current track" : "Like current track"}
          >
            <Heart size={17} fill={liked ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="player-controls">
          <div className="control-buttons">
            <button
              className={`player-control secondary ${shuffle ? "liked" : ""}`}
              onClick={() => setShuffle((value) => !value)}
              aria-label={`Shuffle ${shuffle ? "on" : "off"}`}
              title={`Shuffle ${shuffle ? "on" : "off"}`}
            >
              <Shuffle size={16} />
            </button>

            <button
              className="player-control"
              onClick={() => skipTrack("previous")}
              aria-label="Previous track"
            >
              <SkipBack size={18} fill="currentColor" />
            </button>

            <button
              className="play-button"
              onClick={togglePlay}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? (
                <Pause size={19} fill="currentColor" />
              ) : (
                <Play size={19} fill="currentColor" />
              )}
            </button>

            <button
              className="player-control"
              onClick={() => skipTrack("next")}
              aria-label="Next track"
            >
              <SkipForward size={18} fill="currentColor" />
            </button>

            <button
              className={`player-control secondary ${repeat ? "liked" : ""}`}
              onClick={() => setRepeat((value) => !value)}
              aria-label={`Repeat current track ${repeat ? "on" : "off"}`}
              title={`Repeat current track ${repeat ? "on" : "off"}`}
            >
              <Repeat size={16} />
            </button>
          </div>

          <div className="progress-row">
            <span>{formatTime(currentTime)}</span>
            <input
              className="progress-track"
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(currentTime, duration || 0)}
              onChange={(event) => handleSeek(Number(event.target.value))}
              aria-label="Seek audio"
              disabled={!duration}
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="player-extra">
          <button
            className="player-control secondary"
            aria-label="Show queue"
            title="Queue: tracks in your library"
            onClick={() =>
              document
                .querySelector(".track-list")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <ListMusic size={18} />
          </button>
          <button
            className="player-control secondary"
            aria-label="Show recently played"
            title="Recently played this session"
            onClick={() => {
              const recent = recentTracks
                .map((src) => tracks.find((track) => track.audioSrc === src))
                .filter(Boolean) as Track[];

              if (recent.length) playTrack(recent[0]);
            }}
          >
            <Clock3 size={18} />
          </button>
          <Volume2 size={18} className="volume-icon" />
          <input
            className="volume-track"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            aria-label="Volume"
          />
        </div>
      </footer>
    </div>
  );
}

export default App;