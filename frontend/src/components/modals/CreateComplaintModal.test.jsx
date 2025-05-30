import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateComplaintModal from './CreateComplaintModal';

// Mock the components
vi.mock('../../buttons/OutlinedButton', () => ({
    default: ({ action }) => (
        <button onClick={action.onClick} disabled={action.disabled}>
            {action.label}
        </button>
    )
}));

vi.mock('../../common/StatusPopup', () => ({
    default: () => null
}));

vi.mock('../../../config/apiConfig', () => ({
    apiClient: { post: vi.fn() }
}));

describe('CreateComplaintModal - Form Fill Test', () => {
    it('should fill all form fields and enable submit button', async () => {
        const user = userEvent.setup();
        const mockOnClose = vi.fn();

        render(<CreateComplaintModal open={true} onClose={mockOnClose} />);

        // Fill complainer details
        await user.type(screen.getByLabelText(/NIC Number/), '123456789V');
        await user.type(screen.getByLabelText(/Full Name/), 'John Doe');
        await user.type(screen.getByLabelText(/Phone Number/), '0771234567');
        await user.type(screen.getByLabelText(/Email Address/), 'john@example.com');
        await user.type(screen.getByLabelText(/Address/), '123 Main Street, Colombo');
        await user.type(screen.getByLabelText(/Date of Birth/), '1990-01-01');

        // Fill complaint details
        await user.type(screen.getByLabelText(/Complaint Description/), 'This is my complaint description');
        await user.type(screen.getByLabelText(/Voice Statement Details/), 'This is detailed evidence information');

        // Check all fields are filled
        expect(screen.getByDisplayValue('123456789V')).toBeInTheDocument();
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('0771234567')).toBeInTheDocument();
        expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('123 Main Street, Colombo')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1990-01-01')).toBeInTheDocument();
        expect(screen.getByDisplayValue('This is my complaint description')).toBeInTheDocument();
        expect(screen.getByDisplayValue('This is detailed evidence information')).toBeInTheDocument();

        // Click submit button
        const submitButton = screen.getByText('Submit Complaint');
        await user.click(submitButton);

        // Verify submit button was clicked (component will show loading state)
        expect(screen.getByText('Submitting...')).toBeInTheDocument();
    });
});