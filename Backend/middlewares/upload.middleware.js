import multer from "multer";

// Configure multer to use RAM instead of disk
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit size to 10MB to prevent memory exhaustion
  },
  fileFilter: (req, file, cb) => {
    // Only accept excel or csv mimetypes
    if (
      file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || // .xlsx
      file.mimetype === "application/vnd.ms-excel" || // .xls
      file.mimetype === "text/csv" // .csv
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only Excel (.xlsx) and CSV files are allowed."), false);
    }
  },
});
