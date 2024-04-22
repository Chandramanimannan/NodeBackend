const express = require("express");

const { fun } = require("../controllers/newcontroller");

const router = express.Router();

router.post("/new", fun);

module.exports = router;
