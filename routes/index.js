const express = require("express");
const router = express.Router();

const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
const { ExpressAdapter } = require("@bull-board/express");

const admin = require("./admin");
const pengguna = require("./pengguna");
const private = require("./private");
const authenticateToken = require("../middlewares/auth.middleware");
const { checkLevel } = require("../middlewares/level.middleware");
const checkHeader = require("../middlewares/header.middleware");
const authBull = require("../middlewares/authBull.middleware");
const authPrivate = require("../middlewares/authPrivate.middleware");
const {
    registrasi,
    login,
    refresh,
    logout,
} = require("../controllers/auth.controller");
const dlrController = require("../controllers/dlr.controller");

const {
    queue,
    queuePoint,
    queueSendMessage,
    queueInitSender,
    queueWebhook,
    queueWarmup,
} = require("../config/queueBullMQ");

const serverAdapter = new ExpressAdapter();
createBullBoard({
    queues: [
        new BullMQAdapter(queue),
        new BullMQAdapter(queuePoint),
        new BullMQAdapter(queueInitSender),
        new BullMQAdapter(queueSendMessage),
        new BullMQAdapter(queueWebhook),
        new BullMQAdapter(queueWarmup),
    ],
    serverAdapter: serverAdapter,
});
serverAdapter.setBasePath("/hanacan");

router.get("/", (req, res) => {
    res.status(200).send({
        message: "Welcome",
    });
});

router.post("/webhook", (req, res) => {
    console.log("webhook-post", req.body);
    res.status(200).send({
        message: "Welcome POST",
        body: req.body,
    });
});
router.get("/webhook", (req, res) => {
    console.log("webhook-get", req.params);
    res.status(200).send({
        message: "Welcome GET",
        body: req.params,
    });
});

router.post("/api/register", registrasi);
router.post("/api/login", login);
router.post("/api/refresh", refresh);
router.post("/api/logout", logout);
router.post("/api/dlr/listen-dlr", checkHeader, dlrController.process);

router.use("/api/v1", authPrivate, private);
router.use(`/api/admin`, authenticateToken, checkLevel, admin);
router.use("/api", authenticateToken, pengguna);

router.use("/hanacan", authBull, serverAdapter.getRouter());

module.exports = router;
