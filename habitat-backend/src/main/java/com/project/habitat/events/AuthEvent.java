package com.project.habitat.events;

import java.time.Instant;

public class AuthEvent {

    private String eventId;
    private AuthEventType eventType;

    private Long userId;
    private String username;
    private String email;
    private String role;

    private Instant occurredAt;

    public AuthEvent() {}

    public AuthEvent(
            String eventId,
            AuthEventType eventType,
            Long userId,
            String username,
            String email,
            String role
    ) {
        this.eventId = eventId;
        this.eventType = eventType;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
        this.occurredAt = Instant.now();
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public AuthEventType getEventType() {
        return eventType;
    }

    public void setEventType(AuthEventType eventType) {
        this.eventType = eventType;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Instant getOccurredAt() {
        return occurredAt;
    }

    public void setOccurredAt(Instant occurredAt) {
        this.occurredAt = occurredAt;
    }

    @Override
    public String toString() {
        return "AuthEvent{" +
                "eventId='" + eventId + '\'' +
                ", eventType=" + eventType +
                ", userId=" + userId +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", role='" + role + '\'' +
                ", occurredAt=" + occurredAt +
                '}';
    }
}