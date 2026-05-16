import { useState, useEffect } from 'react'
import { supabase } from '../../client/databaseClient' 
import { useLocation } from 'react-router-dom'
import AdminPageHeader from './AdminPageHeader.jsx'
import AdminPageSidebar from './AdminPageSidebar.jsx'
import Fullcalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";


function useDashboardData() {
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [borrowedBooks, setBorrowedBooks] = useState(0);
  const [activeStudents, setActiveStudents] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: overdueData } = await supabase
        .from('borrowers_record')
        .select('*, books(title)')
        .is('return_date', null)
        .lt('due_date', today.toISOString());
      setOverdueBooks(overdueData || []);

      const { data: copiesData } = await supabase
        .from('books')
        .select('copies');

      const totalCopies = copiesData?.reduce((sum, book) => sum + (book.copies || 0), 0) || 0;
      setTotalBooks(totalCopies);

      const { count: borrowedCount } = await supabase
        .from('borrowers_record')
        .select('*', { count: 'exact', head: true })
        .is('return_date', null);
      setBorrowedBooks(borrowedCount || 0);

      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });
      setActiveStudents(studentCount || 0);
    };

    fetchAll();
  }, []);

  return { overdueBooks, totalBooks, borrowedBooks, activeStudents };
}

function useLibraryEntryData() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchEntries = async () => {
      const today = new Date(Date.now() + 8 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]; 


      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('logbook')
        .select(`
          *,
          user (
            first_name,
            middle_name,
            last_name,
            user_type,
            students (grade_level, section),
            teachers (department)
          )
        `)
        .eq('date_check_in', today)
        .order('time_check_in', { ascending: false });

        console.log('data:', data);
        console.log('error: ', error);
        console.log('wew: ', entries);
        console.log('user type', entries.map(e => e.user?.user_type));
        console.log('user', entries.map(e => ({ students: e.user?.students, teachers: e.user?.teachers })));


      setEntries(data || []);
    };

    fetchEntries();
  }, []);

  return { entries };
}

function useDueTodayData() {
  const [dueToday, setDueToday] = useState([]);

  useEffect(() => {
    const fetchDueToday = async () => {
      const today = new Date().toLocaleDateString('en-CA');

      console.log('due today date:', today);

      const { data, error } = await supabase
        .from('borrowers_record')
        .select(`
          *,
          user (
            first_name,
            middle_name,
            last_name
          ),
          books (title)
        `)
        .is('return_date', null)
        .eq('due_date', today);

      console.log('due today data:', data);
      console.log('due today error:', error);
      setDueToday(data || []);
    };

    fetchDueToday();
  }, []);

  return { dueToday };
}

function useCalendarEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('borrowers_record')
        .select(`
          borrowers_id,
          due_date,
          return_date,
          user (first_name, middle_name, last_name),
          books (title)
        `)
        .is('return_date', null); 

      console.log('calendar data:', data);
      console.log('calendar error:', error);

      const events = data?.map(record => ({
        id: record.borrowers_id,
        title: `${record.books?.title} - ${[record.user?.first_name, record.user?.middle_name, record.user?.last_name].filter(Boolean).join(' ')}`,
        date: record.due_date, 
        backgroundColor: '#F26419',
        borderColor: '#F26419',
      })) || [];

      setEvents(events);
    };

    fetchEvents();
  }, []);

  return { events };
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

            <LibraryEntryRecordToday />
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

function LibraryEntryRecordToday() {
  const { entries } = useLibraryEntryData();
  const { dueToday } = useDueTodayData();
  const { events } = useCalendarEvents();
  const [filter, setFilter] = useState('Student');

  const filteredEntries = entries.filter(entry =>
    entry.user?.user_type?.toLowerCase() === filter.toLowerCase()
  );

const handleExport = () => {
    if (filteredEntries.length === 0) return;

    const rows = filteredEntries.map(entry => {
      const name = [entry.user?.first_name, entry.user?.middle_name, entry.user?.last_name]
        .filter(Boolean)
        .join(' ');

      const gradeSection = entry.user?.user_type?.toLowerCase() === 'student'
        ? `${entry.user?.students?.[0]?.grade_level} - ${entry.user?.students?.[0]?.section}`
        : entry.user?.teachers?.[0]?.department;

      return {
        'Time In': entry.time_check_in,
        'Date': entry.date_check_in,
        'Name': name,
        'Grade & Section / Department': gradeSection,
        'Purpose': entry.purpose,
      };
    });

    const headers = Object.keys(rows[0]).join(',');
    const csv = [
      headers,
      ...rows.map(row => Object.values(row).map(v => `"${v ?? ''}"`).join(','))
    ].join('\n');

    const today = new Date().toLocaleDateString('en-CA');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `library-entry-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className='first-row-entry-record'>
        <div className='library-entry-record-container'>
          <div className='library-entry-record-header'>
            <h1 className='library-entry-record-label'>Today's Library Entry Record</h1>
            <span className='library-entry-record-buttons-container'>
              <button className='library-entry-record-buttons'>View Full List</button>
              <select
                className='library-entry-record-buttons'
                value={filter}
                onChange={(e) => setFilter(e.target.value)} 
              >
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
              </select>
              <button
                className='library-entry-record-buttons'
                onClick={handleExport}
              >
                Export Log
              </button>
            </span>
          </div>

          <div className='library-entry-record-table-container'>
            <table>
              <thead className='library-entry-record-table'>
                <tr>
                  <th>Time In</th>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Grade & Section / Department</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>No entries today.</td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr key={entry.logbook_number}>
                      <td>{entry.time_check_in}</td>
                      <td>{entry.date_check_in}</td>
                      <td>
                        {[entry.user?.first_name, entry.user?.middle_name, entry.user?.last_name]
                          .filter(Boolean)
                          .join(' ')}
                      </td>
                      <td>
                        {entry.user?.user_type?.toLowerCase() === 'student'
                          ? `${entry.user?.students?.grade_level} - ${entry.user?.students?.section}`
                          : entry.user?.teachers?.department}
                      </td>
                      <td>{entry.purpose}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

          <div className='due-today-container'>
            <div className='due-today-header'>
              <h1 className='due-today-label'>Due Today</h1>
              <h1 className='due-today-total'>{dueToday.length} books</h1>
            </div>
            
            <div className='due-today-table-container'>

              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Book Title</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dueToday.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center' }}>No books due today.</td>
                    </tr>
                  ) : (
                    dueToday.map((record) => (
                      <tr key={record.borrowers_id}>
                        <td>
                          {[record.user?.first_name, record.user?.middle_name, record.user?.last_name]
                            .filter(Boolean)
                            .join(' ')}
                        </td>
                        <td>{record.books?.title}</td>
                        <td>
                          <button className='check-out-button'>Check-out</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
      </div>

      <div className='second-row-entry-record'>
        <div className='calendar-container'>
          <Fullcalendar
            plugins={[dayGridPlugin, timeGridPlugin,interactionPlugin]}
            initialView={'dayGridMonth'}
            height={'600px'}
            aspectRatio={1.7}
            events={events}
            eventClick={(info) => {
              alert(`Due: ${info.event.title}`);
            }}
            
          />
        </div>

        <div className='total-students-container'>
          <div className='total-students-header'>
            <h3 className='total-students-label'>STUDENTS</h3>
            <button className='total-students-view-button'>View</button>
          </div>

          <div className='table-container'>
              
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminPageDashboard;