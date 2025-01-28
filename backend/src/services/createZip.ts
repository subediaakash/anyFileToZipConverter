import fs from "fs";
import path from "path";
import archiver from "archiver";

export const createZip = async (file: Express.Multer.File): Promise<string> => {
  const zipFileName = `${file.originalname}.zip`;
  const zipFilePath = path.join(__dirname, "../../zips", zipFileName);
  const output = fs.createWriteStream(zipFilePath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on("close", () => {
      resolve(zipFileName);
    });

    archive.on("error", (err) => {
      reject(err);
    });

    archive.pipe(output);
    archive.append(fs.createReadStream(file.path), { name: file.originalname });
    archive.finalize();
  });
};
