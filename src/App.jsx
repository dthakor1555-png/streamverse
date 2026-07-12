import React, { useState, useEffect, useRef, useCallback } from 'react';  
import {   
  Play, Info, Search, X, ChevronLeft, ChevronRight,   
  Home, Film, Tv, Star, Calendar, Clock, ArrowLeft  
} from 'lucide-react';  
  
// --- API CONFIGURATION ---  
const API_KEY = '0627e9682f6c3eca80da4e2a6217ce57';  
const BASE_URL = 'https://api.themoviedb.org/3';  
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';  
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';  
  
// Embed Links  
const getMovieEmbedUrl = (tmdbId) => `https://vidsrc.sbs/embed/movie/${tmdbId}`;  
const getTvEmbedUrl = (tmdbId, season, episode) => `https://vidsrc.sbs/embed/tv/${tmdbId}/${season}/${episode}`;  
  
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
  
const truncateText = (text, maxLength) => {  
  if (!text) return '';  
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;  
};  
  
// --- COMPONENTS ---  
  
// 1. Loading Spinner  
const Loader = () => (  
  <div className="flex justify-center items-center h-40">  
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>  
  </div>  
);  
  
// 2. Poster Card  
const PosterCard = ({ item, onClick, isLarge = false }) => {  
  const imageUrl = item.poster_path ? `${POSTER_BASE_URL}${item.poster_path}` : null;  
  const title = item.title || item.name;  
  
  if (!imageUrl) return null;  
  
  return (  
    <div   
      className={`relative group cursor-pointer transition-transform duration-300 ease-out hover:scale-105 hover:z-20 flex-shrink-0 ${isLarge ? 'w-48 md:w-64' : 'w-36 md:w-48'}`}  
      onClick={() => onClick(item)}  
    >  
      <img   
        src={imageUrl}   
        alt={title}   
        className="w-full h-auto rounded-lg shadow-lg object-cover"  
        loading="lazy"  
      />  
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex flex-col justify-end p-4">  
        <h3 className="text-white font-semibold text-sm md:text-base leading-tight drop-shadow-md">  
          {title}  
        </h3>  
        <div className="flex items-center space-x-2 mt-2 text-xs text-gray-300">  
          <span className="flex items-center text-yellow-400"><Star size={12} className="mr-1" /> {item.vote_average?.toFixed(1)}</span>  
          <span>{item.release_date ? item.release_date.split('-')[0] : (item.first_air_date ? item.first_air_date.split('-')[0] : '')}</span>  
        </div>  
      </div>  
    </div>  
  );  
};  
  
// 3. Row (Horizontal Scrolling List)  
const ContentRow = ({ title, fetchUrl, onItemSelected, isLarge = false }) => {  
  const [items, setItems] = useState([]);  
  const rowRef = useRef(null);  
  
  useEffect(() => {  
    const getData = async () => {  
      const data = await fetchApi(fetchUrl);  
      if (data && data.results) {  
        // Filter out items without posters  
        setItems(data.results.filter(item => item.poster_path));  
      }  
    };  
    getData();  
  }, [fetchUrl]);  
  
  const handleScroll = (direction) => {  
    if (rowRef.current) {  
      const { scrollLeft, clientWidth } = rowRef.current;  
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;  
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });  
    }  
  };  
  
  if (items.length === 0) return null;  
  
  return (  
    <div className="py-6 relative group pl-4 md:pl-12">  
      <h2 className="text-white text-xl md:text-2xl font-bold mb-4 tracking-wide">{title}</h2>  
        
      {/* Scroll Buttons */}  
      <button   
        onClick={() => handleScroll('left')}  
        className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/80 text-white p-3 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"  
      >  
        <ChevronLeft size={28} />  
      </button>  
        
      <div   
        ref={rowRef}  
        className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4 pr-12 scroll-smooth"  
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}  
      >  
        {items.map(item => (  
          <PosterCard   
            key={item.id}   
            item={item}   
            onClick={onItemSelected}  
            isLarge={isLarge}  
          />  
        ))}  
      </div>  
  
      <button   
        onClick={() => handleScroll('right')}  
        className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/80 text-white p-3 rounded-l-full opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"  
      >  
        <ChevronRight size={28} />  
      </button>  
    </div>  
  );  
};  
  
// 4. Hero Section  
const Hero = ({ item, onPlay, onMoreInfo }) => {  
  if (!item) return <div className="h-[70vh] bg-zinc-900 animate-pulse"></div>;  
  
  const title = item.title || item.name;  
  const description = item.overview;  
  const backdropUrl = item.backdrop_path ? `${IMAGE_BASE_URL}${item.backdrop_path}` : null;  
  
  return (  
    <div className="relative h-[70vh] md:h-[85vh] w-full bg-zinc-950">  
      {backdropUrl && (  
        <div className="absolute inset-0">  
          <img   
            src={backdropUrl}   
            alt={title}   
            className="w-full h-full object-cover opacity-60"  
          />  
          {/* Gradient Overlay for seamless blend */}  
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent" />  
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />  
        </div>  
      )}  
        
      <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-16 max-w-3xl">  
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg leading-tight">  
          {title}  
        </h1>  
          
        <div className="flex items-center space-x-4 text-sm md:text-base text-gray-300 mb-6 font-medium">  
          <span className="flex items-center text-yellow-400 font-bold bg-black/40 px-2 py-1 rounded">  
            <Star size={16} className="mr-1 fill-current" />   
            {item.vote_average?.toFixed(1)}  
          </span>  
          <span>{item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0]}</span>  
          {item.media_type && (  
            <span className="uppercase tracking-wider border border-gray-500 px-2 py-0.5 rounded text-xs">  
              {item.media_type}  
            </span>  
          )}  
        </div>  
  
        <p className="text-gray-200 text-sm md:text-lg mb-8 line-clamp-3 md:line-clamp-4 max-w-2xl text-shadow">  
          {description}  
        </p>  
  
        <div className="flex space-x-4">  
          <button   
            onClick={() => onPlay(item)}  
            className="flex items-center px-6 py-3 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors shadow-lg"  
          >  
            <Play size={20} className="mr-2 fill-current" /> Play  
          </button>  
          <button   
            onClick={() => onMoreInfo(item)}  
            className="flex items-center px-6 py-3 bg-zinc-600/70 text-white font-bold rounded hover:bg-zinc-600 transition-colors backdrop-blur-sm"  
          >  
            <Info size={20} className="mr-2" /> More Info  
          </button>  
        </div>  
      </div>  
    </div>  
  );  
};  
  
// 5. Video Player Modal (Iframe)  
const PlayerModal = ({ url, onClose }) => {  
  return (  
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">  
      <div className="flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10 hover:opacity-100 opacity-0 transition-opacity duration-300">  
        <button onClick={onClose} className="flex items-center text-white hover:text-blue-400 transition-colors">  
          <ArrowLeft size={24} className="mr-2" /> Back to Browse  
        </button>  
      </div>  
      <div className="flex-grow relative w-full h-full pt-16">  
        <iframe  
          src={url}  
          className="w-full h-full border-0"  
          allowFullScreen  
          title="Video Player"  
          sandbox="allow-same-origin allow-scripts allow-forms" // Basic security, vidsrc needs scripts  
        ></iframe>  
      </div>  
    </div>  
  );  
};  
  
// 6. Details Modal (Handles comprehensive info and TV seasons)  
const DetailsModal = ({ item, onClose, onPlayMedia }) => {  
  const [details, setDetails] = useState(null);  
  const [loading, setLoading] = useState(true);  
    
  // TV specific state  
  const [seasons, setSeasons] = useState([]);  
  const [selectedSeason, setSelectedSeason] = useState(1);  
  const [episodes, setEpisodes] = useState([]);  
  const [episodesLoading, setEpisodesLoading] = useState(false);  
  
  const isTv = item?.media_type === 'tv' || item?.first_air_date;  
  const mediaType = isTv ? 'tv' : 'movie';  
  const id = item?.id;  
  
  // Fetch full details  
  useEffect(() => {  
    const fetchDetails = async () => {  
      setLoading(true);  
      const data = await fetchApi(`/${mediaType}/${id}?append_to_response=credits`);  
      if (data) {  
        setDetails(data);  
        if (isTv && data.seasons) {  
          // Filter out season 0 (usually specials) unless it's the only one  
          const validSeasons = data.seasons.filter(s => s.season_number > 0);  
          setSeasons(validSeasons.length > 0 ? validSeasons : data.seasons);  
          setSelectedSeason(validSeasons.length > 0 ? validSeasons[0].season_number : 1);  
        }  
      }  
      setLoading(false);  
    };  
    if (id) fetchDetails();  
  }, [id, mediaType, isTv]);  
  
  // Fetch episodes when a TV season is selected  
  useEffect(() => {  
    const fetchEpisodes = async () => {  
      if (isTv && selectedSeason !== null) {  
        setEpisodesLoading(true);  
        const data = await fetchApi(`/tv/${id}/season/${selectedSeason}`);  
        if (data && data.episodes) {  
          setEpisodes(data.episodes);  
        }  
        setEpisodesLoading(false);  
      }  
    };  
    fetchEpisodes();  
  }, [id, isTv, selectedSeason]);  
  
  if (!item) return null;  
  
  const backdropUrl = item.backdrop_path ? `${IMAGE_BASE_URL}${item.backdrop_path}` : null;  
  const title = item.title || item.name;  
  
  return (  
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 pt-20">  
      {/* Backdrop overlay for closing */}  
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>  
        
      {/* Modal Content */}  
      <div className="relative bg-zinc-900 rounded-xl overflow-hidden w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl border border-zinc-800 animate-in fade-in zoom-in duration-200">  
          
        {/* Close Button */}  
        <button   
          onClick={onClose}  
          className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-white hover:text-black rounded-full text-white transition-colors backdrop-blur-md"  
        >  
          <X size={24} />  
        </button>  
  
        {/* Modal Header/Banner */}  
        <div className="relative h-64 md:h-96 flex-shrink-0 w-full">  
          {backdropUrl ? (  
             <img src={backdropUrl} alt={title} className="w-full h-full object-cover" />  
          ) : (  
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">No Image</div>  
          )}  
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent"></div>  
            
          <div className="absolute bottom-6 left-6 md:left-10 z-10 max-w-2xl">  
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-md">{title}</h1>  
              
            {!isTv && (  
               <button   
                  onClick={() => onPlayMedia(getMovieEmbedUrl(id))}  
                  className="flex items-center px-6 py-2 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors"  
                >  
                  <Play size={20} className="mr-2 fill-current" /> Play Movie  
               </button>  
            )}  
          </div>  
        </div>  
  
        {/* Modal Body - Scrollable */}  
        <div className="flex-1 overflow-y-auto p-6 md:p-10 text-gray-300 custom-scrollbar">  
          {loading ? (  
            <Loader />  
          ) : (  
            <div className="flex flex-col md:flex-row gap-8">  
              {/* Left Column: Info */}  
              <div className="md:w-2/3 space-y-6">  
                <div className="flex flex-wrap items-center gap-4 text-sm font-medium">  
                  <span className="text-green-400 font-bold">{details?.vote_average ? Math.round(details.vote_average * 10) : 'NR'}% Match</span>  
                  <span>{details?.release_date?.split('-')[0] || details?.first_air_date?.split('-')[0]}</span>  
                  {isTv ? (  
                    <span className="border border-gray-600 px-2 py-0.5 rounded">{details?.number_of_seasons} Seasons</span>  
                  ) : (  
                    <span>{details?.runtime} min</span>  
                  )}  
                  <span className="border border-gray-600 px-2 py-0.5 rounded text-xs text-white">HD</span>  
                </div>  
  
                <p className="text-sm md:text-base leading-relaxed text-gray-100">  
                  {details?.overview}  
                </p>  
  
                {/* Cast */}  
                {details?.credits?.cast?.length > 0 && (  
                   <div>  
                     <h3 className="text-white font-semibold mb-2">Cast</h3>  
                     <p className="text-sm text-gray-400">  
                       {details.credits.cast.slice(0, 6).map(c => c.name).join(', ')}  
                     </p>  
                   </div>  
                )}  
              </div>  
  
              {/* Right Column: Genres etc */}  
              <div className="md:w-1/3 space-y-4 text-sm">  
                <div>  
                  <span className="text-gray-500">Genres: </span>  
                  <span className="text-gray-300">{details?.genres?.map(g => g.name).join(', ')}</span>  
                </div>  
                {details?.status && (  
                  <div>  
                    <span className="text-gray-500">Status: </span>  
                    <span className="text-gray-300">{details.status}</span>  
                  </div>  
                )}  
                {details?.spoken_languages?.length > 0 && (  
                  <div>  
                    <span className="text-gray-500">Language: </span>  
                    <span className="text-gray-300">{details.spoken_languages[0].english_name}</span>  
                  </div>  
                )}  
              </div>  
            </div>  
          )}  
  
          {/* TV Shows: Episodes Section */}  
          {isTv && !loading && seasons.length > 0 && (  
            <div className="mt-10 border-t border-zinc-800 pt-8">  
              <div className="flex items-center justify-between mb-6">  
                <h3 className="text-2xl font-bold text-white">Episodes</h3>  
                  
                {/* Season Selector */}  
                <select   
                  className="bg-zinc-800 text-white border border-zinc-700 rounded-md px-4 py-2 outline-none focus:border-blue-500 font-medium"  
                  value={selectedSeason}  
                  onChange={(e) => setSelectedSeason(Number(e.target.value))}  
                >  
                  {seasons.map(season => (  
                    <option key={season.id} value={season.season_number}>  
                      Season {season.season_number}  
                    </option>  
                  ))}  
                </select>  
              </div>  
  
              {/* Episode List */}  
              {episodesLoading ? (  
                <Loader />  
              ) : (  
                <div className="space-y-4">  
                  {episodes.map((episode, index) => (  
                    <div   
                      key={episode.id}   
                      onClick={() => onPlayMedia(getTvEmbedUrl(id, selectedSeason, episode.episode_number))}  
                      className="flex flex-col md:flex-row items-center p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-700 transition-colors cursor-pointer group"  
                    >  
                      <div className="flex-shrink-0 w-full md:w-40 relative rounded overflow-hidden aspect-video bg-zinc-800 mb-4 md:mb-0">  
                        {episode.still_path ? (  
                          <img   
                            src={`${POSTER_BASE_URL}${episode.still_path}`}   
                            alt={episode.name}   
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"  
                          />  
                        ) : (  
                           <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No Image</div>  
                        )}  
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">  
                          <Play size={32} className="text-white" />  
                        </div>  
                      </div>  
                        
                      <div className="md:ml-6 flex-grow w-full">  
                        <div className="flex justify-between items-start mb-2">  
                          <h4 className="text-white font-semibold text-lg group-hover:text-blue-400 transition-colors">  
                            {index + 1}. {episode.name}  
                          </h4>  
                          <span className="text-sm text-gray-400 whitespace-nowrap">{episode.runtime ? `${episode.runtime}m` : ''}</span>  
                        </div>  
                        <p className="text-sm text-gray-400 line-clamp-2 md:line-clamp-3">  
                          {episode.overview || "No description available for this episode."}  
                        </p>  
                      </div>  
                    </div>  
                  ))}  
                  {episodes.length === 0 && <p className="text-gray-400">No episodes found for this season.</p>}  
                </div>  
              )}  
            </div>  
          )}  
        </div>  
      </div>  
    </div>  
  );  
};  
  
  
// --- MAIN APP COMPONENT ---  
  
export default function App() {  
  const [activeTab, setActiveTab] = useState('home'); // home, movies, tv, search  
  const [searchQuery, setSearchQuery] = useState('');  
  const [searchResults, setSearchResults] = useState([]);  
  const [isSearching, setIsSearching] = useState(false);  
    
  const [heroItem, setHeroItem] = useState(null);  
    
  // Modals state  
  const [selectedItemDetails, setSelectedItemDetails] = useState(null);  
  const [playerUrl, setPlayerUrl] = useState(null);  
  
  const [isScrolled, setIsScrolled] = useState(false);  
  
  // Handle scroll for navbar styling  
  useEffect(() => {  
    const handleScroll = () => {  
      setIsScrolled(window.scrollY > 50);  
    };  
    window.addEventListener('scroll', handleScroll);  
    return () => window.removeEventListener('scroll', handleScroll);  
  }, []);  
  
  // Fetch Hero Item on load  
  useEffect(() => {  
    const fetchHero = async () => {  
      // Fetch trending day to get a good hero image  
      const data = await fetchApi('/trending/all/day');  
      if (data && data.results) {  
        // Find a good item with a backdrop  
        const validItem = data.results.find(item => item.backdrop_path);  
        setHeroItem(validItem || data.results[0]);  
      }  
    };  
    fetchHero();  
  }, []);  
  
  // Handle Search  
  useEffect(() => {  
    const delayDebounceFn = setTimeout(async () => {  
      if (searchQuery.trim().length > 1) {  
        setIsSearching(true);  
        const data = await fetchApi(`/search/multi?query=${encodeURIComponent(searchQuery)}&include_adult=false`);  
        if (data && data.results) {  
          // Filter to only show movies and tv shows that have images  
          setSearchResults(data.results.filter(item =>   
            (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path  
          ));  
        }  
        setIsSearching(false);  
      } else {  
        setSearchResults([]);  
      }  
    }, 500); // 500ms debounce  
  
    return () => clearTimeout(delayDebounceFn);  
  }, [searchQuery]);  
  
  // Handlers  
  const handleItemClick = (item) => {  
    // If it's from search, we need to ensure media_type is set for the details modal  
    // If it's missing, try to infer it based on active tab, though search returns it.  
    let itemWithType = { ...item };  
    if (!itemWithType.media_type) {  
      if (activeTab === 'movies') itemWithType.media_type = 'movie';  
      else if (activeTab === 'tv') itemWithType.media_type = 'tv';  
      else itemWithType.media_type = item.first_air_date ? 'tv' : 'movie'; // fallback heuristic  
    }  
    setSelectedItemDetails(itemWithType);  
  };  
  
  const handlePlayDirect = (item) => {  
    let type = item.media_type || (item.first_air_date ? 'tv' : 'movie');  
    if (type === 'movie') {  
      setPlayerUrl(getMovieEmbedUrl(item.id));  
    } else {  
      // For TV shows from Hero, open details first to select season/episode  
      handleItemClick(item);  
    }  
  };  
  
  const launchPlayer = (url) => {  
    setPlayerUrl(url);  
    // Keep details modal open underneath, or close it? Let's keep it open for easy back navigation  
  };  
  
  // Content Views  
  const renderHome = () => (  
    <>  
      <Hero item={heroItem} onPlay={handlePlayDirect} onMoreInfo={handleItemClick} />  
      <div className="pb-20 -mt-24 md:-mt-32 relative z-20">  
        <ContentRow title="Trending Now" fetchUrl="/trending/all/week" onItemSelected={handleItemClick} isLarge />  
        <ContentRow title="Popular Movies" fetchUrl="/movie/popular" onItemSelected={handleItemClick} />  
        <ContentRow title="Popular TV Shows" fetchUrl="/tv/popular" onItemSelected={handleItemClick} />  
        <ContentRow title="Top Rated Movies" fetchUrl="/movie/top_rated" onItemSelected={handleItemClick} />  
        <ContentRow title="Top Rated TV Shows" fetchUrl="/tv/top_rated" onItemSelected={handleItemClick} />  
      </div>  
    </>  
  );  
  
  const renderMovies = () => (  
    <div className="pt-24 pb-20">  
      <h1 className="text-4xl font-bold text-white px-4 md:px-12 mb-8">Movies</h1>  
      <ContentRow title="Trending Movies" fetchUrl="/trending/movie/week" onItemSelected={handleItemClick} isLarge />  
      <ContentRow title="Action & Adventure" fetchUrl="/discover/movie?with_genres=28" onItemSelected={handleItemClick} />  
      <ContentRow title="Comedies" fetchUrl="/discover/movie?with_genres=35" onItemSelected={handleItemClick} />  
      <ContentRow title="Sci-Fi & Fantasy" fetchUrl="/discover/movie?with_genres=878" onItemSelected={handleItemClick} />  
      <ContentRow title="Horror" fetchUrl="/discover/movie?with_genres=27" onItemSelected={handleItemClick} />  
    </div>  
  );  
  
  const renderTv = () => (  
    <div className="pt-24 pb-20">  
      <h1 className="text-4xl font-bold text-white px-4 md:px-12 mb-8">TV Shows</h1>  
      <ContentRow title="Trending TV Shows" fetchUrl="/trending/tv/week" onItemSelected={handleItemClick} isLarge />  
      <ContentRow title="Action & Adventure" fetchUrl="/discover/tv?with_genres=10759" onItemSelected={handleItemClick} />  
      <ContentRow title="Comedies" fetchUrl="/discover/tv?with_genres=35" onItemSelected={handleItemClick} />  
      <ContentRow title="Sci-Fi & Fantasy" fetchUrl="/discover/tv?with_genres=10765" onItemSelected={handleItemClick} />  
      <ContentRow title="Dramas" fetchUrl="/discover/tv?with_genres=18" onItemSelected={handleItemClick} />  
    </div>  
  );  
  
  const renderSearch = () => (  
    <div className="pt-32 pb-20 px-4 md:px-12 min-h-screen">  
      <div className="max-w-4xl mx-auto mb-10">  
        <div className="relative">  
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />  
          <input   
            type="text"   
            placeholder="Search for movies, TV shows..."   
            className="w-full bg-zinc-800/80 border border-zinc-700 text-white rounded-full py-4 pl-14 pr-6 text-xl focus:outline-none focus:border-blue-500 transition-colors shadow-inner backdrop-blur-sm"  
            value={searchQuery}  
            onChange={(e) => setSearchQuery(e.target.value)}  
            autoFocus  
          />  
          {searchQuery && (  
             <button   
               onClick={() => setSearchQuery('')}  
               className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"  
             >  
               <X size={20} />  
             </button>  
          )}  
        </div>  
      </div>  
  
      {isSearching ? (  
        <Loader />  
      ) : searchResults.length > 0 ? (  
        <div>  
          <h2 className="text-2xl font-semibold text-gray-300 mb-6">Results for "{searchQuery}"</h2>  
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">  
            {searchResults.map(item => (  
              <div key={item.id} className="w-full">  
                <PosterCard item={item} onClick={handleItemClick} />  
              </div>  
            ))}  
          </div>  
        </div>  
      ) : searchQuery.length > 1 ? (  
        <div className="text-center text-gray-400 mt-20">  
          <p className="text-2xl mb-2">No results found.</p>  
          <p>Try different keywords or check for typos.</p>  
        </div>  
      ) : (  
        <div className="flex flex-col items-center justify-center text-zinc-600 mt-20 space-y-4">  
          <Film size={64} className="opacity-50" />  
          <p className="text-xl font-medium">Search the Streamverse catalog</p>  
        </div>  
      )}  
    </div>  
  );  
  
  return (  
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-blue-500/30">  
        
      {/* Dynamic Navbar */}  
      <nav className={`fixed top-0 w-full z-40 transition-all duration-300 px-4 md:px-12 py-4 flex items-center justify-between ${  
        isScrolled ? 'bg-zinc-950/95 backdrop-blur-md shadow-lg shadow-black/50 py-3' : 'bg-gradient-to-b from-black/80 to-transparent'  
      }`}>  
        <div className="flex items-center space-x-8 md:space-x-12">  
          {/* Logo */}  
          <div   
            className="text-2xl md:text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 cursor-pointer hover:scale-105 transition-transform"  
            onClick={() => { setActiveTab('home'); window.scrollTo(0,0); }}  
          >  
            STREAMVERSE  
          </div>  
            
          {/* Desktop Nav Links */}  
          <div className="hidden md:flex space-x-6 text-sm font-medium">  
            <button onClick={() => { setActiveTab('home'); window.scrollTo(0,0); }} className={`transition-colors hover:text-blue-400 ${activeTab === 'home' ? 'text-white' : 'text-gray-400'}`}>Home</button>  
            <button onClick={() => { setActiveTab('movies'); window.scrollTo(0,0); }} className={`transition-colors hover:text-blue-400 ${activeTab === 'movies' ? 'text-white' : 'text-gray-400'}`}>Movies</button>  
            <button onClick={() => { setActiveTab('tv'); window.scrollTo(0,0); }} className={`transition-colors hover:text-blue-400 ${activeTab === 'tv' ? 'text-white' : 'text-gray-400'}`}>TV Shows</button>  
          </div>  
        </div>  
  
        {/* Right side actions */}  
        <div className="flex items-center space-x-4">  
          <button   
            onClick={() => { setActiveTab('search'); window.scrollTo(0,0); }}  
            className={`p-2 rounded-full transition-all duration-300 ${activeTab === 'search' ? 'bg-white/10 text-white' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}  
          >  
            <Search size={20} />  
          </button>  
            
          {/* User Avatar Placeholder */}  
          <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-blue-600 to-purple-600 border border-zinc-700 cursor-pointer"></div>  
        </div>  
      </nav>  
  
      {/* Main Content Area */}  
      <main className="min-h-screen">  
        {activeTab === 'home' && renderHome()}  
        {activeTab === 'movies' && renderMovies()}  
        {activeTab === 'tv' && renderTv()}  
        {activeTab === 'search' && renderSearch()}  
      </main>  
  
      {/* Footer */}  
      <footer className="bg-zinc-950 py-10 px-4 md:px-12 border-t border-zinc-900 mt-auto text-center text-zinc-500 text-sm">  
        <p className="mb-2">© {new Date().getFullYear()} Streamverse. All rights reserved.</p>  
        <p>Data provided by TMDB. Video sources provided by external services.</p>  
      </footer>  
  
      {/* Mobile Bottom Navigation (Visible only on small screens) */}  
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-lg border-t border-zinc-800 flex justify-around items-center p-3 z-40 pb-safe">  
        <button onClick={() => { setActiveTab('home'); window.scrollTo(0,0); }} className={`flex flex-col items-center ${activeTab === 'home' ? 'text-blue-400' : 'text-gray-500'}`}>  
          <Home size={24} />  
          <span className="text-[10px] mt-1">Home</span>  
        </button>  
        <button onClick={() => { setActiveTab('movies'); window.scrollTo(0,0); }} className={`flex flex-col items-center ${activeTab === 'movies' ? 'text-blue-400' : 'text-gray-500'}`}>  
          <Film size={24} />  
          <span className="text-[10px] mt-1">Movies</span>  
        </button>  
        <button onClick={() => { setActiveTab('tv'); window.scrollTo(0,0); }} className={`flex flex-col items-center ${activeTab === 'tv' ? 'text-blue-400' : 'text-gray-500'}`}>  
          <Tv size={24} />  
          <span className="text-[10px] mt-1">TV</span>  
        </button>  
        <button onClick={() => { setActiveTab('search'); window.scrollTo(0,0); }} className={`flex flex-col items-center ${activeTab === 'search' ? 'text-blue-400' : 'text-gray-500'}`}>  
          <Search size={24} />  
          <span className="text-[10px] mt-1">Search</span>  
        </button>  
      </div>  
  
      {/* Overlays */}  
      {selectedItemDetails && (  
        <DetailsModal   
          item={selectedItemDetails}   
          onClose={() => setSelectedItemDetails(null)}  
          onPlayMedia={launchPlayer}  
        />  
      )}  
  
      {playerUrl && (  
        <PlayerModal   
          url={playerUrl}   
          onClose={() => setPlayerUrl(null)}   
        />  
      )}  
  
      {/* Global styles for custom scrollbar within modals/rows to keep it clean */}  
      <style dangerouslySetInnerHTML={{__html: `  
        .scrollbar-hide::-webkit-scrollbar {  
          display: none;  
        }  
        .custom-scrollbar::-webkit-scrollbar {  
          width: 8px;  
        }  
        .custom-scrollbar::-webkit-scrollbar-track {  
          background: #18181b; /* zinc-900 */  
        }  
        .custom-scrollbar::-webkit-scrollbar-thumb {  
          background-color: #3f3f46; /* zinc-700 */  
          border-radius: 20px;  
        }  
        .pb-safe {  
          padding-bottom: env(safe-area-inset-bottom);  
        }  
      `}} />  
    </div>  
  );  
}  
  
