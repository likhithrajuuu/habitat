package com.project.habitat.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.habitat.exception.CrudOperationException;
import com.project.habitat.exception.CrudValidationException;
import com.project.habitat.model.Format;
import com.project.habitat.model.Genre;
import com.project.habitat.model.Language;
import com.project.habitat.model.Movie;
import com.project.habitat.repository.MovieRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;

@Service
public class MovieService {
	@Autowired
	private MovieRepository movieRepository;
	
	@PersistenceContext
	private EntityManager entityManager;
	
	private Logger log = LogManager.getLogger(MovieService.class);
	
	@Autowired
	private Validator validator;
	
	private static final String CACHE_ALL_MOVIES = "allMovies";
	private static final String CACHE_MOVIE_BY_ID = "movie";
	
	private void checkForNull(Movie movie) {
		if(movie == null) {
			throw CrudOperationException.asNullEntity(Movie.class);
		}
	}
	
	private void checkId(Long id) throws CrudValidationException{
		if(id<=0) {
			throw CrudValidationException.asInvalidEntityId(getClass());
		}
	}
	
	
	private void validate(Movie model) throws CrudValidationException {
        Set<ConstraintViolation<Movie>> violations = validator.validate(model);
        if (!violations.isEmpty()) {
            throw CrudValidationException.asFailedValidationOperation(Movie.class, violations);
        }
    }

    private void attachRelatedEntities(Movie movie) {
        if (movie.getGenres() != null && !movie.getGenres().isEmpty()) {
            Set<Genre> managedGenres = movie.getGenres().stream()
                .map(genre -> {
                    if (genre.getGenreId() != null) {
                        return entityManager.getReference(Genre.class, genre.getGenreId());
                    }
                    return entityManager.merge(genre);
                })
                .collect(Collectors.toSet());
            movie.setGenres(managedGenres);
        }
        
        if (movie.getFormats() != null && !movie.getFormats().isEmpty()) {
            Set<Format> managedFormats = movie.getFormats().stream()
                .map(format -> {
                    if (format.getFormatId() != null) {
                        return entityManager.getReference(Format.class, format.getFormatId());
                    }
                    return entityManager.merge(format);
                })
                .collect(Collectors.toSet());
            movie.setFormats(managedFormats);
        }
        
        if (movie.getLanguages() != null && !movie.getLanguages().isEmpty()) {
            Set<Language> managedLanguages = movie.getLanguages().stream()
                .map(language -> {
                    if (language.getLanguageId() != null) {
                        return entityManager.getReference(Language.class, language.getLanguageId());
                    }
                    return entityManager.merge(language);
                })
                .collect(Collectors.toSet());
            movie.setLanguages(managedLanguages);
        }
    }

    private Movie createNewMovieEntity(Movie movie) {
        Movie newMovie = new Movie();
        newMovie.setMovieName(movie.getMovieName());
        newMovie.setMovieDescription(movie.getMovieDescription());
        newMovie.setDurationMinutes(movie.getDurationMinutes());
        newMovie.setCertificate(movie.getCertificate());
        newMovie.setReleaseDate(movie.getReleaseDate());
        newMovie.setAvgRating(movie.getAvgRating());
        return newMovie;
    }

    @Transactional
    private Movie saveMovie(Movie movie) throws CrudOperationException {
        try {
            boolean isNew = (movie.getMovieId() == null);
            Movie movieToSave;
            
            if (isNew) {
                movieToSave = createNewMovieEntity(movie);
                attachRelatedEntities(movieToSave);
            } else {
                if (entityManager.contains(movie)) {
                    entityManager.detach(movie);
                }
                movieToSave = movie;
                attachRelatedEntities(movieToSave);
            }
            
            Movie savedModel = movieRepository.save(movieToSave);
            log.info((isNew ? "Added" : "Updated") + " MoviesModel with ID: " + savedModel.getMovieId());
            return savedModel;
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            log.error("Data integrity violation while saving movie: " + e.getMessage(), e);
            throw CrudOperationException.asFailedAddOperation(Movie.class, e);
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Entity not found while saving movie: " + e.getMessage(), e);
            throw CrudOperationException.asFailedAddOperation(Movie.class, e);
        } catch (org.hibernate.StaleObjectStateException e) {
            log.error("Stale object state exception while saving movie: " + e.getMessage(), e);
            throw CrudOperationException.asFailedAddOperation(Movie.class, e);
        } catch (Exception e) {
            log.error("Unexpected error while saving movie: " + e.getMessage(), e);
            throw CrudOperationException.asFailedAddOperation(Movie.class, e);
        }
    }
    
    @PreAuthorize("permitAll()")
    @Cacheable(value = CACHE_ALL_MOVIES, key = "'all'")
    public List<Movie> getAllMovies() throws CrudOperationException{
    	try {
    		log.info("Fetching all movies from database");
    		List<Movie> movies = movieRepository.findAll();
    		log.info("Fetched {} movies from database", movies.size());
    		return movies;
    	}
    	catch(Exception e) {
    		throw CrudOperationException.asFailedGetOperation(getClass(), e);
    	}
    }

	@Cacheable(value = CACHE_MOVIE_BY_ID, key = "#id")
	public Optional<Movie> getMovieById(Long id) throws CrudOperationException {
		try{
			log.info("Fetching movie with ID {} from database", id);
			Optional<Movie> movie = movieRepository.findById(id);
			if (movie.isPresent()) {
				log.info("Movie with ID {} found in database", id);
			} else {
				log.warn("Movie with ID {} not found in database", id);
			}
			return movie;
		}
		catch(Exception e) {
			throw CrudOperationException.asFailedGetOperation(getClass(), e);
		}
	}

	@PreAuthorize("hasRole('ADMIN')")
	@CacheEvict(value = CACHE_ALL_MOVIES, allEntries = true)
	public Movie addMovie(Movie movie) throws CrudOperationException {
		checkForNull(movie);
		movie.setMovieId(null);
		validate(movie);
		Movie savedMovie = saveMovie(movie);
		log.info("Cleared cache for all movies after adding new movie");
		return savedMovie;
	}

	@PreAuthorize("hasRole('ADMIN')")
	@Caching(evict = {
		@CacheEvict(value = CACHE_ALL_MOVIES, allEntries = true),
		@CacheEvict(value = CACHE_MOVIE_BY_ID, key = "#movie.movieId")
	})
	public Movie updateMovie(Movie movie) throws CrudOperationException {
		checkForNull(movie);
		checkId(movie.getMovieId());
		validate(movie);
		Movie savedMovie = saveMovie(movie);
		log.info("Cleared cache for movie ID {} and all movies after update", movie.getMovieId());
		return savedMovie;
	}

	@PreAuthorize("hasRole('ADMIN')")
	@Transactional
	@Caching(evict = {
		@CacheEvict(value = CACHE_ALL_MOVIES, allEntries = true),
		@CacheEvict(value = CACHE_MOVIE_BY_ID, key = "#id")
	})
	public void deleteMovie(Long id) throws CrudOperationException {
		checkId(id);
		try {
			if (!movieRepository.existsById(id)) {
				throw CrudOperationException.asEntityNotFound(Movie.class, id);
			}
			movieRepository.deleteById(id);
			log.info("Deleted MoviesModel with ID: " + id);
			log.info("Cleared cache for movie ID {} and all movies after deletion", id);
		} catch (org.springframework.dao.DataIntegrityViolationException e) {
			log.error("Cannot delete movie with ID " + id + " due to foreign key constraints: " + e.getMessage(), e);
			throw CrudOperationException.asFailedDeleteOperation(Movie.class, e);
		} catch (Exception e) {
			log.error("Error while deleting movie with ID " + id + ": " + e.getMessage(), e);
			throw CrudOperationException.asFailedDeleteOperation(Movie.class, e);
		}
	}

    public List<Movie> getMoviesByGenre(String genreName){
        List<Movie> movies = movieRepository.findMoviesByGenre(genreName);
        log.info("Successfully fetched " + movies.size() + " movies based on Genre:"+genreName);
        return movies;
    }

    public List<Movie> getMoviesByFormat(String format){
        List<Movie> movies = movieRepository.findMoviesByFormat(format);
        log.info("Successfully fetched " + movies.size() + " movies based on Format:"+format);
        return movies;
    }

    public List<Movie> getMoviesByLangauge(String language){
        List<Movie> movies = movieRepository.findMoviesByLanguage(language);
        log.info("Successfully fetched "+movies.size()+" movies based on Language:"+ language);
        return movies;
    }
}
