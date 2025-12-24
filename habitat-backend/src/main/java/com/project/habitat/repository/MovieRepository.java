package com.project.habitat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.project.habitat.model.Movie;

public interface MovieRepository extends JpaRepository<Movie, Long>{

	Movie save(Movie movie);

	List<Movie> findAll();

	@Query("""
        SELECT DISTINCT m
        FROM Movie m
        JOIN m.genres g
        WHERE g.name = :genre
    """)
    List<Movie> findMoviesByGenre(@Param("genre") String genre);

	@Query("""
		SELECT DISTINCT m
		FROM Movie m
		JOIN m.formats f
		where f.name = :format
			""")
	List<Movie> findMoviesByFormat(@Param("format") String format);

	@Query("""
		SELECT DISTINCT m
		FROM Movie m
		JOIN m.languages l
		where l.name = :language
			""")
	List<Movie> findMoviesByLanguage(@Param("language") String language);
}
