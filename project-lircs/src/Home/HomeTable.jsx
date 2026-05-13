import { useEffect, useState } from 'react';
import { supabase } from '../../client/databaseClient.js';

function HomeTable() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('user')
                .select(`
                    *,
                    students (
                        grade_level,
                        section
                    ),
                    teachers (
                        department
                    )
                `);

            if (error) {
                setError(error.message);
            } else {
                setUsers(data || []);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="home-table"><p>Loading...</p></div>;
    }

    if (error) {
        return <div className="home-table"><p>Error: {error}</p></div>;
    }

    return (
        <div className="home-table">
            <table>
                <thead id="home-table-header">
                    <tr>
                        <th>Date</th>
                        <th>Time In</th>
                        <th>Role</th>
                        <th>Name</th>
                        <th>Grade & Section / Department</th>
                        <th>Purpose</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length > 0 ? (
                        users.map((user) => (
                            <tr key={user.user_id}>
                                <td>
                                    {user.date
                                        ? new Date(user.date).toLocaleDateString()
                                        : '-'}
                                </td>

                                <td>{user.created_at || '-'}</td>

                                <td>{user.user_type || '-'}</td>

                                <td>
                                    {[
                                        user.first_name,
                                        user.middle_name,
                                        user.last_name
                                    ]
                                        .filter(Boolean)
                                        .join(' ') || '-'}
                                </td>

                                <td>
                                    {user.user_type === 'HS' || user.user_type === 'GS'
                                        ? `${user.students?.grade_level || ''} - ${user.students?.section || ''}`
                                        : user.user_type === 'F'
                                        ? user.teachers?.department || '-'
                                        : '-'}
                                </td>

                                <td>{user.purpose || '-'}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center' }}>No users found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default HomeTable;