import React, { useEffect, useState } from 'react';
import { forumApi, UserProfile } from '../../services/forumApi';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await forumApi.getCurrentUserProfile();
        if (response.role !== 'alpha') throw new Error('Unauthorized');
        const userResponse = await forumApi.getUserProfile(response.id);
        setUsers([userResponse]); // For demonstration, add logic to list users
      } catch (err: any) {
        setError(err.message);
      }
    };
    loadUsers();
  }, []);

  const updateRole = async (userId: number, newRole: 'alpha' | 'delta') => {
    try {
      await forumApi.updateUserRole(userId, newRole);
      const updatedUsers = users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      );
      setUsers(updatedUsers);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Admin Panel</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.username} - {user.role}
            <button onClick={() => updateRole(user.id, 'alpha')}>Make Admin</button>
            <button onClick={() => updateRole(user.id, 'delta')}>Revoke Admin</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;
