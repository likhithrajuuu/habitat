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

    private String moviePoster;

    /* ---------- RELATIONSHIPS ---------- */

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "movie_genres",
        schema = "dev",
        joinColumns = @JoinColumn(name = "movie_id"),
        inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    private Set<Genre> genres;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "movie_formats",
        schema = "dev",
        joinColumns = @JoinColumn(name = "movie_id"),
        inverseJoinColumns = @JoinColumn(name = "format_id")
    )
    private Set<Format> formats;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "movie_languages",
        schema = "dev",
        joinColumns = @JoinColumn(name = "movie_id"),
        inverseJoinColumns = @JoinColumn(name = "language_id")
    )
    private Set<Language> languages;

    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Rating> ratings;

    /* ---------- CONSTRUCTORS ---------- */

    public Movie() {}

    /* ---------- GETTERS & SETTERS ---------- */

    public Long getMovieId() { return movieId; }
    public void setMovieId(Long movieId) { this.movieId = movieId; }

    public String getMovieName() { return movieName; }
    public void setMovieName(String movieName) { this.movieName = movieName; }

    public String getMovieDescription() { return movieDescription; }
    public void setMovieDescription(String movieDescription) { this.movieDescription = movieDescription; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public String getCertificate() { return certificate; }
    public void setCertificate(String certificate) { this.certificate = certificate; }

    public LocalDate getReleaseDate() { return releaseDate; }
    public void setReleaseDate(LocalDate releaseDate) { this.releaseDate = releaseDate; }

    public Double getAvgRating() { return avgRating; }
    public void setAvgRating(Double avgRating) { this.avgRating = avgRating; }

    public String getMoviePoster() { return moviePoster; }
    public void setMoviePoster(String moviePoster) { this.moviePoster = moviePoster; }

    public Set<Genre> getGenres() { return genres; }
    public void setGenres(Set<Genre> genres) { this.genres = genres; }

    public Set<Format> getFormats() { return formats; }
    public void setFormats(Set<Format> formats) { this.formats = formats; }

    public Set<Language> getLanguages() { return languages; }
    public void setLanguages(Set<Language> languages) { this.languages = languages; }

    public List<Rating> getRatings() { return ratings; }
    public void setRatings(List<Rating> ratings) { this.ratings = ratings; }
}