-- SEM 1
INSERT INTO course (code, title, category, nature, lecture_hours, tutorial_hours, practical_hours, credits) VALUES
    ('HS23111', 'Communicative English', 'HSMC', 'THEORY', 3, 0, 0, 3),
    ('CY23111', 'Engineering Chemistry', 'BSC', 'THEORY', 3, 0, 0, 3),
    ('MA23111', 'Matrices and Calculus', 'BSC', 'THEORY', 3, 1, 0, 4),
    ('GE23111', 'Problem Solving and C Programming', 'ESC', 'THEORY', 3, 0, 0, 3),
    ('GE23112', 'தமிழர் மரபு / Heritage of Tamils', 'HSMC', 'THEORY', 1, 0, 0, 0),
    ('GE23131', 'Engineering Graphics', 'ESC', 'LAB_ORIENTED_THEORY', 2, 0, 4, 4),
    ('CY23121', 'Chemistry Laboratory', 'BSC', 'LAB', 0, 0, 2, 1),
    ('GE23121', 'Problem Solving and C Programming Laboratory', 'ESC', 'LAB', 0, 0, 2, 1),
    ('GE23122', 'Engineering Practices Laboratory', 'ESC', 'LAB', 0, 0, 2, 1)
ON CONFLICT (code) DO NOTHING;

-- SEM 2
INSERT INTO course (code, title, category, nature, lecture_hours, tutorial_hours, practical_hours, credits) VALUES
    ('HS23211', 'Professional English', 'HSMC', 'THEORY', 2, 0, 0, 2),
    ('MA23211', 'Statistics and Numerical Methods', 'BSC', 'THEORY', 3, 1, 0, 4),
    ('PH23211', 'Physics for Information Science', 'BSC', 'THEORY', 3, 0, 0, 3),
    ('AD23211', 'Python for Data Science', 'ESC', 'THEORY', 3, 0, 0, 3),
    ('GE23211', 'Basic Electrical and Electronics Engineering', 'ESC', 'THEORY', 3, 0, 0, 3),
    ('GE23213', 'தமிழரும் தொழில் நுட்பமும் / Tamils and Technology', 'HSMC', 'THEORY', 1, 0, 0, 0),
    ('PH23221', 'Physics Laboratory', 'BSC', 'LAB', 0, 0, 2, 1),
    ('AD23221', 'Python for Data Science Laboratory', 'ESC', 'LAB', 0, 0, 2, 1),
    ('GE23221', 'Communication Laboratory / Foreign Language', 'EEC', 'LAB', 0, 0, 2, 1)
ON CONFLICT (code) DO NOTHING;

-- SEM 3
INSERT INTO course (code, title, category, nature, lecture_hours, tutorial_hours, practical_hours, credits) VALUES
    ('MA23311', 'Discrete Mathematics', 'BSC', 'THEORY', 3, 1, 0, 4),
    ('CB23311', 'Fundamentals of Economics and Financial Accounting', 'PCC', 'THEORY', 3, 1, 0, 4),
    ('CS23312', 'Object Oriented Programming', 'PCC', 'THEORY', 3, 0, 0, 3),
    ('CS23314', 'Data Structures and Algorithms', 'PCC', 'THEORY', 3, 0, 0, 3),
    ('EC23331', 'Digital Principles and Computer Organization', 'ESC', 'LAB_ORIENTED_THEORY', 3, 0, 2, 4),
    ('CS23322', 'Object Oriented Programming Laboratory', 'PCC', 'LAB', 0, 0, 2, 1),
    ('CS23324', 'Data Structures and Algorithms Laboratory', 'PCC', 'LAB', 0, 0, 2, 1),
    ('CB23IC1', 'Design Thinking', 'EEC', 'INDUSTRY_ORIENTED', 1, 0, 0, 1)
ON CONFLICT (code) DO NOTHING;

-- SEM 4
INSERT INTO course (code, title, category, nature, lecture_hours, tutorial_hours, practical_hours, credits) VALUES
    ('GE23411', 'Environmental Science and Sustainability', 'BSC', 'THEORY', 2, 0, 0, 2),
    ('MA23411', 'Probability and Statistics', 'BSC', 'THEORY', 3, 1, 0, 4),
    ('CB23411', 'Introduction to Business Systems', 'PCC', 'THEORY', 3, 0, 0, 3),
    ('CS23411', 'Database Management Systems', 'PCC', 'THEORY', 3, 0, 0, 3),
    ('CS23412', 'Operating Systems', 'PCC', 'THEORY', 3, 0, 0, 3),
    ('AL23431', 'Artificial Intelligence and Machine Learning', 'PCC', 'LAB_ORIENTED_THEORY', 3, 0, 2, 4),
    ('CS23421', 'Database Management Systems Laboratory', 'PCC', 'LAB', 0, 0, 2, 1),
    ('CS23422', 'Operating Systems Laboratory', 'PCC', 'LAB', 0, 0, 2, 1),
    ('CB23IC2', 'Enterprise Resource Planning', 'EEC', 'INDUSTRY_ORIENTED', 1, 0, 0, 1)
ON CONFLICT (code) DO NOTHING;

-- SEM 5
INSERT INTO course (code, title, category, nature, lecture_hours, tutorial_hours, practical_hours, credits) VALUES
    ('CB23511', 'Data and Information Security', 'PCC', 'THEORY', 3, 0, 0, 3),
    ('CB23512', 'Fundamentals of Management', 'PCC', 'THEORY', 3, 0, 0, 3),
    ('AD23V11', 'Exploratory Data Analysis', 'PEC', 'THEORY', 3, 0, 0, 3),
    ('CB23V57', 'IT Project Management', 'PEC', 'THEORY', 3, 0, 0, 3),
    ('MX23511', 'Disaster Risk Reduction and Management', 'MC', 'THEORY', 3, 0, 0, 0),
    ('AD23531', 'Deep Learning Techniques', 'PCC', 'LAB_ORIENTED_THEORY', 3, 0, 2, 4),
    ('CB23531', 'Business Analytics', 'PCC', 'LAB_ORIENTED_THEORY', 3, 0, 2, 4),
    ('CB23521', 'Data and Information Security Laboratory', 'PCC', 'LAB', 0, 0, 2, 1),
    ('GE23521', 'Business Communication Laboratory-I', 'ESC', 'LAB', 0, 0, 2, 1),
    ('CB23IC3', 'Visualization Tools using R', 'EEC', 'INDUSTRY_ORIENTED', 1, 0, 0, 1)
ON CONFLICT (code) DO NOTHING;