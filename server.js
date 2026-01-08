const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const rooms = {};

io.on("connection", socket => {
  console.log("Connected:", socket.id);

  socket.on("joinRoom", ({ roomId, name }) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = { players: [] };
    }

    if (rooms[roomId].players.length >= 8) return;

    rooms[roomId].players.push({
      id: socket.id,
      name,
      role: "Player",
      alive: true
    });

    io.to(roomId).emit("players", rooms[roomId].players);
  });

  socket.on("startGame", roomId => {
    const room = rooms[roomId];
    if (!room || room.players.length < 5) return;

    // Assign impostors
    const shuffled = [...room.players].sort(() => Math.random() - 0.5);
    shuffled.slice(0, 2).forEach(p => p.role = "Impostor");

    // Categories
    const categories = {
      Person: ["Doctor","Teacher","Singer"],
      Food: ["Pizza","Burger","Sushi"],
      Place: ["Beach","School","Mall"],
      Thing: ["Phone","Laptop","Watch"]
    };

    const catKeys = Object.keys(categories);
    const category = catKeys[Math.floor(Math.random()*catKeys.length)];
    const word = categories[category][Math.floor(Math.random()*categories[category].length)];

    room.players.forEach(p => {
      io.to(p.id).emit("role", {
        role: p.role,
        category,
        word: p.role === "Impostor" ? null : word
      });
    });
  });

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      rooms[roomId].players =
        rooms[roomId].players.filter(p => p.id !== socket.id);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
 () => {
  console.log("Server running at http://localhost:3000");
}
