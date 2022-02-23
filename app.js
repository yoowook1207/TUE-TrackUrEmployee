const inquirer = require('inquirer');
var mysql = require('mysql2');
// const cTable = require('console.table')

var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Dbtjddnr9395!",
  database: "myEmployee"
});


const whatToDo = () => {
    inquirer.prompt({
        type: 'list',
        name: 'whatWouldDo',
        message: 'What would you like to do?',
        choices: ['View all departments', 'View all roles', 'View all employees', 'Add a Department', 'Add a Role', 'Add an Employee', 'Update an employee role']
    })
    .then(action => {
        if (action.whatWouldDo === 'View all departments') {
            viewDepartment()
        } else if (action.whatWouldDo === 'View all roles') {
            viewRoles();
        } else if (action.whatWouldDo === 'View all employees') {
            viewEmployees();
        } else if (action.whatWouldDo === 'Add a Department') {
            addDepartment();
        } else if (action.whatWouldDo === 'Add a Role') {
            addRole();
        } else if (action.whatWouldDo === 'Add an Employee') {
            addEmployee();
        } else if (action.whatWouldDo === 'Update an employee role') {
            updateEmployee();
        }
    })
};

const viewDepartment = () => {
    db.connect(function(err) {
        if (err) throw err;
        let sql="select * from department"
        db.query(sql, function (err, result) {
            if (err) throw err;
            console.table(result)
            if (result) {
                return whatToDo();
            }
        })
      })
}

const viewRoles = () => {
    db.connect(function(err) {
        if (err) throw err;
        let sql=`
        SELECT role.*, department.name     
        AS department_name
        FROM role
        LEFT JOIN department
        ON role.department_id = department.id
        ;`
        db.query(sql, function (err, result) {
          if (err) throw err;
        console.table(result)
        if (result) {
            return whatToDo();
        }
        })
      })
}

const viewEmployees = () => {
    db.connect(function(err) {
        if (err) throw err;
        let sql=`
        SELECT employee.*, CONCAT(m.first_name, ' ', m.last_name) AS manager, role.title AS title, role.salary AS salaries, department.name as Department
        FROM employee
        LEFT JOIN employee m ON
        m.id = employee.manager_id
        LEFT JOIN role
        on employee.role_id = role.id
        LEFT JOIN department
        on role.department_id = department.id
        ;`
        db.query(sql, function (err, result) {
          if (err) throw err;
        console.table(result)
        if (result) {
            return whatToDo();
        }
        });
      })
}

const addDepartment = () => {
    inquirer.prompt(
        {
        type: 'input',
        name: 'department',
        message: 'What is the name of the department?',
        validate: depName =>{
            if (depName.length > 30 || depName.length <= 0) {
                return false
            } else {
                return true;
            }}
        })
    .then(depInfo => {
        let sql = `INSERT INTO department (name) VALUE ('${depInfo.department}')`
        db.query(sql, (err, result) => {
            if (err) {
                throw err;
            }
            if (result) {
                return whatToDo();
            }
        })
    })
}

const addRole = () => {
    inquirer.prompt([
        {
        type: 'input',
        name: 'role',
        message: 'What is the name of the role?',
        validate: roleName =>{
            if (roleName.length > 30 || roleName.length <= 0) {
                return false
            } else {
                return true;
            }}
        },
        {
            type: 'number',
            name: 'salary',
            message: 'How much its salary?'
        },
        {
            type: 'input',
            name: 'department',
            message: 'Which department does the role belong to?',
            default: null
        }])
    .then(roleInfo => {
        // 먼저 department id 찾기
        let firstSQL = `SELECT id from department where name = '${roleInfo.department}'`
        db.query(firstSQL, (err, result) => {
            // result 예시: [ { id: 1 }]
            console.log(result)
            // 커넥션 에러
            if (err) {
                throw err;
            }
            // typo 에러
            else if (result.length===0) {
                console.log('please put correct department name.')
                return addRole();
            }
            // department 이름 제대로 쳤으면 다음으로 진행
            else {
                // 디파트먼트 이름을 해당하는 아이디로 바꾸기            
            let dep_id = result[0].id
            // 직책 이름, 직책 연봉, 디파트먼트 아이디
            let sql = `INSERT INTO role (title, salary, department_id) VALUE ('${roleInfo.role}', '${roleInfo.salary}', '${dep_id}')`
            db.query(sql, (err, result) => {
                if (err) {
                    throw err;
                }
                if (result) {
                    return whatToDo();
                }
            })
        }
        })
        })

}

const addEmployee = () => {
    inquirer.prompt([
        {
        type: 'input',
        name: 'first_name',
        message: 'First Name:',
        validate: firstName =>{
            if (firstName.length > 30 || firstName.length <= 0) {
                return false
            } else {
                return true;
            }}
        },
        {
            type: 'input',
            name: 'last_name',
            message: 'Last Name:',
            validate: lastName =>{
                if (lastName.length > 30 || lastName.length <= 0) {
                    return false
                } else {
                    return true;
                }}
        },
        {
            type: 'input',
            name: 'role',
            message: "What is the employee's title(role)?",
            validate: roleName =>{
                if (roleName.length > 30 || roleName.length <= 0) {
                    return false
                } else {
                    return true;
                }}
        },
        {
            type: 'confirm',
            name: 'managerConfirm',
            message: "Does this employee have a manager?",
            default: false
        },
        {
            type: 'input',
            name: 'manager_first',
            message: "Manager's first name:",
            when: ({managerConfirm}) => managerConfirm
        },
        {
            type: 'input',
            name: 'manager_last',
            message: "Manager's last name:",
            when: ({managerConfirm}) => managerConfirm
        }
    ])
    .then(empInfo => {
        let roleSQL = `SELECT id FROM role WHERE title = '${empInfo.role}'`
        db.query(roleSQL, (err, result)=>{
            if (err) {
                throw err;
            } else if (result.length===0) {
                console.log('please put an existing title(role) name.')
                return addEmployee();
            } else {
                let roleID = result[0].id
                let managerSQL = `SELECT id FROM employee WHERE first_name = '${empInfo.manager_first}' AND last_name = '${empInfo.manager_last}'`
                db.query(managerSQL, (err,result)=> {
                    if (err) {
                        throw err;
                    } else if(!empInfo.managerConfirm) {
                        let sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUE ('${empInfo.first_name}', '${empInfo.last_name}', '${roleID}', null)`
                        db.query(sql, (err, result) => {
                            if (err) {
                                throw err;
                            }
                            if (result) {
                                return whatToDo();
                            }
                        })
                    } else if (result.length===0) {
                        console.log("please put existing manager's first and last name")
                        return addEmployee();
                    } else{
                        let managerID = result[0].id
                        let sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUE ('${empInfo.first_name}', '${empInfo.last_name}', '${roleID}', '${managerID}')`
                        db.query(sql, (err, result) => {
                            if (err) {
                                throw err;
                            }
                            if (result) {
                                return whatToDo();
                            }
                        })
                    }
                })
            }
        })

    })
}

const updateEmployee = () => {
    
    let callSQL = `SELECT CONCAT(first_name,' ', last_name) AS name FROM employee;`
    db.query(callSQL, (err, result) => {
        if(err) {
            throw err;
        }
        let nameArray=[]
        for (i=0; i<result.length; i++) {
            let comingName = result[i].name
            nameArray.push(comingName)
        }
        console.log(nameArray)

        let roleIdSQL = `SELECT title FROM role`
        db.query(roleIdSQL, (err, result) => {
            if(err) {
                throw err;
            }
            let roleArray=[]
            for (i=0; i<result.length; i++) {
                let roleName = result[i].title
                roleArray.push(roleName)
            }
            console.log(roleArray)
            inquirer.prompt([
                {
                type: 'list',
                name: 'whichEmployee',
                message: "Which employee's role do you want to update?",
                choices: nameArray
                },
                {
                type: 'list',
                name: 'whatRole',
                message: "To what role do you want to update?",
                choices: roleArray
                }
            ])
            .then(updateInfo => {
                let updateTarget = updateInfo.whichEmployee
                let newNameArray = updateTarget.split(' ');
                let newFirstName = newNameArray[0]
                let newLastName = newNameArray[1]
                console.log(updateInfo.whatRole)
                let findRoleIdSQL = `SELECT id FROM role WHERE title = '${updateInfo.whatRole}'`
                db.query(findRoleIdSQL, (err,result) => {
                    if (err) {
                        throw err;
                    }
                    let newRoleId = result[0].id

                    let updateSQL = `
                    UPDATE employee
                    SET role_id = ${newRoleId}
                    WHERE first_name = '${newFirstName}' AND last_name = '${newLastName}'
                    ;`
                    db.query( updateSQL, (err,result) => {
                        if (err) {
                            throw err;
                        }
                        return whatToDo();
                    }
                    )
                })

            })
        })

       
    })
}

whatToDo()


