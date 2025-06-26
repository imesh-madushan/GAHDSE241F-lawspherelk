// Report generation utilities

/**
 * Download case report as PDF
 * @param {string} caseId - The case ID to generate report for
 * @returns {Promise<void>}
 */
export const downloadCaseReport = async (caseId) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/reports/case/${caseId}/pdf`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to generate report");
    }

    // Get the filename from Content-Disposition header
    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = `Case_Report_${caseId}_${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    // Convert response to blob
    const blob = await response.blob();

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, filename };
  } catch (error) {
    console.error("Error downloading case report:", error);
    throw error;
  }
};

/**
 * Get report generation history for a case
 * @param {string} caseId - The case ID to get history for
 * @returns {Promise<Array>}
 */
export const getReportHistory = async (caseId) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/reports/case/${caseId}/history`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to get report history");
    }

    const data = await response.json();
    return data.reports;
  } catch (error) {
    console.error("Error getting report history:", error);
    throw error;
  }
};

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Validate if case data is sufficient for report generation
 * @param {Object} caseData - Case data object
 * @returns {Object}
 */
export const validateCaseForReport = (caseData) => {
  const warnings = [];
  const errors = [];

  if (!caseData.case_id) {
    errors.push("Case ID is missing");
  }

  if (!caseData.topic) {
    warnings.push("Case topic is not set");
  }

  if (!caseData.leader_name) {
    warnings.push("Case leader is not assigned");
  }

  if (!caseData.evidence || caseData.evidence.length === 0) {
    warnings.push("No evidence has been collected for this case");
  }

  if (!caseData.investigations || caseData.investigations.length === 0) {
    warnings.push("No investigations have been recorded for this case");
  }

  if (!caseData.offences || caseData.offences.length === 0) {
    warnings.push("No crime offences have been filed for this case");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    canGenerate: errors.length === 0,
  };
};
