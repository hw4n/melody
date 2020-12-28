const express = require("express");
const router = express.Router();

router.get("/stream", (req, res) => {
  if (connectedSocketIds.includes(req.query.id)) {
    const anotherOne = PassThrough();
    writables[req.query.id] = anotherOne;
    logCyan(`Added ${req.query.id} to writables`);

    res.setHeader("Content-Type", "audio/mpeg");
    return anotherOne.pipe(res);
  } else {
    return res.status(401).send("");
  }
});

router.get("/status", (req, res) => {
  res.status(200).json({
    sockets: {
      length: connectedSocketIds.length,
      array: connectedSocketIds
    },
    writables: {
      length: Object.keys(writables).length,
      keys: Object.keys(writables)
    },
  });
});

module.exports = router;
