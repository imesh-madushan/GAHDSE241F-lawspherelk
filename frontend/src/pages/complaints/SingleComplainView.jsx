import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from "../../config/apiConfig";

const SingleComplainView = () => {
    const { complainId } = useParams();

    const [caseData, setCaseData] = useState(null);
    const [complaint, setComplaint] = useState(null);
    const [editedCase, setEditedCase] = useState(null);
    const [allOfficers, setAllOfficers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const { data } = await apiClient.get(`/complaints/${complainId}`);

                if (data.complaintData) {
                  console.log(data.complaintData);
                }
            } catch (error) {
                console.error('Error fetching case data:', error);
                setError('Failed to load case data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        if (complainId) {
            fetchData();
        }
    }, [complainId]);

    return (
        <div>
            <h1>Single complain View</h1>
            <p>This is the single case view page.</p>
        </div>
    );
}

export default SingleComplainView;