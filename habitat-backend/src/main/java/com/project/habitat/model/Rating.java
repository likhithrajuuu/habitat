package com.project.habitat.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(schema = "dev", name="rating")
public class Rating {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ratingId;

    private Integer rating;
    private String review;

    @ManyToOne
    @JoinColumn(name = "movie_id")
    private Movie movie;

    private LocalDateTime createdAt;
    
    public Rating() {
    	
    }

	public Rating(Long ratingId, Integer rating, String review, Movie movie, LocalDateTime createdAt) {
		super();
		this.ratingId = ratingId;
		this.rating = rating;
		this.review = review;
		this.movie = movie;
		this.createdAt = createdAt;
	}

	public Long getRatingId() {
		return ratingId;
	}

	public void setRatingId(Long ratingId) {
		this.ratingId = ratingId;
	}

	public Integer getRating() {
		return rating;
	}

	public void setRating(Integer rating) {
		this.rating = rating;
	}

	public String getReview() {
		return review;
	}

	public void setReview(String review) {
		this.review = review;
	}

	public Movie getMovie() {
		return movie;
	}

	public void setMovie(Movie movie) {
		this.movie = movie;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	@Override
	public String toString() {
		return "Rating [ratingId=" + ratingId + ", rating=" + rating + ", review=" + review + ", movie=" + movie
				+ ", createdAt=" + createdAt + "]";
	}
    
    
}
