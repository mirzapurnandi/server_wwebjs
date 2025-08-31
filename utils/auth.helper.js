const authService = require("../services/auth.service");

const verifyUserPrivate = async (userID, passkey) => {
    const result = await authService.findUserPrivate({
        user_id: userID,
        passkey: passkey,
    });
    return result;
};

module.exports = {
    verifyUserPrivate,
};
