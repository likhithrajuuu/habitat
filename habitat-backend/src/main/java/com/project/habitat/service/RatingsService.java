package com.project.habitat.service;

import com.project.habitat.exception.CrudOperationException;
import com.project.habitat.exception.CrudValidationException;
import com.project.habitat.model.Rating;
import com.project.habitat.model.User;
import com.project.habitat.repository.RatingsRepository;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class RatingsService {

    @Autowired
    private RatingsRepository ratingsRepository;

    @Autowired
    private Validator validator;

    private Logger log = LogManager.getLogger(UserService.class);

    private void checkForNull(Rating rating) {
        if(rating == null) {
            throw CrudOperationException.asNullEntity(Rating.class);
        }
    }

    private void checkId(Long id) throws CrudValidationException {
        if(id<=0) {
            throw CrudValidationException.asInvalidEntityId(getClass());
        }
    }


    private void validate(Rating model) throws CrudValidationException {
        Set<ConstraintViolation<Rating>> violations = validator.validate(model);
        if (!violations.isEmpty()) {
            throw CrudValidationException.asFailedValidationOperation(getClass(), violations);
        }
    }

    private Rating saveRating(Rating rating) throws CrudOperationException {
        try {
            boolean isNew = (rating.getRatingId() == null);
            Rating savedModel = ratingsRepository.save(rating);
            log.info((isNew ? "Added" : "Updated") + " UsersModel with ID: " + savedModel.getRatingId());
            return savedModel;
        } catch (Exception e) {
            throw CrudOperationException.asFailedAddOperation(User.class, e);
        }
    }

    public Long getRatingsCountByMovieId(Long movieId){
        checkId(movieId);
        return ratingsRepository.countByMovieId(movieId);
    }

    public List<Rating> getAllRatings(Long movieId){
        return ratingsRepository.findAllRatingsByMovieMovieId(movieId);
    }
}
