
CREATE TABLE app_users (
    id BIGSERIAL PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('STUDENT', 'FACULTY')),
    avatar_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_app_users_email ON app_users(email);
CREATE INDEX idx_app_users_username ON app_users(username);
CREATE INDEX idx_app_users_role ON app_users(role);

CREATE TABLE faculty (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,

    staff_code TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    designation TEXT NOT NULL,
    biometric_id TEXT NOT NULL,
    anna_university_code TEXT,
    date_of_joining DATE,

    dob DATE,
    gender TEXT NOT NULL CHECK (gender IN ('MALE', 'FEMALE')),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE programs (
    id BIGSERIAL PRIMARY KEY,
    degree_level TEXT NOT NULL,
    name TEXT NOT NULL,
    abbreviation TEXT NOT NULL UNIQUE
);

CREATE TABLE batches (
    id BIGSERIAL PRIMARY KEY,
    start_year INT NOT NULL,
    end_year INT NOT NULL,
    UNIQUE (start_year, end_year)
);

CREATE TABLE academic_years (
    id BIGSERIAL PRIMARY KEY,
    start_year INT NOT NULL,
    end_year INT NOT NULL,
    UNIQUE (start_year, end_year)
);

CREATE TABLE semesters (
    id BIGSERIAL PRIMARY KEY,
    academic_year_id BIGINT NOT NULL REFERENCES academic_years(id),
    number INT NOT NULL CHECK (number BETWEEN 1 AND 8),
    UNIQUE (academic_year_id, number)
);

CREATE TABLE sections (
    id BIGSERIAL PRIMARY KEY,
    program_id BIGINT NOT NULL REFERENCES programs(id),
    batch_id BIGINT NOT NULL REFERENCES batches(id),
    semester_id BIGINT NOT NULL REFERENCES semesters(id),
    name TEXT NOT NULL,
    UNIQUE (program_id, batch_id, semester_id, name)
);

CREATE TABLE students (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    current_section_id BIGINT NOT NULL REFERENCES sections(id),

    register_number TEXT UNIQUE NOT NULL,
    hosteler BOOLEAN NOT NULL,
    lateral_entry BOOLEAN NOT NULL,

    dob DATE,
    gender TEXT NOT NULL CHECK (gender IN ('MALE', 'FEMALE')),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subjects (
    id BIGSERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    regulation TEXT NOT NULL,
    credits NUMERIC(3,1) NOT NULL
);

CREATE TABLE faculty_subject_section (
     id BIGSERIAL PRIMARY KEY,
     faculty_id BIGINT NOT NULL REFERENCES faculty(id),
     subject_id BIGINT NOT NULL REFERENCES subjects(id),
     section_id BIGINT NOT NULL REFERENCES sections(id),
     academic_year_id BIGINT NOT NULL REFERENCES academic_years(id),
     UNIQUE (faculty_id, subject_id, section_id)
);