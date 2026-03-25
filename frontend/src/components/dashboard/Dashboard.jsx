import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Loading from '../loading/Loading';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/profile');
        setUser(response.data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h2 className="text-danger mb-4">Dashboard</h2>
              {user && (
                <div className="row">
                  <div className="col-md-6">
                    <h5>Welcome, {user.name}!</h5>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;