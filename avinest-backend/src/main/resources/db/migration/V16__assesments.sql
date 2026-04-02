CREATE TABLE student_cat_marks (
                                   id BIGSERIAL PRIMARY KEY,

                                   student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
                                   course_offering_id BIGINT NOT NULL REFERENCES course_offering(id) ON DELETE CASCADE,

                                   co1 SMALLINT CHECK (co1 BETWEEN 0 AND 25),
                                   co2 SMALLINT CHECK (co2 BETWEEN 0 AND 25),
                                   co3 SMALLINT CHECK (co3 BETWEEN 0 AND 25),
                                   co4 SMALLINT CHECK (co4 BETWEEN 0 AND 25),
                                   co5 SMALLINT CHECK (co5 BETWEEN 0 AND 25),

                                   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                   UNIQUE (student_id, course_offering_id)
);

CREATE INDEX idx_cat_student ON student_cat_marks(student_id);
CREATE INDEX idx_cat_offering ON student_cat_marks(course_offering_id);


CREATE TABLE student_assignment_marks (
                                          id BIGSERIAL PRIMARY KEY,

                                          student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
                                          course_offering_id BIGINT NOT NULL REFERENCES course_offering(id) ON DELETE CASCADE,

                                          a1 SMALLINT CHECK (a1 BETWEEN 0 AND 25),
                                          a2 SMALLINT CHECK (a2 BETWEEN 0 AND 25),
                                          a3 SMALLINT CHECK (a3 BETWEEN 0 AND 25),
                                          a4 SMALLINT CHECK (a4 BETWEEN 0 AND 25),
                                          a5 SMALLINT CHECK (a5 BETWEEN 0 AND 25),

                                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                          UNIQUE (student_id, course_offering_id)
);

CREATE INDEX idx_assignment_student ON student_assignment_marks(student_id);
CREATE INDEX idx_assignment_offering ON student_assignment_marks(course_offering_id);

CREATE TABLE student_lab_marks (
                                   id BIGSERIAL PRIMARY KEY,

                                   student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
                                   course_offering_id BIGINT NOT NULL REFERENCES course_offering(id) ON DELETE CASCADE,

                                   experiment_no SMALLINT NOT NULL CHECK (experiment_no > 0),
                                   marks SMALLINT CHECK (marks BETWEEN 0 AND 100),

                                   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                   UNIQUE (student_id, course_offering_id, experiment_no)
);

CREATE INDEX idx_lab_student ON student_lab_marks(student_id);
CREATE INDEX idx_lab_offering ON student_lab_marks(course_offering_id);

CREATE OR REPLACE FUNCTION enforce_cat_allowed()
    RETURNS TRIGGER AS $$
DECLARE
    course_nature TEXT;
BEGIN
    SELECT c.nature INTO course_nature
    FROM course_offering co
             JOIN course c ON co.course_id = c.id
    WHERE co.id = NEW.course_offering_id;

    IF course_nature NOT IN ('THEORY', 'LAB_ORIENTED_THEORY') THEN
        RAISE EXCEPTION 'CAT not allowed for this course type';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cat_allowed
    BEFORE INSERT OR UPDATE ON student_cat_marks
    FOR EACH ROW
EXECUTE FUNCTION enforce_cat_allowed();

CREATE OR REPLACE FUNCTION enforce_assignment_allowed()
    RETURNS TRIGGER AS $$
DECLARE
    course_nature TEXT;
BEGIN
    SELECT c.nature INTO course_nature
    FROM course_offering co
             JOIN course c ON co.course_id = c.id
    WHERE co.id = NEW.course_offering_id;

    IF course_nature NOT IN ('THEORY', 'LAB_ORIENTED_THEORY') THEN
        RAISE EXCEPTION 'Assignment not allowed for this course type';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_assignment_allowed
    BEFORE INSERT OR UPDATE ON student_assignment_marks
    FOR EACH ROW
EXECUTE FUNCTION enforce_assignment_allowed();

CREATE OR REPLACE FUNCTION enforce_lab_allowed()
    RETURNS TRIGGER AS $$
DECLARE
    course_nature TEXT;
BEGIN
    SELECT c.nature INTO course_nature
    FROM course_offering co
             JOIN course c ON co.course_id = c.id
    WHERE co.id = NEW.course_offering_id;

    IF course_nature NOT IN ('LAB', 'LAB_ORIENTED_THEORY') THEN
        RAISE EXCEPTION 'Lab marks not allowed for this course type';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lab_allowed
    BEFORE INSERT OR UPDATE ON student_lab_marks
    FOR EACH ROW
EXECUTE FUNCTION enforce_lab_allowed();


CREATE OR REPLACE FUNCTION get_cat_weightage(course_offering_id BIGINT)
    RETURNS TABLE (
                      per_co INT,
                      total INT
                  ) AS $$
BEGIN
    RETURN QUERY
        SELECT
            CASE c.nature
                WHEN 'THEORY' THEN 6
                WHEN 'LAB_ORIENTED_THEORY' THEN 4
                ELSE NULL
                END,
            CASE c.nature
                WHEN 'THEORY' THEN 30
                WHEN 'LAB_ORIENTED_THEORY' THEN 20
                ELSE NULL
                END
        FROM course_offering co
                 JOIN course c ON co.course_id = c.id
        WHERE co.id = course_offering_id;
END;
$$ LANGUAGE plpgsql;