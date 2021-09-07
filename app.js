const express = require("express");
const app = express();
app.use(express.json());
const {
  models: { User, Note },
} = require("./db");
const path = require("path");
const jwt = require("jsonwebtoken");

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.get("/api/users/:userId/notes", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const _data = await User.byToken(req.headers.authorization)
    const data = await Note.findAll({
      where: {
        userId: userId,
      },
      incude: User,
    });
    res.send(data);
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth", async (req, res, next) => {
  try {
    res.send({ token: await User.authenticate(req.body) });
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/auth", async (req, res, next) => {
  try {
    res.send(await User.byToken(req.headers.authorization));
  } catch (ex) {
    next(ex);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});

module.exports = app;
