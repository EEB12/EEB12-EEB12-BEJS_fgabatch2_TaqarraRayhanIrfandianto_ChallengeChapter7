
const express = require("express");
const router = express.Router();
const { resolveRefs } = require('json-refs');

const IMAGES_ROUTER = require("./images");
const USER_ROUTER = require("./user");
router.use("/images", IMAGES_ROUTER);
router.use("/user", USER_ROUTER);
module.exports = router;