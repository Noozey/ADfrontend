import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function Dashboard() {
  const { user } = useAuth();
  
  return (
    <div className="page">
      <h1>Welcome, {user?.name || user?.email}</h1>
      <div className="dashboard-cards">
        <div className="card">
          <h3>Dashboard</h3>
          <p>Your role: {user?.roles?.join(', ')}</p>
        </div>
      </div>
    </div>
  );
}