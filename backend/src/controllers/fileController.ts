import { Request, Response } from "express";
import path from "path";
import fs from "fs";

import { createZip } from "../services/createZip";

export const uploadFile = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      res.status(400).send("Please upload a file!");
      return;
    }

    const zipFilePath = await createZip(file);
    const downloadUrl = `http://localhost:3000/api/files/download/${zipFilePath}`;

    res.status(200).json({ downloadUrl });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export const downloadZip = (req: Request, res: Response) => {
  const { filename } = req.params;

  const decodedFilename = decodeURIComponent(filename);

  const filePath = path.resolve(__dirname, "../../zips", decodedFilename);

  console.log("Requested Filename:", decodedFilename);
  console.log("Resolved File Path:", filePath);

  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    res.status(404).json({ message: "File not found" });
    return;
  }

  res.download(filePath, decodedFilename, (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      res.status(500).json({ message: "Error downloading file" });
    }
  });
};
