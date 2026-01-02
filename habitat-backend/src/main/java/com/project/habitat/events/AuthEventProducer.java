package com.project.habitat.events;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class AuthEventProducer {

    private static final Logger log = LoggerFactory.getLogger(AuthEventProducer.class);
    private static final String TOPIC = "auth-events";

    private final KafkaTemplate<String, AuthEvent> kafkaTemplate;

    public AuthEventProducer(KafkaTemplate<String, AuthEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }


    public void publish(AuthEventType type, com.project.habitat.model.User user) {

        log.error("🔥🔥🔥 AUTH EVENT PRODUCER CALLED FOR USER ID: {}", user.getId());
        AuthEvent event = new AuthEvent(
                UUID.randomUUID().toString(),
                type,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole()
        );

        kafkaTemplate.send(TOPIC, user.getId().toString(), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish auth event {}", event, ex);
                    } else {
                        log.info("Auth event published: {}", event.getEventType());
                    }
                });
    }
}