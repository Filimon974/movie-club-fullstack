import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import MovieCard from '../components/MovieCard'; 

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const res = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&append_to_response=genres`
        );
        setMovie(res.data);
      } catch (err) {
        console.error('Failed to fetch movie details', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovieDetails();
  }, [id]);

  if (isLoading) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-red-600" size={48} /></div>;
  if (!movie) return <div className="text-white text-center mt-10 text-xl">Movie not found.</div>;

  return (
    <div className="text-white p-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-12 bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
        <img 
          src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/500x750?text=No+Poster'} 
          alt={movie.title} 
          className="rounded-2xl w-full md:w-80 shadow-2xl shadow-black/50" 
        />
        
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-5xl font-extrabold mb-2">{movie.title}</h1>
            <div className="flex gap-2 flex-wrap">
              {movie.genres.map(genre => (
                <span key={genre.id} className="bg-red-600/10 text-red-500 border border-red-600/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {genre.name}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-zinc-400 uppercase tracking-widest">Overview</h3>
            <p className="text-zinc-300 leading-relaxed text-lg">{movie.overview}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-zinc-800 p-4 rounded-2xl">
              <p className="text-xs text-zinc-500 uppercase font-bold">Rating</p>
              <p className="text-2xl font-bold text-yellow-500">{movie.vote_average.toFixed(1)} <span className="text-sm text-zinc-600">/ 10</span></p>
            </div>
            <div className="bg-zinc-800 p-4 rounded-2xl">
              <p className="text-xs text-zinc-500 uppercase font-bold">Release</p>
              <p className="text-2xl font-bold">{new Date(movie.release_date).getFullYear()}</p>
            </div>
          </div>
          
          <div className="pt-6">
            <p className="text-sm text-zinc-500 mb-3 italic">Ready to make this your movie of the week?</p>
            {/* The MovieCard is reused specifically to handle the voting logic/button */}
            <MovieCard movie={movie} />
          </div>
        </div>
      </div>
    </div>
  );
}