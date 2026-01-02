package com.project.habitat.events;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class AuthEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(AuthEventConsumer.class);

    @KafkaListener(topics = "auth-events", groupId = "auth-consumer")
    public void handle(AuthEvent event) {
        log.info("Received auth event: {}", event);
    }
}