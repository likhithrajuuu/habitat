package com.project.habitat.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(schema = "dev", name = "languages")
public class Language {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long languageId;

    private String name;
    
    public Language() {
    	
    }
    
	public Language(String name) {
		this.name = name;
	}
	public Language(Long languageId, String name) {
		super();
		this.languageId = languageId;
		this.name = name;
	}


	public Long getLanguageId() {
		return languageId;
	}

	public void setLanguageId(Long languageId) {
		this.languageId = languageId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}


	@Override
	public String toString() {
		return "Language [languageId=" + languageId + ", name=" + name + "]";
	}
	
    
}
