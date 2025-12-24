package com.project.habitat.controller;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.habitat.exception.CrudOperationException;
import com.project.habitat.exception.CrudValidationException;
import com.project.habitat.service.GenreService;
import com.project.habitat.service.LanguageService;
import com.project.habitat.model.Genre;
import com.project.habitat.model.Language;

@RestController
@RequestMapping("/language")
public class LanguageController {
    @Autowired
    private LanguageService languageService;

    private Logger log = LogManager.getLogger(MovieController.class);

    @GetMapping("/getall")
    public ResponseEntity<?> getAllLanguages() {
        try {
            List<Language> languages = languageService.getAllLanguages();
            log.info("Successfully fetched " + languages.size() + " movies");
            return ResponseEntity.status(HttpStatus.OK).body(languages);
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


}
