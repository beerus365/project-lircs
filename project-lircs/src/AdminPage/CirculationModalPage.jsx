import { useState, useEffect } from "react"
import { supabase } from '../../client/databaseClient';

function CheckHistoryModal({ record, onClose }) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [unpaidFines, setUnpaidFines] = useState(0);
  const [totalBorrowed, setTotalBorrowed] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = record?.user_id;
  const user = record?.user;

  const fullName = [user?.first_name, user?.middle_name, user?.last_name]
    .filter(Boolean).join(' ');

  const designation = user?.user_type === 'Student'
    ? `Grade ${user?.students?.grade_level} - ${user?.students?.section}`
    : user?.teachers?.department;

  useEffect(() => {
    if (!userId) return;

    const fetchUserHistory = async () => {
      setLoading(true);

      const { data: allRecords, error: recordsError } = await supabase
        .from('borrowers_record')
        .select(`
          *,
          books(title)
        `)
        .eq('user_id', userId)
        .order('request_date', { ascending: false });

      if (recordsError) {
        console.error('Error fetching borrow history:', recordsError);
      } else {
        setTotalBorrowed(allRecords.length);
        setRecentTransactions(allRecords.slice(0, 10)); 
      }

      const { data: finesData, error: finesError } = await supabase
        .from('fines')
        .select('amount')
        .eq('user_id', userId)
        .eq('status', 'Paid');

      if (finesError) {
        console.error('Error fetching fines:', finesError);
      } else {
        const total = finesData?.reduce((sum, fine) => sum + (fine.amount || 0), 0);
        setUnpaidFines(total);
      }

      setLoading(false);
    };

    fetchUserHistory();
  }, [userId]);

  if (showCheckout) {
    return <ProceedCheckoutModal record={record} onClose={onClose} onBack={() => setShowCheckout(false)} />;
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="circulation-modal-container">
        <div className="circulation-modal-header">
          <h3>BOOK BORROWER INFORMATION</h3>
          <p>REVIEWING STUDENT'S ACCOUNT BEFORE APPROVAL</p>
        </div>

        <div className="circulation-modal-profile">
          <img src="./ProfilePic.svg" className="circulation-modal-profile-pic" alt="Profile" />
          <span className="circulation-profile-info">
            <h4>{fullName || '—'}</h4>
            <p>{designation} | ID: {userId}</p>
          </span>
        </div>

        <div className="circulation-modal-cards-container">
          <div className="circulation-modal-cards">
            <h1 className='circulation-total-fines'>
              {loading ? '...' : `₱${unpaidFines.toFixed(2)}`}
            </h1>
            <p>UNPAID FINES</p>
          </div>
          <div className="circulation-modal-cards">
            <h1 className='circulation-total-borrow'>
              {loading ? '...' : totalBorrowed}
            </h1>
            <p>BOOKS BORROWED</p>
          </div>
        </div>

        <h4 className="recent-transactions">RECENT TRANSACTIONS</h4>
        <table className="circulation-modal-table-container">
          <thead>
            <tr>
              <th>DATE</th>
              <th>BOOK TITLE</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3">Loading...</td></tr>
            ) : recentTransactions.length === 0 ? (
              <tr><td colSpan="3">No transaction history.</td></tr>
            ) : (
              recentTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.request_date}</td>
                  <td>{tx.books?.title || '—'}</td>
                  <td>{tx.borrow_status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <span className="circulation-modal-buttons">
          <button onClick={onClose}>Cancel</button>
          <button onClick={() => setShowCheckout(true)}>Proceed to Approve →</button>
        </span>
      </div>
    </div>
  );
}

export function ProceedCheckoutModal({ record, onClose, onBack, onDueDateConfirmed }) {
    const [borrowingPeriod, setBorrowingPeriod] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [customDate, setCustomDate] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const getDueDate = (days) => {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const getActualDueDate = () => {
        if (borrowingPeriod === 'custom' && customDate) return customDate;
        if (borrowingPeriod) {
            const date = new Date();
            date.setDate(date.getDate() + borrowingPeriod);
            return date;
        }
        return null;
    };

    const getDisplayDate = () => {
        if (borrowingPeriod === 'custom' && customDate)
            return customDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        if (borrowingPeriod) return getDueDate(borrowingPeriod);
        return null;
    };

    const handleConfirm = async () => {
        if (!borrowingPeriod) {
            alert('Please select a borrowing period first.');
            return;
        }

        const dueDate = getActualDueDate();

        // If called from SearchBookModal, just pass the date back — don't update DB
        if (onDueDateConfirmed) {
            onDueDateConfirmed({
                date: dueDate,
                formatted: dueDate.toISOString().split('T')[0],
                display: getDisplayDate(),
            });
            return;
        }

        // Original flow — update existing record in DB
        await updateBorrow();
    };

    const updateBorrow = async () => {
        const dueDate = getActualDueDate();
        if (!dueDate) { alert('Due date is missing.'); return; }

        const formattedDueDate = dueDate.toISOString().split('T')[0];
        const formattedBorrowDate = new Date().toISOString().split('T')[0];

        const { error } = await supabase
            .from('borrowers_record')
            .update({
                borrow_status: 'Approved',
                borrow_date: formattedBorrowDate,
                due_date: formattedDueDate,
            })
            .eq('borrowers_id', record?.borrowers_id)
            .select();

        if (error) {
            console.error('Supabase error:', error);
            alert('Failed to approve. Please try again.');
        } else {
            setShowSuccess(true);
        }
    };

    if (showSuccess) {
        return <SuccessfulBookBorrowModal onClose={onClose} />;
    }

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="circulation-modal-container">
                <span className="proceed-checkout-modal-header">
                    <h3>SET DUE DATE</h3>
                </span>
                <span className="circulation-approve-message-container">
                    <span className="approve-message">
                        <p>Setting due date for <strong>{record?.books?.title}</strong></p>
                    </span>
                </span>
                <div className="circulation-borrowing-period-container">
                    <h3>BORROWING PERIOD</h3>
                    <span className="borrowing-period-buttons">
                        <button className={borrowingPeriod === 5 ? 'active' : ''} onClick={() => { setBorrowingPeriod(5); setShowCalendar(false); setCustomDate(null); }}>5 Days</button>
                        <button className={borrowingPeriod === 7 ? 'active' : ''} onClick={() => { setBorrowingPeriod(7); setShowCalendar(false); setCustomDate(null); }}>7 Days</button>
                        <button className={borrowingPeriod === 'custom' ? 'active' : ''} onClick={() => { setBorrowingPeriod('custom'); setShowCalendar(!showCalendar); }}>+ Custom</button>
                        {showCalendar && (
                            <input className="custom-calendar" type="date"
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => { setCustomDate(new Date(e.target.value)); setBorrowingPeriod('custom'); setShowCalendar(false); }}
                            />
                        )}
                    </span>
                    <h3>DUE DATE</h3>
                    <span className="circulation-due-date-container">
                        <p>{getDisplayDate() || 'No due date selected'}</p>
                    </span>
                </div>
                <span className="circulation-modal-buttons">
                    <button onClick={onBack}>← Back</button>
                    <button onClick={handleConfirm}>Confirm Due Date</button>
                </span>
            </div>
        </div>
    );
}

function SuccessfulBookBorrowModal({ onClose }) {
  return(
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="successful-borrow-container">
        <img src='./CheckMarkLogo.svg' alt="Check Mark Logo"></img>
        <span className="successful-borrow-text-wrapper">
          <h1>Successfully borrowed a</h1>
          <h1>Book!</h1>
        </span>
      </div>
    </div>
  )
}

export function ExtendBookBorrowModal({ record, onClose, onExtended }) {
    const [borrowingPeriod, setBorrowingPeriod] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [customDate, setCustomDate] = useState(null);

    const getExtendedDueDate = () => {
        const base = record?.due_date ? new Date(record.due_date) : new Date();

        if (borrowingPeriod === 'custom' && customDate) return customDate;
        if (borrowingPeriod) {
            const extended = new Date(base);
            extended.setDate(extended.getDate() + borrowingPeriod);
            return extended;
        }
        return null;
    };

    const getDisplayDate = () => {
        const date = getExtendedDueDate();
        return date
            ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : null;
    };

    const handleConfirm = async () => {
        if (!borrowingPeriod) {
            alert('Please select an extension period first.');
            return;
        }

        const newDueDate = getExtendedDueDate();
        const formattedDueDate = newDueDate.toISOString().split('T')[0];

        console.log('record:', record);
        console.log('borrowers_id:', record?.borrowers_id);
        console.log('new due date:', formattedDueDate);

        const { data, error } = await supabase
            .from('borrowers_record')
            .update({
                due_date: formattedDueDate,
                borrow_status: 'Approve',
            })
            .eq('borrowers_id', record?.borrowers_id)
            .select()
            .single();

        console.log('error:', error);   // ← what does this say?
        console.log('data:', data);     // ← is this null or an object?

        if (error) {
            console.error('Supabase error:', error);
            alert('Failed to extend. Please try again.');
        } else {
            onExtended(data);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="circulation-modal-container">
                <span className="proceed-checkout-modal-header">
                    <h3>EXTEND DUE DATE</h3>
                </span>
                <span className="circulation-approve-message-container">
                    <span className="approve-message">
                        <p>Extending <strong>{record?.books?.title}</strong> for {record?.user?.first_name} {record?.user?.last_name}</p>
                        <p>Current due date: <strong>{record?.due_date}</strong></p>
                    </span>
                </span>
                <div className="circulation-borrowing-period-container">
                    <h3>EXTEND PERIOD</h3>
                    <span className="borrowing-period-buttons">
                        <button className={borrowingPeriod === 5 ? 'active' : ''} onClick={() => { setBorrowingPeriod(5); setShowCalendar(false); setCustomDate(null); }}>5 Days</button>
                        <button className={borrowingPeriod === 7 ? 'active' : ''} onClick={() => { setBorrowingPeriod(7); setShowCalendar(false); setCustomDate(null); }}>7 Days</button>
                        <button className={borrowingPeriod === 'custom' ? 'active' : ''} onClick={() => { setBorrowingPeriod('custom'); setShowCalendar(!showCalendar); }}>+ Custom</button>
                        {showCalendar && (
                            <input className="custom-calendar" type="date"
                                min={record?.due_date}  
                                onChange={(e) => { setCustomDate(new Date(e.target.value)); setBorrowingPeriod('custom'); setShowCalendar(false); }}
                            />
                        )}
                    </span>
                    <h3>NEW DUE DATE</h3>
                    <span className="circulation-due-date-container">
                        <p>{getDisplayDate() || 'No extension date selected'}</p>
                    </span>
                </div>
                <span className="circulation-modal-buttons">
                    <button onClick={onClose}>← Back</button>
                    <button onClick={handleConfirm}>Confirm Extension</button>
                </span>
            </div>
        </div>
    );
}

export function LostBookModal({ record, onClose, onConfirmed }) {

    const handleConfirm = async () => {
        
        const { error: statusError } = await supabase
            .from('borrowers_record')
            .update({ 
                borrow_status: 'Lost',
                amount: (record?.amount || 0) + 50,  
            })
            .eq('borrowers_id', record?.borrowers_id);

        if (statusError) {
            console.error('Supabase error:', statusError);
            alert('Failed to update. Please try again.');
            return;
        }

        onConfirmed(record.borrowers_id);
    };

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="circulation-modal-container">
                <div className="circulation-modal-header">
                    <h3>MARK AS LOST</h3>
                    <p>This action cannot be undone</p>
                </div>

                <div className="lost-modal-details">
                    <p>Are you sure you want to mark this book as lost?</p>
                    <div className="success-modal-row">
                        <span>Borrower</span>
                        <strong>{record?.user?.first_name} {record?.user?.last_name}</strong>
                    </div>
                    <div className="success-modal-row">
                        <span>Book Title</span>
                        <strong>{record?.books?.title}</strong>
                    </div>
                    <div className="success-modal-row">
                        <span>Accession No.</span>
                        <strong>{record?.books?.accession_num}</strong>
                    </div>
                    <div className="success-modal-row">
                        <span>Violation Fee</span>
                        <strong style={{ color: 'red' }}>₱50.00</strong>   
                    </div>
                    <div className="success-modal-row">
                        <span>Total Amount Due</span>
                        <strong style={{ color: 'red' }}>₱{(record?.amount || 0) + 50}.00</strong>  
                    </div>
                </div>

                <span className="circulation-modal-buttons">
                    <button onClick={onClose}>← Cancel</button>
                    <button id="reject-button" onClick={handleConfirm}>Confirm Lost</button>
                </span>
            </div>
        </div>
    );
}

export function AddBorrowerModal({ onClose }) {
    const [openSearchModal, setOpenSearchModal] = useState(false);
    const [formData, setFormData] = useState({
        user_id: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        designation: '',
    });

    if (openSearchModal) {
        return (
            <SearchBookModal
                formData={formData}
                onClose={onClose}
                onBack={() => setOpenSearchModal(false)}
            />
        );
    }

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="circulation-modal-container">
                <span className="add-borrower-header">
                    <h3>BOOK BORROWER INFORMATION</h3>
                </span>
                <div className="add-borrower-input-container">
                    <label className="add-borrower-label">STUDENT'S LRN / TEACHER ID</label>
                    <input
                        className="add-borrower-label"
                        placeholder="Enter Student/Teacher ID"
                        value={formData.user_id}
                        onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    />
                    <div className="add-borrower-name-container">
                        <span className="add-borrower-name-wrapper">
                            <label className="add-borrower-label">FIRST NAME</label>
                            <input
                                className="add-borrower-label"
                                placeholder="Ex. Marrah Princess"
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            />
                        </span>
                        <span className="add-borrower-name-wrapper">
                            <label className="add-borrower-label">MIDDLE NAME</label>
                            <input
                                className="add-borrower-label"
                                placeholder="Ex. Cuizon"
                                value={formData.middle_name}
                                onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                            />
                        </span>
                        <span className="add-borrower-name-wrapper">
                            <label className="add-borrower-label">LAST NAME</label>
                            <input
                                className="add-borrower-label"
                                placeholder="Ex. Librea"
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            />
                        </span>
                    </div>
                    <div className="add-borrower-designation-container">
                        <label className="add-borrower-label">DEPARTMENT / GRADE & SECTION</label>
                        <select
                            className="add-borrower-label"
                            value={formData.designation}
                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        >
                            <option value="Filipino">Filipino</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Kawayan">9 - Kawayan</option>
                        </select>
                    </div>
                    <div className="add-borrower-modal-button-container">
                        <button className="add-borrower-modal-button" onClick={onClose}>Cancel</button>
                        <button
                            className="add-borrower-modal-button"
                            onClick={() => setOpenSearchModal(true)}  
                        >
                            Next →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SearchBookModal({ formData, onClose, onBack }) {
    const [confirmBorrow, setConfirmBorrow] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [showDueDate, setShowDueDate] = useState(false);
    const [dueDate, setDueDate] = useState(null);
    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBooks('');
    }, []);

    const fetchBooks = async (searchTerm) => {
        setLoading(true);

        let query = supabase.from('books').select('*');

        if (searchTerm.trim() !== '') {
            query = query.or(`accession_num.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%,call_num.ilike.%${searchTerm}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching books:', error);
        } else {
            setBooks(data);
        }
        setLoading(false);
    };

    const handleLookUp = () => {
        fetchBooks(search);
    };

    if (confirmBorrow && selectedBook && dueDate) {
        return (
            <ConfirmBorrowingModal
                formData={formData}
                selectedBook={selectedBook}
                dueDate={dueDate}
                onClose={onClose}
                onBack={() => {
                    setConfirmBorrow(false);
                    setDueDate(null);
                }}
            />
        );
    }

    if (showDueDate && selectedBook) {
        return (
            <ProceedCheckoutModal
                record={{ books: selectedBook, user: null }}
                onClose={() => { setShowDueDate(false); setSelectedBook(null); }}
                onBack={() => { setShowDueDate(false); setSelectedBook(null); }}
                onDueDateConfirmed={(confirmedDate) => {
                    setDueDate(confirmedDate);
                    setShowDueDate(false);
                    setConfirmBorrow(true);
                }}
            />
        );
    }

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="circulation-modal-container">
                <span className="add-borrower-header">
                    <h3>BOOK BORROWER INFORMATION</h3>
                </span>
                <div className="search-book-modal-container">
                    <h3>SEARCH A BOOK</h3>
                    <span className="search-input-modal-container">
                        <input
                            placeholder="Enter Accession No., Book Title, Call No..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleLookUp(); }}
                        />
                        <button onClick={handleLookUp}>Look Up</button>
                    </span>
                </div>
                <div className="book-modal-table-container">
                    <h4>BOOKS</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>Accession No.</th>
                                <th>Book Title</th>
                                <th>Call No.</th>
                                <th>Set Due Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4">Searching...</td></tr>
                            ) : books.length === 0 ? (
                                <tr><td colSpan="4">No books found.</td></tr>
                            ) : (
                                books.map((book) => (
                                    <tr key={book.accession_num}>
                                        <td>{book.accession_num}</td>
                                        <td>{book.title}</td>
                                        <td>{book.call_num}</td>
                                        <td>
                                            <button
                                                id="approve-button"
                                                onClick={() => {
                                                    setSelectedBook(book);
                                                    setShowDueDate(true);
                                                }}
                                            >
                                                Set Due Date
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <span className="circulation-modal-buttons">
                    <button onClick={onBack}>← Back</button>
                </span>
            </div>
        </div>
    );
}

export function ConfirmBorrowingModal({ formData, selectedBook, dueDate, onClose, onBack }) {
    const [showSuccess, setShowSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);

        console.log('Step 1: checking copies...');
        const { data: bookData, error: bookError } = await supabase
            .from('books')
            .select('copies')
            .eq('book_id', selectedBook.book_id)
            .single();

        console.log('bookData:', bookData);
        console.log('bookError:', bookError);

        if (bookError || !bookData) {
            alert('Book not found.');
            setLoading(false);
            return;
        }

        if (bookData.copies <= 0) {
            alert('No available copies of this book.');
            setLoading(false);
            return;
        }

        console.log('Step 2: checking user...');
        const { data: userData, error: userError } = await supabase
            .from('user')
            .select('*')
            .eq('user_id', formData.user_id)
            .single();

        console.log('userData:', userData);
        console.log('userError:', userError);

        if (userError || !userData) {
            alert('User not found. Please check the ID.');
            setLoading(false);
            return;
        }

        console.log('Step 3: generating ID...');
        const { data: lastRecord } = await supabase
            .from('borrowers_record')
            .select('borrowers_id')
            .order('borrowers_id', { ascending: false })
            .limit(1)
            .single();

        console.log('lastRecord:', lastRecord);

        const lastNum = lastRecord ? parseInt(lastRecord.borrowers_id.split('-')[2]) : 0;
        const newNum = String(lastNum + 1).padStart(4, '0');
        const newBorrowersId = `BR-${new Date().getFullYear()}-${newNum}`;

        console.log('newBorrowersId:', newBorrowersId);

        const today = new Date().toISOString().split('T')[0];

        console.log('Step 4: inserting borrow record...');
        const { error: insertError } = await supabase
            .from('borrowers_record')
            .insert({
                borrowers_id: newBorrowersId,
                user_id: formData.user_id,
                book_id: selectedBook.book_id,
                borrow_status: 'Approve',
                borrow_date: today,
                request_date: today,
                due_date: dueDate.formatted,
                amount: 0,
            });

        console.log('insertError:', insertError);

        if (insertError) {
            console.error('Insert error:', insertError);
            alert('Failed to add borrower. Please try again.');
            setLoading(false);
            return;
        }

        console.log('Step 5: decrementing copies...');
        const { error: decrementError } = await supabase
            .from('books')
            .update({ copies: bookData.copies - 1 })
            .eq('book_id', selectedBook.book_id);

        console.log('decrementError:', decrementError);

        setShowSuccess(true);
        setLoading(false);
    };

    if (showSuccess) {
        return <SuccessfulBookBorrowModal onClose={onClose} />;
    }

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="circulation-modal-container">
                <span className="add-borrower-header">
                    <h3>CONFIRM BORROWING</h3>
                </span>

                <div className="confirm-borrow-profile-container">
                    <img src="./ProfilePic.svg" />
                    <span className="confirm-borrow-profile-info">
                        <h4>{formData.first_name} {formData.middle_name} {formData.last_name}</h4>
                        <p>ID: {formData.user_id}</p>
                    </span>
                </div>

                <table className="circulation-table-modal-container">
                    <thead>
                        <tr>
                            <th>Accession No.</th>
                            <th>Book Title</th>
                            <th>Call No.</th>
                            <th>Due Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{selectedBook?.accession_num}</td>
                            <td>{selectedBook?.title}</td>
                            <td>{selectedBook?.call_num}</td>
                            <td>{dueDate?.display}</td>
                        </tr>
                    </tbody>
                </table>

                <span className="circulation-modal-buttons">
                    <button onClick={onBack}>← Back</button>
                    <button onClick={handleConfirm} disabled={loading}>
                        {loading ? 'Saving...' : 'Confirm Borrowing'}
                    </button>
                </span>
            </div>
        </div>
    );
}
export default CheckHistoryModal;