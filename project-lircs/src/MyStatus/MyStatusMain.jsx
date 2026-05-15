import { supabase } from "../../client/databaseClient";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import HeaderLogEntry from "../Header/HeaderLogEntry";
import LogEntryNav from "../Header/LogEntryNav";

function MyStatusMain() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const student = state?.student;
  const studentInfo = state?.studentInfo;
  const [loans, setLoans] = useState([]);
  const [allLoans, setAllLoans] = useState([]); // for overdue and balance (includes returned)

  useEffect(() => {
    if (!student) {
      navigate("/my-status-login");
    }
  }, [student, navigate]);

  useEffect(() => {
    if (!student) return;

    // Fetch current loans (not yet returned)
    const fetchLoans = async () => {
      const { data, error } = await supabase
        .from('borrowers_record')
        .select('*, books(title)')
        .eq('user_id', student.user_id)
        .is('return_date', null);

      if (error) {
        console.error("Error fetching current loans:", error);
        return;
      }
      setLoans(data || []);
    };

    // Fetch all loans (for unpaid balance)
    const fetchAllLoans = async () => {
      const { data, error } = await supabase
        .from('borrowers_record')
        .select('*, books(title)')
        .eq('user_id', student.user_id);

      if (error) {
        console.error("Error fetching all loans:", error);
        return;
      }
      setAllLoans(data || []);
    };

    fetchLoans();
    fetchAllLoans();
  }, [student]);

  if (!student) return null;

  return (
    <>
      <HeaderLogEntry />
      <LogEntryNav />
      <div className="my-status-main-container">
        <h1 className="my-status-title">My Library Status</h1>
        <div className="my-status-info-container">
          <img src='/ProfilePic.svg' alt="Profile Icon" className="profile-icon" />
          <div className="my-status-text-group">
            <p className="my-status-info" id="student-name">
              {student.first_name} {student.middle_name} {student.last_name}
            </p>
            <p className="my-status-info" id="student-details">
              {studentInfo?.grade_level} - {studentInfo?.section}{" | User ID: "}{student.user_id}
            </p>
          </div>
          <button className="sign-out-button">Sign Out</button>
        </div>
        <MyStatusCard loans={loans} allLoans={allLoans} />
        <CurrentLoanTable loans={loans} />
        <BorrowingHistoryTable allLoans={allLoans} />
      </div>
    </>
  );
}

function MyStatusCard({ loans, allLoans }) {
  const currentBorrowed = loans.length;

  const today = new Date();
  const overdueBooks = loans.filter(loan => new Date(loan.due_date) < today).length;

  // Unpaid balance = sum of all unpaid fines
  const unpaidBalance = allLoans
    .filter(loan => loan.fines === "Unpaid")
    .reduce((total, loan) => total + Number(loan.amount || 0), 0);

  return (
    <div className="my-status-cards-container">
      <div className="my-status-card">
        <h1>{currentBorrowed}</h1>
        <h3 className="card-title">Current Borrowed Books</h3>
      </div>
      <div className="my-status-card">
        <h1>{overdueBooks}</h1>
        <h3 className="card-title">Total Overdue Books</h3>
      </div>
      <div className="my-status-card">
        <h1>₱{unpaidBalance.toFixed(2)}</h1>
        <h3 className="card-title">Unpaid Balance</h3>
      </div>
    </div>
  );
}

function CurrentLoanTable({ loans }) {
  return (
    <div className="current-loan-table-container">
      <h4 className="my-status-table-title">Current Loan</h4>
      <table className="current-loan-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Date Borrowed</th>
            <th>Due Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {loans.length === 0 ? (
            <tr><td colSpan="4">No current loans found.</td></tr>
          ) : (
            loans.map((loan) => (
              <tr key={loan.borrowers_id}>
                <td>{loan.books?.title}</td>
                <td>{loan.borrow_date}</td>
                <td>{loan.due_date}</td>
                <td>{new Date(loan.due_date) < new Date() ? "Overdue" : "Borrowed"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function BorrowingHistoryTable({ allLoans }) {
  return (
    <div className="borrowing-history-table-container">
      <h4 className="my-status-table-title" id="borrowing-history-title">
        Borrowing History
      </h4>
      <table className="borrowing-history-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Date Borrowed</th>
            <th>Date Returned</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {allLoans.length === 0 ? (
            <tr><td colSpan="4">No borrowing history found.</td></tr>
          ) : (
            allLoans.map((loan) => (
              <tr key={loan.borrowers_id}>
                <td>{loan.books?.title}</td>
                <td>{loan.borrow_date}</td>
                <td>{loan.return_date || "Not returned"}</td>
                <td>{loan.fines || "No fines"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default MyStatusMain;