import React, { useState, useEffect, useRef } from 'react';
import { 
  Music, Download, Search, Play, Pause, Volume2, VolumeX,
  CheckCircle2, HardDrive, Check, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight,
  Heart, Disc, Compass, Flame, ListMusic, ShieldCheck, Share2, Sliders,
  Radio, Sparkles, User, SkipBack, SkipForward, Repeat, Shuffle, FileAudio,
  Menu, X
} from 'lucide-react';
import { apiClient } from './services/apiClient';

const SPOTLIGHT_ARTISTS = [
  {
    name: 'Dadju',
    role: 'Artiste R&B / Afrobeats',
    listeners: '4,150,820',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop',
    bio: 'Pape du R&B contemporain francophone, auteur des albums à succès Gentleman 2.0, Cullinan et Héritage.',
    topHits: ['Reine', 'Compliqué', 'Mon soleil', 'I love you', 'Jaloux']
  },
  {
    name: 'Burna Boy',
    role: 'Afrobeats Giant',
    listeners: '18,400,000',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop',
    bio: 'Artiste nigérian récompensé aux Grammy Awards, pionnier du son Afro-fusion mondial.',
    topHits: ['City Boys', 'Last Last', 'It\'s Plenty', 'Ye', 'On The Low']
  },
  {
    name: 'Wizkid',
    role: 'Afro-fusion Legend',
    listeners: '14,200,000',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop',
    bio: 'L\'icône mondiale d\'Afrobeats, créateur de Made in Lagos et collaborateur international.',
    topHits: ['Essence', 'Ojuelegba', 'Joro', 'Bad To Me', 'Ginger']
  },
  {
    name: 'Michael Jackson',
    role: 'King of Pop',
    listeners: '42,000,000',
    cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop',
    bio: 'Le Roi de la Pop dont la discographie révolutionnaire continue d\'inspirer des générations.',
    topHits: ['Beat It', 'Billie Jean', 'Smooth Criminal', 'Thriller', 'Bad']
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Tous');
  const [selectedSubFilter, setSelectedSubFilter] = useState('Tous');
  const [format, setFormat] = useState('MP3');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Search Data
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentArtistInfo, setCurrentArtistInfo] = useState(SPOTLIGHT_ARTISTS[0]);

  // Saved State
  const [favorites, setFavorites] = useState([]);
  const [downloadHistory, setDownloadHistory] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);

  // Pagination
  const [showFullDiscography, setShowFullDiscography] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Player State
  const [activeTrack, setActiveTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const audioRef = useRef(null);

  const genresList = ['Tous', 'Dadju', 'Afrobeats', 'R&B / Soul', 'Hip-Hop Francophone', 'Pop Internationale', 'Synthwave'];
  const subFilters = ['Tous', 'Clips Officiels', 'Albums & EPs', 'Remixes'];

  // Initial auto search for Dadju discography on mount
  useEffect(() => {
    executeSearch('Dadju');
  }, []);

  // Handle Playback State
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.warn("Autoplay block:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, activeTrack]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.volume = volume || 0.8;
    } else {
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const executeSearch = async (queryText) => {
    if (!queryText || !queryText.trim()) return;
    setIsSearching(true);
    setCurrentPage(1);
    
    const matchedArtist = SPOTLIGHT_ARTISTS.find(a => a.name.toLowerCase().includes(queryText.toLowerCase()));
    if (matchedArtist) {
      setCurrentArtistInfo(matchedArtist);
    }

    const apiRes = await apiClient.search(queryText);
    setIsSearching(false);

    if (apiRes && apiRes.tracks && apiRes.tracks.length > 0) {
      setSearchResults(apiRes.tracks);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const togglePlayTrack = (track) => {
    if (activeTrack && activeTrack.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveTrack(track);
      setIsPlaying(true);
    }
  };

  const toggleFavoriteTrack = (track) => {
    if (favorites.some(t => t.id === track.id)) {
      setFavorites(favorites.filter(t => t.id !== track.id));
    } else {
      setFavorites([...favorites, track]);
    }
  };

  const triggerDirectDownload = (track) => {
    setDownloadingId(track.id);
    
    setTimeout(() => {
      setDownloadingId(null);
      if (!downloadHistory.some(t => t.id === track.id)) {
        setDownloadHistory([track, ...downloadHistory]);
      }

      const downloadUrl = track.streamUrl || `http://localhost:5000/api/v1/download/file?vid=${track.id}&title=${encodeURIComponent(track.title)}`;
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.setAttribute('download', `${track.title}.${format.toLowerCase()}`);
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    }, 800);
  };

  const filteredTracks = searchResults.filter(t => {
    if (selectedSubFilter === 'Clips Officiels') return t.title.toLowerCase().includes('clip') || t.title.toLowerCase().includes('official');
    if (selectedSubFilter === 'Albums & EPs') return t.title.toLowerCase().includes('album') || t.duration.includes('40:') || t.duration.includes('50:');
    if (selectedSubFilter === 'Remixes') return t.title.toLowerCase().includes('remix') || t.title.toLowerCase().includes('mix');
    return true;
  });

  const totalPages = Math.ceil(filteredTracks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTracks = showFullDiscography 
    ? filteredTracks.slice(startIndex, startIndex + itemsPerPage) 
    : filteredTracks.slice(0, 8);

  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      
      {/* HTML5 Audio Player Engine */}
      {activeTrack && (
        <audio 
          ref={audioRef} 
          src={activeTrack.streamUrl} 
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => {
            if (isRepeat) {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
              }
            } else {
              setIsPlaying(false);
            }
          }}
        />
      )}

      {/* Responsive Left Studio Sidebar Navigation */}
      <aside className="studio-sidebar" style={{
        width: '260px',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        padding: '24px 18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100
      }}>
        <div>
          {/* Logo Branding */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', paddingLeft: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
              }}>
                <Music size={18} color="#000" />
              </div>
              <div>
                <h1 style={{ fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.3px', color: '#fff' }}>
                  Sonic<span style={{ color: 'var(--accent-primary)' }}>Stream</span>
                </h1>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>STUDIO AUDIO</p>
              </div>
            </div>

            {/* Mobile Menu Toggle Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'none' }}
              className="mobile-menu-btn"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { id: 'explore', label: 'Découvrir', icon: Compass },
              { id: 'discography', label: 'Discographie', icon: Disc },
              { id: 'library', label: 'Favoris', icon: Heart, count: favorites.length },
              { id: 'downloads', label: 'Téléchargements', icon: HardDrive, count: downloadHistory.length },
            ].map(item => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id === 'discography') {
                      setShowFullDiscography(true);
                      if (searchResults.length === 0) executeSearch('Dadju');
                    } else if (item.id === 'explore') {
                      setShowFullDiscography(false);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: isActive ? 'var(--bg-surface)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: isActive ? '700' : '500',
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <IconComp size={17} color={isActive ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.08)', padding: '2px 7px', borderRadius: '10px', color: 'var(--text-muted)' }}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Storage Widget Card */}
        <div className="studio-card sidebar-storage-card" style={{ padding: '14px', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <FileAudio size={15} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Stockage Local</span>
          </div>
          <div style={{ height: '4px', background: '#27272a', borderRadius: '2px', overflow: 'hidden', marginBottom: '6px' }}>
            <div style={{ width: '28%', height: '100%', background: 'var(--accent-primary)' }}></div>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            4.2 GB libres • MP3 320k / FLAC
          </p>
        </div>
      </aside>

      {/* Responsive Main Workspace */}
      <div className="main-workspace" style={{ flex: 1, paddingBottom: activeTrack ? '95px' : '30px', overflowX: 'hidden' }}>
        
        {/* Responsive Header Search & Quality Bar */}
        <header className="top-header" style={{
          padding: '16px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-header)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 90
        }}>
          {/* Main Search Input Form */}
          <form className="header-search-form" onSubmit={handleSearchSubmit} style={{ width: '100%', maxWidth: '560px', display: 'flex', gap: '8px', background: 'var(--bg-card)', padding: '5px 6px 5px 14px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <Search size={18} color="var(--text-muted)" style={{ alignSelf: 'center' }} />
            <input 
              type="text" 
              placeholder="Rechercher un artiste (Dadju, Burna Boy, Wizkid), un titre..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.88rem', fontFamily: 'inherit' }}
            />
            <button type="submit" className="btn-emerald" disabled={isSearching} style={{ padding: '7px 16px', fontSize: '0.82rem' }}>
              {isSearching ? '...' : 'Rechercher'}
            </button>
          </form>

          {/* Quality Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', paddingRight: '4px' }}>Format:</span>
              {['MP3', 'FLAC', 'AAC'].map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  style={{
                    background: format === f ? 'var(--accent-primary)' : 'transparent',
                    border: 'none',
                    color: format === f ? '#000' : 'var(--text-secondary)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    fontWeight: '700'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.1)', padding: '5px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-primary-glow)' }}>
              <ShieldCheck size={14} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '700' }}>Master Audio HD</span>
            </div>
          </div>
        </header>

        {/* Content Workspace Padding */}
        <main className="main-content-padding" style={{ padding: '24px 36px' }}>

          {/* TAB 1: EXPLORE */}
          {activeTab === 'explore' && !showFullDiscography && (
            <>
              {/* Responsive Spotlight Card */}
              <section className="studio-card" style={{ marginBottom: '28px', overflow: 'hidden', padding: 0 }}>
                <div className="spotlight-grid">
                  <img className="spotlight-img" src={currentArtistInfo.cover} alt={currentArtistInfo.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  
                  <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(to right, #141417, #09090b)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>ARTISTE EN VEDETTE</span>
                      <CheckCircle2 size={14} color="var(--accent-primary)" />
                    </div>

                    <h2 className="spotlight-title" style={{ fontSize: '2.1rem', fontWeight: '800', marginBottom: '8px' }}>{currentArtistInfo.name}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '600px', marginBottom: '18px', lineHeight: '1.4' }}>
                      {currentArtistInfo.bio}
                    </p>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button className="btn-emerald" onClick={() => { executeSearch(currentArtistInfo.name); setShowFullDiscography(true); }}>
                        <Play size={15} fill="#000" /> Écouter Discographie
                      </button>
                      <button className="btn-secondary" onClick={() => { executeSearch(currentArtistInfo.name); }}>
                        <Disc size={15} /> Parcourir Titres
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Popular Artists Responsive Grid */}
              <section style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                  Artistes Populaires
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '14px' }}>
                  {SPOTLIGHT_ARTISTS.map(artist => (
                    <div 
                      key={artist.name}
                      onClick={() => {
                        setCurrentArtistInfo(artist);
                        setSearchQuery(artist.name);
                        executeSearch(artist.name);
                      }}
                      className="studio-card"
                      style={{ padding: '14px', cursor: 'pointer', textAlign: 'center' }}
                    >
                      <img src={artist.cover} alt={artist.name} style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 10px auto' }} />
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '2px' }}>{artist.name}</h4>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{artist.role}</p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Genre & Artist Selector Pills */}
          <section style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {genresList.map(g => (
                <button
                  key={g}
                  onClick={() => {
                    setSelectedGenre(g);
                    const q = g === 'Tous' ? 'Dadju' : g;
                    setSearchQuery(q);
                    executeSearch(q);
                  }}
                  style={{
                    background: selectedGenre === g ? 'var(--accent-primary)' : 'rgba(255,255,255,0.04)',
                    border: '1px solid ' + (selectedGenre === g ? 'var(--accent-primary)' : 'var(--border-color)'),
                    color: selectedGenre === g ? '#000000' : 'var(--text-secondary)',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: selectedGenre === g ? '700' : '500',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </section>

          {/* Search Results & Discography View */}
          {searchResults.length > 0 && (
            <section className="studio-card" style={{ padding: '20px', marginBottom: '28px' }}>
              
              {/* Filter Tabs Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Disc size={18} color="var(--accent-primary)" /> Discographie pour "{searchQuery || 'Dadju'}"
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {filteredTracks.length} titres répertoriés • Qualité Studio 320 kbps
                  </p>
                </div>

                {/* Sub Filter Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
                  {subFilters.map(tab => (
                    <button
                      key={tab}
                      onClick={() => { setSelectedSubFilter(tab); setCurrentPage(1); }}
                      style={{
                        background: selectedSubFilter === tab ? 'var(--bg-surface)' : 'transparent',
                        border: '1px solid ' + (selectedSubFilter === tab ? 'var(--border-hover)' : 'transparent'),
                        color: selectedSubFilter === tab ? '#fff' : 'var(--text-muted)',
                        padding: '5px 10px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Responsive Music Table / Grid */}
              <div style={{ display: 'grid', gap: '4px' }}>
                {paginatedTracks.map((track, idx) => {
                  const isCurrent = activeTrack?.id === track.id;
                  const isFav = favorites.some(f => f.id === track.id);
                  const isDownloading = downloadingId === track.id;

                  return (
                    <div 
                      key={track.id} 
                      className="track-row-grid"
                      style={{ 
                        background: isCurrent ? 'rgba(16, 185, 129, 0.08)' : 'transparent', 
                        border: '1px solid ' + (isCurrent ? 'var(--accent-primary-glow)' : 'transparent') 
                      }}
                    >
                      {/* Track Index */}
                      <div className="track-index-col" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isCurrent && isPlaying ? (
                          <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '14px' }}>
                            <div className="studio-eq-bar"></div>
                            <div className="studio-eq-bar"></div>
                            <div className="studio-eq-bar"></div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                            {startIndex + idx + 1}
                          </span>
                        )}
                      </div>

                      {/* Title & Artist */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <button 
                          onClick={() => togglePlayTrack(track)}
                          style={{ 
                            width: '34px', 
                            height: '34px', 
                            borderRadius: '8px', 
                            background: isCurrent && isPlaying ? 'var(--accent-primary)' : '#27272a', 
                            border: 'none', 
                            color: isCurrent && isPlaying ? '#000' : '#fff', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {isCurrent && isPlaying ? <Pause size={15} fill="#000" /> : <Play size={15} style={{ marginLeft: '2px' }} />}
                        </button>

                        <div style={{ overflow: 'hidden' }}>
                          <h4 style={{ fontSize: '0.86rem', fontWeight: '700', color: isCurrent ? 'var(--accent-primary)' : '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {track.title}
                          </h4>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {track.artist}
                          </p>
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="hide-on-mobile" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {track.duration} • <span style={{ color: 'var(--text-muted)' }}>{track.size}</span>
                      </div>

                      {/* Bitrate Badge */}
                      <div className="hide-on-mobile">
                        <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', padding: '3px 7px', borderRadius: '4px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                          {format} 320k
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <button 
                          onClick={() => toggleFavoriteTrack(track)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
                        >
                          <Heart size={15} color={isFav ? 'var(--accent-magenta)' : 'var(--text-muted)'} fill={isFav ? 'var(--accent-magenta)' : 'none'} />
                        </button>

                        <button 
                          className="btn-emerald" 
                          style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                          onClick={() => triggerDirectDownload(track)}
                        >
                          {isDownloading ? '...' : <><Download size={12} /> MP3</>}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Responsive Pagination Controls */}
              {showFullDiscography && totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTracks.length)} sur {filteredTracks.length} titres
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button 
                      className="btn-secondary"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      style={{ opacity: currentPage === 1 ? 0.4 : 1, padding: '5px 10px', fontSize: '0.75rem' }}
                    >
                      <ChevronLeft size={13} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '5px',
                          border: '1px solid ' + (currentPage === page ? 'var(--accent-primary)' : 'var(--border-color)'),
                          background: currentPage === page ? 'var(--accent-primary)' : 'transparent',
                          color: currentPage === page ? '#000' : '#fff',
                          fontWeight: '700',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        {page}
                      </button>
                    ))}

                    <button 
                      className="btn-secondary"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      style={{ opacity: currentPage === totalPages ? 0.4 : 1, padding: '5px 10px', fontSize: '0.75rem' }}
                    >
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              )}

              {!showFullDiscography && filteredTracks.length > 8 && (
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <button className="btn-emerald" style={{ padding: '8px 20px', fontSize: '0.82rem' }} onClick={() => setShowFullDiscography(true)}>
                    Voir toute la discographie ({filteredTracks.length} chansons) <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </section>
          )}

          {/* TAB 2: FAVORITES */}
          {activeTab === 'library' && (
            <section className="studio-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Heart size={20} color="var(--accent-magenta)" fill="var(--accent-magenta)" /> Ma Bibliothèque
              </h3>

              {favorites.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Aucun titre favori enregistré pour le moment.
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {favorites.map((track) => (
                    <div key={track.id} className="studio-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-surface)' }}>
                      <div>
                        <h4 style={{ fontSize: '0.86rem', fontWeight: '700' }}>{track.title}</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{track.artist} • {track.duration}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={() => togglePlayTrack(track)}>Écouter</button>
                        <button className="btn-emerald" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={() => triggerDirectDownload(track)}>MP3</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* TAB 3: DOWNLOADS */}
          {activeTab === 'downloads' && (
            <section className="studio-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HardDrive size={20} color="var(--accent-primary)" /> Historique des Téléchargements
              </h3>

              {downloadHistory.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Aucun téléchargement effectué dans cette session.
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {downloadHistory.map((track) => (
                    <div key={track.id} className="studio-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-surface)' }}>
                      <div>
                        <h4 style={{ fontSize: '0.86rem', fontWeight: '700' }}>{track.title}</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{track.artist} • Qualité 320 kbps MP3</p>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={14} /> Enregistré
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

        </main>
      </div>

      {/* Responsive Sticky Bottom Audio Player Bar */}
      {activeTrack && (
        <div className="player-bar-container" style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '75px',
          background: '#0c0c0e',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          zIndex: 200
        }}>
          {/* Active Track Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '240px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#1c1c20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Music size={18} color="var(--accent-primary)" />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: '700', fontSize: '0.82rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: '#fff' }}>
                {activeTrack.title}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{activeTrack.artist}</div>
            </div>
          </div>

          {/* Central Playback Controls & Scrubber */}
          <div className="player-center-controls" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flex: 1, maxWidth: '480px', margin: '0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button onClick={() => setIsShuffle(!isShuffle)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isShuffle ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                <Shuffle size={14} />
              </button>

              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-primary)', border: 'none', color: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {isPlaying ? <Pause size={16} fill="#000" /> : <Play size={16} fill="#000" style={{ marginLeft: '2px' }} />}
              </button>

              <button onClick={() => setIsRepeat(!isRepeat)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isRepeat ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                <Repeat size={14} />
              </button>
            </div>

            <div className="player-time-display" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', minWidth: '30px', textAlign: 'right' }}>{formatTime(currentTime)}</span>
              <input 
                type="range" 
                min="0" 
                max={duration || 100} 
                value={currentTime} 
                onChange={handleSeek}
                style={{ flex: 1, cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', minWidth: '30px' }}>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume Control & Download Action */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="player-volume-col" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button onClick={toggleMute} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                {isMuted ? <VolumeX size={15} color="var(--accent-magenta)" /> : <Volume2 size={15} color="var(--text-secondary)" />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                value={isMuted ? 0 : volume} 
                onChange={handleVolumeChange}
                style={{ width: '60px', cursor: 'pointer' }}
              />
            </div>

            <button className="btn-emerald" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => triggerDirectDownload(activeTrack)}>
              <Download size={13} /> MP3
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
