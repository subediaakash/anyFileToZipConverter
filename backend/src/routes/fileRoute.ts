import express from "express";

const fileRouter = express.Router();

import multer from "multer";
import { uploadFile, downloadZip } from "../controllers/fileController";

const upload = multer({ dest: "uploads/" });

fileRouter.post("/upload", upload.single("file"), uploadFile);

fileRouter.get("/download/:filename", downloadZip);

export default fileRouter;
