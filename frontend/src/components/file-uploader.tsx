import { useState, useEffect } from "react";
import { Loader2, Download } from "lucide-react";

const FileUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [downloadFileName, setDownloadFileName] = useState<string | null>(null);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    if (isLoading) {
      setDownloadProgress(0);
      progressInterval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 3.33;
        });
      }, 100);

      const timer = setTimeout(() => {
        clearInterval(progressInterval);
        setDownloadProgress(100);
      }, 3000);

      return () => {
        clearInterval(progressInterval);
        clearTimeout(timer);
      };
    }
  }, [isLoading]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setDownloadUrl(null);
      setDownloadFileName(null);
    }
  };

  const validateResponse = (data: { downloadUrl: string | URL }) => {
    if (!data || !data.downloadUrl) {
      throw new Error("Invalid response from server");
    }

    try {
      new URL(data.downloadUrl);
    } catch {
      throw new Error("Invalid download URL received");
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const link = document.createElement("a");
    link.href = downloadUrl.toString();
    link.download = downloadFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    await new Promise((resolve) => setTimeout(resolve, 500));

    window.location.reload();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setDownloadUrl(null);
    setDownloadFileName(null);

    const formData = new FormData();
    formData.append("file", file);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const response = await fetch("http://localhost:3000/api/files/upload", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(
          `Server error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      validateResponse(data);

      setDownloadUrl(data.downloadUrl);
      setDownloadFileName(`${file.name}.zip`);
    } catch (err) {
      if (err.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        setError(err.message || "An error occurred while processing the file.");
      }
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
      setDownloadProgress(0);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError(null);
      setDownloadUrl(null);
      setDownloadFileName(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 to-black p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
          File to Zip Converter
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-gray-600 transition-all"
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
              accept="*/*"
              disabled={downloadUrl}
            />
            <label
              htmlFor="file-upload"
              className={`text-gray-700 font-semibold ${
                downloadUrl
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:text-gray-900"
              } transition-colors`}
            >
              {file ? file.name : "Choose a file"}
            </label>
            <p className="text-sm text-gray-500 mt-2">
              {file ? "File selected" : "Drag & drop or click to upload"}
            </p>
            {file && (
              <p className="text-xs text-gray-400 mt-1">
                Size: {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {isLoading && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-800 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Converting... {Math.round(downloadProgress)}%
                </p>
              </div>
            )}

            {!downloadUrl && (
              <button
                type="submit"
                disabled={isLoading || !file}
                className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  "Convert to Zip"
                )}
              </button>
            )}

            {downloadUrl && (
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Download Zip</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default FileUploader;
