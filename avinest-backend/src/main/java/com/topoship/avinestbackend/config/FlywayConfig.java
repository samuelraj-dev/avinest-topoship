//package com.topoship.avinestbackend.config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//
//@Configuration
//public class FlywayConfig {
//
//    // Custom migration strategy (optional)
//    @Bean
//    public org.springframework.boot.flyway.autoconfigure.FlywayMigrationStrategy flywayMigrationStrategy() {
//        return flyway -> {
//            // Custom logic before migration
//            System.out.println("Running Flyway migrations...");
//            flyway.migrate();
//            System.out.println("Flyway migrations completed!");
//        };
//    }
//}