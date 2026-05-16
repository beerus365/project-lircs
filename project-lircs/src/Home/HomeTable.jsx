import { useEffect, useState } from 'react';
import { supabase } from '../../client/databaseClient.js';

function HomeTable() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('logbook')
                .select(`
                    *,
                    user (
                        user_id,
                        user_type,
                        first_name,
                        middle_name,
                        last_name,
                        students (
                            grade_level,
                            section
                        ),
                        teachers (
                            department
                        )
                    )
                `);

            if (error) {
                setError(error.message);
            } else {
                setLogs(data || []);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="home-table"><p>Loading...</p></div>;
    if (error) return <div className="home-table"><p>Error: {error}</p></div>;

    return (
        <div className="home-table">
            <table>
                <thead id="home-table-header">
                    <tr>
                        <th>Date</th>
                        <th>Time In</th>
                        <th>Role</th>
                        <th>Name</th>
                        <th>Designation</th>
                        <th>Purpose</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.length > 0 ? (
                        logs.map((log) => {
                            const user = log.user;
                            return (
                                <tr key={log.logbook_number}>
                                    <td>
                                        {log.date_check_in
                                            ? new Date(log.date_check_in).toLocaleDateString()
                                            : '-'}
                                    </td>
                                    <td>{log.time_check_in || '-'}</td>
                                    <td>{user?.user_type || '-'}</td>
                                    <td>
                                        {[
                                            user?.first_name,
                                            user?.middle_name,
                                            user?.last_name
                                        ]
                                            .filter(Boolean)
                                            .join(' ') || '-'}
                                    </td>
                                    <td>
                                        {user?.user_type === 'Student'
                                            ? `${user?.students?.grade_level || ''} - ${user?.students?.section || ''}`
                                            : user?.user_type === 'Faculty'
                                            ? user?.teachers?.department || '-'
                                            : '-'}
                                    </td>
                                    <td>{log.purpose || '-'}</td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center' }}>No logs found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default HomeTable;