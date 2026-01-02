package com.project.habitat.repository;

import com.project.habitat.model.Movie;
import com.project.habitat.model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RatingsRepository extends JpaRepository<Rating, Long> {

    @Query("SELECT COUNT(r) FROM Rating r WHERE r.movie.movieId = :movieId")
    long countByMovieId(@Param("movieId") Long movieId);

    List<Rating> findAllRatingsByMovieMovieId(Long movieId);
}
