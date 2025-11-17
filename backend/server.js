import express from "express";
import connectDb from "./connectDb.js";

const app = express();

app.use(express.json());

const startServer = async () => {
  try {
    await connectDb();

    app.listen(process.env.BACKEND_PORT, () => {
      console.log(
        `Matruva backend running on port ${process.env.BACKEND_PORT}`
      );
    });
  } catch (error) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();
