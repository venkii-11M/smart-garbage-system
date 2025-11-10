import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const API_URL = 'http://localhost:5000/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    loadReports();
  }, [selectedStatus]);

  const loadDashboardData = async () => {
    try {
      const [statsRes, collectorsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/dashboard`),
        axios.get(`${API_URL}/admin/collectors`)
      ]);

      setStats(statsRes.data.stats);
      setCollectors(collectorsRes.data.collectors);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      const url = selectedStatus === 'all' 
        ? `${API_URL}/admin/reports`
        : `${API_URL}/admin/reports?status=${selectedStatus}`;
      
      const response = await axios.get(url);
      setReports(response.data.reports);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🗑️ Smart Garbage Collection System</h1>
        <p>Admin Dashboard</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card blue">
          <h3>Total Reports</h3>
          <p className="stat-number">{stats?.totalReports || 0}</p>
        </div>
        <div className="stat-card orange">
          <h3>Pending</h3>
          <p className="stat-number">{stats?.pendingReports || 0}</p>
        </div>
        <div className="stat-card green">
          <h3>Collected</h3>
          <p className="stat-number">{stats?.collectedReports || 0}</p>
        </div>
        <div className="stat-card purple">
          <h3>Active Collectors</h3>
          <p className="stat-number">{stats?.activeCollectors || 0}</p>
        </div>
      </div>

      <div className="section">
        <h2>Collectors</h2>
        <div className="collectors-grid">
          {collectors.map(collector => (
            <div key={collector._id} className="collector-card">
              <h3>{collector.name}</h3>
              <p>📞 {collector.phone}</p>
              <p>🚛 {collector.vehicleNumber}</p>
              <p>📍 {collector.area}</p>
              <p className="collection-count">
                ✓ Collected: <strong>{collector.totalCollected}</strong>
              </p>
              <span className={`badge ${collector.isActive ? 'active' : 'inactive'}`}>
                {collector.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Garbage Reports</h2>
          <div className="filter-buttons">
            <button 
              className={selectedStatus === 'all' ? 'active' : ''}
              onClick={() => setSelectedStatus('all')}
            >
              All
            </button>
            <button 
              className={selectedStatus === 'pending' ? 'active' : ''}
              onClick={() => setSelectedStatus('pending')}
            >
              Pending
            </button>
            <button 
              className={selectedStatus === 'assigned' ? 'active' : ''}
              onClick={() => setSelectedStatus('assigned')}
            >
              Assigned
            </button>
            <button 
              className={selectedStatus === 'collected' ? 'active' : ''}
              onClick={() => setSelectedStatus('collected')}
            >
              Collected
            </button>
          </div>
        </div>

        <div className="reports-table">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>User</th>
                <th>Location</th>
                <th>Status</th>
                <th>Collector</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <tr key={report._id}>
                  <td>
                    <img 
                      src={`http://localhost:5000${report.photoUrl}`}
                      alt="Garbage"
                      className="report-image"
                    />
                  </td>
                  <td>
                    <strong>{report.userName}</strong><br/>
                    {report.userPhone}
                  </td>
                  <td>{report.location.address}</td>
                  <td>
                    <span className={`badge ${report.status}`}>
                      {report.status.toUpperCase()}
                    </span>
                  </td>
                  <td>{report.collectorName || '-'}</td>
                  <td>{new Date(report.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}