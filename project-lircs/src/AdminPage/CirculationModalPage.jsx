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

export function ProceedCheckoutModal({ record, onClose, onBack }) {
  const [borrowingPeriod, setBorrowingPeriod] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [customDate, setCustomDate] = useState(null);
  const[showSuccess, setShowSuccess] = useState(false);

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

  const handleConfirm = async () => {
    if (!borrowingPeriod) {
      alert('Please select a borrowing period first.');
      return;
    }
    await updateBorrow();
  };

  const updateBorrow = async () => {
      console.log('updateBorrow called');        
      console.log('borrowingPeriod:', borrowingPeriod);
      
      const dueDate = getActualDueDate();
      console.log('dueDate:', dueDate);           

      if (!dueDate) {
          alert('Due date is missing.');
          return;
      }

      const formattedDueDate = dueDate.toISOString().split('T')[0];
      const formattedBorrowDate = new Date().toISOString().split('T')[0];

      console.log('record:', record);
      console.log('borrowers_id:', record?.borrowers_id);

      const { error } = await supabase
        .from('borrowers_record')
        .update({
          borrow_status: 'Approve',
          borrow_date: formattedBorrowDate,
          due_date: formattedDueDate,
        })
        .eq('borrowers_id', record?.borrowers_id)
        .select();

      console.log('update error:', error);  
      console.log('update attempted for:', record?.borrowers_id);

      if (error) {
        console.error('Supabase error:', error);
        alert('Failed to approve. Please try again.');
      } else {
        setShowSuccess(true);
      }
  };

  const getDisplayDate = () => {
    if (borrowingPeriod === 'custom' && customDate) {
      return customDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    if (borrowingPeriod) return getDueDate(borrowingPeriod);
    return null;
  };

  if (showSuccess) {
    return (
      <SuccessfulBookBorrowModal
        record={record}
        dueDate={getDisplayDate()}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="circulation-modal-container">
        <span className="proceed-checkout-modal-header">
          <h3>SET DUE DATE</h3>
        </span>
        <span className="circulation-approve-message-container">
          <span className="approve-message">
            <p>Approving <strong>{record?.books?.title}</strong> for {record?.user?.first_name} {record?.user?.last_name}</p>
          </span>
        </span>
        <div className="circulation-borrowing-period-container">
          <h3>BORROWING PERIOD</h3>
          <span className="borrowing-period-buttons">
            <button className={borrowingPeriod === 5 ? 'active' : ''} onClick={() => { setBorrowingPeriod(5); setShowCalendar(false); setCustomDate(null); }}>5 Days</button>
            <button className={borrowingPeriod === 7 ? 'active' : ''} onClick={() => { setBorrowingPeriod(7); setShowCalendar(false); setCustomDate(null); }}>7 Days</button>
            <button className={borrowingPeriod === 'custom' ? 'active' : ''} onClick={() => { setBorrowingPeriod('custom'); setShowCalendar(!showCalendar); }}>+ Custom</button>
            {showCalendar && (
              <input className="custom-calendar" type="date" min={new Date().toISOString().split('T')[0]}
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
          <button onClick={handleConfirm}>Confirm Checkout</button>
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
                        <strong style={{ color: 'red' }}>₱50.00</strong>   {/* ← show the fee */}
                    </div>
                    <div className="success-modal-row">
                        <span>Total Amount Due</span>
                        <strong style={{ color: 'red' }}>₱{(record?.amount || 0) + 50}.00</strong>  {/* ← show total */}
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

export function AddBorrowerModal() {
  return(
    <div className="modal-layout">
      <div className="circulation-modal-container">

      </div>
    </div>
  )
}
export default CheckHistoryModal;