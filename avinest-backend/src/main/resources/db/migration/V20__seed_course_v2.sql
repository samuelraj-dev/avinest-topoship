-- SEM 5
INSERT INTO course (code, title, category, nature, lecture_hours, tutorial_hours, practical_hours, credits) VALUES
    ('CB23511', 'Data and Information Security', 'PCC', 'THEORY', 3, 0, 0, 3),
    ('CB23512', 'Fundamentals of Management', 'PCC', 'THEORY', 3, 0, 0, 3),
    ('AL23V11', 'Exploratory Data Analysis', 'PEC', 'THEORY', 3, 0, 0, 3),
    ('CB23V57', 'IT Project Management', 'PEC', 'THEORY', 3, 0, 0, 3),
    ('MX23511', 'Disaster Risk Reduction and Management', 'MC', 'THEORY', 3, 0, 0, 0),
    ('AD23531', 'Deep Learning Techniques', 'PCC', 'LAB_ORIENTED_THEORY', 3, 0, 2, 4),
    ('CB23531', 'Business Analytics', 'PCC', 'LAB_ORIENTED_THEORY', 3, 0, 2, 4),
    ('CB23521', 'Data and Information Security Laboratory', 'PCC', 'LAB', 0, 0, 2, 1),
    ('GE23521', 'Business Communication Laboratory-I', 'ESC', 'LAB', 0, 0, 2, 1),
    ('CB23IC3', 'Visualization Tools using R', 'EEC', 'INDUSTRY_ORIENTED', 1, 0, 0, 1)
ON CONFLICT (code) DO NOTHING;

DELETE FROM course WHERE code = 'AD23V11';