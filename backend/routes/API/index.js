const express = require("express");
const router = express.Router();
const V1_ROUTER = require("./V1");

router.use("/v1", V1_ROUTER);
// router.get('/v1', function(req, res, next) {
//     res.send('going to v1');
//   });
module.exports = router;