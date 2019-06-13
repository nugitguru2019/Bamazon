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
//Initial function that starts the program and asks user what action to use
function managerInit() {
inquirer
    .prompt([{
    name: "managerAction",
    type: "list",
    message: "Welcome, your excellency. How can I help you?",
    choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
    }]).then(function (response) {
    switch (response.managerAction) {
        case "View Products for Sale":
        listProducts();
        break;
        case "View Low Inventory":
        lowQuantity();
        break;
        case "Add to Inventory":
        addQuantity();
        break;
        case "Add New Product":
        addProduct();
        break;
    }
    })
};
//Function that lists all of the available items in the products table
function listProducts() {
connection.query(
    "SELECT * FROM products",
    function (err, products) {
    console.log("\nCurrent Products:");
    //console.table(products, ["item_id"]);
    let data = [
        ["item_id", "product_name", "price", "stock_quantity"],
    ];
    for (let i = 0; i < products.length; i++) {
        //console.table(products[i], ["item_id" + products[i].item_id, "product_name", "price", "stock_quantity"]);
        //console.log("\n" + products[i].item_id + " | " + products[i].product_name + " | $" + products[i].price + "\n");
        let daProds = [products[i].item_id, products[i].product_name, products[i].price, products[i].stock_quantity];
        data.push(daProds);
    }
    config = {
        border: table.getBorderCharacters('honeywell')
    };
    output = table.table(data, config);
    console.log("\n" + output);
    }
)
inquirer
    .prompt([{
    name: "more",
    type: "confirm",
    message: "Would you like to do something else?"
    }]).then(function (answer) {
    if (answer.more) {
        managerInit();
    } else {
        console.log(figlet.textSync("Fine then!",
        {
        font: "Big",
        horizontalLayout: "default",
        verticalLayout: "default"
        }));
        connection.end();
    }
    })
};
//Function that lists all of the products with a stock_quantity less than 5
function lowQuantity() {
connection.query(
    "SELECT * FROM products WHERE stock_quantity < 5",
    function (err, products) {
    console.log("\nLow Quantity Products ");
    data = [
        ["item_id", "product_name", "price", "stock_quantity"]
    ];
    for (let j = 0; j < products.length; j++) {
        let deseProds = [products[j].item_id, products[j].product_name, "$" + products[j].price, products[j].stock_quantity];
        data.push(deseProds);
        //console.log("\n" + products[j].item_id + " | " + products[j].product_name + " | $" + products[j].price + " | " + products[j].stock_quantity + "\n");
    }
    config = {
        border: table.getBorderCharacters('honeywell')
    };
    output = table.table(data, config);
    console.log("\n" + output);
    }
)
inquirer
    .prompt([{
    name: "wannaAdd",
    type: "confirm",
    message: "Would you like to add any stock?"
    }]).then(function (response) {
    if (response.wannaAdd) {
        addQuantity();
    } else {
        console.log(figlet.textSync("You are weak!", {
        font: "Big",
        horizontalLayout: "default",
        verticalLayout: "default"
        }));
        connection.end();
    }
    })
};
//Function that allows user to add to stock_quantity of products table
function addQuantity() {
connection.query(
    "SELECT * FROM products",
    function (err, products) {
    inquirer
        .prompt([{
            name: "whatItem",
            type: "list",
            message: "What item would you like to stock?",
            choices: function () {
            let choicesArray = [];
            for (let l = 0; l < products.length; l++) {
                choicesArray.push(products[l].product_name);
            }
            return choicesArray;
            }
        },
        {
            name: "whatAmount",
            type: "input",
            message: "What quantity would you like to add?",
            validate: function (val) {
            if (!isNaN(val)) {
                return true;
            }
            return false;
            }
        }
        ]).then(function (answer) {
        let chosenItem;
        for (let f = 0; f < products.length; f++) {
            if (products[f].product_name === answer.whatItem) {
            chosenItem = products[f];
            }
        }
        if (answer.whatAmount) {
            console.log(answer.whatAmount);
            console.log("Successfully added " + answer.whatAmount + " units to " + chosenItem.product_name + " stock!");
            let newQuantity = chosenItem.stock_quantity + parseInt(answer.whatAmount);
            connection.query(
            "UPDATE products SET ? WHERE ?",
            [{
                stock_quantity: newQuantity
                },
                {
                product_name: chosenItem.product_name
                }
            ]
            )
        } else {
            console.log("Ruh roh, fix this fix-it-man!");
        }
        moreManagering();
        })
    }
)
};
//Function that allows user to add additional items to products table
function addProduct() {
inquirer
    .prompt([{
        name: "name",
        type: "input",
        message: "What is the name of your new product?"
    },
    {
        name: "department",
        type: "input",
        message: "What is the department?"
    },
    {
        name: "price",
        type: "input",
        message: "What is the price?",
        validate: function (val) {
        if (!isNaN(val)) {
            return true;
        }
        return false;
        }
    },
    {
        name: "quantity",
        type: "input",
        message: "What is the quantity you want in stock?",
        validate: function (val) {
        if (!isNaN(val)) {
            return true;
        }
        return false;
        }
    }
    ]).then(function (response) {
    console.log("Successfully added " + response.name + " to the store!");
    connection.query(
        "INSERT INTO products SET ?",
        [{
        product_name: response.name,
        department_name: response.department,
        price: response.price,
        stock_quantity: response.quantity,
        product_sales: 0
        }]
    )
    moreManagering();
    })
};
//Function that asks user if they want to execute another action
//If yes, runs init function again
//If no, ends the connection and the program
function moreManagering() {
inquirer
    .prompt([{
    name: "more",
    type: "confirm",
    message: "Would you like to do more managering?"
    }]).then(function (answer) {
    if (answer.more) {
        managerInit();
    } else {
        console.log(figlet.textSync("Then GET OUT!", {
        font: "Big",
        horizontalLayout: "default",
        verticalLayout: "default"
        }));
        connection.end();
    }
    })
};
//Call init function to run program on node launch
managerInit();
