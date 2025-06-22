const db = require("../config/db");
const { getUserFromCookies } = require("../middlewares/authMiddleware");
const officerService = require("../services/officerService");
const formidable = require("formidable");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

// Configuration for file server
const FILE_SERVER_URL = "http://localhost:5001";

exports.getAll = async (req, res) => {
  const token = req.cookies.authtoken;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  const user = await getUserFromCookies(token);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const roles = req.body.roles || [];
    const officers = await officerService.getAllOfficers(
      roles,
      user.role,
      user.user_id
    );

    if (!officers || officers.length === 0) {
      return res.status(404).json({ message: "No officers found" });
    }

    res.status(200).json({ officers: officers });
  } catch (error) {
    console.error("Error in getAll officers:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch officers", error: error.message });
  }
};

exports.searchOfficers = async (req, res) => {
  const filters = {
    role: req.body.role || null,
    name: req.body.name || null,
    id: req.body.id || null,
    nic: req.body.nic || null,
    phone: req.body.phone || null,
    email: req.body.email || null,
    page: req.body.page || 1,
    pageSize: req.body.pageSize || 12,
    dropIds: req.body.dropIds || [],
    dropRoles: req.body.dropRoles || [],
    extraIds: req.body.extraIds || [],
  };

  const token = req.cookies.authtoken;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  const user = await getUserFromCookies(token);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const officers = await officerService.searchOfficers(
      filters,
      user.role,
      user.user_id
    );
    res.status(200).json(officers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to search officers", error: error.message });
  }
};

exports.getOfficerById = async (req, res) => {
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

    const officerData = await officerService.getOfficerById(id);

    if (!officerData) {
      return res.status(404).json({
        success: false,
        message: "Officer not found",
      });
    }

    res.status(200).json({
      success: true,
      officerData,
    });
  } catch (error) {
    console.error("Error in getOfficerById:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving officer details",
      error: error.message,
    });
  }
};

exports.toggleOfficerAccount = async (req, res) => {
  try {
    const { officerId } = req.body;
    const token = req.cookies.authtoken;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);

    if (!user || user.role !== "OIC") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only OIC can perform this action" });
    }

    if (!officerId) {
      return res.status(400).json({ message: "Officer ID is required" });
    }

    if (user.user_id === officerId) {
      return res
        .status(400)
        .json({ message: "You cannot toggle your own account status" });
    }

    const result = await officerService.toggleOfficerAccount(
      officerId,
      user.user_id
    );

    if (!result) {
      return res.status(404).json({ message: "Officer not found" });
    }

    res.status(200).json({ success: true, message: "Account status toggled" });
  } catch (error) {
    console.error("Error in toggleOfficerAccount:", error);
    res.status(500).json({
      message: "Failed to toggle account status",
      error: error.message,
    });
  }
};

exports.updateOfficer = async (req, res) => {
  const token = req.cookies.authtoken;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  const user = await getUserFromCookies(token);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Only OIC can update officer details
  if (user.role !== "OIC") {
    return res
      .status(403)
      .json({ message: "Forbidden: Only OIC can update officer details" });
  }

  // Accept all updatable officer fields
  const { officerId, name, nic, phone, email, address, role, profile_pic } =
    req.body;

  if (!officerId) {
    return res.status(400).json({ message: "Officer ID is required" });
  }

  // Only send changed fields to service
  const updateFields = {};
  if (name !== undefined) updateFields.name = name;
  if (nic !== undefined) updateFields.nic = nic;
  if (phone !== undefined) updateFields.phone = phone;
  if (email !== undefined) updateFields.email = email;
  if (address !== undefined) updateFields.address = address;
  if (role !== undefined) updateFields.role = role;
  if (profile_pic !== undefined) updateFields.profile_pic = profile_pic;

  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ message: "No changes detected" });
  }

  try {
    const updatedOfficer = await officerService.updateOfficer(
      officerId,
      updateFields,
      user.user_id // pass OIC user id for audit
    );
    if (!updatedOfficer) {
      return res.status(404).json({ message: "Officer not found" });
    }
    res.status(200).json({
      success: true,
      message: "Officer updated successfully",
      officer: updatedOfficer,
    });
  } catch (error) {
    console.error("Error updating officer:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.createOfficer = async (req, res) => {
  try {
    const token = req.cookies.authtoken;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await getUserFromCookies(token);
    if (!user || user.role !== "OIC") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only OIC can create officers" });
    }

    // Use formidable to parse form data with files
    const form = new formidable.IncomingForm({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
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

      // Extract fields - Get the first value if it's an array
      const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
      const nic = Array.isArray(fields.nic) ? fields.nic[0] : fields.nic;
      const phone = Array.isArray(fields.phone)
        ? fields.phone[0]
        : fields.phone;
      const email = Array.isArray(fields.email)
        ? fields.email[0]
        : fields.email;
      const address = Array.isArray(fields.address)
        ? fields.address[0]
        : fields.address;
      const role = Array.isArray(fields.role) ? fields.role[0] : fields.role;
      const username = Array.isArray(fields.username)
        ? fields.username[0]
        : fields.username;
      const password = Array.isArray(fields.password)
        ? fields.password[0]
        : fields.password;

      // Validate required fields
      if (
        !name ||
        !nic ||
        !phone ||
        !email ||
        !address ||
        !role ||
        !username ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      try {
        // Handle profile picture upload if provided (same pattern as evidence)
        let profilePicUrl = null;
        if (files.profile_pic) {
          const file = files.profile_pic;

          // Check which property contains the file path (same as createEvidence)
          const filePath = file.filepath || file.path || file.newFilename;

          if (filePath && file.originalFilename) {
            try {
              // Create form data for file upload to file server (same pattern as evidence)
              const formData = new FormData();

              // Create a readable stream from the file
              const fileStream = fs.createReadStream(filePath);

              formData.append("file", fileStream, {
                filename: file.originalFilename || file.name || "profile.jpg",
                contentType: file.mimetype || "image/jpeg",
              });
              formData.append("folder", "users"); // Specify users folder

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
                profilePicUrl = `${FILE_SERVER_URL}${fileResponse.data.file_path}`;
                console.log(
                  "Profile picture uploaded successfully:",
                  profilePicUrl
                );
              } else {
                console.error(
                  "Error uploading profile picture:",
                  fileResponse.data
                );
              }
            } catch (fileError) {
              console.error(
                "Error uploading profile picture:",
                fileError.message
              );
              // Continue without profile picture if upload fails
            }
          } else {
            console.warn("File path or filename not found in uploaded file");
          }
        }

        // Create officer using service
        const result = await officerService.createOfficer(
          {
            name: name.trim(),
            nic: nic.trim(),
            phone: phone.trim(),
            email: email.trim(),
            address: address.trim(),
            role,
            username: username.trim(),
            password: password.trim(),
            profile_pic: profilePicUrl,
          },
          user.user_id
        );

        if (!result) {
          return res.status(400).json({
            success: false,
            message: "Failed to create officer",
          });
        }

        res.status(201).json({
          success: true,
          message: "Officer created successfully",
          officer: result,
        });
      } catch (error) {
        console.error("Error creating officer:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error.message,
        });
      }
    });
  } catch (error) {
    console.error("Error in createOfficer:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
