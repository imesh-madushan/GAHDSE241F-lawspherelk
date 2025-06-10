const { getUserFromCookies } = require("../middlewares/authMiddleware");
const criminalService = require("../services/criminalService");
const axios = require("axios");
const formidable = require("formidable");
const FormData = require("form-data");
const fs = require("fs");
const { generateUniqueId } = require("../utils/genarateIDs");

// Configuration for file server
const FILE_SERVER_URL = "http://localhost:5001"; // Change this to your file server URL

// Get all criminals
exports.getAllCriminals = async (req, res) => {
  const filters = {};

  const token = req.cookies.authtoken;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  const user = await getUserFromCookies(token);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.query.limit) {
    filters.limit = parseInt(req.query.limit, 10);
  }

  try {
    const criminals = await criminalService.getAllCriminals(
      filters,
      user.role,
      user.id
    );

    if (criminals.length === 0) {
      console.log("No criminals found");
      return res.status(404).json({ message: "No criminals found" });
    }

    res
      .status(200)
      .json({ message: "Criminals fetched successfully", criminals });
  } catch (error) {
    console.error("Error fetching criminals:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Search criminals
exports.searchCriminals = async (req, res) => {
  try {
    const filters = {
      name: req.query.name || "",
      nic: req.query.nic || "",
      id: req.query.criminal_id || "",
      fingerprint: req.query.fingerprint || "",
    };

    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const criminals = await criminalService.searchCriminals(
      filters,
      user.role,
      user.id
    );

    if (criminals.length === 0) {
      return res
        .status(404)
        .json({ message: "No criminals found matching the search criteria" });
    }

    res
      .status(200)
      .json({ message: "Criminals fetched successfully", criminals });
  } catch (error) {
    console.error("Error in searchCriminals controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get single criminal by ID
exports.getCriminalById = async (req, res) => {
  const { id } = req.params;

  const token = req.cookies.authtoken;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  const user = await getUserFromCookies(token);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const criminalData = await criminalService.getCriminalById(
      id,
      user.role,
      user.id
    );

    if (!criminalData) {
      return res.status(404).json({ message: "Criminal not found" });
    }

    res
      .status(200)
      .json({ message: "Criminal fetched successfully", criminalData });
  } catch (error) {
    console.error("Error fetching criminal:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create new criminal record
exports.createCriminal = async (req, res) => {
  try {
    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Only OIC, Crime OIC, Inspector, Sub Inspector can create criminal records
    if (
      user.role !== "OIC" &&
      user.role !== "Crime OIC" &&
      user.role !== "Inspector" &&
      user.role !== "Sub Inspector"
    ) {
      return res
        .status(403)
        .json({
          message:
            "Forbidden: You do not have permission to create a criminal record",
        });
    }

    // Use formidable to parse form data with files - same as evidence controller
    const form = new formidable.IncomingForm({
      multiples: true,
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parsing error:", err);
        return res.status(400).json({
          success: false,
          message: "Error parsing form data",
          error: err.message,
        });
      }

      // Extract criminal data from fields (handle array format from formidable)
      const criminalData = {
        name: Array.isArray(fields.name) ? fields.name[0] : fields.name,
        nic: Array.isArray(fields.nic) ? fields.nic[0] : fields.nic,
        phone: Array.isArray(fields.phone) ? fields.phone[0] : fields.phone,
        address: Array.isArray(fields.address)
          ? fields.address[0]
          : fields.address,
        dob: Array.isArray(fields.dob) ? fields.dob[0] : fields.dob,
        fingerprint_hash: Array.isArray(fields.fingerprint_hash)
          ? fields.fingerprint_hash[0]
          : fields.fingerprint_hash,
      };

      // Validate required fields
      if (
        !criminalData.name ||
        !criminalData.nic ||
        !criminalData.dob ||
        !criminalData.phone ||
        !criminalData.address
      ) {
        return res
          .status(400)
          .json({
            message:
              "Name, NIC, Date of Birth, Phone, and Address are required",
          });
      }

      try {
        // Generate a criminal ID first to use in the file path
        const criminalId = await generateUniqueId("criminalrecord");

        // Handle profile image upload if exists - same pattern as evidence attachments
        if (files.profileImage) {
          // Handle array format - get the first file
          const file = Array.isArray(files.profileImage)
            ? files.profileImage[0]
            : files.profileImage;

          // Check if file exists and has proper properties - same validation as evidence
          if (file && file.originalFilename) {
            try {
              // Create form data for file upload to file server
              const formData = new FormData();

              // Check which property contains the file path (same as evidence controller)
              const filePath = file.filepath || file.path || file.newFilename;

              if (!filePath) {
                console.error("File path not found in uploaded file");
                return res.status(400).json({ message: "File path not found" });
              }

              // Create a readable stream from the file
              const fileStream = fs.createReadStream(filePath);

              // Append file and criminal_id to FormData - same pattern as evidence
              formData.append("file", fileStream, {
                filename: file.originalFilename || file.name || "profile.jpg",
                contentType: file.mimetype || "image/jpeg",
              });
              formData.append("evidence_id", `criminals/${criminalId}`); // Use evidence_id param like evidence does

              // Upload to file server
              const fileResponse = await axios.post(
                `${FILE_SERVER_URL}/upload`,
                formData,
                {
                  headers: {
                    ...formData.getHeaders(),
                  },
                }
              );

              if (fileResponse.data.success) {
                // Add file path to criminal data (same format as evidence attachments)
                criminalData.photo = `${FILE_SERVER_URL}${fileResponse.data.file_path}`; // Full URL path
              } else {
                console.error(
                  "Error uploading file to file server:",
                  fileResponse.data
                );
                return res.status(400).json({
                  success: false,
                  message: "Profile image upload failed",
                  error: fileResponse.data.error,
                });
              }
            } catch (error) {
              console.error("Error processing profile image:", error.message);
              return res.status(500).json({
                success: false,
                message: "File server error",
                error: error.message,
              });
            }
          } else {
            console.log(
              "No valid profile image file found or missing filename"
            );
          }
        }

        // Create criminal record in database
        const newCriminal = await criminalService.createCriminal(
          criminalData,
          user.user_id,
          criminalId
        );
        res
          .status(201)
          .json({
            message: "Criminal record created successfully",
            criminal: newCriminal,
          });
      } catch (error) {
        console.error("Error creating criminal record:", error);
        res
          .status(500)
          .json({ message: error.sqlMessage || "Internal server error" });
      }
    });
  } catch (error) {
    console.error("Error creating criminal record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update criminal record
exports.updateCriminal = async (req, res) => {
  const token = req.cookies.authtoken;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  const user = await getUserFromCookies(token);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Use formidable to handle file uploads - same as evidence and create criminal
  const form = new formidable.IncomingForm({
    multiples: true,
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024, // 50MB
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: "Error parsing form data",
        error: err.message,
      });
    }

    // Extract criminal_id (handle array format from formidable)
    const criminal_id = Array.isArray(fields.criminal_id)
      ? fields.criminal_id[0]
      : fields.criminal_id;

    if (!criminal_id) {
      return res.status(400).json({ message: "Criminal ID is required" });
    }

    // Extract and validate other fields
    const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
    const nic = Array.isArray(fields.nic) ? fields.nic[0] : fields.nic;
    const dob = Array.isArray(fields.dob) ? fields.dob[0] : fields.dob;

    if (name !== undefined && (!name || !name.trim())) {
      return res.status(400).json({ message: "Name cannot be empty" });
    }
    if (nic !== undefined && (!nic || !nic.trim())) {
      return res.status(400).json({ message: "NIC cannot be empty" });
    }
    if (dob !== undefined && (!dob || !dob.trim())) {
      return res.status(400).json({ message: "Date of Birth cannot be empty" });
    }

    // Init update data from fields
    const updateData = {
      name: Array.isArray(fields.name) ? fields.name[0] : fields.name,
      nic: Array.isArray(fields.nic) ? fields.nic[0] : fields.nic,
      phone: Array.isArray(fields.phone) ? fields.phone[0] : fields.phone,
      address: Array.isArray(fields.address)
        ? fields.address[0]
        : fields.address,
      dob: Array.isArray(fields.dob) ? fields.dob[0] : fields.dob,
      fingerprint_hash: Array.isArray(fields.fingerprint_hash)
        ? fields.fingerprint_hash[0]
        : fields.fingerprint_hash,
    };

    // Check if there's a new profile image - same pattern as evidence attachments
    if (files.profileImage) {
      // Handle array format - get the first file
      const file = Array.isArray(files.profileImage)
        ? files.profileImage[0]
        : files.profileImage;

      if (file && file.originalFilename) {
        try {
          // Create form data for file upload to file server
          const formData = new FormData();

          // Get file path (handling different property names - same as evidence)
          const filePath = file.filepath || file.path || file.newFilename;

          if (!filePath) {
            return res.status(400).json({ message: "File path not found" });
          }

          // Create readable stream from file
          const fileStream = fs.createReadStream(filePath);

          // Append file to form data with custom folder path for criminals
          formData.append("file", fileStream, {
            filename: file.originalFilename || file.name || "profile.jpg",
            contentType: file.mimetype || "image/jpeg",
          });
          formData.append("evidence_id", `criminals/${criminal_id}`); // Use evidence_id param like evidence does

          // Upload to file server
          const fileResponse = await axios.post(
            `${FILE_SERVER_URL}/upload`,
            formData,
            {
              headers: {
                ...formData.getHeaders(),
              },
            }
          );

          if (fileResponse.data.success) {
            // Add file path to update data
            updateData.photo = `${FILE_SERVER_URL}${fileResponse.data.file_path}`;
          } else {
            return res.status(400).json({
              success: false,
              message: "Profile image upload failed",
              error: fileResponse.data.error,
            });
          }
        } catch (error) {
          console.error("Profile image upload error:", error);
          return res.status(500).json({
            success: false,
            message: "File server error",
            error: error.message,
          });
        }
      }
    }

    // Only allow update if at least one field is present
    const updatableFields = [
      "name",
      "nic",
      "phone",
      "address",
      "dob",
      "fingerprint_hash",
      "photo",
    ];
    const hasUpdate = updatableFields.some((f) => updateData[f] !== undefined);
    if (!hasUpdate) {
      return res.status(400).json({ message: "No changes detected" });
    }

    try {
      const result = await criminalService.updateCriminal(
        criminal_id,
        updateData,
        user.user_id
      );

      if (!result) {
        return res.status(404).json({ message: "Criminal Data update failed" });
      }

      res
        .status(200)
        .json({
          message: "Criminal record updated successfully",
          success: result,
        });
    } catch (error) {
      console.error("Error updating criminal record:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
};
