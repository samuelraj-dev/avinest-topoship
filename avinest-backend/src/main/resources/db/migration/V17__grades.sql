CREATE TABLE grade_scale (
     grade TEXT PRIMARY KEY,
     points SMALLINT NOT NULL
);

CREATE TABLE student_grades (
    id BIGSERIAL PRIMARY KEY,

    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES course(id),

    semester_id BIGINT NOT NULL REFERENCES semesters(id),

    grade TEXT NOT NULL REFERENCES grade_scale(grade),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (student_id, course_id, semester_id)
);

CREATE INDEX idx_student_grades_student
    ON student_grades(student_id);

CREATE INDEX idx_student_grades_semester
    ON student_grades(semester_id);

INSERT INTO grade_scale VALUES
('O', 10),
('A+', 9),
('A', 8),
('B+', 7),
('B', 6),
('C', 5),
('U', 0),
('UA', 0)
ON CONFLICT (grade) DO NOTHING;