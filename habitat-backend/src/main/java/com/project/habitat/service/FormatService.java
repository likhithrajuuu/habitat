package com.project.habitat.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.habitat.model.Format;
import com.project.habitat.repository.FormatRepository;

@Service
public class FormatService {
    @Autowired
    private FormatRepository formatRepository;

    public List<Format> getAllFormats(){
        return formatRepository.findAll();
    }
}
