package com.trellolite;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TrelloLiteApplication {
    public static void main(String[] args) {
        SpringApplication.run(TrelloLiteApplication.class, args);
    }
}
