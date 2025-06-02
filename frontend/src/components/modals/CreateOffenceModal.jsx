import React, { useState, useEffect, useCallback } from 'react';
import { Add, Close, Send, Person, Badge, Phone, LocationOn, CalendarToday, Gavel, AccessTime, Report } from '@mui/icons-material';
import { apiClient } from '../../config/apiConfig';
import OutlinedButton from '../buttons/OutlinedButton';
import StatusPopup from '../common/StatusPopup';
import { crimeTypes } from '../../../data';
import CustomCriminalDropdown from '../dropdowns/CustomCriminalDropdown';
import CustomCaseDropdown from '../dropdowns/CustomCaseDropdown';
import CreateCriminalModal from '../modals/CreateCriminalModal';

const CreateOffenceModal = ({ open, onClose }) => {
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({
        crime_type: '',
        status: 'Alleged', // Default status is always "Alleged" for new offences
        risk_score: '',
        reported_dt: '',
        happened_dt: '',
        criminal_id: '',
        case_id: ''
    });
    const [criminals, setCriminals] = useState([]);
    const [cases, setCases] = useState([]);
    const [showCreateCriminal, setShowCreateCriminal] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [popup, setPopup] = useState({ open: false, status: "success", message: "", description: "", referenceLink: null });

    // Reset form when modal opens
    useEffect(() => {
        if (open) resetForm();
    }, [open]);

    // Fetch criminals and cases on modal open
    useEffect(() => {
        if (!open) return;

        const fetchData = async () => {
            try {
                // Fetch initial data for the dropdowns
                const [criminalsRes, casesRes] = await Promise.all([
                    apiClient.get('/criminals/search', { params: { limit: 25 } }),
                    apiClient.get('/cases/search', { params: { limit: 25 } })
                ]);

                setCriminals(criminalsRes.data?.criminals || []);
                setCases(casesRes.data?.cases || []);
            } catch (err) {
                console.error("Error fetching initial data:", err);
            }
        };

        fetchData();
    }, [open]);

    // Auto-set risk score when crime type changes
    useEffect(() => {
        if (form.crime_type) {
            const selectedCrime = crimeTypes.find(c =>
                typeof c === 'object' ? c.type === form.crime_type : c === form.crime_type
            );
            if (selectedCrime && typeof selectedCrime === 'object' && selectedCrime.points) {
                setForm(prev => ({
                    ...prev,
                    risk_score: selectedCrime.points
                }));
            }
        }
    }, [form.crime_type]);

    const resetForm = () => {
        setForm({
            crime_type: '',
            status: 'Alleged', // Always default to "Alleged"
            risk_score: '',
            reported_dt: '',
            happened_dt: '',
            criminal_id: '',
            case_id: ''
        });
        setFieldErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!form.crime_type) errors.crime_type = 'Crime type is required';
        if (!form.reported_dt) errors.reported_dt = 'Reported date/time is required';
        if (!form.happened_dt) errors.happened_dt = 'Happened date/time is required';
        if (!form.criminal_id) errors.criminal_id = 'Criminal ID is required';
        if (!form.case_id) errors.case_id = 'Case ID is required';

        // Validate date logic
        if (form.reported_dt && form.happened_dt) {
            const reportedDate = new Date(form.reported_dt);
            const happenedDate = new Date(form.happened_dt);

            if (happenedDate > reportedDate) {
                errors.happened_dt = 'Happened date cannot be after reported date';
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle criminal selection
    const handleCriminalSelect = (criminal) => {
        setForm(prev => ({
            ...prev,
            criminal_id: criminal?.criminal_id || ''
        }));
    };

    // Handle case selection
    const handleCaseSelect = (caseObj) => {
        setForm(prev => ({
            ...prev,
            case_id: caseObj?.case_id || ''
        }));
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setCreating(true);
        try {
            // Status is always 'Alleged' for new offences
            const submitData = {
                ...form,
                status: 'Alleged'
            };

            const { data } = await apiClient.post('/crimeoffences/create', submitData);
            if (data.success && data.offence?.offence_id) {
                setPopup({
                    open: true,
                    status: "success",
                    message: "Crime Offence Created Successfully",
                    description: `New Offence #${data.offence.offence_id} has been created.`,
                    referenceLink: `/crimeoffences/${data.offence.offence_id}`
                });
            } else {
                setPopup({
                    open: true,
                    status: "error",
                    message: "Creation Failed",
                    description: data.message || "Failed to create offence"
                });
            }
        } catch (error) {
            setPopup({
                open: true,
                status: "error",
                message: "Creation Failed",
                description: error.response?.data?.message || "Failed to create offence"
            });
        }
        setCreating(false);
    };

    const handleCreateNewCriminal = () => {
        setShowCreateCriminal(true);
    };

    const handlePopupClose = useCallback(() => {
        setPopup({ ...popup, open: false });
        if (popup.status === "success") {
            handleClose();
        }
    }, [popup, handleClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center py-4 px-4 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />
            <StatusPopup
                open={popup.open}
                status={popup.status}
                message={popup.message}
                description={popup.description}
                referenceLink={popup.referenceLink}
                onClose={handlePopupClose}
                okLabel={popup.status === "success" ? "OK" : "Close"}
            />
            {/* Modal */}
            {!popup.open && (
                <div className="relative bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl w-full h-fit max-w-4xl max-h-[95vh] overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Gavel className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Create Crime Offence</h2>
                                <p className="text-white/80 text-sm">Record a new criminal offence</p>
                            </div>
                        </div>
                        <button
                            className="hover:bg-white/10 rounded-full p-2 transition-colors"
                            onClick={handleClose}
                        >
                            <Close />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-[calc(95vh-140px)] overflow-y-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column - Crime Details */}
                            <div className="space-y-6">
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                                        <Report className="mr-2 text-blue-600" />
                                        Crime Information
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Crime Type <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="crime_type"
                                                value={form.crime_type}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldErrors.crime_type ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            >
                                                <option value="">Select crime type</option>
                                                {crimeTypes.map(type =>
                                                    typeof type === 'object'
                                                        ? <option key={type.type} value={type.type}>{type.type} ({type.points} pts)</option>
                                                        : <option key={type} value={type}>{type}</option>
                                                )}
                                            </select>
                                            {fieldErrors.crime_type && <p className="text-red-500 text-xs mt-1">{fieldErrors.crime_type}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Status
                                            </label>
                                            <input
                                                type="text"
                                                value="Alleged"
                                                disabled
                                                className="w-full px-4 py-3 border rounded-lg bg-gray-100 text-gray-500 border-gray-300"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">New offences are always "Alleged" by default</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Risk Score
                                            </label>
                                            <input
                                                type="number"
                                                name="risk_score"
                                                value={form.risk_score}
                                                disabled
                                                className="w-full px-4 py-3 border rounded-lg bg-gray-100 text-gray-500 border-gray-300"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Automatically set based on crime type</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                                        <AccessTime className="mr-2 text-blue-600" />
                                        Timeline Information
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <CalendarToday className="w-4 h-4 inline mr-1" />
                                                Reported Date/Time <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="datetime-local"
                                                name="reported_dt"
                                                value={form.reported_dt}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldErrors.reported_dt ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            />
                                            {fieldErrors.reported_dt && <p className="text-red-500 text-xs mt-1">{fieldErrors.reported_dt}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <CalendarToday className="w-4 h-4 inline mr-1" />
                                                Happened Date/Time <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="datetime-local"
                                                name="happened_dt"
                                                value={form.happened_dt}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldErrors.happened_dt ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            />
                                            {fieldErrors.happened_dt && <p className="text-red-500 text-xs mt-1">{fieldErrors.happened_dt}</p>}
                                            <p className="text-xs text-gray-500 mt-1">When the crime actually occurred</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Associations */}
                            <div className="space-y-6">
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                                        <Person className="mr-2 text-blue-600" />
                                        Criminal Assignment
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Criminal <span className="text-red-500">*</span>
                                            </label>
                                            <CustomCriminalDropdown
                                                criminals={criminals}
                                                selectedCriminalId={form.criminal_id}
                                                onCriminalSelect={(criminal) => setForm(prev => ({ ...prev, criminal_id: criminal.criminal_id }))}
                                                onCreateNewCriminal={handleCreateNewCriminal}
                                                className="w-full"
                                            />
                                            {fieldErrors.criminal_id && <p className="text-red-500 text-xs mt-1">{fieldErrors.criminal_id}</p>}
                                            <p className="text-xs text-gray-500 mt-1">Search by name, NIC, or ID. Click "Create New Criminal" if not found.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                                        <Badge className="mr-2 text-blue-600" />
                                        Case Assignment
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Case <span className="text-red-500">*</span>
                                            </label>
                                            <CustomCaseDropdown
                                                cases={cases}
                                                selectedCaseId={form.case_id}
                                                onCaseSelect={(caseObj) => setForm(prev => ({ ...prev, case_id: caseObj.case_id }))}
                                                className="w-full"
                                            />
                                            {fieldErrors.case_id && <p className="text-red-500 text-xs mt-1">{fieldErrors.case_id}</p>}
                                            <p className="text-xs text-gray-500 mt-1">Search by case topic or case ID to link this offence.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Summary Card */}
                                <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-4 border border-blue-200">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Summary</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Crime Type:</span>
                                            <span className="font-medium">{form.crime_type || "Not selected"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Risk Score:</span>
                                            <span className="font-medium">{form.risk_score || "0"} points</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Status:</span>
                                            <span className="font-medium text-yellow-700">Alleged</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                            <OutlinedButton
                                action={{
                                    icon: <Close fontSize="small" />,
                                    label: 'Cancel',
                                    onClick: handleClose,
                                    styles: 'border-gray-300 text-gray-700 hover:bg-gray-100 h-11 px-6',
                                }}
                            />
                            <OutlinedButton
                                action={{
                                    icon: <Send fontSize="small" />,
                                    label: creating ? 'Creating...' : 'Create Offence',
                                    ariaLabel: 'Create Offence',
                                    onClick: handleSubmit,
                                    styles: 'bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 h-11 px-6 shadow-lg',
                                    disabled: creating
                                }}
                            />
                        </div>
                    </div>

                    {/* Create Criminal Modal */}
                    <CreateCriminalModal
                        open={showCreateCriminal}
                        onClose={() => setShowCreateCriminal(false)}
                        onCriminalCreated={criminal => {
                            setShowCreateCriminal(false);
                            setForm(prev => ({
                                ...prev,
                                criminal_id: criminal.criminal_id
                            }));
                            setCriminals(prev => [criminal, ...prev]);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default CreateOffenceModal;
