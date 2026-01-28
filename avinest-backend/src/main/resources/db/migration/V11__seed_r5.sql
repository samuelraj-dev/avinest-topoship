ALTER TABLE course
    DROP CONSTRAINT course_credits_check;

ALTER TABLE course
    ADD CONSTRAINT course_credits_check
        CHECK (credits >= 0);


INSERT INTO course (code, title, category, nature, lecture_hours, tutorial_hours, practical_hours, credits) VALUES
    ('MX23612', 'Industrial Safety', 'MC', 'THEORY', 3, 0, 0, 0)
ON CONFLICT (code) DO NOTHING;