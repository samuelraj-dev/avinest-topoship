INSERT INTO course (code, title, category, nature, lecture_hours, tutorial_hours, practical_hours, credits) VALUES
    ('O23EC12', 'IT in Agricultural System', 'OEC', 'LAB', 3, 0, 0, 3)
ON CONFLICT (code) DO NOTHING;