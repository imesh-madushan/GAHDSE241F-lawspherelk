const evidenceService = require("../services/evidenceService");
const caseService = require("../services/caseService");
const { getUserFromCookies } = require("../middlewares/authMiddleware");
const axios = require("axios");
const formidable = require("formidable");
const FormData = require("form-data");
const fs = require("fs");
const db = require("../config/db");
const { generateUniqueId } = require("../utils/genarateIDs");

// Configuration for file server
const FILE_SERVER_URL = "http://localhost:5001"; // Change this to your file server URL

exports.createEvidence = async (req, res) => {
  try {
    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Use formidable to parse form data with files
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

      // Extract fields from the form data - Get the first value if it's an array
      const type = Array.isArray(fields.type) ? fields.type[0] : fields.type;
      const location = Array.isArray(fields.location)
        ? fields.location[0]
        : fields.location;
      const details = Array.isArray(fields.details)
        ? fields.details[0]
        : fields.details;
      const collected_dt = Array.isArray(fields.collected_dt)
        ? fields.collected_dt[0]
        : fields.collected_dt;
      const linking_type = Array.isArray(fields.linking_type)
        ? fields.linking_type[0]
        : fields.linking_type;
      const case_id = Array.isArray(fields.case_id)
        ? fields.case_id[0]
        : fields.case_id;
      const investigation_id = Array.isArray(fields.investigation_id)
        ? fields.investigation_id[0]
        : fields.investigation_id;
      const offence_id = Array.isArray(fields.offence_id)
        ? fields.offence_id[0]
        : fields.offence_id;

      // Parse witnesses from string if available
      let witnesses = [];
      if (fields.witnesses) {
        const witnessesData = Array.isArray(fields.witnesses)
          ? fields.witnesses[0]
          : fields.witnesses;
        try {
          witnesses = JSON.parse(witnessesData);
          if (!Array.isArray(witnesses)) {
            witnesses = [];
          }
        } catch (e) {
          console.error("Error parsing witnesses:", e);
        }
      }

      // Validate required fields
      if (!type || !details) {
        return res.status(400).json({
          success: false,
          message: "Evidence type and details are required",
          received: { type, details },
        });
      }

      // Convert ISO string to MySQL datetime format
      let collectedDateTime;
      if (collected_dt && collected_dt !== "undefined") {
        const date = new Date(collected_dt);
        collectedDateTime = date.toISOString().slice(0, 19).replace("T", " ");
      } else {
        const now = new Date();
        collectedDateTime = now.toISOString().slice(0, 19).replace("T", " ");
      }

      if (!case_id) {
        return res.status(400).json({
          success: false,
          message: "Case ID is required when linking to case",
        });
      }

      // First create the evidence record to get an evidence_id
      const evidenceId = await generateUniqueId("evidance");

      // Now process and upload attachments if any
      const processedAttachments = [];

      if (files && files.attachments) {
        // Handle both single file and multiple files
        const fileList = Array.isArray(files.attachments)
          ? files.attachments
          : [files.attachments];

        for (const file of fileList) {
          if (file && file.originalFilename) {
            try {
              // Create form data for file upload
              const formData = new FormData();
              formData.append("file", fs.createReadStream(file.filepath));
              formData.append("evidence_id", evidenceId);

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
                // Add file metadata to processed attachments
                processedAttachments.push({
                  original_name: fileResponse.data.original_name,
                  file_name: fileResponse.data.original_name,
                  file_path: `${FILE_SERVER_URL}${fileResponse.data.file_path}`, // Full URL path
                  file_type: fileResponse.data.file_type,
                  file_size: fileResponse.data.file_size,
                });
              } else {
                console.error(
                  "Error uploading file to file server:",
                  fileResponse.data
                );
              }
            } catch (error) {
              console.error("Error processing attachment:", error.message);
            }
          }
        }
      }

      try {
        const result = await evidenceService.createEvidence(
          {
            evidence_id: evidenceId,
            type,
            location,
            details,
            collectedDateTime,
            linking_type,
            case_id: case_id || null,
            investigation_id: investigation_id || null,
            offence_id: offence_id || null,
            witnesses: witnesses.filter((w) => w.nic && w.name),
            attachments: processedAttachments, // Pass processed attachments
          },
          user.user_id
        );

        if (!result) {
          return res.status(400).json({
            success: false,
            message: "Failed to create evidence",
          });
        }

        res.status(201).json({
          success: true,
          message: "Evidence created successfully",
          evidence: result,
        });
      } catch (error) {
        console.error("Error creating evidence:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error.message,
        });
      }
    });
  } catch (error) {
    console.error("Error in createEvidence:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getAllEvidence = async (req, res) => {
  try {
    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const filters = {};

    // Get pagination and sorting parameters
    if (req.query.limit) {
      filters.limit = parseInt(req.query.limit, 10);
    }
    if (req.query.offset) {
      filters.offset = parseInt(req.query.offset, 10);
    }
    if (req.query.sortBy) {
      filters.sortBy = req.query.sortBy;
    }
    if (req.query.sortOrder) {
      filters.sortOrder = req.query.sortOrder;
    }

    const evidences = await evidenceService.getAllEvidence(
      user.role,
      user.user_id,
      filters
    );

    if (evidences.length === 0) {
      return res.status(200).json({
        message: "No evidence found",
        evidences: [],
        total: 0,
      });
    }

    res.status(200).json({
      message: "Evidence fetched successfully",
      evidences,
      total: evidences[0]?.total_count || 0,
    });
  } catch (error) {
    console.error("Error fetching evidence:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch evidence",
    });
  }
};

// TODO: have to fix search and filtering
exports.searchEvidence = async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      evidence_id: req.query.evidence_id,
      location: req.query.location,
      case_id: req.query.case_id,
      investigation_id: req.query.investigation_id,
      officer_name: req.query.officer_name,
      evidence_type: req.query.evidence_type,
      linking_type: req.query.linking_type,
      offence_id: req.query.offence_id,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
    };

    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get pagination and sorting parameters
    if (req.query.limit) {
      filters.limit = parseInt(req.query.limit, 10);
    }
    if (req.query.offset) {
      filters.offset = parseInt(req.query.offset, 10);
    }
    if (req.query.sortBy) {
      filters.sortBy = req.query.sortBy;
    }
    if (req.query.sortOrder) {
      filters.sortOrder = req.query.sortOrder;
    }

    const evidences = await evidenceService.searchEvidence(
      filters,
      user.role,
      user.user_id
    );

    if (evidences.length === 0) {
      return res.status(200).json({
        message: "No evidence found matching the criteria",
        evidences: [],
        total: 0,
      });
    }

    res.status(200).json({
      message: "Search completed successfully",
      evidences,
      total: evidences[0]?.total_count || 0,
    });
  } catch (error) {
    console.error("Error searching evidence:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search evidence",
    });
  }
};

exports.getEvidenceById = async (req, res) => {
  try {
    const { id } = req.params;

    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const evidence = await evidenceService.getEvidenceById(id);

    if (!evidence) {
      return res.status(404).json({
        success: false,
        message: "Evidence not found",
      });
    }

    res.status(200).json({
      success: true,
      evidence,
    });
  } catch (error) {
    console.error("Error fetching evidence:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch evidence",
    });
  }
};

exports.updateEvidence = async (req, res) => {
  try {
    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { evidence_id, type, location, details, collected_dt } = req.body;

    if (!evidence_id) {
      return res.status(400).json({ message: "Evidence ID is required" });
    }

    // Get the officer_id (collected by) for this evidence
    const collectedByOfficerId = await evidenceService.getCollectedBy(
      evidence_id
    );

    if (!collectedByOfficerId) {
      return res.status(404).json({ message: "Evidence not found" });
    }

    // Only OIC, Crime OIC, or the officer who collected can update
    if (
      user.role !== "OIC" &&
      user.role !== "Crime OIC" &&
      user.user_id !== collectedByOfficerId
    ) {
      return res.status(403).json({
        message:
          "Forbidden: Only OIC, Crime OIC, or the officer who collected this evidence can update it",
      });
    }

    // Only send changed fields to service
    const updateFields = {};
    if (type !== undefined) updateFields.type = type;
    if (location !== undefined) updateFields.location = location;
    if (details !== undefined) updateFields.details = details;
    if (collected_dt !== undefined) updateFields.collected_dt = collected_dt;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No changes detected" });
    }

    const updatedEvidence = await evidenceService.updateEvidence(
      evidence_id,
      updateFields,
      user.user_id
    );

    if (!updatedEvidence) {
      return res.status(404).json({ message: "Evidence not found" });
    }

    res.status(200).json({
      success: true,
      message: "Evidence updated successfully",
      evidence: updatedEvidence,
    });
  } catch (error) {
    console.error("Error updating evidence:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update evidence",
    });
  }
};

// Add new endpoint for file upload
exports.uploadAttachment = async (req, res) => {
  try {
    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Use formidable to parse form data with files
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

      console.log("Parsed fields:", fields);
      console.log("Parsed files:", files);

      const evidence_id = Array.isArray(fields.evidence_id)
        ? fields.evidence_id[0]
        : fields.evidence_id;

      if (!evidence_id) {
        return res.status(400).json({
          success: false,
          message: "Evidence ID is required",
        });
      }

      // Check if evidence exists
      const evidence = await evidenceService.getEvidenceById(evidence_id);
      if (!evidence) {
        return res.status(404).json({
          success: false,
          message: "Evidence not found",
        });
      }

      // Check permissions
      const canAddAttachments =
        user.role === "OIC" ||
        user.role === "Crime OIC" ||
        user.role === "Forensic Officer" ||
        user.user_id === evidence.officer_id ||
        evidence.investigation_officers?.some(
          (o) => o.user_id === user.user_id
        );

      if (!canAddAttachments) {
        return res.status(403).json({
          success: false,
          message:
            "You don't have permission to add attachments to this evidence",
        });
      }

      // Check if file is provided
      if (!files.file) {
        return res.status(400).json({
          success: false,
          message: "No file provided",
        });
      }

      try {
        // Process the file attachments using the same pattern as createEvidence
        const processedAttachments = [];

        // Handle both single file and multiple files
        const fileList = Array.isArray(files.file) ? files.file : [files.file];

        for (const file of fileList) {
          if (file && file.originalFilename) {
            try {
              // Create form data for file upload to file server
              const formData = new FormData();

              // Check which property contains the file path (same as createEvidence)
              const filePath = file.filepath || file.path || file.newFilename;

              if (!filePath) {
                console.error("File path not found in uploaded file");
                continue;
              }

              // Create a readable stream from the file
              const fileStream = fs.createReadStream(filePath);

              // Append file and evidence_id to FormData
              formData.append("file", fileStream, {
                filename: file.originalFilename || file.name || "attachment",
                contentType: file.mimetype || "application/octet-stream",
              });
              formData.append("evidence_id", evidence_id);

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
                // Add file metadata to processed attachments (same format as createEvidence)
                processedAttachments.push({
                  original_name: fileResponse.data.original_name,
                  file_name: fileResponse.data.original_name,
                  file_path: `${FILE_SERVER_URL}${fileResponse.data.file_path}`, // Full URL path
                  file_type: fileResponse.data.file_type,
                  file_size: fileResponse.data.file_size,
                });
              } else {
                console.error(
                  "Error uploading file to file server:",
                  fileResponse.data
                );
              }
            } catch (error) {
              console.error("Error processing attachment:", error.message);
            }
          }
        }

        if (processedAttachments.length === 0) {
          return res.status(400).json({
            success: false,
            message: "No files were successfully processed",
          });
        }

        // Save attachments to database using the service (same pattern as createEvidence)
        const createdAttachments = [];
        for (const attachmentData of processedAttachments) {
          const attachment = await evidenceService.createAttachment(
            {
              evidence_id: evidence_id,
              file_name: attachmentData.file_name,
              file_path: attachmentData.file_path,
              file_type: attachmentData.file_type,
              file_size: attachmentData.file_size,
            },
            user.user_id
          );

          createdAttachments.push(attachment);
        }

        res.json({
          success: true,
          attachments: createdAttachments,
          message: `${createdAttachments.length} file(s) uploaded successfully`,
        });
      } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({
          success: false,
          message: "File server error",
          error: error.message,
        });
      }
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Add endpoint to serve files through main server (proxy to file server)
exports.getAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;

    // Get attachment details from database using service
    const attachment = await evidenceService.getAttachmentById(attachmentId);

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: "Attachment not found",
      });
    }

    // Redirect to the file URL
    return res.redirect(attachment.file_path);
  } catch (error) {
    console.error("File serving error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to serve file",
      error: error.message,
    });
  }
};
