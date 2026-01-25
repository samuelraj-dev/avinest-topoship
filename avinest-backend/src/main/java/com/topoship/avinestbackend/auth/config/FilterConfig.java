package com.topoship.avinestbackend.auth.config;

import com.topoship.avinestbackend.auth.JwtService;
import com.topoship.avinestbackend.auth.filter.AuthFilter;
import com.topoship.avinestbackend.auth.filter.CorsFilter;
import com.topoship.avinestbackend.auth.service.SessionService;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FilterConfig {
    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilter() {
        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>();
        bean.setFilter(new CorsFilter());
        bean.setOrder(0);
        bean.addUrlPatterns("/*");
        return bean;
    }

    @Bean
    public AuthFilter authFilter(JwtService jwtService, SessionService sessionService) {
        return new AuthFilter(jwtService, sessionService);
    }

    @Bean
    public FilterRegistrationBean<AuthFilter> authFilterReg(AuthFilter filter) {
        var bean = new FilterRegistrationBean<>(filter);
        bean.addUrlPatterns("/api/*");
        bean.setOrder(1);
        return bean;
    }
}
