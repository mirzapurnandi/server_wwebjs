const express = require("express");
const router = express.Router();

const privateController = require("../controllers/private.controller");

router.post("/send", privateController.sendMessage);
router.get("/check/:id_transaction", privateController.checkMessage);

module.exports = router;
