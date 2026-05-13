import { supabase } from "../../client/databaseClient";
import { useEffect, useState } from "react";
import CurrentDate from "../Date.jsx";

function BorrowModal({ book, onClose, onSubmit }) {
    const [userId, setUserId] = useState('');

    const handleSubmit = () => {
        if (!userId.trim()) {
            alert('Please enter your User ID.');
            return;
        }
        onSubmit({ book, userId });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>

                <div className="modal-header">
                    <img src="/RequestToBorrow.svg" alt="Request Icon" className="modal-header-icon" />
                    <h2>REQUEST TO BORROW</h2>
                </div>

                <div className="modal-book-info">
                    <p>Title: <span>{book.title}</span></p>
                    <p>Author: <span>{book.author}</span></p>
                    <p>Status: <span>{book.status}</span></p>
                </div>

                <div className="modal-input-group">
                    <label htmlFor="user-id-input">Your User ID Number</label>
                    <div className="modal-input-wrapper">
                        <input
                            id="user-id-input"
                            type="text"
                            placeholder="e.g. 2023-0000"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                        />
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="modal-cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="modal-submit-btn" onClick={handleSubmit}>Submit Request</button>
                </div>

            </div>
        </div>
    );
}

function SearchBooks() {
    return (
        <div className="title-purpose">
            <img src="/SearchBooks.svg" alt="Library Purpose" className="library-purpose"/>
            <h2 className="library-purpose-text">SEARCH BOOKS</h2>                
            <CurrentDate />
        </div>
    );
}

function SearchBooksMain() {
    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const { data, error } = await supabase.from('books').select('*');
            if (error) throw error;
            setBooks(data);
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    };

    const handleBorrowRequest = ({ book, userId }) => {
        console.log(`User ${userId} requested to borrow "${book.title}"`);
        // TODO: insert borrow request into Supabase here
    };

    return (

        <>
            <SearchBooks />

            <div className="search-books-main">
                <div className="search-input-wrapper">
                    <img src="/MagnifyingGlass.svg" alt="Search Icon" className="search-icon" />
                    <input type="text" placeholder="Search for books..." className="search-input" />
                </div>

                <table className="search-results-table">
                    <thead id="search-books-table-header">
                        <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Location</th>
                            <th>Copies</th>
                            <th>Status</th>
                            <th>Borrow Request</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.map((book) => (
                            <tr key={book.id}>
                                <td>{book.title}</td>
                                <td>{book.author}</td>
                                <td>{book.genre}</td>
                                <td>{book.copies}</td>
                                <td>{book.status}</td>
                                <td>
                                    <button className="borrow-button" onClick={() => setSelectedBook(book)}>
                                        <img src="/RequestBorrowLogo.svg" alt="Borrow Icon" className="borrow-icon" />
                                        Request
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {selectedBook && (
                    <BorrowModal
                        book={selectedBook}
                        onClose={() => setSelectedBook(null)}
                        onSubmit={handleBorrowRequest}
                    />
                )}
            </div>
        </>
    );
}

export { BorrowModal };
export { SearchBooks };
export default SearchBooksMain;