import { useState } from "react"

function CheckHistoryModal({record, onClose}) {
    const [userId, setUserId] = useState('');
    const [totalFines, settotalFines] = useState('');
    const [totalBooksBorrowerd, settotalBooksBorrowerd] = useState([]);
    return(
        <div className="modal-overlay" onClick={onClose}>
            <div className="circulation-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="circulation-modal-header">
                    <h3>BOOK BORROWER INFORMATION</h3>
                    <p>REVIEWING STUDENT'S ACCOUNT BEFORE APPROVAL</p>
                </div>

                <div className="circulation-modal-profile">
                    <img src="./ProfilePic.svg" className="circulation-modal-profile-pic" alt="Circulation Profile Pic"></img>
                    <span className="circulation-profile-info">
                        <h4>Name</h4>
                        <p>Grade & Section | LRN</p>
                    </span>
                </div>

                <div className="circulation-modal-cards-container">
                    <div className="circulation-modal-cards">
                        <h1 className='circulation-total-fines'>$0.00</h1>
                        <p>UNPAID FINES</p>
                    </div>

                    <div className="circulation-modal-cards">
                        <h1 className='circulation-total-borrow'>20</h1>
                        <p>BOOKS BORROWED</p>
                    </div>
                </div>

                <h4 className="recent-transactions">RECENT TRANSACTIONS</h4>

                <table className="circulation-table-container">
                    <thead>
                        <td>DATE</td>
                        <td>BOOK TITLE</td>
                        <td>STATUS</td>
                    </thead>
                </table>

                <span className="circulation-modal-buttons">
                    <button>Cancel</button>
                    <button>Proceed to Approve → </button>
                </span>

            </div>
        </div>
    )
}
export default CheckHistoryModal;