package com.project.habitat.service;

import com.project.habitat.events.AuthEventProducer;
import com.project.habitat.events.AuthEventType;
import com.project.habitat.exception.CrudOperationException;
import com.project.habitat.exception.CrudValidationException;
import com.project.habitat.model.User;
import com.project.habitat.repository.UserRepository;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;
import java.util.List;

import com.project.habitat.model.Movie;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Logger log = LogManager.getLogger(UserService.class);

    @Autowired
    private Validator validator;


    private void checkForNull(User user) {
        if(user == null) {
            throw CrudOperationException.asNullEntity(User.class);
        }
    }

    private void checkId(Long id) throws CrudValidationException {
        if(id<=0) {
            throw CrudValidationException.asInvalidEntityId(getClass());
        }
    }


    private void validate(User model) throws CrudValidationException {
        Set<ConstraintViolation<User>> violations = validator.validate(model);
        if (!violations.isEmpty()) {
            throw CrudValidationException.asFailedValidationOperation(User.class, violations);
        }
    }

    private User saveUser(User user) throws CrudOperationException {
        try {
            boolean isNew = (user.getId() == null);
            User savedModel = userRepository.save(user);
            log.info((isNew ? "Added" : "Updated") + " UsersModel with ID: " + savedModel.getId());
            return savedModel;
        } catch (Exception e) {
            throw CrudOperationException.asFailedAddOperation(User.class, e);
        }
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.error("User not found: {}", username);
                    return new RuntimeException("User not found");
                });
    }

    public User updateUser(String username, User updatedUser) throws CrudOperationException, CrudValidationException {
        User existingUser = getUserByUsername(username);

        if (updatedUser.getEmail() != null && !updatedUser.getEmail().isEmpty()) {
            existingUser.setEmail(updatedUser.getEmail());
        }
        
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        validate(existingUser);
        return saveUser(existingUser);
    }

    
}
