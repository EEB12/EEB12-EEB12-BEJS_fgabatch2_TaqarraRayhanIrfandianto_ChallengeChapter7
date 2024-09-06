const express = require("express");
const router = express.Router();
const API= require("./API");

router.use("/api", API);
// router.get('/api', API,function(req, res, next) {
//   res.send('going to api folder');
// });
module.exports = router;