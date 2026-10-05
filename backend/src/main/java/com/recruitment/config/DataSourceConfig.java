package com.recruitment.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url:${DB_URL:}}")
    private String dbUrl;

    @Value("${spring.datasource.username:${DB_USERNAME:}}")
    private String dbUsername;

    @Value("${spring.datasource.password:${DB_PASSWORD:}}")
    private String dbPassword;

    @Value("${spring.datasource.driver-class-name:org.postgresql.Driver}")
    private String driverClassName;

    @Bean
    public DataSource dataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setDriverClassName(driverClassName);
        
        // Optimizations for Neon/Cloud PgBouncer
        dataSource.addDataSourceProperty("sslmode", "require");
        dataSource.addDataSourceProperty("prepareThreshold", "0");
        dataSource.addDataSourceProperty("preparedStatementCacheQueries", "0");
        dataSource.setMaximumPoolSize(10);
        dataSource.setMinimumIdle(2);
        dataSource.setIdleTimeout(30000);
        dataSource.setMaxLifetime(600000);
        dataSource.setKeepaliveTime(30000);

        if (dbUrl != null && (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://"))) {
            try {
                URI uri = new URI(dbUrl);
                String userInfo = uri.getUserInfo();
                if (userInfo != null) {
                    String[] auth = userInfo.split(":", 2);
                    dataSource.setUsername(auth[0]);
                    if (auth.length > 1) {
                        dataSource.setPassword(auth[1]);
                    }
                } else {
                    if (dbUsername != null && !dbUsername.isEmpty()) dataSource.setUsername(dbUsername);
                    if (dbPassword != null && !dbPassword.isEmpty()) dataSource.setPassword(dbPassword);
                }
                
                String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + (uri.getPort() != -1 ? ":" + uri.getPort() : "") + uri.getPath();
                if (uri.getQuery() != null) {
                    jdbcUrl += "?" + uri.getQuery();
                }
                dataSource.setJdbcUrl(jdbcUrl);
            } catch (URISyntaxException e) {
                // Fallback to literal if parsing fails
                dataSource.setJdbcUrl(dbUrl);
            }
        } else {
            dataSource.setJdbcUrl(dbUrl);
            if (dbUsername != null && !dbUsername.isEmpty()) dataSource.setUsername(dbUsername);
            if (dbPassword != null && !dbPassword.isEmpty()) dataSource.setPassword(dbPassword);
        }

        return dataSource;
    }
}
