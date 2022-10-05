const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "hunter.db");
const app = express();

app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(-1);
  }
};
initializeDBAndServer();

//Get list of users API

app.get("/users/", async (request, response) => {
  const getUserQuery = `
            SELECT
              *
            FROM
             customers
            ORDER BY
             id;`;
  const userArray = await db.all(getUserQuery);
  response.send(userArray);
});

//Get SINGLE Book API

app.get("/users/:userId/", async (request, response) => {
  const { userId } = request.params;
  const getSingleCustomer = `
      SELECT
       *
      FROM
       customers 
      WHERE
       id = ${userId};
    `;
  const customerArray = await db.get(getSingleCustomer);

  if (customerArray !== undefined) {
    response.send(customerArray);
    response.status(200);
  } else {
    response.send("user does not exist");
    response.status(400);
  }
});

//GET user BY customizing QUERY

app.get("/users/", async (request, response) => {
  const { page = 2, limit = 5, sort = "age", name = "" } = request.query;

  let sortBy;

  if ((sortBy = sort[0] === "a")) {
    sortBy = "ASC";
  } else {
    sortBy = "DESC";
  }

  const getMyQuery = `SELECT
            * 
            FROM 
            customers 
            WHERE first_name LIKE '%${name}%'
            or last_name LIKE '%${name}%'
            ORDER BY '${sort}' ${sortBy}
            LIMIT ${limit}
            OFFSET ${page}
        ; `;

  const customizeArray = await db.all(getMyQuery);

  if (customizeArray !== undefined) {
    response.send(customizeArray);
    response.status(200);
  } else {
    response.send("something went wrong");
    response.status(400);
  }
});

//CREATE  NEW USER
app.post("/users/", async (request, response) => {
  const {
    firstName,
    lastName,
    companyName,
    city,
    state,
    zip,
    email,
    web,
    age,
  } = request.body;
  //console.log(request.body);
  //console.log(age);

  if (
    request.body.first_name !== undefined ||
    request.body.last_name !== undefined ||
    request.body.company_name !== undefined ||
    request.body.city !== undefined ||
    request.body.state !== undefined ||
    request.body.zip !== undefined ||
    request.body.email !== undefined ||
    request.body.web !== undefined ||
    request.body.age !== undefined
  ) {
    const postCustomerQuery = `
  INSERT INTO
    customers (first_name,
  last_name ,
  company_name ,
  city ,
  state ,
  zip ,
  email ,
  web ,
  age)
  VALUES
    ('${firstName}', '${lastName}', '${companyName}','${city}', '${state}',${zip}, '${email}','${web}',${age});`;
    const ted = await db.run(postCustomerQuery);
    response.send("Customer Successfully Added");
    response.status(200);
  } else {
    response.status(400);
    response.send("please enter Customer details");
  }

  //console.log("yes");
});

//UPDATE QUERY

app.put("/users/:userId", async (request, response) => {
  const { userId } = request.params;
  const getFirstQuery = `select * from customers where id=${userId}`;
  const dBSingleQuery = await db.get(getFirstQuery);

  if (dBSingleQuery !== undefined) {
    const {
      first_name = dBSingleQuery.first_name,
      last_name = dBSingleQuery.last_name,
      company_name = dBSingleQuery.company_name,
      city = dBSingleQuery.city,
      state = dBSingleQuery.state,
      zip = dBSingleQuery.zip,
      email = dBSingleQuery.email,
      web = dBSingleQuery.web,
      age = dBSingleQuery.age,
    } = request.body;

    if (
      request.body.first_name !== undefined ||
      request.body.last_name !== undefined ||
      request.body.company_name !== undefined ||
      request.body.city !== undefined ||
      request.body.state !== undefined ||
      request.body.zip !== undefined ||
      request.body.email !== undefined ||
      request.body.web !== undefined ||
      request.body.age !== undefined
    ) {
      const updatedQuery = `UPDATE
        customers
        SET
        first_name= '${first_name}',
        last_name= '${last_name}',
        company_name='${company_name}' ,
        city='${city}' ,
        state='${state}' ,
        zip=${zip} ,
        email='${email}' ,
        web='${web}' ,
        age=${age}
        WHERE
        id=${userId};`;

      const responseData = await db.run(updatedQuery);
      response.send("Customer Details Updated Successfully");
    } else {
      response.status(400);
      response.send("Invalid Customer details");
    }
  } else {
    response.send("Customer does not exists");
  }
});

/////###DELETE QUERY
app.delete("/users/:userId/", async (request, response) => {
  const { userId } = request.params;
  const formatUserQuery = `
      DELETE
      FROM
       customers 
      WHERE
       id = ${userId};
    `;
  const book = await db.run(formatUserQuery);
  response.send(`customer deleted ${userId}`);
});
