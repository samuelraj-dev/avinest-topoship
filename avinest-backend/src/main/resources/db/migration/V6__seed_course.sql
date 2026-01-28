INSERT INTO course (code, title, category, nature, lecture_hours, tutorial_hours, practical_hours, credits) VALUES
    ('CS23631', 'Object Oriented Software Engineering', 'PCC', 'LAB_ORIENTED_THEORY', 3, 0, 2, 4)
ON CONFLICT (code) DO NOTHING;

INSERT INTO course (code, title, category, nature, lecture_hours, tutorial_hours, practical_hours, credits) VALUES
    ('EC23631', 'Embedded Systems and IoT', 'ESC', 'LAB_ORIENTED_THEORY', 3, 0, 2, 4)
ON CONFLICT (code) DO NOTHING;