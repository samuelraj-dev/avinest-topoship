INSERT INTO course (code, title, category, nature, lecture_hours, tutorial_hours, practical_hours, credits) VALUES
    ('CB23V53', 'Entrepreneurship Development', 'PEC', 'THEORY', 3, 0, 0, 3)
ON CONFLICT (code) DO NOTHING;