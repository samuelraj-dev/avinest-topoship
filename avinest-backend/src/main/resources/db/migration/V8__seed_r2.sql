INSERT INTO course (code, title, category, nature, lecture_hours, tutorial_hours, practical_hours, credits) VALUES
    ('GE23621', 'Business Communication Laboratory-II', 'ESC', 'LAB', 0, 0, 2, 1)
ON CONFLICT (code) DO NOTHING;