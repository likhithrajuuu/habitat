import {useEffect, useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {getAllMovies} from "../redux/actions/movieActions";
import api from "../api/axios";
import MovieCard from "../components/MovieCard";
import {ChevronDown, ChevronUp, X} from "lucide-react";

const extractOptions = (movies, key, subKey) => {
    const set = new Set();
    movies.forEach(m => {
        const val = m[key];
        if (Array.isArray(val)) {
            val.forEach(item => set.add(typeof item === 'object' ? item[subKey] : item));
        } else if (val) {
            set.add(typeof val === 'object' ? val[subKey] : val);
        }
    });
    return Array.from(set).sort();
};

export default function ExploreMovies({
                                          location
                                      }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {movies, loading} = useSelector(state => state.movieList || {});

    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedFormats, setSelectedFormats] = useState([]);

    useEffect(() => {
        dispatch(getAllMovies());
    }, [dispatch]);

    useEffect(() => {
        if (!movies || movies.length === 0) return;

        const fetchCounts = async () => {
            try {
                const responses = await Promise.all(
                    movies.map(movie =>
                        api.get(`/ratings/count/${movie.movieId}`)
                            .then(res => ({
                                movieId: movie.movieId,
                                count: res.data
                            }))
                            .catch(() => ({
                                movieId: movie.movieId,
                                count: 0
                            }))
                    )
                );

                const map = {};
                responses.forEach(r => {
                    map[r.movieId] = r.count;
                });

                setRatingsCountMap(map);
            } catch (e) {
                console.error("Failed to fetch ratings counts", e);
            }
        };

        fetchCounts();
    }, [movies]);

    const languages = useMemo(() => extractOptions(movies || [], 'languages', 'name'), [movies]);
    const genres = useMemo(() => extractOptions(movies || [], 'genres', 'name'), [movies]);
    const formats = useMemo(() => extractOptions(movies || [], 'formats', 'name'), [movies]);
    const [ratingsCountMap, setRatingsCountMap] = useState({});

    const filteredMovies = useMemo(() => {
        if (!movies) return [];
        return movies.filter(m => {
            const mLangs = (m.languages || []).map(l => l.name);
            const mGenres = (m.genres || []).map(g => g.name);
            const mFormats = (m.formats || []).map(f => f.name);

            const langMatch = selectedLanguages.length === 0 || selectedLanguages.some(l => mLangs.includes(l));
            const genreMatch = selectedGenres.length === 0 || selectedGenres.some(g => mGenres.includes(g));
            const formatMatch = selectedFormats.length === 0 || selectedFormats.some(f => mFormats.includes(f));

            return langMatch && genreMatch && formatMatch;
        });
    }, [movies, selectedLanguages, selectedGenres, selectedFormats]);

    const FilterSection = ({title, options, selected, onChange, onClear, defaultOpen = false}) => {
        const [isOpen, setIsOpen] = useState(defaultOpen);
        return (
            <div
                className="mb-4 rounded-lg bg-white shadow-sm dark:bg-slate-900 overflow-hidden border border-slate-100 dark:border-slate-800">
                <div className="flex w-full items-center justify-between p-4">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 text-sm font-semibold transition-colors outline-none"
                    >
                        {isOpen ? (
                            <ChevronUp size={16} className="text-rose-500"/>
                        ) : (
                            <ChevronDown size={16} className="text-slate-400"/>
                        )}
                        <span className={isOpen ? "text-rose-500" : "text-slate-700 dark:text-slate-200"}>
                            {title}
                        </span>
                    </button>

                    {selected.length > 0 && (
                        <button
                            onClick={onClear}
                            className="text-[10px] font-bold text-slate-400 hover:text-rose-500 uppercase tracking-wider transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {isOpen && (
                    <div className="flex flex-wrap gap-2 px-4 pb-4">
                        {options.map(opt => {
                            const isSelected = selected.includes(opt);
                            return (
                                <button
                                    key={opt}
                                    onClick={() => onChange(isSelected ? selected.filter(s => s !== opt) : [...selected, opt])}
                                    className={`rounded border px-3 py-1.5 text-xs font-medium transition-all ${
                                        isSelected
                                            ? "border-rose-500 bg-rose-50 text-rose-500 dark:bg-rose-500/10 shadow-sm"
                                            : "border-slate-200 text-slate-600 hover:border-rose-500 hover:text-rose-500 dark:border-slate-800 dark:text-slate-400 bg-white dark:bg-transparent"
                                    }`}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
            <div className="flex flex-col gap-8 md:flex-row">
                {/* Sidebar Filters */}
                <aside className="w-full shrink-0 md:w-64 lg:w-72">
                    <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Filters</h2>
                    <FilterSection
                        title="Languages"
                        options={languages}
                        selected={selectedLanguages}
                        onChange={setSelectedLanguages}
                        onClear={() => setSelectedLanguages([])}
                        defaultOpen={true}
                    />
                    <FilterSection
                        title="Genres"
                        options={genres}
                        selected={selectedGenres}
                        onChange={setSelectedGenres}
                        onClear={() => setSelectedGenres([])}
                    />
                    <FilterSection
                        title="Format"
                        options={formats}
                        selected={selectedFormats}
                        onChange={setSelectedFormats}
                        onClear={() => setSelectedFormats([])}
                    />
                    <button
                        className="w-full rounded-lg border border-rose-500 py-2.5 text-xs font-bold text-rose-500 transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10">
                        Browse by Cinemas
                    </button>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Movies In Your Area</h1>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-8">
                        {languages.slice(0, 8).map(lang => (
                            <button key={lang}
                                    className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-rose-500 shadow-sm transition-all hover:bg-rose-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-rose-500/10">
                                {lang}
                            </button>
                        ))}
                    </div>

                    <a
                        href="#"
                        className="p-4 rounded-lg shadow-md w-full mx-auto mt-2 mb-6
             flex items-center justify-between
             border border-gray-300
             bg-[radial-gradient(#e5e7eb_1px,transparent_1px)]
             bg-[size:16px_16px]"
                    >
                        <h4 className="text-l font-semibold text-gray-800">Coming Soon</h4>
                        <span className="text-red-500 text-s font-medium">
    Explore Upcoming Movies →
  </span>
                    </a>

                    {loading ? (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {Array.from({length: 8}).map((_, i) => (
                                <div key={i}
                                     className="aspect-[2/3] animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"/>
                            ))}
                        </div>
                    ) : filteredMovies.length > 0 ? (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
                            {filteredMovies.map(movie => (
                                <div key={movie.movieId}
                                     className="w-full transform transition-transform">
                                    <MovieCard
                                        movieId={movie.movieId}
                                        title={movie.movieName}
                                        posterSrc={movie.moviePoster}
                                        avgRatingLabel={movie.avgRating}
                                        certificate={movie.certificate}
                                        languagesLabel={(movie.languages || []).map(l => l.name).join(', ')}
                                        countOfRatings={ratingsCountMap[movie.movieId]}
                                        onClick={() => navigate(`/movies/${movie.movieId}`)}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <X size={48} className="mb-4 opacity-20"/>
                            <p>No movies found matching these filters.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}