import { useEffect, useState } from 'react';
import AdminPageHeader from './AdminPageHeader';
import AdminPageSidebar from './AdminPageSidebar';
import CirculationModalPage, { ProceedCheckoutModal, ExtendBookBorrowModal, LostBookModal, AddBorrowerModal } from './CirculationModalPage';
import { supabase } from '../../client/databaseClient';

function CirculationPage() {
    const [activeTab, setActiveTab] = useState('pending');
    const [addBorrower, setAddBorrower] = useState(false);
    const [search, setSearch] = useState("");

    return (
        <div className="admin-layout">
            <AdminPageHeader />
            <div className="admin-body">     
                <AdminPageSidebar />
                <main className="circulation-content">
                    <div className='admin-page-title'>
                        <h1>CIRCULATION</h1>
                        <p>Manage borrowing, active loans, and returning</p>
                    </div>

                    <div className='circulation-main-body'>
                        <span className='circulation-header-buttons'>
                            <span className='three-buttons'>

                                <button 
                                    className={`circulation-button ${activeTab === 'pending' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('pending')}
                                >
                                    Pending Request
                                </button>

                                <button 
                                    className={`circulation-button ${activeTab === 'active' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('active')}
                                >
                                    Active Borrowing
                                </button>

                                <button 
                                    className={`circulation-button ${activeTab === 'returning' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('returning')}
                                >
                                    Returning
                                </button>

                            </span>
                            <button 
                                className='add-borrower-button'
                                onClick={() => setAddBorrower(true)}    
                            >
                                + Add Borrower
                            </button>
                        </span>

                        <div className='circulation-search-container'>
                            <h3>SEARCH A STUDENT/TEACHER</h3>
                            <span className='circulation-search-bar'>
                                <input
                                    type='text' 
                                    className='circulation-search-input' 
                                    placeholder="Enter Student/Teacher's ID"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button>Look Up</button>
                            </span>
                        </div>
                        
                        {activeTab === 'pending' && <PendingRequestTable search={search} />}
                        {activeTab === 'active' && <ActiveBorrowingTable search={search} />}
                        {activeTab === 'returning' && <ReturningTable search={search} />}
                    </div>
                </main>
            </div>
        </div>
    )
}

function PendingRequestTable({ search }) {
    const [pendingTotal, setPendingTotal] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState(null);      
    const [checkoutRecord, setCheckoutRecord] = useState(null);     

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        const { data, error } = await supabase
            .from('borrowers_record')
            .select(`
                *,
                user(
                    first_name,
                    middle_name,
                    last_name,
                    user_type,
                    students(grade_level, section),
                    teachers(department)
                ),
                books(title, accession_num, call_num)
            `)
            .eq('borrow_status', 'Pending');

        if (error) {
            console.error('Error fetching records: ', error);
        } else {
            setPendingTotal(data);
        }
    };

    const handleApprove = async (recordId) => {
        
        console.log('Approve clicked, recordId:', recordId);
        console.log('checkoutRecord:', checkoutRecord);

        const { error } = await supabase
            .from('borrowers_record')
            .update({ borrow_status: 'Active' })
            .eq('borrowers_id', recordId);

        if (error) {
            console.error('Error approving record:', error);
            alert('Failed to approve. Please try again.');
        } else {
            setPendingTotal((prev) => prev.filter((r) => r.borrowers_id !== recordId));
            setCheckoutRecord(null);
        }
    };

    const handleReject = async (recordId) => {
        const { error } = await supabase
            .from('borrowers_record')
            .update({ borrow_status: 'Rejected' })
            .eq('borrowers_id', recordId);

        if (error) {
            console.error('Error rejecting record:', error);
            alert('Failed to reject. Please try again.');
        } else {
            setPendingTotal((prev) => prev.filter((r) => r.borrowers_id !== recordId));
        }
    };

    const filteredRecords = pendingTotal.filter((record) => {
        const userId = record.user_id?.toString() || "";
        return userId.includes(search);
    });

    return (
        <>
            <div className='circulation-table-container'>
                <table>
                    <thead>
                        <tr>
                            <th>Date Requested</th>
                            <th>Name</th>
                            <th>Designation</th>
                            <th>Book Title</th>
                            <th>Accession No.</th>
                            <th>Call No.</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRecords.length === 0 ? (
                            <tr>
                                <td colSpan="7">No pending requests found.</td>
                            </tr>
                        ) : (
                            filteredRecords.map((record) => (
                                <tr key={record.borrowers_id}>
                                    <td>{record.request_date}</td>
                                    <td>
                                        {record.user?.first_name} {record.user?.middle_name} {record.user?.last_name}
                                    </td>
                                    <td>
                                        {record.user?.user_type === 'Student'
                                            ? `Grade ${record.user?.students?.grade_level} - ${record.user?.students?.section}`
                                            : record.user?.teachers?.department}
                                    </td>
                                    <td>{record.books?.title}</td>
                                    <td>{record.books?.accession_num}</td>
                                    <td>{record.books?.call_num}</td>
                                    <td className='pending-buttons-group'>
                                        <button
                                            className='pending-buttons'
                                            id='check-history-button'
                                            onClick={() => setSelectedRecord(record)}
                                        >
                                            Check History
                                        </button>
                                        <button
                                            className='pending-buttons'
                                            id='approve-button'
                                            onClick={() => setCheckoutRecord(record)}  
                                        >
                                            Approve
                                        </button>
                                        <button
                                            className='pending-buttons'
                                            id='reject-button'
                                            onClick={() => handleReject(record.borrowers_id)}
                                        >
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Check History Modal */}
            {selectedRecord && (
                <CirculationModalPage
                    record={selectedRecord}
                    onClose={() => setSelectedRecord(null)}
                />
            )}

            {/* Approve / Checkout Modal */}
            {checkoutRecord && (
                <ProceedCheckoutModal
                    record={checkoutRecord}
                    onClose={() => setCheckoutRecord(null)}
                    onConfirm={() => handleApprove(checkoutRecord.borrowers_id)}
                />
            )}
        </>
    );
}

function ActiveBorrowingTable({ search }) {
    const [activeTotal, setActiveTotal] = useState([]);
    const [extendRecord, setExtendRecord] = useState(null); 
    const [lostRecord, setLostRecord] = useState(null); 

    useEffect(() => {
        const fetchActive = async () => {
            const { data, error } = await supabase
                .from('borrowers_record')
                .select(`
                    *,
                    user(
                        first_name, middle_name, last_name, user_type,
                        students(grade_level, section),
                        teachers(department)
                    ),
                    books(title, accession_num, call_num)
                `)
                .in('borrow_status', ['Approve', 'Overdue']);  

            if (error) {
                console.error('Error fetching active records: ', error);
            } else {
                setActiveTotal(data);
            }
        };
        fetchActive();
    }, []);

    const filteredRecords = activeTotal.filter((record) => {
        const userId = record.user_id?.toString() || "";
        return userId.includes(search);
    });

    return (
        <>
            <div className='circulation-table-container'>
                <table>
                    <thead>
                        <tr>
                            <th>Date Borrowed</th>
                            <th>Due Date</th>
                            <th>Name</th>
                            <th>Designation</th>
                            <th>Book Title</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRecords.length === 0 ? (
                            <tr><td colSpan="7">No active borrowing records found.</td></tr>
                        ) : (
                            filteredRecords.map((record) => (
                                <tr key={record.borrowers_id}>
                                    <td>{record.borrow_date}</td>
                                    <td>{record.due_date}</td>
                                    <td>{record.user?.first_name} {record.user?.middle_name} {record.user?.last_name}</td>
                                    <td>
                                        {record.user?.user_type === 'Student'
                                            ? `Grade ${record.user?.students?.grade_level} - ${record.user?.students?.section}`
                                            : record.user?.teachers?.department}
                                    </td>
                                    <td>{record.books?.title}</td>
                                    <td>{record.borrow_status}</td>
                                    <td>
                                        <button onClick={() => setExtendRecord(record)}>Extend</button>
                                        <button onClick={() => setLostRecord(record)}>Lost</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {extendRecord && (
                <ExtendBookBorrowModal
                    record={extendRecord}
                    onClose={() => setExtendRecord(null)}
                    onExtended={(updatedRecord) => {
                        setActiveTotal((prev) =>
                            prev.map((r) =>
                                r.borrowers_id === updatedRecord.borrowers_id ? updatedRecord : r
                            )
                        );
                        setExtendRecord(null);
                    }}
                />
            )}

            {lostRecord && (
                <LostBookModal
                    record={lostRecord}
                    onClose={() => setLostRecord(null)}
                    onConfirmed={(borrowersId) => {
                        setActiveTotal((prev) => prev.filter((r) => r.borrowers_id !== borrowersId));
                        setLostRecord(null);
                    }}
                />
            )}
        </>
    );
}

function ReturningTable({ search }) {
    const [returningTotal, setReturningTotal] = useState([]);

    useEffect(() => {
        const fetchReturning = async () => {
            const { data, error } = await supabase
                .from('borrowers_record')
                .select(`
                    *,
                    user(
                        first_name,
                        middle_name,
                        last_name,
                        user_type,
                        students(
                            grade_level,
                            section
                        ),
                        teachers(
                            department
                        )
                    ),
                    books(
                        title,
                        accession_num,
                        call_num
                    )
                `)
                .eq('borrow_status', 'Returning');

            if (error) {
                console.error('Error fetching returning records: ', error);
            } else {
                setReturningTotal(data);
            }
        };
        fetchReturning();
    }, []);

    // FIX: use own state (returningTotal) instead of undefined pendingTotal
    const filteredRecords = returningTotal.filter((record) => {
        const userId = record.user_id?.toString() || "";
        return userId.includes(search);
    });

    return (
        <div className='circulation-table-container'>
            <table>
                <thead>
                    <tr>
                        <th>Date Borrowed</th>
                        <th>Due Date</th>
                        <th>Name</th>
                        <th>Designation</th>
                        <th>Book Title</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredRecords.length === 0 ? (
                        <tr>
                            <td colSpan="7">No returning records found.</td>
                        </tr>
                    ) : (
                        filteredRecords.map((record) => (
                            <tr key={record.id}>
                                <td>{record.borrow_date}</td>
                                <td>{record.due_date}</td>
                                <td>
                                    {record.user?.first_name} {record.user?.middle_name} {record.user?.last_name}
                                </td>
                                <td>
                                    {record.user?.user_type === 'Student'
                                        ? `Grade ${record.user?.students?.grade_level} - ${record.user?.students?.section}`
                                        : record.user?.teachers?.department}
                                </td>
                                <td>{record.books?.title}</td>
                                <td>{record.borrow_status}</td>
                                <td>
                                    {/* Add action buttons here as needed */}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default CirculationPage;