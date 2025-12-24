package com.project.habitat.model;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Entity
@Table(schema = "dev", name = "movies")
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long movieId;

    private String movieName;
    private String movieDescription;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    private String certificate;

    private LocalDate releaseDate;

    private Double avgRating;

    @ManyToMany
    @JoinTable(
            name = "movie_genres",
            schema = "dev",
            joinColumns = @JoinColumn(name = "movie_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    private Set<Genre> genres;

    @ManyToMany
    @JoinTable(
            name = "movie_formats",
            schema = "dev",
            joinColumns = @JoinColumn(name = "movie_id"),
            inverseJoinColumns = @JoinColumn(name = "format_id")
    )
    private Set<Format> formats;

    @ManyToMany
    @JoinTable(
            name = "movie_languages",
            schema = "dev",
            joinColumns = @JoinColumn(name = "movie_id"),
            inverseJoinColumns = @JoinColumn(name = "language_id")
    )
    private Set<Language> languages;

    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL)
    private List<Rating> ratings;
    
	private String moviePoster;

    public Movie() {
    	
    }

	public Movie(Long movieId, String movieName, String movieDescription, Integer durationMinutes, String certificate,
			LocalDate releaseDate, Double avgRating, Set<Genre> genres, Set<Format> formats, Set<Language> languages,
			List<Rating> ratings, String moviePoster) {
		super();
		this.movieId = movieId;
		this.movieName = movieName;
		this.movieDescription = movieDescription;
		this.durationMinutes = durationMinutes;
		this.certificate = certificate;
		this.releaseDate = releaseDate;
		this.avgRating = avgRating;
		this.genres = genres;
		this.formats = formats;
		this.languages = languages;
		this.ratings = ratings;
		this.moviePoster = moviePoster;
	}

	public Long getMovieId() {
		return movieId;
	}

	public void setMovieId(Long movieId) {
		this.movieId = movieId;
	}

	public String getMovieName() {
		return movieName;
	}

	public void setMovieName(String movieName) {
		this.movieName = movieName;
	}

	public String getMovieDescription() {
		return movieDescription;
	}

	public void setMovieDescription(String movieDescription) {
		this.movieDescription = movieDescription;
	}

	public Integer getDurationMinutes() {
		return durationMinutes;
	}

	public void setDurationMinutes(Integer durationMinutes) {
		this.durationMinutes = durationMinutes;
	}

	public String getCertificate() {
		return certificate;
	}

	public void setCertificate(String certificate) {
		this.certificate = certificate;
	}

	public LocalDate getReleaseDate() {
		return releaseDate;
	}

	public void setReleaseDate(LocalDate releaseDate) {
		this.releaseDate = releaseDate;
	}

	public Double getAvgRating() {
		return avgRating;
	}

	public void setAvgRating(Double avgRating) {
		this.avgRating = avgRating;
	}

	public Set<Genre> getGenres() {
		return genres;
	}

	public void setGenres(Set<Genre> genres) {
		this.genres = genres;
	}

	public Set<Format> getFormats() {
		return formats;
	}

	public void setFormats(Set<Format> formats) {
		this.formats = formats;
	}

	public Set<Language> getLanguages() {
		return languages;
	}

	public void setLanguages(Set<Language> languages) {
		this.languages = languages;
	}

	public List<Rating> getRatings() {
		return ratings;
	}

	public void setRatings(List<Rating> ratings) {
		this.ratings = ratings;
	}

	public String getMoviePoster(String moviePoster){
		return moviePoster;
	}

	public void setMoviePoster(String moviePoster){
		this.moviePoster = moviePoster;
	}

	@Override
	public String toString() {
		return "Movie [movieId=" + movieId + ", movieName=" + movieName + ", movieDescription=" + movieDescription
				+ ", durationMinutes=" + durationMinutes + ", certificate=" + certificate + ", releaseDate="
				+ releaseDate + ", avgRating=" + avgRating + ", genres=" + genres + ", formats=" + formats
				+ ", languages=" + languages + ", ratings=" + ratings + "]";
	}
    
    
}