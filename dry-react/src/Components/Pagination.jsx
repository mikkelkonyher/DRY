import React from 'react';
import PropTypes from 'prop-types';
import './Pagination.css';

function Pagination({ currentPage, totalPages, onPageChange }) {
    return (
        <div className="pagination">
            <button
                className="pagination-button"
                onClick={() => onPageChange('prev')}
                disabled={currentPage === 1}
            >
                &larr;
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
                className="pagination-button"
                onClick={() => onPageChange('next')}
                disabled={currentPage === totalPages}
            >
                &rarr;
            </button>
        </div>
    );
}

Pagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
};

export default Pagination;