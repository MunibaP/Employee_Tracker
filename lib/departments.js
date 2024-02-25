const db = require('../db/connection');
const cTable = require('console.table');
const inquirer = require('inquirer');

// Inquirer Prompts
function start() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Add a manager',
        'Update an employee role',
        'View employees by manager',
        'View employees by department',
        'Delete Departments | Roles | Employees',
        'View the total utilized budget of a department',
        'Exit',
      ],
    }
  ])
  .then((answer) => {
    switch(answer.action) {
      case 'View all departments':
        viewAllDepartments();
        break;
      case 'View all roles':
        viewAllRoles();
        break;
      case 'View all employees':
        viewAllEmployees();
        break;
      case 'Add a department':
        addDepartment();
        break;
      case 'Add a role':
        addRole();
        break;
      case 'Add an employee':
        addEmployee();
        break;
      case 'Add a manager':
        addManager();
        break;
      case 'Update an employee role':
        updateEmployeeRole();
        break;
      case 'View employees by manager':
        viewEmployeesManager();
        break;
      case 'View Employees by Department':
        viewEmployeesDepartment();
        break;
      case 'Delete Departments | Roles | Employees':
        deleteDepartmentsRolesEmployees();
        break;
      case 'View the total utilized budget of a department':
        viewTotalUtilizedBudgetOfDepartment();
        break;
      case 'Exit':
        Connection.end();
        console.log('Bye!');
        break;
    }
  });
}

// Added Funtion to view all departments
function viewAllDepartments() {
  const query = 'SELECT * FROM departments';
  connection.query(query, (err, res) => {
    if(err) throw err;
    console.table(res);
    // Restart the application
    start();
  });
}

// Added Function to view all roles
function viewAllRoles() {
  const query = 'SELECT roles.title, roles.id, departments.department_name, roles.salary from roles join departments on roles.department_id = departments.id';
  connection.query(query, (err, res) => {
    if(err) throw err;
    console.table(res);
    // Restart the application
    start();
  });
}

// Added Function to view all employees
function viewAllEmployees() {
  const query =  `
  SELECT employees.id,
  employees.first_name, 
  employees.last_name,
  roles.title,
  roles.salary,
  departments.department_name,
  CONCAT(manager.first_name, ' ', manager.last_name) AS manager_name
  FROM employees
  LEFT JOIN roles ON employees.role_id = roles.id
  LEFT JOIN departments ON roles.department_id = departments.id
  LEFT JOIN employees manager ON employees.manager_id = manager.id`;

  connection.query(query, (err, res) => {
    if(err) throw err;
    console.table(res);
    // Restart the application
    start();
  });
}

// Added Function to ADD a department
function addDepartment() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'name', 
      message: 'Enter the name of the department:',
    }
  ])
  .then((answer) => {
    console.log('answer.name');
    const query = `INSERT INTO departments (department_name) VALUES ("${answer.name}")`;
    connection.query(query, (err, res) => {
      if (err) throw err;
      console.log(`Department ${answer.name} added to the database!`);
      // Restart the application
      start();
      console.log(answer.name);
    });
  });
}

// Added Function to ADD a role
function addRole(){
  const query = 'SELECT * FROM departments';
  connection.query(query, (err, res) => {
    if(err) throw err;
    inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Enter the title of the new role:',
      },
      {
        type: 'input',
        name: 'salary',
        message: 'Enter the salary for this role:',
      },
      {
        type: 'input',
        name: 'department',
        message: 'Select the department for this role:',
        choices: res.map(
          (department) => department.department_name
        ),
      },
    ])
    .then((answer) => {
      const department = res.find(
        (department) => department.name === answer.department
      );
      const query = 'INSERT INTO roles SET?';
      connection.query (
        query,
        {
          title: answer.title,
          salary: answer.salary,
          department_id: department,
        },
        (err, res) => {
          if (err) throw err;
          console.log(`Added role ${answer.title} with salary ${answer.salary} to the ${answer.department} department in the database!`);
          // Restart the application
          start();
        }
      );
    });
  });
}

// Added Function to ADD employees
function addEmployee() {
  // retrieve list of roles from database
  connection.query("SELECT id, title FROM roles", (error, results) => {
    if (error) {
      console.error(error);
      return;
    }

    const roles = results.map(({id, title}) => ({
      name: title,
      value: id,
    }));

    // retrieves list of employees from database
    connection.query(
      'SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee',
      (error, results) => {
        if(error) {
          console.log(error);
          return;
        }

        const managers = results.map(({id, name}) => ({
          name,
          value: id,
        }));

        // Inquirer prompt for employee information
        inquirer.prompt([
          {
            type: 'input',
            name: 'firstName',
            message: 'Enter the employees first name:',
          },
          {
            type: 'input',
            name: 'lastName',
            message: 'Enter the employees last name:',
          },
          {
            type: 'list',
            name: 'roleId',
            message: 'Select the employee role:',
            choices: roles,
          },
          {
            type: 'list',
            name: 'managerId',
            message: 'Select the employee manager:',
            choices: [
              { name: "None", value: null },
              ...managers,
            ],
          },
        ])
        .then((answer) => {
          // Add employee to database
          const sql = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)';
          const values = [
            answer.firstName,
            answer.lastName,
            answer.roleId,
          ];
          connection.query(sql, values, (error) => {
            if(error) {
              console.error(error);
              return;
            }
            console.log('Employee added!');
            start();
          });
        })
        .catch((error) => {
          console.error(error);
        });
      }
    );
  });
}

// Added Function to ADD a Manager
function addManager() {
  const queryDepartments = "SELECT * FROM departments";
  const queryEmployees = "SELECT * FROM employee";

  connection.query(queryDepartments, (err, resDepartments) => {
    if(err) throw err;
    connection.query(queryEmployees, (err, resEmployees) => {
      if(err) throw err;
      inquirer.prompt([
        {
          type: 'list',
          name: 'department',
          message: 'Select the department:',
          choices: resDepartments.map(
            (department) => department.department_name
          ),
        },
        {
          type: 'list',
          name: 'employee',
          message: 'Select the employee to add a manager to:',
          choices: resEmployees.map(
            (employee) =>
            `${employee.first_name} ${employee.last_name}`
          ),
        },
        {
          type: 'list',
          name: 'manager',
          message: 'Select the employees manager:',
          choices: resEmployees.map(
            (employee) =>
            `${employee.first_name} ${employee.last_name}`
          ),
        },
      ])
      .then((answer) => {
        const department = resDepartments.find(
          (department) =>
          department.department_name === answer.department
        );
        const employee = resEmployees.find(
          (employee) =>
          `${employee.first_name} ${employee.last_name}` === answer.employee
        );
        const manager = resEmployees.find(
          (employee) =>
          `${employee.first_name} ${employee.last_name}` === answer.manager
        );
        const query =
        "UPDATE employee SET manager_id = ? WHERE id = ? AND role_id IN (SELECT id FROM roles WHERE department_id = ?)";
        connection.query(
          query,
          [manager.id, employee.id, department.id], (err, res) => {
            if (err) throw err;
            console.log(`Added manager ${manager.first_name} ${manager.last_name} to employee ${employee.first_name} ${employee.last_name} in department ${department.department_name}!`);
            
            // Restart the application
            start();
          }
        );
      });
    });
  });      
}

// Added Function to UPDATE employee role
function updateEmployeeRole() {
  const queryEmployees = 'SELECT employee.id, employee.first_name, employee.last_name, roles.title FROM employee LEFT JOIN roles ON employee.role_id = roles.id';
  const queryRoles = 'SELECT * FROM roles';
  connection.query(queryEmployees, (err, resEmployees) => {
    if(err) throw err;
    connection.query(queryRoles, (err, resRoles) => {
      if(err) throw err;
      inquirer.prompt([
        {
          type: 'list',
          name: 'employee',
          message: 'Select the employee to update:',
          choices: resEmployees.map(
            (employee) => `${employee.first_name} ${employee.last_name}`
          ),
        },
        {
          type: 'list',
          name: 'role',
          message: 'Select the new role:',
          choices: resRoles.map((role) => role.title),
        },
      ])
      .then((answer) => {
        const employee = resEmployees.find(
          (employee) =>
          `${employee.first_name} ${employee.last_name}` === answer.employee
        );
        const role = resRoles.find(
          (role) => role.title === answer.role
        );
        const query =
        "UPDATE employee SET role_id = ? WHERE id = ?";
        connection.query(
          query,
          [role.id, employee.id],
          (err, res) => {
            if (err) throw err;
            console.log(`Updated ${employee.first_name} ${employee.last_name}'s role to ${role.title} in the database!`);
           
            // Restart the Application
            start();
          }
        );
      });
    });
  });
}

// Added Function to VIEW employee by manager
function viewEmployeesManager() {
  const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, departments.department_name, CONCAT(manager.first_name, ' ', manager.last_name) AS manager_name
  FROM
  employee 
  INNER JOIN roles ON employee.role_id = role.id
  INNER JOIN departments ON roles.department_id = department.id 
  LEFT JOIN employee ON employee.manager_id = manager.id
  ORDER BY
  manager_name,
  employee.last_name,
  employee.first_name`;

  connection.query(query, (err, res) => {
    if(err) throw err;

    // Group employee by manager
    const employeesManager = res.reduce((acc, cur) => {
      const managerName = cur.manager_name;
      if(acc[managerName]) {
        acc[managerName].push(cur);
      }else {
        acc[managerName] = [cur];
      }
      return acc;
    }, {});

    // Added Function to VIEW employee by managers
    console.log('Employees By Manager:');
    for (const managerName in employeesManager) {
      console.log(`\n${managerName}:`);
      const employees = employeesManager[managerName];
      employees.forEach((employee) => {
        console.log(`${employee.first_name} ${employee.last_name} | ${employee.title} | ${employee.department_name}`);
      });
    }
    // Restart the application
    start();
  });
}

// Added Function to VIEW employee by Department
function viewEmployeesDepartment() {
  const query =
  "SELECT departments.department_name, employee.first_name, employee.last_name FROM employee INNER JOIN roles ON employee.role_id = roles.id INNER JOIN departments ON roles.department_id = departments.id ORDER BY departments.department_name";

  connection.query(query, (err, res) => {
    if (err) throw err;
    console.log("\nEmployees by department:");
    console.table(res);
    // Restart the application
    start();
  });
}

// Added Function to DELETE Departments, Roles, Employees
function deleteDepartmentsRolesEmployees() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'data',
      message: 'What would you like to delete?',
      choices: ['Departments', 'Roles', 'Employees'],
    }
  ])
  .then((answer) => {
    switch (answer.data) {
      case 'Department':
        deleteDepartment();
        break;
      case 'Role':
        deleteRole();
        break;
      case 'Employee':
        deleteEmployee();
        break;
    }
  });
} 

// Added Function to DELETE Department
function deleteDepartment() {
  const query = 'SELECT * FROM departments';
  connection.query(query, (err, res) => {
    if(err) throw err;
    const departmentChoices = res.map((department) => ({
      name: department.department_name,
      value: department.id,
    }));
    
    // Inquirer prompt
    inquirer.prompt([
      {
        type: 'list',
        name: 'departmentId',
        message: 'Which department do you want to delete?',
        choices: [
          ...departmentChoices,
          {name: 'Go Back', value: 'back'},
        ],
      }
    ])
    .then((answer) => {
      if (answer.departmentId === 'back') {
        deleteDepartmentsRolesEmployees();
      } else {
        const query = 'DELETE FROM departments WHERE id = ?';
        connection.query(
          query,
          [answer.departmentId],
          (err, res) => {
            if(err) throw err;
            console.log(`Deleted department with ID ${answer.departmentId} from the database!`);
            // Restart the application
            start();
          }
        );
      }
    });
  });
}

// Added Function to DELETE role
function deleteRole() {
  const query = 'SELECT * FROM roles';
  connection.query(query, (err, res) => {
    if(err) throw err;
    const choices = res.map((role) => ({
      name: `${role.title} (${role.id}) - ${role.salary}`,
      value: role.id,
    }));

    // Added a GO BACK function
    choices.push({ name: "Go Back", value: null });
    inquirer.prompt ([
      {
        type: 'list',
        name: 'roleId',
        message: 'Select the role you want to delete:',
        choices: choices,
      }
    ])
    .then((answer) => {
      if (answer.roleId === null) {
        deleteDepartmentsRolesEmployees();
        return;
      }
      const query = "DELETE FROM roles WHERE id = ?";
      connection.query(query, [answer.roleId], (err, res) => {
        if (err) throw err;
        console.log(`Deleted role with ID ${answer.roleId} from the database!`);

        start();
      });
    });
  });
}

// Added Function to DELETE employees
function deleteEmployee() {
  const query = 'SELECT * FROM employees';
  connection.query(query, (err, res) => {
    if(err) throw err;
    const employeeList = res.map((employee) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id,
    }));

    employeeList.push({ name: "Go Back", value: "back" });
    inquirer.prompt([
      {
        type: 'list',
        name: 'id',
        message: 'Select the employee you want to delete:',
        choices: employeeList,
      }
    ])
    .then((answer) => {
      if(answer.id === 'back') {
        deleteDepartmentsRolesEmployees();
        return;
      }
      const query = 'DELETE FROM employee WHERE id = ?';
      connection.query(query, [answer.id], (err, res) => {
        if (err) throw err;
        console.log(`Deleted employee with ID ${answer.id} from the database!`);
        // Restart the application
        start();
      });
    });
  });
}
// Function to view Total Utilized Budget of Department
function viewTotalUtilizedBudgetOfDepartment() {
  const query = "SELECT * FROM departments";
  connection.query(query, (err, res) => {
      if (err) throw err;
      const departmentChoices = res.map((department) => ({
          name: department.department_name,
          value: department.id,
      }));

      // prompt the user to select a department
      inquirer.prompt([
        {
          type: 'list',
          name: 'departmentId',
          message: 'Which department do you want to calculate the total salary for?',
          choices: departmentChoices,
        }
      ])
      .then((answer) => {
        // calculate the total salary for the selected department
        const query =
            `SELECT 
            departments.department_name AS department,
            SUM(roles.salary) AS total_salary
          FROM 
            departments
            INNER JOIN roles ON departments.id = roles.department_id
            INNER JOIN employees ON roles.id = employee.role_id
          WHERE 
            departments.id = ?
          GROUP BY 
            departments.id;`;
            connection.query(query, [answer.departmentId], (err, res) => {
              if (err) throw err;
              const totalSalary = res[0].total_salary;
              console.log(`The total salary for employees in this department is $${totalSalary}`);
              // restart the application
              start();
            });
      });
  });
}

// close the connection when the application exits
process.on("exit", () => {
  connection.end();
});