const auth = require("../models/auth.model");
const bcrypt = require("bcryptjs");
const wallet = require("../models/wallet.model");
const { queue } = require("../config/queueBullMQ");
const CustomError = require("../helpers/customError");

class authService {
    registerUser = async (data) => {
        const checkEmail = await auth.checkEmail(data.email);
        if (checkEmail) throw new CustomError("Email sudah registrasi", 400);

        const checkUsername = await auth.checkUsername(data.username);
        if (checkUsername) throw new CustomError("Username sudah dipakai", 400);

        const result = await auth.create({
            name: data.name,
            username: data.username,
            email: data.email,
            password: data.password,
            level: data.level ?? "pengguna",
        });
        if (!result)
            throw new CustomError("Gagal menyimpan data pengguna", 400);

        await wallet.insert({ email: data.email, point_balance: 1000 });
        await queue.add(
            "send_email",
            { name: data.name, email: data.email },
            { delay: 1000 }
        );
        return result;
    };

    loginUser = async (data) => {
        const users = await auth.checkEmail(data.email);
        if (!users)
            throw new CustomError("Email or Password is incorrect", 400);

        const validPassword = await bcrypt.compare(
            data.password,
            users.password
        );
        if (!validPassword)
            throw new CustomError("Email or Password is incorrect", 400);

        return users;
    };

    findToken = async (id) => {
        const checkUser = await auth.findUserToken(id);
        if (!checkUser) throw new CustomError("User Not Found", 404);
        return checkUser;
    };

    updateToken = async (userId, refreshToken) => {
        const checkUser = await auth.findUserToken(userId);
        if (!checkUser) throw new CustomError("User Not Found", 404);

        const updateToken = await auth.updateUserToken(
            checkUser.user_id,
            refreshToken
        );
        if (!updateToken) throw new CustomError("Gagal Update Data", 400);
        return updateToken;
    };

    saveToken = async (user_id, token, refresh_token) => {
        const save = await auth.saveDataToken({
            user_id,
            token,
            refresh_token,
        });
        if (!save) {
            throw new CustomError("Gagal menyimpan data token", 400);
        }
        return save.rows[0];
    };

    findUserPrivate = async (data) => {
        const users = await auth.checkUserPrivate(data.user_id, data.passkey);
        if (!users) throw new CustomError("User Not Found", 404);
        return users;
    };
}

module.exports = new authService();
