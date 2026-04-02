ALTER TABLE student_grades
ADD result TEXT CHECK( result IN ('ARREAR', 'CLEARED'));