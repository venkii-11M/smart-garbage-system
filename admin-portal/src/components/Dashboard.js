import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  Trash2, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  LogOut,
  RefreshCw
} from 'lucide-react';
import './Dashboard.css';

const API_URL = 'http://localhost:5000/api';

export default function Dashboard({ user, onLogout }) {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, reportsRes, collectorsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/dashboard`),
        axios.get(`${API_URL}/admin/reports`),
        axios.get(`${API_URL}/admin/collectors`)
      ]);

      setStats(statsRes.data.stats);
      setReports(reportsRes.data.reports);
      setCollectors(collectorsRes.data.collectors);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    loadData();
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-left">
            <span className="logo">🗑️ Smart Garbage</span>
          </div>
          <div className="navbar-right">
            <button className="btn-icon" onClick={handleRefresh}>
              <RefreshCw size={20} />
            </button>
            <div className="user-info">
              <span>{user.name}</span>
            </div>
            <button className="btn-icon" onClick={onLogout}>
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="dashboard-header">
        <div className="container">
          <h1>Admin Portal</h1>
          <p>Manage your Smart Garbage ecosystem</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="container">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              User Management
            </button>
            <button 
              className={`tab ${activeTab === 'collectors' ? 'active' : ''}`}
              onClick={() => setActiveTab('collectors')}
            >
              Collector Management
            </button>
            <button 
              className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              Reports
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        <div className="container">
          {activeTab === 'overview' && (
            <>
              {/* Stats Grid */}
              <div className="stats-grid">
                <div className="stat-card blue">
                  <div className="stat-content">
                    <p className="stat-label">Total Users</p>
                    <h3 className="stat-value">{stats?.totalUsers || 0}</h3>
                  </div>
                  <div className="stat-icon">
                    <Users />
                  </div>
                </div>

                <div className="stat-card green">
                  <div className="stat-content">
                    <p className="stat-label">Active Collectors</p>
                    <h3 className="stat-value">{stats?.activeCollectors || 0}</h3>
                  </div>
                  <div className="stat-icon">
                    <Trash2 />
                  </div>
                </div>

                <div className="stat-card orange">
                  <div className="stat-content">
                    <p className="stat-label">Pending Reports</p>
                    <h3 className="stat-value">{stats?.pendingReports || 0}</h3>
                  </div>
                  <div className="stat-icon">
                    <Clock />
                  </div>
                </div>

                <div className="stat-card purple">
                  <div className="stat-content">
                    <p className="stat-label">Completed</p>
                    <h3 className="stat-value">{stats?.collectedReports || 0}</h3>
                  </div>
                  <div className="stat-icon">
                    <CheckCircle />
                  </div>
                </div>
              </div>

              {/* Tables */}
              <div className="tables-grid">
                {/* Collectors Table */}
                <div className="table-card">
                  <div className="table-header">
                    <h3>🚛 Top Collectors</h3>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Collector</th>
                        <th>Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collectors.slice(0, 5).map((collector) => (
                        <tr key={collector._id}>
                          <td>
                            <div className="user-cell">
                              <span className="user-name">{collector.name}</span>
                              <span className="user-email">{collector.phone}</span>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-success">
                              {collector.totalCollected} completed
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Recent Reports */}
                <div className="table-card">
                  <div className="table-header">
                    <h3>📋 Recent Reports</h3>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.slice(0, 5).map((report) => (
                        <tr key={report._id}>
                          <td>
                            <div className="user-cell">
                              <span className="user-name">{report.userName}</span>
                              <span className="user-email">{report.userPhone}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`badge badge-${report.status}`}>
                              {report.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'collectors' && (
            <div className="table-card full-width">
              <div className="table-header">
                <h3>🚛 Collector Management</h3>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Collector</th>
                    <th>Vehicle</th>
                    <th>Area</th>
                    <th>Completed</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {collectors.map((collector) => (
                    <tr key={collector._id}>
                      <td>{collector._id.slice(-6)}</td>
                      <td>
                        <div className="user-cell">
                          <span className="user-name">{collector.name}</span>
                          <span className="user-email">{collector.email}</span>
                        </div>
                      </td>
                      <td>{collector.vehicleNumber}</td>
                      <td>{collector.area}</td>
                      <td>
                        <span className="badge badge-success">
                          {collector.totalCollected} tasks
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${collector.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {collector.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="table-card full-width">
              <div className="table-header">
                <h3>📋 All Reports</h3>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Collector</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report._id}>
                      <td>{report._id.slice(-6)}</td>
                      <td>
                        <div className="user-cell">
                          <span className="user-name">{report.userName}</span>
                          <span className="user-email">{report.userPhone}</span>
                        </div>
                      </td>
                      <td>{report.location?.address?.substring(0, 30)}...</td>
                      <td>
                        <span className={`badge badge-${report.status}`}>
                          {report.status}
                        </span>
                      </td>
                      <td>{report.collectorName || '-'}</td>
                      <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}