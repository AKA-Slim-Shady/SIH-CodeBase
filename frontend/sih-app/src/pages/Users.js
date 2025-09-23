import React, { useEffect, useState } from "react";
import { getAllUsers, deleteUser } from "../api/users";

export default function Users() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const data = await getAllUsers();
    setUsers(data);
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 32 }}>
      <h2>Users</h2>
      {users.map(user => (
        <div key={user._id} style={{ padding: 16, border: "1px solid #ddd", borderRadius: 8, marginBottom: 16 }}>
          <p>{user.name} ({user.email})</p>
          <button onClick={() => { deleteUser(user._id); fetchUsers(); }}>Delete</button>
        </div>
      ))}
    </div>
  );
}
