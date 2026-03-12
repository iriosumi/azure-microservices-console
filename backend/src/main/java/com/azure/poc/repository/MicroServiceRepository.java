package com.azure.poc.repository;

import com.azure.poc.model.MicroService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MicroServiceRepository extends JpaRepository<MicroService, String> {}
