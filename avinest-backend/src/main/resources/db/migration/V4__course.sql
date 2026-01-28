CREATE TYPE course_category AS ENUM (
    'HSMC',
    'BSC',
    'ESC',
    'PCC',
    'PEC',
    'OEC',
    'EEC',
    'MC'
    );

CREATE TYPE course_nature AS ENUM (
    'THEORY',
    'LAB',
    'LAB_ORIENTED_THEORY',
    'INDUSTRY_ORIENTED'
    );

CREATE TABLE course (
    id BIGSERIAL PRIMARY KEY,

    code VARCHAR(20) NOT NULL UNIQUE,
    title TEXT NOT NULL,

    category course_category NOT NULL,
    nature course_nature NOT NULL,

    lecture_hours SMALLINT NOT NULL CHECK (lecture_hours >= 0),
    tutorial_hours SMALLINT NOT NULL CHECK (tutorial_hours >= 0),
    practical_hours SMALLINT NOT NULL CHECK (practical_hours >= 0),

    total_contact_hours SMALLINT NOT NULL,
    credits NUMERIC(3,1) NOT NULL CHECK (credits > 0),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE course_offering (
    id BIGSERIAL PRIMARY KEY,

    course_id BIGINT NOT NULL REFERENCES course(id),
    section_id BIGINT NOT NULL REFERENCES sections(id),

    faculty_id BIGINT NOT NULL REFERENCES faculty(id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (course_id, section_id)
);

CREATE TYPE weekday AS ENUM (
    'MON',
    'TUE',
    'WED',
    'THU',
    'FRI',
    'SAT'
    );

CREATE TABLE timetable (
    id BIGSERIAL PRIMARY KEY,

    section_id BIGINT NOT NULL REFERENCES sections(id),
    course_offering_id BIGINT NOT NULL REFERENCES course_offering(id),
    course_offering_alt_id BIGINT REFERENCES course_offering(id),

    day weekday NOT NULL,
    period_number SMALLINT NOT NULL CHECK (period_number BETWEEN 1 AND 7),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

    CONSTRAINT chk_alt_not_same CHECK (
        course_offering_alt_id IS NULL
            OR course_offering_alt_id <> course_offering_id
    )
);
