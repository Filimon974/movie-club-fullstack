import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useState, useEffect } from 'react';

export default function MovieCard({ movie, onVoteSuccess }) {
  const navigate = useNavigate();
  const [hasVoted, setHasVoted] = useState(false);
  
  // Current Week logic
  const currentWeek = '2024-W10'; 

  useEffect(() => {
    const checkIfVoted = async () => {
      const userId = localStorage.getItem('userId'); // Get ID inside effect
      try {
        if (!userId || !movie?.id) return;
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/check-vote`, {
          params: { 
            movieId: String(movie.id), 
            userId: userId, 
            week: currentWeek 
          }
        });
        setHasVoted(res.data.voted);
      } catch (err) { 
        console.error('Error checking vote status', err); 
      }
    };
    checkIfVoted();
  }, [movie.id]);

  const handleVote = async (e) => {
    e.stopPropagation();
    const userId = localStorage.getItem('userId'); // Ensure we have the latest ID

    if (!userId) {
      alert("Session expired. Please log out and log back in.");
      return;
    }

    if (hasVoted) {
      if (!window.confirm("Update your weekly vote to this movie?")) return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/vote`, {
        movieId: String(movie.id),
        title: movie.title,
        poster: movie.poster_path,
        userId: userId, 
        week: currentWeek 
      });
      alert('Voted successfully!');
      setHasVoted(true);
      if (onVoteSuccess) onVoteSuccess();
    } catch (err) { 
      console.error('Voting failed', err);
      alert(err.response?.data?.error || 'Voting failed. Try logging in again.'); 
    }
  };

  const handleClick = () => navigate(`/movie/${movie.id}`);

  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
    : 'https://placehold.co/500x750?text=No+Poster';

  return (
    <div onClick={handleClick} className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 hover:border-zinc-700 transition group w-full cursor-pointer flex flex-col justify-between">
      <div>
        <img src={posterUrl} alt={movie.title} className="rounded-lg mb-3 w-full h-72 object-cover" />
        <h3 className="font-semibold truncate group-hover:text-red-500 text-sm text-white">{movie.title}</h3>
        <p className="text-xs text-zinc-400 mb-3">{movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</p>
      </div>
      <button onClick={handleVote} className={`w-full text-white text-xs font-semibold py-2 px-3 rounded-lg transition ${hasVoted ? 'bg-zinc-700' : 'bg-red-600 hover:bg-red-700'}`}>
        {hasVoted ? 'Update Vote' : 'Vote as Movie of the Week'}
      </button>
    </div>
  );
}