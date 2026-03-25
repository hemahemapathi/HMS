import './AdminLoading.css';

const AdminLoading = () => {
  return (
    <div className="admin-loading-container">
      <div className="admin-loading-content">
        <div className="admin-loading-spinner">
          <div className="admin-loading-ring"></div>
          <div className="admin-loading-ring"></div>
          <div className="admin-loading-ring"></div>
        </div>
        <h4 className="admin-loading-text">Loading Admin Portal...</h4>
        <p className="admin-loading-subtitle">Please wait while we prepare your dashboard</p>
      </div>
    </div>
  );
};

export default AdminLoading;