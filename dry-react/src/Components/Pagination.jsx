import PropTypes from 'prop-types';
import './Pagination.css';

function Pagination({ currentPage, totalPages, onPageChange }) {
    const pageNumbers = [];

    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="pagination">
            <button
                className="pagination-button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                &larr;
            </button>
            {pageNumbers.map((number) => (
                <button
                    key={number}
                    className={`pagination-button ${currentPage === number ? 'active' : ''}`}
                    onClick={() => onPageChange(number)}
                >
                    {number}
                </button>
            ))}
            <button
                className="pagination-button"
                onClick={() => onPageChange(currentPage + 1)}
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