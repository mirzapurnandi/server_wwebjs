const { Queue } = require("bullmq");
const queue = new Queue("Defaults", {
    connection: {
        host: "localhost",
        port: 6379,
    },
});

const queuePoint = new Queue("PointBalance", {
    connection: {
        host: "localhost",
        port: 6379,
    },
});

const queueSendMessage = new Queue("SendMessage", {
    connection: {
        host: "localhost",
        port: 6379,
    },
});

const queueInitSender = new Queue("InitSender", {
    connection: {
        host: "localhost",
        port: 6379,
    },
});

const queueWebhook = new Queue("Webhook", {
    connection: {
        host: "localhost",
        port: 6379,
    },
});

module.exports = {
    queue,
    queuePoint,
    queueSendMessage,
    queueInitSender,
    queueWebhook,
};
