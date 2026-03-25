import { AlertCircle, Clock, Mail } from 'lucide-react';

const PendingApproval = ({ user, onLogout }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'white',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '4rem 2rem 2rem',
      overflow: 'hidden'
    }}>
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          background: '#f3f4f6',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <Clock size={30} style={{ color: '#6b7280' }} />
        </div>
        
        <h2 style={{ color: '#111827', marginBottom: '0.75rem', fontSize: '1.5rem' }}>
          Account Pending Approval
        </h2>
        
        <p style={{ color: '#6b7280', marginBottom: '1rem', lineHeight: '1.6' }}>
          Hello <strong>{user?.name}</strong>, your doctor account has been registered successfully 
          but is currently pending admin approval.
        </p>
        
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <AlertCircle size={18} style={{ color: '#6b7280' }} />
            <strong style={{ color: '#374151' }}>What happens next?</strong>
          </div>
          <ul style={{ 
            textAlign: 'left', 
            color: '#6b7280', 
            paddingLeft: '1rem',
            margin: 0,
            lineHeight: '1.6'
          }}>
            <li>An admin will review your registration</li>
            <li>You'll receive an email once approved</li>
            <li>Then you can access the full doctor portal</li>
          </ul>
        </div>
        
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '0.75rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Mail size={18} style={{ color: '#6b7280' }} />
          <span style={{ color: '#374151', fontSize: '0.85rem' }}>
            Registered email: <strong>{user?.email}</strong>
          </span>
        </div>
        
        <button
          onClick={() => {
            localStorage.removeItem('pendingUser');
            window.location.href = '/login';
          }}
          style={{
            background: '#0ea5e9',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            cursor: 'pointer',
            marginRight: '0.5rem',
            transition: 'background 0.2s'
          }}
        >
          Try Login Again
        </button>
        
        <button
          onClick={onLogout}
          style={{
            background: '#111827',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#374151'}
          onMouseOut={(e) => e.target.style.background = '#111827'}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default PendingApproval;