const express = require("express");
const router = express.Router();
const multer = require("multer");

const userController = require("../controllers/pengguna/profil.controller");
const providerDetailController = require("../controllers/pengguna/providerDetail.controller");
const messageController = require("../controllers/pengguna/message.controller");
const routingController = require("../controllers/pengguna/routing.controller");
const { apiLimiter } = require("../middlewares/rateLimiter.middleware");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // pastikan folder ini ada
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

router.use(apiLimiter);

router.get("/", (req, res) => {
    res.status(200).json({
        message: "Hello User!",
    });
});
router.get("/me", userController.index);
router.get("/point", userController.point);

router.get("/provider-detail", providerDetailController.getAll);
router.post(
    "/provider-detail/refresh",
    providerDetailController.refreshInstance
);
router.post("/provider-detail/get-qr", providerDetailController.getQRInstance);
router.post(
    "/provider-detail/redeploy",
    providerDetailController.redeployInstance
);

router.post("/routing", routingController.getAll);
router.get("/routing/:id", routingController.getById);
router.post("/routing/create", routingController.createRouting);
router.post("/routing/create-engine", routingController.createEngine);

router.post("/message/send", messageController.sendMessage);
router.post("/message/sending", messageController.sendMessageBack);
router.post(
    "/message/upload",
    upload.single("file"),
    messageController.uploadFile
);
router.post("/message/upload/send", messageController.uploadFileSend);

module.exports = router;
