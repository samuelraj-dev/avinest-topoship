mvn flyway:migrate    # Apply migrations
mvn flyway:info       # Show migration status
mvn flyway:validate   # Validate migrations
mvn flyway:repair     # Repair metadata table (if needed)
mvn flyway:clean      # Clean database (use carefully!)
mvn flyway:baseline   # Baseline existing database