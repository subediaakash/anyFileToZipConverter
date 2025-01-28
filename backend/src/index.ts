import express from "express";
import cors from "cors";
import fileRouter from "./routes/fileRoute";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/files", fileRouter);

app.listen(3000, () => {
  console.log(`Server is running on port 3000`);
});
