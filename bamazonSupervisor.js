//Importing all required module to make app work
const dotenv = require("dotenv").config();
const mysql = require("mysql");
const inquirer = require("inquirer");
const figlet = require("figlet");
const table = require("table");
let config,
    data,
    output;
//Create connection with mysql database to retrieve and manipulate data
const connection = mysql.createConnection({
host: `localhost`,
port: 3306,
user: `root`,
password: "2529",
database: `amarzon`
});
//Checking the connection
connection.connect(function (err) {
try {
    console.log("Connected as id " + connection.threadId);
} catch (err) {
    console.log(err);
} finally {
    console.log("Successfully Connected!");
}
});
//Function that asks user which part of the program they wish to access.
//runs deptSales function if user chooses the corresponding inquirer choice
//runs addDept function if user chooses the other inquier choice.
//Otherwise exits the program and ends the connection
function superInit() {
inquirer
    .prompt([{
    name: "action",
    type: "list",
    message: "How can I assist you?",
    choices: ["View Product Sales By Department", "Create New Department", "Exit"]
    }]).then(function (answer) {
    switch (answer.action) {
        case "View Product Sales By Department":
        deptSales();
        break;
        case "Create New Department":
        addDept();
        break;
        case "Exit":
        console.log(figlet.textSync("You are not worthy!", {
            font: "Big",
            horizontalLayout: "default",
            verticalLayout: "default"
        }));
        connection.end();
    }
    })
};
//Subtraction of values from two dfferent tables assistance found here: "https://social.msdn.microsoft.com/Forums/sqlserver/en-US/4b57cd29-947b-4253-bbe0-77adae08b682/how-to-subtract-two-values-from-same-table-but-different-columns?forum=transactsql"
//Aggregate function breakdown/review needed to make this work found here:"https://stackoverflow.com/questions/13940397/sum-values-from-multiple-rows-into-one-row"
//Function that lists the sales by depart_name
function deptSales() {
let query = "SELECT d.department_id, d.department_name, d.over_head_costs, SUM(p.product_sales) AS product_sales,  SUM(p.product_sales) - d.over_head_costs AS total_profits ";
query += "FROM departments d LEFT JOIN products p ";
query += "ON d.department_name = p.department_name ";
query += "GROUP BY d.department_id, d.department_name";
connection.query(query, function (err, results) {
    if (err) throw err;
    data = [
    ["department_id", "department_name", "over_head_costs", "product_sales", "total_profits"]
    ];
    for (let i = 0; i < results.length; i++) {
        let daProds = [results[i].department_id, results[i].department_name, "$" + results[i].over_head_costs, "$" + results[i].product_sales, "$" + results[i].total_profits]
    data.push(daProds);
    //console.log(results[i].department_id + " | " + results[i].department_name + " | $" + results[i].over_head_costs + " | $" + results[i].product_sales + " | $" + results[i].total_profits);
    }
    config = {
    border: table.getBorderCharacters('honeywell')
    };
    output = table.table(data, config);
    console.log("\n" + output);
});
    inquirer
    .prompt([{
        name: "add",
        type: "confirm",
        message: "\n" + "Would you like to add a new department?"
    }]).then(function (res) {
        if (res.add) {
        addDept();
        } else {
        console.log(figlet.textSync("Farewell, Pitiful Human!", {
            font: "Big",
            horizontalLayout: "default",
            verticalLayout: "default"
        }));
        connection.end();
        }
    });
};
function addDept() {
inquirer
    .prompt([{
        name: "name",
        type: "input",
        message: "What is the name of your new department?"
    },
    {
        name: "costs",
        type: "input",
        message: "What are the overhead costs?",
        validate: function (val) {
        if (!isNaN(val)) {
            return true;
        }
        return false;
        }
    }
    ]).then(function (answers) {
    console.log("Successfully added the " + answers.name + " department!");
    connection.query(
        "INSERT INTO departments SET ?",
        [{
        department_name: answers.name,
        over_head_costs: answers.costs
        }],
        function (err, data) {
        if (err) throw err;
        }
    );
    shallIContinue();
    })
};
//function that asks the user if they wish to continue using the app
//runs init function if "yes", ends connection if "no"
function shallIContinue() {
inquirer
    .prompt([{
    name: "continue",
    type: "confirm",
    message: "Would you like to keep ruling over all existence?"
    }]).then(function (res) {
    if (res.continue) {
        superInit();
    } else {
        console.log(figlet.textSync("FILTH!",
        {
        font: "Big",
        horizontalLayout: "default",
        verticalLayout: "default"
        }));
        connection.end();
    }
    })
};
//Call init function to run program on node launch
superInit();
