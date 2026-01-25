INSERT INTO programs (degree_level, name, abbreviation) VALUES
('B.Tech.', 'Computer Science and Business Systems', 'CSBS')
ON CONFLICT (abbreviation) DO NOTHING;

INSERT INTO batches (start_year, end_year) VALUES
    (2023, 2027)
ON CONFLICT (start_year, end_year) DO NOTHING;

INSERT INTO academic_years (start_year, end_year) VALUES
(2023, 2024),
(2024, 2025),
(2025, 2026),
(2026, 2027)
ON CONFLICT (start_year, end_year) DO NOTHING;

INSERT INTO semesters (academic_year_id, number)
SELECT ay.id, s.number
FROM academic_years ay
         JOIN (
    VALUES
        (2023, 2024, 1),
        (2023, 2024, 2),
        (2024, 2025, 3),
        (2024, 2025, 4),
        (2025, 2026, 5),
        (2025, 2026, 6),
        (2026, 2027, 7),
        (2026, 2027, 8)
) AS s(start_year, end_year, number)
              ON ay.start_year = s.start_year
                  AND ay.end_year   = s.end_year
ON CONFLICT (academic_year_id, number) DO NOTHING;


INSERT INTO sections (program_id, batch_id, semester_id, name)
SELECT
    p.id,
    b.id,
    s.id,
    sec.name
FROM programs p
         JOIN batches b
              ON b.start_year = 2023
                  AND b.end_year   = 2027
         JOIN semesters s ON TRUE
         JOIN (VALUES ('A'), ('B')) AS sec(name) ON TRUE
WHERE p.abbreviation = 'CSBS'
ON CONFLICT (program_id, batch_id, semester_id, name) DO NOTHING;


