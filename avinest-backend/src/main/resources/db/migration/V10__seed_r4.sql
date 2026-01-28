INSERT INTO course (code, title, category, nature, lecture_hours, tutorial_hours, practical_hours, credits) VALUES
    ('AD23V15', 'Image and Video Analytics', 'PEC', 'THEORY', 3, 0, 0, 3)
ON CONFLICT (code) DO NOTHING;

INSERT INTO course (code, title, category, nature, lecture_hours, tutorial_hours, practical_hours, credits) VALUES
    ('CB23621', 'Mini Project', 'EEC', 'LAB', 0, 0, 4, 2)
ON CONFLICT (code) DO NOTHING;

UPDATE course SET
nature = 'THEORY'
WHERE code = 'O23EC12';