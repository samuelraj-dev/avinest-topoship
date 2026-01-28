ALTER TABLE timetable
    ADD CONSTRAINT uq_timetable_section_day_period
        UNIQUE (section_id, day, period_number);
