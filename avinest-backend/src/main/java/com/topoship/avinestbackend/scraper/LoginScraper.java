package com.topoship.avinestbackend.scraper;


import com.topoship.avinestbackend.dto.LoginRequest;
import com.topoship.avinestbackend.dto.ScrapedUserResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

@Service
public class LoginScraper {

    private final RestClient restClient;

    public LoginScraper(
            RestClient.Builder restClientBuilder,
            @Value("${python.service.url}") String pythonServiceUrl
    ) {
        this.restClient = restClientBuilder.baseUrl(pythonServiceUrl).build();
    }

    public ScrapedUserResponse login(LoginRequest request) {
        try {
            ScrapedUserResponse response = restClient.post()
                    .uri("/auth/scrape-login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(ScrapedUserResponse.class);
            if (response == null) {
                throw new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Received null response from scraping service"
                );
            }
            return response;
        } catch (HttpClientErrorException.Unauthorized e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid credentials on portal"
            );
        } catch (HttpClientErrorException.Gone e) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Portal is currently unavailable"
            );
        } catch (HttpClientErrorException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Scraping service error: " + e.getResponseBodyAsString()
            );
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to authenticate with portal: " + e.getMessage()
            );
        }
    }
}
