import React from "react";
import { format } from "date-fns";

// Utility function to export audit logs as CSV
export const exportAuditLogsToCSV = (auditLogs) => {
  if (!auditLogs || auditLogs.length === 0) {
    console.error("No audit logs to export");
    return;
  }

  // Format date for filename
  const dateStr = format(new Date(), "yyyy-MM-dd_HH-mm");
  const filename = `audit_logs_${dateStr}.csv`;

  // Create CSV header
  const headers = [
    "Batch ID",
    "Table",
    "Record ID",
    "Field",
    "Action",
    "Value",
    "Changed By",
    "User Role",
    "Timestamp",
  ];

  // Create CSV rows
  const rows = [];
  auditLogs.forEach((batch) => {
    batch.logs.forEach((log) => {
      rows.push([
        batch.batchId,
        log.tableName,
        log.recordId,
        log.fieldName,
        log.actionType,
        // Wrap values with quotes to handle commas in content
        `"${log.value || ""}"`,
        batch.userName || "Unknown",
        batch.userRole || "Unknown",
        format(new Date(log.changedAt), "yyyy-MM-dd HH:mm:ss"),
      ]);
    });
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  // Create download link
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export for batch details
export const exportBatchDetailsToCSV = (batch) => {
  if (!batch || !batch.logs || batch.logs.length === 0) {
    console.error("No batch details to export");
    return;
  }

  // Format date for filename
  const dateStr = format(new Date(), "yyyy-MM-dd_HH-mm");
  const filename = `audit_batch_${batch.batchId}_${dateStr}.csv`;

  // Create CSV header
  const headers = [
    "Audit ID",
    "Table",
    "Record ID",
    "Field",
    "Action",
    "Value",
    "Timestamp",
  ];

  // Create CSV rows
  const rows = batch.logs.map((log) => [
    log.auditId,
    log.tableName,
    log.recordId,
    log.fieldName,
    log.actionType,
    // Wrap values with quotes to handle commas in content
    `"${log.value || ""}"`,
    format(new Date(log.changedAt), "yyyy-MM-dd HH:mm:ss"),
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  // Create download link
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
