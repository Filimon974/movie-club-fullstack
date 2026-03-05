import { useState, useEffect } from 'react';
import { Search, Trophy, X, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import ChatRoom from '../components/ChatRoom';

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [genreSections, setGenreSections] = useState([]);
  const [topVoted, setTopVoted] = useState([]);
  const [currentWeek, setCurrentWeek] = useState('2024-W10'); 
  const [isLoading, setIsLoading] = useState(true);
  
  // NEW Chat State
  const [activeRoom, setActiveRoom] = useState(null);
  const username = localStorage.getItem('username'); 
  const role = localStorage.getItem('role'); 
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const genresRes = await axios.get(`${import.meta.env.VITE_API_URL}/genres`);
      const genres = genresRes.data; 

      const sectionData = await Promise.all(
        genres.map(async (genre) => {
          const res = await axios.get(
            `https://api.themoviedb.org/3/discover/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&with_genres=${genre.id}&page=1`
          );
          return { ...genre, movies: res.data.results };
        })
      );
      setGenreSections(sectionData);
      await fetchTopVoted();
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTopVoted = async () => {
    try {
        const topRes = await axios.get(`${import.meta.env.VITE_API_URL}/leaderboard?week=${currentWeek}`);
        setTopVoted(topRes.data);
    } catch (err) {
        console.error("Failed to fetch top voted", err);
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) {
        setIsSearching(false);
        return;
    }
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/search?query=${searchQuery}`);
      setSearchResults(res.data);
      setIsSearching(true);
    } catch (err) {
      console.error("Search failed", err);
      Swal.fire({
          icon: 'error',
          title: 'Search Failed',
          text: 'Could not connect to search server.',
          background: '#18181b',
          color: '#fff'
      });
    }
  };

  const clearSearch = () => {
      setSearchQuery('');
      setSearchResults([]);
      setIsSearching(false);
  };

  // --- FIXED: Handle Manual Reset ---
  const handleResetVotes = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This will delete all votes for this week. This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#3f3f46',
      confirmButtonText: 'Yes, reset!',
      background: '#18181b',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        // VITE_API_URL is http://localhost:5000/api
        // The endpoint is /api/admin/reset-votes
        // We only append /admin/reset-votes to avoid double /api
        await axios.post(`${import.meta.env.VITE_API_URL}/admin/reset-votes`);
        
        Swal.fire({
          icon: 'success',
          title: 'Reset',
          text: 'Voting data has been cleared.',
          background: '#18181b',
          color: '#fff'
        });
        fetchTopVoted();
      } catch (err) {
        console.error("Reset failed", err);
        Swal.fire('Error', 'Failed to reset votes. Check console for details.', 'error');
      }
    }
  };

  // --- INTERNAL MOVIE CARD ---
  const MovieCard = ({ movie }) => {
    const handleVote = async (e) => {
      e.stopPropagation(); 
      
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        Swal.fire({
            icon: 'error',
            title: 'Unauthorized',
            text: 'Please log in to vote!',
            background: '#18181b',
            color: '#fff',
            confirmButtonColor: '#dc2626'
        });
        return;
      }

      const voteData = {
        userId: userId, 
        movieId: String(movie.id), 
        title: movie.title,
        poster: movie.poster_path,
        week: currentWeek 
      };

      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/vote`, voteData);
        
        if (response.data.promptUpdate) {
            const result = await Swal.fire({
                title: 'Update your vote?',
                text: `You have already voted this week. Change to "${movie.title}"?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#dc2626', 
                cancelButtonColor: '#3f3f46', 
                confirmButtonText: 'Yes, update!',
                background: '#18181b',
                color: '#fff'
            });

            if (result.isConfirmed) {
                await axios.post(`${import.meta.env.VITE_API_URL}/vote/update`, voteData);
                showSuccessToast();
            }
        } else {
            showSuccessToast();
        }

        fetchTopVoted(); 
      } catch (err) {
        console.error('Voting failed', err);
        Swal.fire({
            icon: 'error',
            title: 'Voting Failed',
            text: err.response?.data?.error || 'Failed to vote.',
            background: '#18181b',
            color: '#fff',
            confirmButtonColor: '#dc2626'
        });
      }
    };

    const showSuccessToast = () => {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Vote cast successfully!',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: '#27272a',
            color: '#fff',
            iconColor: '#22c55e'
        });
    }

    return (
      <div 
        onClick={() => navigate(`/movie/${movie.id}`)} 
        className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 hover:border-zinc-700 transition group flex-shrink-0 w-48 cursor-pointer flex flex-col"
      >
        <img 
          src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/500x750?text=No+Poster'} 
          alt={movie.title} 
          className="rounded-lg mb-3 w-full h-72 object-cover" 
        />
        <h3 className="font-semibold truncate group-hover:text-red-500 text-sm text-white">{movie.title}</h3>
        <p className="text-xs text-zinc-400 mb-3">{movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</p>
        
        <button 
          onClick={handleVote}
          className="mt-auto w-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition"
        >
          Vote as Movie of the Week
        </button>
      </div>
    );
  };

  // --- SKELETON COMPONENTS ---
  const TopVotedSkeleton = () => (
    <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-zinc-800 animate-pulse rounded"></div>
        <div className="w-48 h-6 bg-zinc-800 animate-pulse rounded"></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="w-full h-72 bg-zinc-800 animate-pulse rounded-lg"></div>
            <div className="w-3/4 h-4 bg-zinc-800 animate-pulse rounded mx-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const MovieSectionSkeleton = () => (
    <div className="mb-10">
      <div className="w-48 h-8 bg-zinc-800 animate-pulse rounded mb-4"></div>
      <div className="flex gap-4 overflow-x-hidden pb-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-48 space-y-2">
            <div className="w-full h-72 bg-zinc-800 animate-pulse rounded-lg"></div>
            <div className="w-3/4 h-4 bg-zinc-800 animate-pulse rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const MovieSection = ({ title, movies }) => (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <form onSubmit={handleSearch} className="relative mb-6">
        <Search className="absolute left-4 top-3.5 text-zinc-500" size={20} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search movies by title..." 
          className="w-full bg-zinc-900 p-4 pl-12 rounded-xl border border-zinc-800 focus:ring-1 focus:ring-red-600 outline-none text-white"
        />
        {isSearching && (
            <button 
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-3.5 text-zinc-500 hover:text-white"
            >
                <X size={20} />
            </button>
        )}
      </form>

      {/* NEW: Chat Room UI */}
      {activeRoom && (
        <ChatRoom 
            roomName={activeRoom} 
            username={username} 
            onLeave={() => setActiveRoom(null)}
        />
      )}

      {isSearching ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Search Results for "{searchQuery}"</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {searchResults.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      ) : (
        <>
          {isLoading ? (
            <>
              <TopVotedSkeleton />
              {[...Array(3)].map((_, i) => <MovieSectionSkeleton key={i} />)}
            </>
          ) : (
            <>
              <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-10">
                <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3">
                        <Trophy className="text-yellow-500" size={24} />
                        <h2 className="text-xl font-bold text-white">Top 5 Voted - {currentWeek}</h2>
                    </div>
                    
                    {/* --- ADDED: Admin Reset Button --- */}
                    {role === 'admin' && (
                        <button 
                            onClick={handleResetVotes}
                            className="flex items-center gap-2 bg-red-950 text-red-300 hover:bg-red-900 px-4 py-2 rounded-lg text-sm transition"
                        >
                            <Trash2 size={16} />
                            Reset Weekly Vote
                        </button>
                    )}
                </div>
                
                {/* Voting Grid / Empty State */}
                {topVoted.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-zinc-700 rounded-lg">
                        <Trophy size={48} className="mx-auto text-zinc-600 mb-4" />
                        <p className="text-zinc-400">No votes cast yet this week!</p>
                        <p className="text-xs text-zinc-500">Be the first to vote below.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {topVoted.map((movie, index) => (
                        <div key={movie._id} className="text-center relative">
                          <span className="absolute -top-2 -left-2 bg-red-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm z-10">{index + 1}</span>
                          <img 
                            onClick={() => navigate(`/movie/${movie.movieId}`)} 
                            src={movie.poster ? `https://image.tmdb.org/t/p/w500${movie.poster}` : 'https://placehold.co/500x750?text=No+Poster'} 
                            alt={movie.title} 
                            className="rounded-lg mb-2 cursor-pointer w-full h-72 object-cover" 
                          />
                          <p className="text-sm truncate font-medium text-white">{movie.title}</p>
                          <p className="text-xs text-zinc-400">{movie.voteCount} Votes</p>
                        </div>
                      ))}
                    </div>
                )}
              </div>

              {genreSections.map(section => (
                <MovieSection key={section.id} title={section.name} movies={section.movies} />
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}