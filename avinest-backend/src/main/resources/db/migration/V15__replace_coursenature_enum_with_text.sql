ALTER TABLE course
    ADD COLUMN nature_tmp TEXT;

UPDATE course
SET nature_tmp = nature::text;

ALTER TABLE course
    DROP COLUMN nature;

ALTER TABLE course
    RENAME COLUMN nature_tmp TO nature;

ALTER TABLE course
    ALTER COLUMN nature SET NOT NULL;

ALTER TABLE course
    ADD CONSTRAINT chk_course_nature
        CHECK (nature IN ('THEORY','LAB','LAB_ORIENTED_THEORY','INDUSTRY_ORIENTED'));

DROP TYPE IF EXISTS course_nature;