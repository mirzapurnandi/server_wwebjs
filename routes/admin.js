const express = require("express");
const router = express.Router();

const userController = require("../controllers/admin/user.controller");
const providerController = require("../controllers/admin/provider.controller");
const providerDetailController = require("../controllers/admin/providerDetail.controller");
const walletController = require("../controllers/admin/wallet.controller");
const routingController = require("../controllers/admin/routing.controller");
const messageController = require("../controllers/admin/message.controller");

router.get("/user", userController.getAll);
router.post("/user-private", userController.upsertPrivateUser);

router.get("/provider", providerController.getAll);
router.get("/provider/:id", providerController.getById);
router.post("/provider", providerController.insertData);
router.put("/provider/:id", providerController.updateData);
router.delete("/provider/:id", providerController.deleteData);

router.get("/provider-detail/:provider_id", providerDetailController.getAll);
router.post("/provider-detail", providerDetailController.insertData);
router.put("/provider-detail/:id", providerDetailController.updateData);
router.delete("/provider-detail", providerDetailController.deleteData);
router.post(
    "/provider-detail-refresh",
    providerDetailController.refreshInstance
);
router.post("/provider-detail-status", providerDetailController.getStatus);
router.post("/provider-detail-qr", providerDetailController.getQR);
router.post(
    "/provider-detail-screenshot",
    providerDetailController.getScreenshoot
);
router.post(
    "/provider-detail/redeploy",
    providerDetailController.redeployInstance
);

router.get("/routing", routingController.getAll);
router.get("/routing/:id", routingController.getById);
router.post("/routing/create", routingController.createRouting);
router.post("/routing/add-engine", routingController.addEngine);
router.delete("/routing/delete-engine/:id", routingController.deleteEngine);

router.post("/message/send", messageController.sendMessage);

router.post("/wallet/push", walletController.push);
router.post("/wallet/pull", walletController.pull);

module.exports = router;
