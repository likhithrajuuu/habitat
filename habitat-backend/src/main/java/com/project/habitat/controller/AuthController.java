 package com.project.habitat.controller;


import com.project.habitat.model.User;
import com.project.habitat.repository.UserRepository;
import com.project.habitat.security.JwtUtil;
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

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            log.info("Registering user: {}", user.getUsername());
            
            if (user.getEmail() != null && userRepository.findByEmail(user.getEmail()).isPresent()) {
                log.warn("Registration failed: Email already exists - {}", user.getEmail());
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already exists, please login");
            }
            
            if (user.getUsername() != null && userRepository.findByUsername(user.getUsername()).isPresent()) {
                log.warn("Registration failed: Username already exists - {}", user.getUsername());
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already exists, please login");
            }
            
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            user.setRole("USER");
            userRepository.save(user);
            log.info("User registered successfully: {}", user.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully");
        } catch (Exception e) {
            log.error("Error during registration: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred during registration");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            String identifier = (user.getEmail() != null && !user.getEmail().isEmpty()) 
                    ? user.getEmail() 
                    : user.getUsername();

            log.info("Login attempt for: {}", identifier);

            if (user.getPassword() == null || user.getPassword().isEmpty()) {
                log.warn("Login failed: Password is empty for user - {}", identifier);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Credentials");
            }

            User dbUser;
            if (user.getEmail() != null && !user.getEmail().isEmpty()) {
                dbUser = userRepository.findByEmail(user.getEmail())
                        .orElse(null);
                if (dbUser == null) {
                    log.warn("Login failed: User not found - {}", user.getEmail());
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Credentials");
                }
            } else if (user.getUsername() != null && !user.getUsername().isEmpty()) {
                dbUser = userRepository.findByUsername(user.getUsername())
                        .orElse(null);
                if (dbUser == null) {
                    log.warn("Login failed: User not found - {}", user.getUsername());
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Credentials");
                }
            } else {
                log.warn("Login failed: Neither email nor username provided");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Credentials");
            }

            if (!passwordEncoder.matches(user.getPassword(), dbUser.getPassword())) {
                if (dbUser.getPassword() != null && dbUser.getPassword().equals(user.getPassword())) {
                    log.info("Upgrading legacy plaintext password for user: {}", identifier);
                    dbUser.setPassword(passwordEncoder.encode(user.getPassword()));
                    userRepository.save(dbUser);
                } else {
                    log.warn("Login failed: Invalid password for user - {}", identifier);
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Credentials");
                }
            }

            String token = jwtUtil.generateToken(dbUser.getUsername());
            log.info("Login successful. Token generated for user: {}", dbUser.getUsername());
            return ResponseEntity.ok(token);
        } catch (RuntimeException e) {
            log.error("Login error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Credentials");
        } catch (Exception e) {
            log.error("Unexpected error during login: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred during login");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok("Logged out successfully");
    }
}
