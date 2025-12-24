package com.project.habitat.controller;

import com.project.habitat.exception.CrudOperationException;
import com.project.habitat.exception.CrudValidationException;
import com.project.habitat.model.Movie;
import com.project.habitat.service.MovieService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/movies")
public class MovieController {
    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    private Logger log = LogManager.getLogger(MovieController.class);

    @GetMapping("/getall")
    public ResponseEntity<?> getAllMovies() {
        try {
            List<Movie> movies = movieService.getAllMovies();
            log.info("Successfully fetched " + movies.size() + " movies");
            return ResponseEntity.status(HttpStatus.OK).body(movies);
        } catch (CrudOperationException e) {
            log.error("Error while fetching movies: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        } catch (CrudValidationException e) {
            log.error("Error while fetching movies: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error while fetching movies: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<?> getMovieById(@PathVariable Long id) {
        try {
            Optional<Movie> movies = movieService.getMovieById(id);
            log.info("Successfully fetched movie with ID: " + id);
            return ResponseEntity.status(HttpStatus.OK).body(movies);
        } catch (CrudOperationException e) {
            log.error("Error while fetching movies: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        } catch (CrudValidationException e) {
            log.error("Error while fetching movies: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error while fetching movies: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/add")
    public ResponseEntity<?> addMovie(@RequestBody Movie movie) {
        try {
            Movie movies = movieService.addMovie(movie);
            log.info("Successfully added movie with ID: " + movies.getMovieId());
            return ResponseEntity.status(HttpStatus.CREATED).body(movies);
        } catch (CrudOperationException e) {
            log.error("Error while adding movie: " + e.getMessage(), e);
            String errorMessage = e.getMessage();
            if (e.getCause() != null) {
                errorMessage += " - Cause: " + e.getCause().getMessage();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorMessage);
        } catch (CrudValidationException e) {
            log.error("Validation error while adding movie: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error while adding movie: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateMovie(@RequestBody Movie movie) {
        try {
            Movie movies = movieService.updateMovie(movie);
            log.info("Successfully updated movie with ID: " + movies.getMovieId());
            return ResponseEntity.status(HttpStatus.OK).body(movies);
        } catch (CrudOperationException e) {
            log.error("Error while fetching movies: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        } catch (CrudValidationException e) {
            log.error("Error while fetching movies: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error while fetching movies: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteMovie(@PathVariable Long id) {
        try {
            movieService.deleteMovie(id);
            log.info("Successfully deleted movie with ID: " + id);
            return ResponseEntity.status(HttpStatus.OK).body("Movie deleted successfully");
        } catch (CrudOperationException e) {
            log.error("Error while deleting movie: " + e.getMessage(), e);
            String errorMessage = e.getMessage();
            if (e.getCause() != null) {
                errorMessage += " - Cause: " + e.getCause().getMessage();
            }
            if (errorMessage.contains("not found") || errorMessage.contains("Entity not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorMessage);
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorMessage);
        } catch (CrudValidationException e) {
            log.error("Validation error while deleting movie: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error while deleting movie: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/genre/{genreName}")
    public ResponseEntity<?> getMoviesbyGenre(@PathVariable String genreName){
        try{
            List<Movie> movies = movieService.getMoviesByGenre(genreName);
            return ResponseEntity.status(HttpStatus.OK).body(movies);
        }
        catch(CrudOperationException e){
            log.error("Error while fetching movies: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e);
        }
        catch(CrudValidationException e){
            log.error("Error while fetching movies: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e);
        }
        catch(Exception e){
            log.error("Unexpected error while fetching movie: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e);
        }
    }

    @GetMapping("/format/{formatName}")
    public ResponseEntity<?> getMoviesByFormat(@PathVariable String formatName){
        try{
            List<Movie> movies = movieService.getMoviesByFormat(formatName);
            return ResponseEntity.status(HttpStatus.OK).body(movies);
        }
        catch(CrudOperationException e){
            log.error("Error while fetching movies: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e);
        }
        catch(CrudValidationException e){
            log.error("Error while fetching movies: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e);
        }
        catch(Exception e){
            log.error("Unexpected error while fetching movie: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e);
        }
    }

    @GetMapping("/language/{languageName}")
    public ResponseEntity<?> getMoviesByLanguage(@PathVariable String languageName){
        try{
            List<Movie> movies = movieService.getMoviesByLangauge(languageName);
            return ResponseEntity.status(HttpStatus.OK).body(movies);
        }
        catch(CrudOperationException e){
            log.error("Error while fetching movies: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e);
        }
        catch(CrudValidationException e){
            log.error("Error while fetching movies: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e);
        }
        catch(Exception e){
            log.error("Unexpected error while fetching movie: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e);
        }
    }
}
