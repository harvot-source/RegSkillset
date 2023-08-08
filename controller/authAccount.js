const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = mysql.createConnection({
  database: process.env.DATABASE,
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
});

//register function
exports.register = (req, res) => {
  // console.log(req.body);
  // const firstName = req.body.firstName;
  const { firstName, lastName, email, password, confirmPassword } = req.body;
  db.query(
    "SELECT email from accounts WHERE email = ?",
    email,
    async (error, results) => {
      console.log(results);
      if (error) {
        console.log(error);
      }

      if (results.length > 0) {
        res.render("register", {
          errorMsg: "Email entered is already in use!",
          color: "alert-danger",
        });
      } else if (confirmPassword !== password) {
        res.render("register", { errorMsg: "Password is not match" });
      }

      const hashPassword = await bcrypt.hash(password, 8);
      console.log(hashPassword);

      db.query(
        "INSERT INTO accounts SET ?",
        {
          first_name: firstName,
          last_name: lastName,
          email: email,
          password: hashPassword,
        },
        (error, results) => {
          if (error) {
            console.log(error);
          } else {
            console.log(results);
            res.render("register", { message: "You are now registered!" });
          }
        }
      );
    }
  );
};

//login function
exports.login = (req, res) => {
  try {
    const { email, password } = req.body;
    //if email or password is empty
    if (email === "" || password === "") {
      res.render("index", {
        message: "Email and password should not be empty!",
      });
    }
    //if email or password is not empty
    else {
      db.query(
        "SELECT * FROM accounts WHERE email = ?",
        email,
        async (err, results) => {
          // if email is not existing
          if (!results.length > 0) {
            res.render("index", { message: "The email does not exist!" });
          }
          //if password is incorrect
          else if (!(await bcrypt.compare(password, results[0].password))) {
            res.render("index", { message: "Password is incorrect!" });
          }
          //Successfull login and display all the accounts  in the database
          else {
            const account_id = results[0].account_id;
            // console.log(account_id);
            const token = jwt.sign({ account_id }, process.env.JWTSECRET, {
              expiresIn: process.env.JWTEXPIRES,
            });
            // console.log(token);
            // const decoded = jwt.decode(token, {complete: true});
            // console.log(decoded);
            const cookieoptions = {
              expires: new Date(
                Date.now() + process.env.COOKIEEXPIRE * 24 * 60 * 60 * 1000
              ),
              httpOnly: true,
            };
            res.cookie("JWT", token, cookieoptions);
            // console.log(cookieoptions);

            db.query("SELECT * FROM accounts", (err, results) => {
              // console.log(results)
              res.render("listAccounts", {
                title: "List of Users",
                accounts: results,
              });
            });
          }
        }
      );
    }
  } catch (err) {
    console.log(`Catched error: ${err}`);
  }
};

//Population Update Function

exports.updateform = (req, res) => {
  const email = req.params.email;
  console.log(email);
  db.query("SELECT * FROM accounts WHERE email = ?", email, (err, result) => {
    // console.log(result);
    res.render("updateform", { result: result[0] });
  });
};

// Modifying Update Function
exports.updateuser = (req, res) => {
  const { firstName, lastName, email } = req.body;

  if (firstName === "" || lastName === "") {
    res.render("updateform", {
      message: "First Name and Last Name should not be empty!",
      result: { first_name: firstName, last_name: lastName, email: email },
    });
  } else {
    db.query(
      `UPDATE accounts SET first_name = "${firstName}", last_name = "${lastName}" WHERE email = "${email}"`,
      { firstName, lastName },
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          db.query("SELECT * FROM accounts", (err, results) => {
            // console.log(results)
            res.render("listAccounts", {
              title: "List of Users",
              accounts: results,
              message: "Successfully Updated the account",
            });
          });
        }
      }
    );
  }
};

//Delete - Selection
exports.accountRemove = (req, res) => {
  const email = req.params.email;

  db.query("SELECT * FROM accounts WHERE email = ?", email, (err, result) => {
    console.log(result);

    res.render("accountRemove.hbs", {
      result: result[0],
      message: "Are you sure you want to delete this account?",
    });
  });
};

//Delete - Confirmation
exports.remove = (req, res) => {
  const { account_id } = req.body;

  db.query(
    "DELETE FROM accounts WHERE account_id = ?",
    account_id,
    (err, result) => {
      if (err) {
        console.log(err.message);
      } else {
        db.query(
          "SELECT * FROM accounts ORDER BY account_id",
          (err, result) => {
            res.render("listAccounts.hbs", {
              header: "Updated list of Users",
              accounts: result,
            });
          }
        );
      }
    }
  );
};

exports.logout = (req, res) => {
  // if(req.session){
  //     req.session.destroy((err)=> {
  //         if(err){
  //             res.status(400).send("unable to logout")
  //         } else {
  //             res.clear.cookie("JWT").status(200).json({message:"Successfully logout"})
  //             res.render("index")
  //         }
  //     })
  // } else{
  //     console.log("no session");
  //     res.end();
  // }
  res.clearCookie("JWT").status(200);
  res.render("index", { message: "Successfully logout" });
};

exports.skillset = (req, res) => {
  const email = req.params.email;
  db.query(
    "SELECT * FROM accounts as a INNER JOIN skillset as s ON a.account_id = s.account_id WHERE email = ?",
    email,
    (err, result) => {
      console.log(result);

      res.render("skillset.hbs", { result: result[0] });
    }
  );
};
