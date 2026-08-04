const express = require("express");

const app = express();
const PORT = 5002;

app.get("/", (req, res) => {
  res.send("Welcome to ApexFit AI Backend 🚀");
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});