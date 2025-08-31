const basicAuth = require("basic-auth");

function authBull(req, res, next) {
    const user = basicAuth(req);

    const USERNAME = process.env.BULLBOARD_USER || "mirza";
    const PASSWORD = process.env.BULLBOARD_PASS || "hanacankaliny03";

    if (!user || user.name !== USERNAME || user.pass !== PASSWORD) {
        res.set("WWW-Authenticate", 'Basic realm="BullBoard"');
        return res.status(401).send("Authentication required.");
    }

    next();
}

module.exports = authBull;
