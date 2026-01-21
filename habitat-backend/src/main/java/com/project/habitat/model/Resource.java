package com.project.habitat.model;

import jakarta.persistence.*;

@Entity
@Table(schema = "dev", name = "resource")
public class Resource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long resourceId;
}
