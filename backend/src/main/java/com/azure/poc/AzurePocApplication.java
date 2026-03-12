package com.azure.poc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AzurePocApplication {
    public static void main(String[] args) {
        SpringApplication.run(AzurePocApplication.class, args);
    }
}
