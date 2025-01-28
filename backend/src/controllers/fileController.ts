import { Request, Response } from "express";

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
  const { fileName } = req.params;
  const filePath = `${__dirname}/../../zips/${fileName}`;
  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  });
};
