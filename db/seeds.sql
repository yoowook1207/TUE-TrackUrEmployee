INSERT INTO department (name)
VALUES
    ('Development'),
    ('Human Resources');

INSERT INTO role (title, salary, department_id)
VALUES
    ('Software Engineer', 500000, 1),
    ('Electrical Engineer', 400000, 1),
    ('Customer Care', 300000, 2),
    ('Internship', 50000, 2);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ('Sung', 'Yoo', 1, NULL),
    ('Semi', 'Kim', 2, 1),
    ('First', 'Last', 3, NULL),
    ('Intern', 'Ship', 4, 3);
