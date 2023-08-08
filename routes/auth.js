const express = require("express");
const router = express.Router();
const registrationController = require("../controller/authAccount");

router.post("/register", registrationController.register);

router.post("/login", registrationController.login);

router.get("/updateform/:email", registrationController.updateform); // add colon (:) to get the value
router.post("/updateuser", registrationController.updateuser);

router.get("/accountRemove/:email", registrationController.accountRemove);
router.post("/remove", registrationController.remove);

router.get("/logout", registrationController.logout);

router.get("/skillset/:email", registrationController.skillset);

module.exports = router;
