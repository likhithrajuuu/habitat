package com.project.habitat.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.habitat.model.Language;

public interface LanguageRepository extends JpaRepository<Language, Long>{
    
}
