package com.intactbi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class IntactBiApplication {

    public static void main(String[] args) {
        SpringApplication.run(IntactBiApplication.class, args);
    }
}
