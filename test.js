const bcrypt = require("bcrypt");

const hash = "$2b$10$X3oGANIIhcsoLyZ9AvN58umbrKChy.mLaqiXjXsOstS8D4rK5sMmC";

async function run() {
  const result = await bcrypt.compare("123456", hash);
  console.log("MATCH:", result);
}

run();