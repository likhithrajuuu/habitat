package com.project.habitat.model;

import jakarta.persistence.*;
import java.util.Set;

@Entity
@Table(schema = "dev", name = "genres")
public class Genre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long genreId;

    @Column(nullable = false, unique = true)
    private String name;

    @ManyToMany(mappedBy = "genres")
    private Set<Movie> movies;

    public Genre() {}

    public Genre(String name) {
        this.name = name;
    }

    public Genre(Long genreId, String name) {
        this.genreId = genreId;
        this.name = name;
    }

    // getters & setters

    public Long getGenreId() {
        return genreId;
    }

    public void setGenreId(Long genreId) {
        this.genreId = genreId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<Movie> getMovies() {
        return movies;
    }

    public void setMovies(Set<Movie> movies) {
        this.movies = movies;
    }

    @Override
    public String toString() {
        return "Genre [genreId=" + genreId + ", name=" + name + "]";
    }
}