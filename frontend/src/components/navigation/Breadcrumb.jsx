import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from '@mui/icons-material'; // Using MUI icons

const Breadcrumb = ({ items }) => {
    return (
        <div className="flex items-center text-gray-600 text-sm mb-2">
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && <ChevronRight fontSize="small" className="mx-1 text-gray-400" />}
                    {item.link ? (
                        <Link
                            to={item.link}
                            className="hover:text-blue-600 transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-blue-600">{item.label}</span>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default Breadcrumb;
