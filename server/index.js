const express = require("express");
const app = express();
const fs = require("fs");
const PORT = 3333;

app.get("/", (req, res) => {
    return fs.createReadStream("./mp3/mirai.mp3").pipe(res);
});

app.listen(PORT, () => {
    console.log(`Server started at ${PORT}`);
});
