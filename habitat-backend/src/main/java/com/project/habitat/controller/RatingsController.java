package com.project.habitat.controller;

import com.project.habitat.exception.CrudOperationException;
import com.project.habitat.exception.CrudValidationException;
import com.project.habitat.model.Rating;
import com.project.habitat.service.RatingsService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/ratings")
public class RatingsController {
    private final RatingsService ratingsService;

    public RatingsController(RatingsService ratingsService) {
        this.ratingsService = ratingsService;
    }

    private Logger log = LogManager.getLogger(RatingsController.class);

    @GetMapping("/getall/{movieId}")
    public ResponseEntity<?> getAllRatingsByMovieId(@PathVariable Long movieId) {
        try {
            long count = ratingsService.getAllRatingsByMovieId(movieId);
            log.info("Successfully fetched ratings count for movieId {} : {}", movieId, count);
            return ResponseEntity.status(HttpStatus.OK).body(count);

        } catch (CrudValidationException e) {
            log.error("Validation error while fetching ratings count for movieId {} : {}", movieId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());

        } catch (CrudOperationException e) {
            log.error("Operational error while fetching ratings count for movieId {} : {}", movieId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());

        } catch (Exception e) {
            log.error("Unexpected error while fetching ratings count for movieId {} : {}", movieId, e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }


    @GetMapping("/count/{movieId}")
    public ResponseEntity<?> getRatingsCountByMovieId(@PathVariable Long movieId) {
        try {
            long count = ratingsService.getRatingsCountByMoiveId(movieId);
            log.info("Successfully fetched ratings count for movieId {} : {}", movieId, count);
            return ResponseEntity.status(HttpStatus.OK).body(count);

        } catch (CrudValidationException e) {
            log.error("Validation error while fetching ratings count for movieId {} : {}", movieId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());

        } catch (CrudOperationException e) {
            log.error("Operational error while fetching ratings count for movieId {} : {}", movieId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());

        } catch (Exception e) {
            log.error("Unexpected error while fetching ratings count for movieId {} : {}", movieId, e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }
}
