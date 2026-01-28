ALTER TABLE timetable
    DROP CONSTRAINT uq_timetable_section_day_period;

ALTER TABLE timetable
    ADD COLUMN day_tmp TEXT;

UPDATE timetable
SET day_tmp = day::text;

ALTER TABLE timetable
    DROP COLUMN day;

ALTER TABLE timetable
    RENAME COLUMN day_tmp TO day;

ALTER TABLE timetable
    ALTER COLUMN day SET NOT NULL;

ALTER TABLE timetable
    ADD CONSTRAINT chk_timetable_day
        CHECK (day IN ('MON','TUE','WED','THU','FRI','SAT'));

ALTER TABLE timetable
    ADD CONSTRAINT uq_timetable_section_day_period
        UNIQUE (section_id, day, period_number);

DROP TYPE IF EXISTS weekday;