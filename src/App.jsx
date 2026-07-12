```react
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Info, Search, X, ChevronLeft, ChevronRight, 
  Home, Film, Tv, Star, ArrowLeft, Plus, Check, 
  List, Share2, Volume2, Maximize
} from 'lucide-react';

// --- API CONFIGURATION ---
const API_KEY = '0627e9682f6c3eca80da4e2a6217ce57';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Embed Links
const getMovieEmbedUrl = (tmdbId) => {
  return "https://vidsrc.sbs/embed/movie/" + tmdbId;
};

const getTvEmbedUrl = (tmdbId, season, episode) => {
  return "https://vidsrc.sbs/embed/tv/" + tmdbId + "/" + season + "/" + episode;
};

// --- UTILS ---
const fetchApi = async (endpoint) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${API_KEY}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error("API Fetch Error:", error);
    return null;
  }
};

// --- COMPONENTS ---

const Loader = () => (
  <div className="flex justify-center items-center p-10">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 animate-spin"></div>
      <div className="absolute inset-2 rounded-full border-r-2 border-blue-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
    </div>
  </div>
);

const IconButton = ({ icon: Icon, onClick, className = "", tooltip }) => (
  <button 
    onClick={onClick}
    title={tooltip}
    className={`p-2.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white border border-zinc-700/50 backdrop-blur-md transition-all duration-300 hover:scale-110 ${className}`}
  >
    <Icon size={20} />
  </button>
);

const PosterCard = ({ item, onClick, isLarge = false, explicitMediaType = null }) => {
  const imageUrl = item.poster_path ? `${POSTER_BASE_URL}${item.poster_path}` : null;
  const title = item.title || item.name;

  if (!imageUrl) return null;

  return (
    <div 
      className={`relative group cursor-pointer transition-all duration-500 ease-out hover:scale-105 hover:z-20 flex-shrink-0 ${isLarge ? 'w-40 md:w-56' : 'w-32 md:w-48'}`}
      onClick={() => onClick({ ...item, media_type: explicitMediaType || item.media_type })}
    >
      <div className="relative rounded-xl overflow-hidden shadow-xl shadow-black/50 aspect-[2/3]">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <h3 className="text-white font-bold text-sm md:text-base leading-tight drop-shadow-md truncate">
            {title}
          </h3>
          <div className="flex items-center space-x-2 mt-1.5 text-xs font-medium text-gray-300">
            <span className="flex items-center text-cyan-400 drop-shadow"><Star size={12} className="mr-1 fill-current" /> {item.vote_average?.toFixed(1)}</span>
            <span>{item.release_date ? item.release_date.split('-')[0] : (item.first_air_date ? item.first_air_date.split('-')[0] : '')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContentRow = ({ title, fetchUrl, onItemSelected, isLarge = false, explicitMediaType }) => {
  const [items, setItems] = useState([]);
  const rowRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchApi(fetchUrl);
      if (data && data.results) {
        setItems(data.results.filter(item => item.poster_path));
      }
    };
    getData();
  }, [fetchUrl]);

  const handleScrollUI = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeft(scrollLeft > 0);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  const scroll = (direction) => {
    if (rowRef.current) {
      const { clientWidth } = rowRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth + 100 : clientWidth - 100;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="py-6 relative group pl-4 md:pl-12">
      <h2 className="text-white text-lg md:text-2xl font-bold mb-4 tracking-wide drop-shadow-sm">{title}</h2>
      
      <div className="relative">
        {showLeft && (
          <button 
            onClick={() => scroll('left')}
            className="absolute -left-4 md:left-0 top-1/2 -translate-y-1/2 z-30 bg-black/60 hover:bg-zinc-800 text-white p-3 rounded-r-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm hidden md:block"
          >
            <ChevronLeft size={32} />
          </button>
        )}
        
        <div 
          ref={rowRef}
          onScroll={handleScrollUI}
          className="flex space-x-3 md:space-x-5 overflow-x-auto scrollbar-hide pb-6 pr-12 scroll-smooth"
        >
          {items.map(item => (
            <PosterCard 
              key={item.id} 
              item={item} 
              onClick={onItemSelected}
              isLarge={isLarge}
              explicitMediaType={explicitMediaType || (fetchUrl.includes('/movie') ? 'movie' : fetchUrl.includes('/tv') ? 'tv' : null)}
            />
          ))}
        </div>

        {showRight && (
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-black/60 hover:bg-zinc-800 text-white p-3 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm hidden md:block"
          >
            <ChevronRight size={32} />
          </button>
        )}
      </div>
    </div>
  );
};

// --- MAIN DETAILS & PLAYER VIEW (Netflix Style) ---
const DetailsView = ({ item, onClose, watchlist, toggleWatchlist, onNavigate }) => {
  const [details, setDetails] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const viewRef = useRef(null);
  
  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerUrl, setPlayerUrl] = useState('');
  
  // TV State
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);

  const isTv = item?.media_type === 'tv' || item?.first_air_date;
  const mediaType = isTv ? 'tv' : 'movie';
  const id = item?.id;
  const isInWatchlist = watchlist.some(w => w.id === id);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setIsPlaying(false);
      
      const [detailsData, similarData] = await Promise.all([
        fetchApi(`/${mediaType}/${id}?append_to_response=credits,videos`),
        fetchApi(`/${mediaType}/${id}/similar`)
      ]);

      if (detailsData) {
        setDetails(detailsData);
        if (isTv && detailsData.seasons) {
          const validSeasons = detailsData.seasons.filter(s => s.season_number > 0);
          setSeasons(validSeasons);
          setSelectedSeason(validSeasons.length > 0 ? validSeasons[0].season_number : 1);
        }
      }
      
      if (similarData && similarData.results) {
        setSimilar(similarData.results.filter(r => r.poster_path));
      }
      
      setLoading(false);
      // Reset scroll
      if (viewRef.current) viewRef.current.scrollTop = 0;
    };

    if (id) fetchData();
  }, [id, mediaType, isTv]);

  useEffect(() => {
    const fetchEpisodes = async () => {
      if (isTv && selectedSeason !== null && id) {
        setEpisodesLoading(true);
        const data = await fetchApi(`/tv/${id}/season/${selectedSeason}`);
        if (data && data.episodes) setEpisodes(data.episodes);
        setEpisodesLoading(false);
      }
    };
    fetchEpisodes();
  }, [id, isTv, selectedSeason]);

  const handlePlay = (season = null, episode = null) => {
    let url = '';
    if (isTv) {
      const s = season || selectedSeason;
      const e = episode || (episodes.length > 0 ? episodes[0].episode_number : 1);
      url = getTvEmbedUrl(id, s, e);
    } else {
      url = getMovieEmbedUrl(id);
    }
    setPlayerUrl(url);
    setIsPlaying(true);
    
    // Smooth scroll to player
    if (viewRef.current) {
      viewRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!item) return null;

  const title = details?.title || details?.name || item.title || item.name;
  const backdropUrl = details?.backdrop_path ? `${IMAGE_BASE_URL}${details.backdrop_path}` : (item.backdrop_path ? `${IMAGE_BASE_URL}${item.backdrop_path}` : null);
  const releaseYear = details?.release_date?.split('-')[0] || details?.first_air_date?.split('-')[0];

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col animate-in slide-in-from-bottom-10 duration-300">
      
      {/* Top Glassmorphic Nav */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 md:p-6 flex justify-between items-center bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none">
        <button 
          onClick={onClose}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-900/60 backdrop-blur-md text-white hover:bg-white hover:text-black transition-all pointer-events-auto"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div ref={viewRef} className="flex-1 overflow-y-auto custom-scrollbar relative">
        
        {/* PLAYER / HERO SECTION */}
        <div className="w-full relative bg-black md:h-[70vh] aspect-video md:aspect-auto flex items-center justify-center group shadow-2xl shadow-black">
          {isPlaying ? (
            <iframe
              src={playerUrl}
              className="w-full h-full absolute inset-0 z-10 border-0"
              allowFullScreen
              title="Video Player"
            ></iframe>
          ) : (
            <>
              {backdropUrl ? (
                <img src={backdropUrl} alt={title} className="w-full h-full object-cover opacity-60" />
              ) : (
                <div className="w-full h-full bg-zinc-900"></div>
              )}
              {/* Grandient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                 <button 
                   onClick={() => handlePlay()}
                   className="flex items-center justify-center w-20 h-20 md:w-28 md:h-28 bg-cyan-500/90 text-white rounded-full hover:bg-cyan-400 hover:scale-110 transition-all shadow-[0_0_40px_rgba(6,182,212,0.5)] backdrop-blur-sm"
                 >
                   <Play size={40} className="ml-2 fill-current" />
                 </button>
              </div>
            </>
          )}
        </div>

        {/* DETAILS SECTION */}
        <div className="px-4 md:px-12 lg:px-24 py-8 max-w-7xl mx-auto">
          {loading ? (
            <Loader />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              
              {/* Left/Main Column: Title, Meta, Actions, Overview */}
              <div className="lg:col-span-2 space-y-6">
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-md">
                  {title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-300">
                  <span className="text-green-400">{details?.vote_average ? Math.round(details.vote_average * 10) : 'NR'}% Match</span>
                  <span>{releaseYear}</span>
                  {isTv ? (
                    <span className="bg-zinc-800 px-2 py-1 rounded text-white">{details?.number_of_seasons} Seasons</span>
                  ) : (
                    <span className="bg-zinc-800 px-2 py-1 rounded text-white">{details?.runtime} min</span>
                  )}
                  <span className="border border-gray-600 px-2 py-1 rounded text-xs tracking-wider">HD</span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-4 py-2">
                  {!isPlaying && (
                    <button 
                      onClick={() => handlePlay()}
                      className="flex-1 md:flex-none flex items-center justify-center px-8 py-3.5 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors shadow-lg"
                    >
                      <Play size={20} className="mr-2 fill-current" /> Play
                    </button>
                  )}
                  <IconButton 
                    icon={isInWatchlist ? Check : Plus} 
                    onClick={() => toggleWatchlist(item)} 
                    tooltip={isInWatchlist ? "Remove from List" : "Add to List"}
                    className={isInWatchlist ? "text-cyan-400" : ""}
                  />
                  <IconButton icon={Share2} onClick={() => alert("Share functionality coming soon!")} tooltip="Share" />
                </div>

                <p className="text-base md:text-lg text-gray-300 leading-relaxed font-medium">
                  {details?.overview}
                </p>

                {/* Cast */}
                {details?.credits?.cast?.length > 0 && (
                  <div className="pt-4 border-t border-zinc-800/50">
                    <h3 className="text-zinc-400 font-medium mb-3">Top Cast</h3>
                    <div className="flex flex-wrap gap-2">
                      {details.credits.cast.slice(0, 8).map(actor => (
                        <span key={actor.id} className="text-sm bg-zinc-900 px-3 py-1.5 rounded-full text-zinc-200 border border-zinc-800">
                          {actor.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Extra Details */}
              <div className="space-y-6 text-sm text-gray-400 bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/50 h-fit">
                <div>
                  <span className="block text-zinc-500 mb-1">Genres</span>
                  <div className="flex flex-wrap gap-2">
                    {details?.genres?.map(g => (
                      <span key={g.id} className="text-white bg-zinc-800 px-2 py-1 rounded text-xs">{g.name}</span>
                    ))}
                  </div>
                </div>
                {details?.production_companies?.length > 0 && (
                  <div>
                    <span className="block text-zinc-500 mb-1">Production</span>
                    <span className="text-zinc-200">{details.production_companies.map(c => c.name).join(', ')}</span>
                  </div>
                )}
                {details?.status && (
                  <div>
                    <span className="block text-zinc-500 mb-1">Status</span>
                    <span className="text-zinc-200">{details.status}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TV Shows: Episodes Section */}
          {isTv && !loading && seasons.length > 0 && (
            <div className="mt-16">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <h3 className="text-3xl font-bold text-white">Episodes</h3>
                <div className="relative">
                  <select 
                    className="appearance-none bg-zinc-900 text-white border border-zinc-700 rounded-xl px-6 py-3 pr-12 outline-none focus:border-cyan-500 font-medium text-lg w-full md:w-auto cursor-pointer shadow-lg"
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(Number(e.target.value))}
                  >
                    {seasons.map(season => (
                      <option key={season.id} value={season.season_number}>
                        Season {season.season_number}
                      </option>
                    ))}
                  </select>
                  <ChevronRight size={20} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              {episodesLoading ? (
                <Loader />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {episodes.map((episode, index) => (
                    <div 
                      key={episode.id} 
                      onClick={() => handlePlay(selectedSeason, episode.episode_number)}
                      className="flex flex-col sm:flex-row items-center p-4 bg-zinc-900/50 rounded-2xl hover:bg-zinc-800 transition-all duration-300 cursor-pointer group border border-zinc-800/50 hover:border-cyan-500/30 shadow-md"
                    >
                      <div className="flex-shrink-0 w-full sm:w-48 relative rounded-xl overflow-hidden aspect-video bg-zinc-950 mb-4 sm:mb-0 shadow-lg">
                        {episode.still_path ? (
                          <img 
                            src={`${POSTER_BASE_URL}${episode.still_path}`} 
                            alt={episode.name} 
                            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"
                          />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-xs text-zinc-600 bg-zinc-900">No Image</div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center border border-white/20 group-hover:bg-cyan-500 group-hover:border-transparent transition-all">
                            <Play size={20} className="text-white ml-1 fill-current" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="sm:ml-6 flex-grow w-full">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-white font-bold text-lg group-hover:text-cyan-400 transition-colors">
                            {episode.episode_number}. {episode.name}
                          </h4>
                          <span className="text-xs font-semibold text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
                            {episode.runtime ? `${episode.runtime}m` : ''}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400 line-clamp-3">
                          {episode.overview || "No description available."}
                        </p>
                      </div>
                    </div>
                  ))}
                  {episodes.length === 0 && <p className="text-zinc-500">No episodes found.</p>}
                </div>
              )}
            </div>
          )}

          {/* More Like This Section */}
          {!loading && similar.length > 0 && (
            <div className="mt-16 border-t border-zinc-800/50 pt-8">
              <h3 className="text-2xl font-bold text-white mb-6">More Like This</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                 {similar.slice(0, 10).map(simItem => (
                    <PosterCard 
                      key={simItem.id} 
                      item={simItem} 
                      onClick={(newItem) => {
                         // When clicking a similar item, we just re-navigate to this view with new item
                         onNavigate({ ...newItem, media_type: mediaType });
                      }} 
                    />
                 ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- HERO COMPONENT ---
const Hero = ({ item, onPlay, onMoreInfo }) => {
  if (!item) return <div className="h-[80vh] bg-zinc-900 animate-pulse"></div>;

  const title = item.title || item.name;
  const description = item.overview;
  const backdropUrl = item.backdrop_path ? `${IMAGE_BASE_URL}${item.backdrop_path}` : null;
  const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');

  return (
    <div className="relative h-[75vh] md:h-[85vh] w-full bg-zinc-950 overflow-hidden">
      {backdropUrl && (
        <div className="absolute inset-0">
          <img 
            src={backdropUrl} 
            alt={title} 
            className="w-full h-full object-cover opacity-70 scale-105 animate-[slowZoom_20s_ease-in-out_infinite_alternate]"
          />
          {/* Complex Gradient Overlays for Premium Look */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent h-32" />
        </div>
      )}
      
      <div className="relative z-10 h-full flex flex-col justify-end pb-24 md:pb-32 px-4 md:px-16 max-w-4xl">
        {mediaType && (
          <span className="flex items-center space-x-2 text-cyan-400 font-bold tracking-widest text-xs uppercase mb-4 drop-shadow-md">
            <span className="w-8 h-[2px] bg-cyan-400 rounded-full"></span>
            <span>{mediaType === 'tv' ? 'Series' : 'Movie'}</span>
          </span>
        )}
        
        <h1 className="text-5xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl leading-tight">
          {title}
        </h1>
        
        <p className="text-zinc-300 text-sm md:text-lg mb-8 line-clamp-3 max-w-2xl font-medium drop-shadow-md">
          {description}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={() => onMoreInfo(item)} // Redirect to details to play properly
            className="flex items-center px-8 py-3.5 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all hover:scale-105 shadow-xl shadow-white/10"
          >
            <Play size={20} className="mr-2 fill-current" /> Play Now
          </button>
          <button 
            onClick={() => onMoreInfo(item)}
            className="flex items-center px-8 py-3.5 bg-zinc-800/80 text-white font-bold rounded-lg hover:bg-zinc-700 transition-all backdrop-blur-md border border-zinc-700 shadow-xl"
          >
            <Info size={20} className="mr-2" /> More Info
          </button>
        </div>
      </div>
    </div>
  );
};


// --- MAIN APP ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [heroItem, setHeroItem] = useState(null);
  
  const [activeMedia, setActiveMedia] = useState(null); // Controls the full screen DetailsView
  const [watchlist, setWatchlist] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchHero = async () => {
      const data = await fetchApi('/trending/all/day');
      if (data && data.results) {
        const validItem = data.results.find(item => item.backdrop_path && item.overview);
        setHeroItem(validItem || data.results[0]);
      }
    };
    fetchHero();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        const data = await fetchApi(`/search/multi?query=${encodeURIComponent(searchQuery)}&include_adult=false`);
        if (data && data.results) {
          setSearchResults(data.results.filter(item => 
            (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path
          ));
        }
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const toggleWatchlist = (item) => {
    setWatchlist(prev => {
      const exists = prev.find(w => w.id === item.id);
      if (exists) return prev.filter(w => w.id !== item.id);
      return [...prev, item];
    });
  };

  const navItemClass = (tab) => `transition-colors duration-300 font-semibold text-sm hover:text-cyan-400 ${activeTab === tab ? 'text-white' : 'text-zinc-400'}`;

  // Content Views
  const renderHome = () => (
    <div className="pb-24 animate-in fade-in duration-500">
      <Hero item={heroItem} onPlay={() => {}} onMoreInfo={setActiveMedia} />
      <div className="-mt-24 md:-mt-32 relative z-20 space-y-4">
        <ContentRow title="Trending Today" fetchUrl="/trending/all/day" onItemSelected={setActiveMedia} isLarge />
        <ContentRow title="Must-Watch Movies" fetchUrl="/movie/popular" onItemSelected={setActiveMedia} explicitMediaType="movie" />
        <ContentRow title="Binge-Worthy Series" fetchUrl="/tv/popular" onItemSelected={setActiveMedia} explicitMediaType="tv" />
        <ContentRow title="Critically Acclaimed" fetchUrl="/movie/top_rated" onItemSelected={setActiveMedia} explicitMediaType="movie" />
      </div>
    </div>
  );

  const renderMovies = () => (
    <div className="pt-28 pb-24 animate-in fade-in duration-500 min-h-screen">
      <div className="px-4 md:px-12 mb-8 flex items-center space-x-4">
        <Film size={32} className="text-cyan-400" />
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Movies</h1>
      </div>
      <div className="space-y-4">
        <ContentRow title="Blockbusters" fetchUrl="/trending/movie/week" onItemSelected={setActiveMedia} isLarge explicitMediaType="movie" />
        <ContentRow title="Action Packed" fetchUrl="/discover/movie?with_genres=28" onItemSelected={setActiveMedia} explicitMediaType="movie" />
        <ContentRow title="Laugh Out Loud" fetchUrl="/discover/movie?with_genres=35" onItemSelected={setActiveMedia} explicitMediaType="movie" />
        <ContentRow title="Sci-Fi Marvels" fetchUrl="/discover/movie?with_genres=878" onItemSelected={setActiveMedia} explicitMediaType="movie" />
      </div>
    </div>
  );

  const renderTv = () => (
    <div className="pt-28 pb-24 animate-in fade-in duration-500 min-h-screen">
      <div className="px-4 md:px-12 mb-8 flex items-center space-x-4">
        <Tv size={32} className="text-cyan-400" />
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">TV Series</h1>
      </div>
      <div className="space-y-4">
        <ContentRow title="Global Phenomenons" fetchUrl="/trending/tv/week" onItemSelected={setActiveMedia} isLarge explicitMediaType="tv" />
        <ContentRow title="Drama & Suspense" fetchUrl="/discover/tv?with_genres=18" onItemSelected={setActiveMedia} explicitMediaType="tv" />
        <ContentRow title="Animation" fetchUrl="/discover/tv?with_genres=16" onItemSelected={setActiveMedia} explicitMediaType="tv" />
        <ContentRow title="Sci-Fi & Fantasy" fetchUrl="/discover/tv?with_genres=10765" onItemSelected={setActiveMedia} explicitMediaType="tv" />
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="pt-32 pb-24 px-4 md:px-12 min-h-screen animate-in fade-in duration-500">
      <div className="max-w-3xl mx-auto mb-12 relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex items-center bg-zinc-900 rounded-full p-2 border border-zinc-800">
          <Search className="text-zinc-400 ml-4" size={24} />
          <input 
            type="text" 
            placeholder="Search titles, characters, or genres..." 
            className="w-full bg-transparent text-white rounded-full py-3 px-4 text-lg md:text-xl focus:outline-none placeholder-zinc-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
             <button onClick={() => setSearchQuery('')} className="p-2 text-zinc-400 hover:text-white mr-2">
               <X size={20} />
             </button>
          )}
        </div>
      </div>

      {isSearching ? (
        <Loader />
      ) : searchResults.length > 0 ? (
        <div>
          <h2 className="text-xl font-bold text-zinc-300 mb-6">Top Results</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {searchResults.map(item => (
              <div key={item.id} className="w-full">
                <PosterCard item={item} onClick={setActiveMedia} />
              </div>
            ))}
          </div>
        </div>
      ) : searchQuery.length > 1 ? (
        <div className="text-center text-zinc-500 mt-20">
          <Search size={64} className="mx-auto mb-4 opacity-20" />
          <p className="text-2xl font-bold mb-2 text-zinc-400">No matching results</p>
          <p>Try refining your search terms.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-zinc-700 mt-20 space-y-6">
          <div className="grid grid-cols-2 gap-4 opacity-30">
            <Film size={64} />
            <Tv size={64} />
          </div>
          <p className="text-2xl font-bold">What are you looking for?</p>
        </div>
      )}
    </div>
  );

  const renderWatchlist = () => (
    <div className="pt-28 pb-24 min-h-screen px-4 md:px-12 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4 mb-8">
        <List size={32} className="text-cyan-400" />
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">My List</h1>
      </div>
      
      {watchlist.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {watchlist.map(item => (
            <PosterCard key={item.id} item={item} onClick={setActiveMedia} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center mt-32 text-zinc-600">
          <Plus size={80} className="mb-6 opacity-20" />
          <h2 className="text-3xl font-bold text-zinc-400 mb-2">Your list is empty</h2>
          <p className="text-lg">Add shows and movies to watch later.</p>
          <button 
            onClick={() => setActiveTab('home')}
            className="mt-8 px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200"
          >
            Explore Content
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      
      {/* Dynamic Navbar (Desktop focused, handles tablet) */}
      <nav className={`fixed top-0 w-full z-40 transition-all duration-500 px-4 md:px-12 py-4 flex items-center justify-between ${
        isScrolled ? 'bg-zinc-950/90 backdrop-blur-xl shadow-lg shadow-black/50 py-3' : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent'
      }`}>
        <div className="flex items-center space-x-10">
          {/* Logo */}
          <div 
            className="text-2xl md:text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => { setActiveTab('home'); window.scrollTo(0,0); }}
          >
            STREAMVERSE
          </div>
          
          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-6 bg-zinc-900/50 px-6 py-2 rounded-full border border-zinc-800/50 backdrop-blur-md">
            <button onClick={() => { setActiveTab('home'); window.scrollTo(0,0); }} className={navItemClass('home')}>Home</button>
            <button onClick={() => { setActiveTab('movies'); window.scrollTo(0,0); }} className={navItemClass('movies')}>Movies</button>
            <button onClick={() => { setActiveTab('tv'); window.scrollTo(0,0); }} className={navItemClass('tv')}>Series</button>
            <button onClick={() => { setActiveTab('watchlist'); window.scrollTo(0,0); }} className={navItemClass('watchlist')}>My List</button>
          </div>
        </div>

        {/* Right Nav */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => { setActiveTab('search'); window.scrollTo(0,0); }}
            className={`p-2.5 rounded-full transition-all duration-300 ${activeTab === 'search' ? 'bg-cyan-500/20 text-cyan-400' : 'text-zinc-300 hover:text-white hover:bg-zinc-800'}`}
          >
            <Search size={22} />
          </button>
          <div className="hidden md:block w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 border-2 border-zinc-800 cursor-pointer shadow-lg hover:scale-110 transition-transform"></div>
        </div>
      </nav>

      {/* Main Content Router */}
      <main className="min-h-screen">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'movies' && renderMovies()}
        {activeTab === 'tv' && renderTv()}
        {activeTab === 'search' && renderSearch()}
        {activeTab === 'watchlist' && renderWatchlist()}
      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 py-12 px-4 md:px-12 border-t border-zinc-900 mt-auto text-center md:text-left text-zinc-500 text-sm pb-24 md:pb-12">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-4">
          <div>
            <span className="text-xl font-black tracking-tighter text-zinc-700 mr-2">STREAMVERSE</span>
            <span>© {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex space-x-4">
            <span className="hover:text-zinc-300 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-zinc-300 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-zinc-300 cursor-pointer transition-colors">API info</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation (Glassmorphic) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800/50 flex justify-around items-center p-2 z-40 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {[
          { id: 'home', icon: Home, label: 'Home' },
          { id: 'movies', icon: Film, label: 'Movies' },
          { id: 'tv', icon: Tv, label: 'Series' },
          { id: 'watchlist', icon: List, label: 'My List' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); window.scrollTo(0,0); }} 
            className={`flex flex-col items-center p-2 transition-colors ${activeTab === tab.id ? 'text-cyan-400' : 'text-zinc-500'}`}
          >
            <tab.icon size={22} className={activeTab === tab.id ? 'fill-cyan-400/20' : ''} />
            <span className="text-[10px] mt-1.5 font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Full Screen Details / Player View */}
      {activeMedia && (
        <DetailsView 
          item={activeMedia} 
          onClose={() => setActiveMedia(null)}
          watchlist={watchlist}
          toggleWatchlist={toggleWatchlist}
          onNavigate={setActiveMedia}
        />
      )}

      {/* Global CSS for Animations and Custom Scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slowZoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.15); }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #09090b; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #27272a; 
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #3f3f46;
        }
        .pb-safe {
          padding-bottom: calc(env(safe-area-inset-bottom) + 0.5rem);
        }
      `}} />
    </div>
  );
}


```
