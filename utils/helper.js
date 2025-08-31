const uuid = require("uuid");
async function createUUID(join = 'Y'){
    let Uuid = uuid.v4();
    return Uuid.split("-").join(join);
}

module.exports = { createUUID };

