const htmlPdf = require('html-pdf-node');
const path = require('path');
const fs = require('fs');
const caseService = require('./caseService');
const { logAuditTrail } = require('./commonService');
const { generateBatchId } = require('../utils/genarateIDs');

// Generate comprehensive case report
exports.generateCaseReport = async (caseId, generatedBy) => {
  try {
    // Get complete case data
    const caseData = await caseService.getCaseById(caseId, 'OIC', generatedBy);
    
    if (!caseData) {
      throw new Error('Case not found');
    }

    // Generate HTML content for the report
    const htmlContent = await generateCaseReportHTML(caseData);
    
    // PDF generation options
    const options = {
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; margin: 0 15mm; width: 100%; display: flex; justify-content: space-between;">
          <span>Case Report - ${caseData.case_id}</span>
          <span>Generated: ${new Date().toLocaleDateString()}</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; margin: 0 15mm; width: 100%; text-align: center;">
          <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `
    };

    // Generate PDF
    const file = { content: htmlContent };
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    
    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `Case_Report_${caseData.case_id}_${timestamp}.pdf`;
    
    // Create reports directory if it doesn't exist
    const reportsDir = path.join(__dirname, '../uploads/reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Save PDF file
    const filePath = path.join(reportsDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);
    
    // Log audit trail
    const batchId = await generateBatchId();
    await logAuditTrail({
      batchId,
      changes: [{
        tableName: 'reports',
        recordId: caseId,
        fieldName: 'pdf_report_generated',
        value: fileName,
        actionType: 'INSERT',
      }],
      changedBy: generatedBy,
    });

    return {
      fileName,
      filePath,
      fileSize: pdfBuffer.length,
      buffer: pdfBuffer
    };
    
  } catch (error) {
    console.error('Error generating case report:', error);
    throw error;
  }
};

// Generate HTML content for case report
const generateCaseReportHTML = async (caseData) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return { level: 'Very High', color: '#dc2626' };
    if (score >= 60) return { level: 'High', color: '#ea580c' };
    if (score >= 40) return { level: 'Medium', color: '#d97706' };
    if (score >= 20) return { level: 'Low', color: '#16a34a' };
    return { level: 'Very Low', color: '#059669' };
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'inprogress': return '#f59e0b';
      case 'closed': return '#10b981';
      case 'completed': return '#6366f1';
      case 'convicted': return '#dc2626';
      case 'acquitted': return '#10b981';
      case 'alleged': return '#6b7280';
      default: return '#6b7280';
    }
  };

  // Calculate case statistics
  const stats = {
    totalEvidence: caseData.evidence?.length || 0,
    totalInvestigations: caseData.investigations?.length || 0,
    totalOffences: caseData.offences?.length || 0,
    totalOfficers: caseData.assignedOfficers?.length || 0,
    totalReports: caseData.reports?.length || 0,
    completedInvestigations: caseData.investigations?.filter(inv => inv.status === 'completed').length || 0,
    convictedOffences: caseData.offences?.filter(off => off.status === 'Convicted').length || 0,
    totalRiskScore: caseData.offences?.reduce((sum, off) => sum + (off.risk_score || 0), 0) || 0
  };

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Case Report - ${caseData.case_id}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: white;
        }
        
        .header {
          text-align: center;
          border-bottom: 3px solid #1f2937;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .header h1 {
          color: #1f2937;
          font-size: 28px;
          margin-bottom: 10px;
          font-weight: bold;
        }
        
        .header h2 {
          color: #4b5563;
          font-size: 18px;
          font-weight: normal;
        }
        
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        
        .section-title {
          background: #1f2937;
          color: white;
          padding: 12px 15px;
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 15px;
          border-radius: 4px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .info-item {
          display: flex;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 8px;
          margin-bottom: 8px;
        }
        
        .info-label {
          font-weight: bold;
          color: #374151;
          min-width: 120px;
          margin-right: 10px;
        }
        
        .info-value {
          color: #6b7280;
          flex: 1;
        }
        
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .status-inprogress {
          background: #fef3c7;
          color: #92400e;
        }
        
        .status-closed {
          background: #d1fae5;
          color: #065f46;
        }
        
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          background: white;
          border: 1px solid #e5e7eb;
        }
        
        .table th {
          background: #f9fafb;
          padding: 12px;
          text-align: left;
          font-weight: bold;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .table td {
          padding: 10px 12px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: top;
        }
        
        .table tr:nth-child(even) {
          background: #f9fafb;
        }
        
        .risk-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
          color: white;
        }
        
        .officer-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .complaint-section {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
          margin-bottom: 20px;
        }
        
        .no-data {
          text-align: center;
          color: #9ca3af;
          font-style: italic;
          padding: 20px;
        }
          .summary-stats {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .stat-card {
          text-align: center;
          padding: 15px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        
        .stat-number {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
        }
        
        .stat-label {
          color: #6b7280;
          font-size: 12px;
          margin-top: 5px;
        }
        
        .page-break {
          page-break-before: always;
        }
        
        .evidence-details {
          background: #f8fafc;
          padding: 10px;
          border-radius: 4px;
          margin-top: 5px;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <h1>POLICE CASE INVESTIGATION REPORT</h1>
        <h2>Case ID: ${caseData.case_id}</h2>
        <p style="margin-top: 10px; color: #6b7280;">Generated on ${formatDate(new Date())}</p>
      </div>

      <!-- Case Summary -->
      <div class="section">
        <div class="section-title">CASE SUMMARY</div>        <div class="summary-stats">
          <div class="stat-card">
            <div class="stat-number">${stats.totalEvidence}</div>
            <div class="stat-label">Evidence Items</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${stats.totalInvestigations}</div>
            <div class="stat-label">Investigations</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${stats.totalOffences}</div>
            <div class="stat-label">Crime Offences</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${stats.totalOfficers}</div>
            <div class="stat-label">Assigned Officers</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${stats.totalRiskScore}</div>
            <div class="stat-label">Total Risk Score</div>
          </div>
        </div>
      </div>      <!-- Case Information -->
      <div class="section">
        <div class="section-title">CASE INFORMATION</div>
        <div class="info-grid">
          <div>
            <div class="info-item">
              <span class="info-label">Case ID:</span>
              <span class="info-value">${caseData.case_id}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Topic:</span>
              <span class="info-value">${caseData.topic || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Case Type:</span>
              <span class="info-value">${caseData.case_type || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Status:</span>
              <span class="info-value">
                <span class="status-badge" style="background-color: ${getStatusColor(caseData.status)}; color: white;">${caseData.status}</span>
              </span>
            </div>
          </div>
          <div>
            <div class="info-item">
              <span class="info-label">Started:</span>
              <span class="info-value">${formatDate(caseData.started_dt)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Ended:</span>
              <span class="info-value">${formatDate(caseData.end_dt)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Case Leader:</span>
              <span class="info-value">${caseData.leader_name || 'N/A'} (${caseData.leader_role || 'N/A'})</span>
            </div>
            <div class="info-item">
              <span class="info-label">Complaint ID:</span>
              <span class="info-value">${caseData.complain_id || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Executive Summary -->
      <div class="section">
        <div class="section-title">EXECUTIVE SUMMARY</div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #1f2937;">
          <p style="margin-bottom: 15px; font-size: 14px; line-height: 1.8;">
            This case report provides a comprehensive overview of Case ${caseData.case_id} - "${caseData.topic || 'Untitled Case'}". 
            The case was initiated on ${formatDateOnly(caseData.started_dt)} and is currently in <strong>${caseData.status}</strong> status.
          </p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 15px 0;">
            <div>
              <h4 style="color: #374151; margin-bottom: 10px;">Investigation Progress:</h4>
              <ul style="color: #6b7280; font-size: 13px; line-height: 1.6;">
                <li>${stats.totalEvidence} pieces of evidence collected</li>
                <li>${stats.completedInvestigations} of ${stats.totalInvestigations} investigations completed</li>
                <li>${stats.convictedOffences} convictions out of ${stats.totalOffences} offences</li>
                <li>${stats.totalOfficers} officers assigned to the case</li>
              </ul>
            </div>
            
            <div>
              <h4 style="color: #374151; margin-bottom: 10px;">Risk Assessment:</h4>
              <div style="color: #6b7280; font-size: 13px; line-height: 1.6;">
                <div style="margin-bottom: 8px;">
                  Total Risk Score: <strong style="color: ${getRiskLevel(stats.totalRiskScore).color};">${stats.totalRiskScore} (${getRiskLevel(stats.totalRiskScore).level})</strong>
                </div>
                <div>Case Type: <strong>${caseData.case_type || 'N/A'}</strong></div>
                ${stats.totalOffences > 0 ? `<div style="margin-top: 5px; font-size: 12px; color: #9ca3af;">Based on ${stats.totalOffences} recorded offences</div>` : ''}
              </div>
            </div>
          </div>

          ${caseData.status === 'closed' ? `
            <div style="margin-top: 15px; padding: 10px; background: #d1fae5; border-radius: 4px; border: 1px solid #10b981;">
              <strong style="color: #065f46;">Case Closed:</strong> 
              <span style="color: #047857; font-size: 13px;">This case has been successfully closed on ${formatDateOnly(caseData.end_dt)}.</span>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Complaint Details -->
      ${caseData.complaint ? `
        <div class="section">
          <div class="section-title">ORIGINAL COMPLAINT</div>
          <div class="complaint-section">
            <div class="info-grid">
              <div>
                <div class="info-item">
                  <span class="info-label">Complaint ID:</span>
                  <span class="info-value">${caseData.complaint.complain_id}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Date Filed:</span>
                  <span class="info-value">${formatDate(caseData.complaint.complain_dt)}</span>
                </div>
              </div>
              <div>
                <div class="info-item">
                  <span class="info-label">Handling Officer:</span>
                  <span class="info-value">${caseData.complaint.officer_name || 'N/A'} (${caseData.complaint.officer_role || 'N/A'})</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Status:</span>
                  <span class="info-value">
                    <span class="status-badge status-${caseData.complaint.complaint_status}">${caseData.complaint.complaint_status}</span>
                  </span>
                </div>
              </div>
            </div>
            <div style="margin-top: 15px;">
              <div class="info-label">Description:</div>
              <div style="margin-top: 5px; padding: 10px; background: white; border-radius: 4px; border: 1px solid #e5e7eb;">
                ${caseData.complaint.description || 'No description available'}
              </div>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Assigned Officers -->
      ${caseData.assignedOfficers?.length > 0 ? `
        <div class="section">
          <div class="section-title">ASSIGNED OFFICERS</div>
          <table class="table">
            <thead>
              <tr>
                <th>Officer ID</th>
                <th>Name</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              ${caseData.assignedOfficers.map(officer => `
                <tr>
                  <td>${officer.user_id}</td>
                  <td>${officer.name}</td>
                  <td>${officer.role}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      <!-- Evidence -->
      ${caseData.evidence?.length > 0 ? `
        <div class="section page-break">
          <div class="section-title">EVIDENCE COLLECTED</div>
          <table class="table">
            <thead>
              <tr>
                <th>Evidence ID</th>
                <th>Type</th>
                <th>Location</th>
                <th>Collected By</th>
                <th>Collection Date</th>
              </tr>
            </thead>
            <tbody>
              ${caseData.evidence.map(evidence => `
                <tr>
                  <td>${evidence.evidence_id}</td>
                  <td>${evidence.type}</td>
                  <td>${evidence.location || 'N/A'}</td>
                  <td>${evidence.collected_by || 'N/A'}</td>
                  <td>${formatDate(evidence.collected_dt)}</td>
                </tr>
                ${evidence.details ? `
                  <tr>
                    <td colspan="5">
                      <div class="evidence-details">
                        <strong>Details:</strong> ${evidence.details}
                      </div>
                    </td>
                  </tr>
                ` : ''}
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : `
        <div class="section">
          <div class="section-title">EVIDENCE COLLECTED</div>
          <div class="no-data">No evidence recorded for this case</div>
        </div>
      `}

      <!-- Investigations -->
      ${caseData.investigations?.length > 0 ? `
        <div class="section">
          <div class="section-title">INVESTIGATIONS</div>
          <table class="table">
            <thead>
              <tr>
                <th>Investigation ID</th>
                <th>Topic</th>
                <th>Location</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${caseData.investigations.map(investigation => `
                <tr>
                  <td>${investigation.investigation_id}</td>
                  <td>${investigation.topic}</td>
                  <td>${investigation.location || 'N/A'}</td>
                  <td>${formatDate(investigation.start_dt)}</td>
                  <td>${formatDate(investigation.end_dt)}</td>
                  <td>
                    <span class="status-badge status-${investigation.status}">${investigation.status}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : `
        <div class="section">
          <div class="section-title">INVESTIGATIONS</div>
          <div class="no-data">No investigations recorded for this case</div>
        </div>
      `}

      <!-- Crime Offences -->
      ${caseData.offences?.length > 0 ? `
        <div class="section page-break">
          <div class="section-title">CRIME OFFENCES</div>
          <table class="table">
            <thead>
              <tr>
                <th>Offence ID</th>
                <th>Crime Type</th>
                <th>Criminal</th>
                <th>Status</th>
                <th>Risk Score</th>
                <th>Reported Date</th>
                <th>Incident Date</th>
              </tr>
            </thead>
            <tbody>
              ${caseData.offences.map(offence => {
                const risk = getRiskLevel(offence.risk_score || 0);
                return `
                  <tr>
                    <td>${offence.offence_id}</td>
                    <td>${offence.crime_type || 'N/A'}</td>
                    <td>
                      ${offence.criminal_name ? `
                        <strong>${offence.criminal_name}</strong><br>
                        <small>NIC: ${offence.criminal_nic || 'N/A'}</small><br>
                        <small>Total Crimes: ${offence.total_crimes || 0}</small><br>
                        <small>Total Risk: ${offence.total_risk || 0}</small>
                      ` : 'N/A'}
                    </td>
                    <td>
                      <span class="status-badge status-${offence.status?.toLowerCase()}">${offence.status || 'N/A'}</span>
                    </td>
                    <td>
                      <span class="risk-badge" style="background-color: ${risk.color}">
                        ${offence.risk_score || 0} (${risk.level})
                      </span>
                    </td>
                    <td>${formatDate(offence.reported_dt)}</td>
                    <td>${formatDate(offence.happened_dt)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      ` : `
        <div class="section">
          <div class="section-title">CRIME OFFENCES</div>
          <div class="no-data">No crime offences recorded for this case</div>
        </div>
      `}

      <!-- Reports -->
      ${caseData.reports?.length > 0 ? `
        <div class="section">
          <div class="section-title">CASE REPORTS</div>
          <table class="table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Type</th>
                <th>Created By</th>
                <th>Created Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${caseData.reports.map(report => `
                <tr>
                  <td>${report.report_id}</td>
                  <td>${report.report_type}</td>
                  <td>${report.created_by || 'N/A'} (${report.officer_role || 'N/A'})</td>
                  <td>${formatDate(report.created_dt)}</td>
                  <td>
                    <span class="status-badge status-${report.status}">${report.status}</span>
                  </td>
                </tr>
                ${report.content ? `
                  <tr>
                    <td colspan="5">
                      <div class="evidence-details">
                        <strong>Content:</strong> ${report.content}
                        ${report.remarks ? `<br><strong>Remarks:</strong> ${report.remarks}` : ''}
                      </div>
                    </td>
                  </tr>
                ` : ''}
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : `
        <div class="section">
          <div class="section-title">CASE REPORTS</div>
          <div class="no-data">No reports generated for this case</div>
        </div>
      `}

      <!-- Footer -->
      <div class="section" style="margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px;">
        <hr style="margin-bottom: 20px; border: none; border-top: 1px solid #e5e7eb;">
        <p>This report was automatically generated by the LawSphere Case Management System</p>
        <p>Generated on ${formatDate(new Date())} | Case ID: ${caseData.case_id}</p>
        <p style="margin-top: 10px; font-style: italic;">
          This document contains confidential information and is intended for official use only.
        </p>
      </div>
    </body>
    </html>
  `;

  return html;
};
