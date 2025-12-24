package com.project.habitat.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.habitat.model.Genre;

public interface GenreRepository extends JpaRepository<Genre, Long>{
    
}
