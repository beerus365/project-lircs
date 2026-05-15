import { useState, useEffect } from 'react'
import { supabase } from '../../client/databaseClient' 
import { useLocation } from 'react-router-dom'
import AdminPageHeader from './AdminPageHeader.jsx'
import AdminPageSidebar from './AdminPageSidebar.jsx'

function useDashboardData() {
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [borrowedBooks, setBorrowedBooks] = useState(0);
  const [activeStudents, setActiveStudents] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Overdue books
      const { data: overdueData } = await supabase
        .from('borrowers_record')
        .select('*, books(title)')
        .is('return_date', null)
        .lt('due_date', today.toISOString());
      setOverdueBooks(overdueData || []);

      // Total books
      const { data: copiesData } = await supabase
        .from('books')
        .select('copies');

      const totalCopies = copiesData?.reduce((sum, book) => sum + (book.copies || 0), 0) || 0;
      setTotalBooks(totalCopies);

      // Borrowed books
      const { count: borrowedCount } = await supabase
        .from('borrowers_record')
        .select('*', { count: 'exact', head: true })
        .is('return_date', null);
      setBorrowedBooks(borrowedCount || 0);

      // Total students
      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });
      setActiveStudents(studentCount || 0);
    };

    fetchAll();
  }, []);

  return { overdueBooks, totalBooks, borrowedBooks, activeStudents };
}

function AdminPageDashboard() {
  const location = useLocation();
  const adminName = location.state?.adminName || "Kimberly";
  const { overdueBooks, totalBooks, borrowedBooks, activeStudents } = useDashboardData();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="admin-layout">
      <AdminPageHeader adminName={adminName} />
      <div className="admin-body">
        <AdminPageSidebar />
        <main className="admin-main-content">
          <div className='admin-greetings-card'>
            <h1 className='admin-greetings'>Welcome, {adminName}</h1>
            <p className='admin-overview-label'>Here's your library overview - {today}</p>
          </div>

          <div className='admin-dashboard-main-container'>
            <OverdueBooksWarning overdueBooks={overdueBooks} />
            <LibrarySummary
              totalBooks={totalBooks}
              borrowedBooks={borrowedBooks}
              overdueBooks={overdueBooks.length}
              activeStudents={activeStudents}
            />
          </div>

        </main>
      </div>
    </div>
  );
}

function OverdueBooksWarning({ overdueBooks }) {
  return (
      <span className='admin-overdue-container'>
        {overdueBooks.length > 0 && (
          <div className='overdue-books-list'>
            <img src='/OverdueBooksWarningLogo.svg'></img>
            <span className='overdue-warning-message'>
              <p className='overdue-books-total'>{overdueBooks.length} books overdue - </p>
              <p>&nbsp;Immediate follow-up required.</p>
            </span>
          </div>
        )}
      </span>
  );
}

function LibrarySummary({ totalBooks, borrowedBooks, overdueBooks, activeStudents }) {
  return (
    <div className='library-summary-cards-container'>
      <div className='library-summary-cards'>
        <h1>{totalBooks}</h1>
        <p>TOTAL COPIES</p>
        <p>All Physical Books</p>
      </div>
      <div className='library-summary-cards'>
        <h1>{borrowedBooks}</h1>
        <p>BORROWED BOOKS</p>
        <p>Currently Out</p>
      </div>
      <div className='library-summary-cards'>
        <h1>{overdueBooks}</h1>
        <p>OVERDUE BOOKS</p>
      </div>
      <div className='library-summary-cards'>
        <h1>{activeStudents}</h1>
        <p>ACTIVE STUDENTS</p>
      </div>
    </div>
  );
}

export default AdminPageDashboard;