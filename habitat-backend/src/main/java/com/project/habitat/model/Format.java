package com.project.habitat.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;


@Entity
@Table(schema = "dev", name = "format")
public class Format {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long formatId;

    private String name;
    
    public Format() {
    	
    }
	public Format(String name) {
		this.name = name;
	}
	public Format(Long formatId, String name) {
		super();
		this.formatId = formatId;
		this.name = name;
	}

	public Long getFormatId() {
		return formatId;
	}

	public void setFormatId(Long formatId) {
		this.formatId = formatId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Override
	public String toString() {
		return "Format [formatId=" + formatId + ", name=" + name + "]";
	}
    
}
