package com.project.habitat.controller;

import com.project.habitat.events.AuthEventProducer;
import com.project.habitat.events.AuthEventType;
import com.project.habitat.model.User;
import com.project.habitat.repository.UserRepository;
import com.project.habitat.security.JwtUtil;
import jakarta.validation.Validator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final Validator validator;
    private final AuthEventProducer authEventProducer;

    // ✅ SINGLE constructor (important)
    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            Validator validator,
            AuthEventProducer authEventProducer
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.validator = validator;
        this.authEventProducer = authEventProducer;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            log.info("Registering user: {}", user.getUsername());

            if (user.getEmail() != null && userRepository.findByEmail(user.getEmail()).isPresent()) {
                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body("Email already exists, please login");
            }

            if (user.getUsername() != null && userRepository.findByUsername(user.getUsername()).isPresent()) {
                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body("Username already exists, please login");
            }

            user.setPassword(passwordEncoder.encode(user.getPassword()));
            user.setRole("USER");

            User savedUser = userRepository.save(user);

            log.info("User registered successfully: {}", savedUser.getUsername());

            // 🔥 KAFKA EVENT PUBLISHED HERE
            authEventProducer.publish(
                    AuthEventType.USER_REGISTERED,
                    savedUser
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body("User registered successfully");

        } catch (Exception e) {
            log.error("Error during registration", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred during registration");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            String identifier =
                    (user.getEmail() != null && !user.getEmail().isEmpty())
                            ? user.getEmail()
                            : user.getUsername();

            log.info("Login attempt for: {}", identifier);

            User dbUser = (user.getEmail() != null && !user.getEmail().isEmpty())
                    ? userRepository.findByEmail(user.getEmail()).orElse(null)
                    : userRepository.findByUsername(user.getUsername()).orElse(null);

            if (dbUser == null || !passwordEncoder.matches(user.getPassword(), dbUser.getPassword())) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid Credentials");
            }

            String token = jwtUtil.generateToken(dbUser.getUsername());

            log.info("Login successful for user: {}", dbUser.getUsername());
            return ResponseEntity.ok(token);

        } catch (Exception e) {
            log.error("Login error", e);
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid Credentials");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok("Logged out successfully");
    }
}