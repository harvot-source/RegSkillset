const express = require("express");
const path = require("path");
const app = express();
const port = 10000;
const dotenv = require("dotenv");
const cookie_parser = require("cookie-parser");
// const mysql = require("mysql2");

dotenv.config({ path: "./.env" });
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "./public")));

app.use(express.urlencoded({ extended: true })); // parse body url
app.use(express.json()); // parse request

app.use(cookie_parser());

//define routes imported from another file using the app.use
app.use("/", require("./routes/registerRoutes"));
app.use("/auth", require("./routes/auth"));

// app.get('/', (req,res)=>{
//     res.send(`<html><body><h1>Registration Form</h1></body></html>`)
// });

app
  .listen(port, () => {
    console.log(`Server has started!`);
  })
  .on("error", (err) => {
    console.error(`Server failed to start\n${err}`);
  });
