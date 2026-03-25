import { useState, useEffect } from 'react';
import { DollarSign, CreditCard, FileText, TrendingUp, AlertCircle, Download } from 'lucide-react';
import AdminLoading from '../../../components/loading/AdminLoading';
import '../../../styles/admin-theme.css';

const AdminBilling = () => {
  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState({
    financialSummary: {
      totalRevenue: 2450000,
      pendingClaims: 125000,
      processedPayments: 2325000,
      outstandingBalance: 89000
    },
    recentTransactions: [],
    claimsStatus: {
      approved: 245,
      pending: 67,
      rejected: 12
    }
  });

  useEffect(() => {
    setTimeout(() => {
      setBillingData(prev => ({
        ...prev,
        recentTransactions: [
          { id: 1, patient: 'John Smith', amount: 1250, status: 'paid', date: '2024-12-05', type: 'consultation' },
          { id: 2, patient: 'Maria Garcia', amount: 2800, status: 'pending', date: '2024-12-04', type: 'surgery' },
          { id: 3, patient: 'David Wilson', amount: 450, status: 'paid', date: '2024-12-04', type: 'checkup' },
          { id: 4, patient: 'Sarah Johnson', amount: 3200, status: 'processing', date: '2024-12-03', type: 'treatment' }
        ]
      }));
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <AdminLoading />;

  return (
    <div className="admin-portal">
      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12 d-flex justify-content-between align-items-center">
            <div>
              <h2 className="admin-text-primary mb-1">Billing & Financial Management</h2>
              <p className="text-muted">Claims processing, payments, and financial reports</p>
            </div>
            <button className="btn admin-btn-primary">
              <Download size={16} className="me-2" />
              Export Financial Report
            </button>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="row g-4 mb-4">
          <div className="col-md-6 col-lg-3">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <DollarSign />
              </div>
              <h3 className="admin-text-primary">${(billingData.financialSummary.totalRevenue / 1000).toFixed(0)}K</h3>
              <p className="text-muted mb-0">Total Revenue</p>
            </div>
          </div>
          
          <div className="col-md-6 col-lg-3">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <FileText />
              </div>
              <h3 className="admin-text-primary">${(billingData.financialSummary.pendingClaims / 1000).toFixed(0)}K</h3>
              <p className="text-muted mb-0">Pending Claims</p>
            </div>
          </div>
          
          <div className="col-md-6 col-lg-3">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <CreditCard />
              </div>
              <h3 className="admin-text-primary">${(billingData.financialSummary.processedPayments / 1000).toFixed(0)}K</h3>
              <p className="text-muted mb-0">Processed Payments</p>
            </div>
          </div>
          
          <div className="col-md-6 col-lg-3">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <AlertCircle />
              </div>
              <h3 className="admin-text-primary">${(billingData.financialSummary.outstandingBalance / 1000).toFixed(0)}K</h3>
              <p className="text-muted mb-0">Outstanding Balance</p>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Claims Status */}
          <div className="col-lg-4">
            <div className="admin-card h-100">
              <div className="card-header bg-white border-0">
                <h6 className="mb-0 admin-text-primary">Claims Status Overview</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Approved Claims</span>
                    <span className="text-success fw-bold">{billingData.claimsStatus.approved}</span>
                  </div>
                  <div className="progress">
                    <div className="progress-bar bg-success" style={{width: '75%'}}></div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Pending Claims</span>
                    <span className="text-warning fw-bold">{billingData.claimsStatus.pending}</span>
                  </div>
                  <div className="progress">
                    <div className="progress-bar bg-warning" style={{width: '20%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Rejected Claims</span>
                    <span className="text-danger fw-bold">{billingData.claimsStatus.rejected}</span>
                  </div>
                  <div className="progress">
                    <div className="progress-bar bg-danger" style={{width: '5%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="col-lg-8">
            <div className="admin-card h-100">
              <div className="card-header bg-white border-0">
                <h6 className="mb-0 admin-text-primary">Recent Transactions</h6>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table admin-table mb-0">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Amount</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingData.recentTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td>{transaction.patient}</td>
                          <td className="fw-bold">${transaction.amount}</td>
                          <td>
                            <span className="admin-badge-light">{transaction.type}</span>
                          </td>
                          <td>{transaction.date}</td>
                          <td>
                            <span className={`badge ${
                              transaction.status === 'paid' ? 'bg-success' :
                              transaction.status === 'pending' ? 'bg-warning' :
                              'bg-info'
                            }`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm admin-btn-outline">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Reports */}
          <div className="col-12">
            <div className="admin-card">
              <div className="card-header bg-white border-0">
                <h6 className="mb-0 admin-text-primary">Financial Reports & Analytics</h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-3">
                    <button className="btn admin-btn-outline w-100 d-flex flex-column align-items-center py-3">
                      <TrendingUp size={24} className="mb-2" />
                      <span>Revenue Report</span>
                    </button>
                  </div>
                  <div className="col-md-3">
                    <button className="btn admin-btn-outline w-100 d-flex flex-column align-items-center py-3">
                      <FileText size={24} className="mb-2" />
                      <span>Claims Report</span>
                    </button>
                  </div>
                  <div className="col-md-3">
                    <button className="btn admin-btn-outline w-100 d-flex flex-column align-items-center py-3">
                      <CreditCard size={24} className="mb-2" />
                      <span>Payment Report</span>
                    </button>
                  </div>
                  <div className="col-md-3">
                    <button className="btn admin-btn-outline w-100 d-flex flex-column align-items-center py-3">
                      <DollarSign size={24} className="mb-2" />
                      <span>Financial Summary</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBilling;