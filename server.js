const express = require("express");
const mysql = require("mysql");
const BodyParser = require("body-parser");
const app = express();

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(BodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", "views");

const db = mysql.createConnection({
  host: "localhost",
  database: "db_kuliah",
  user: "root",
  password: "",
});

db.connect((err) => {
  if (err) throw err;
  console.log("database connected...");

  // untuk get data
  app.get("/", (req, res) => {
    const sql = "SELECT * FROM mahasiswa";
    db.query(sql, (err, result) => {
      const users = JSON.parse(JSON.stringify(result));
      //   console.log("hasil database ->", users);
      res.render("index", { users: users, title: "Daftar Mahasiswa" });
    });
  });

  //   mengarahkan ke file chat
  app.get("/chat", (req, res) => {
    res.render("chat", {
      loginTitle: "Masuk Forum 📩",
      chatroomTitle: "Diskusi Terbuka Mahasiswa 📌",
    });
  });

  // untuk insert data
  app.post("/tambah", (req, res) => {
    const insertSql = `INSERT INTO mahasiswa (nama, jurusan) VALUES ('${req.body.nama}', '${req.body.jurusan}');`;
    db.query(insertSql, (err, result) => {
      if (err) throw err;
      res.redirect("/");
    });
  });
});

io.on("connection", (socket) => {
  socket.on("message", (data) => {
    const { id, message } = data;
    // console.log("data => ", data);
    socket.broadcast.emit("message", id, message);
  });
});

server.listen(8000, () => {
  console.log("server ready...");
});
