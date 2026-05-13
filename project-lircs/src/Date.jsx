function CurrentDate () {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="date-display">
            <p>Today's Log | {formattedDate}</p>
        </div>
    );
}

export default CurrentDate;