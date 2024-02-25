-- Adding Departments
INSERT INTO departments (department_name)
VALUES
('Marketing'),
('Finance'),
('Engineering'),
('Information Technology'),
('Customer Relations'),
('Legal'),
('Human Resources'),
('Sales'),
('Maintenance'),
('Research and Development');

-- Adding Roles
INSERT INTO roles (title, salary, department_id)
VALUES
('Senior-level Marketing Manager', 100,000, 1),
('Finance Analyst', 70,000, 2),
('Senior Engineering', 150,000, 3),
('IT Manager', 180,000, 4),
('Director of Customer Relations', 76,000, 5),
('Attorney', 200,000, 6),
('Chief HR Officer', 300,000, 7),
('Sales Manager', 60,000, 8),
('Maintenance Supervisor', 80,000, 9),
('R&D Manager', 200,000, 10);

-- Adding Employees
INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES
('John', 'Smith', 1, 1),
('Emily', 'Johnson', 2, 1),
('Michael', 'Williams', 3, NULL),
('Emma', 'Jones', 4, 2),
('Daniel', 'Brown', 5, 4),
('Sarah', 'Davis', 6, 5),
('David', 'Miller', 7, NULL),
('Olivia', 'Wilson', 8, 3),
('James', 'Taylor', 9, 6),
('Sophia', 'Moore', 10, 8);
