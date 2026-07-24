const bcrypt = require("bcryptjs");

async function hash() {
    const hashed = await bcrypt.hash("123", 10);
    console.log(hashed);
}

hash();