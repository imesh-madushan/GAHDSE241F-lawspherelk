// onlineComplaintService.js

// For now, just log the data to check if it's coming to the backend
exports.createOnlineComplaint = async (description, complainer, evidence_details, complain_type) => {
    console.log('[TEST] Service received:', { description, complainer, evidence_details, complain_type });
    // Return a dummy response for testing
    return { test: true, received: { description, complainer, evidence_details, complain_type } };
};