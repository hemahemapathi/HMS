import { useState, useEffect } from 'react';
import { FileText, Calendar, User, Clock } from 'lucide-react';
import api from '../../utils/api';

const PatientNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await api.get('/appointments');
      const appointments = response.data.appointments || [];
      
      // Filter completed appointments with notes
      const notesData = appointments
        .filter(apt => apt.status === 'completed' && apt.notes)
        .map(apt => ({
          id: apt._id,
          message: apt.notes,
          doctorName: apt.doctor?.name || 'Unknown Doctor',
          doctorSpecialization: apt.doctor?.specialization || '',
          date: apt.date,
          time: apt.time,
          createdAt: apt.updatedAt || apt.createdAt
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setNotes(notesData);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="text-danger mb-1">My Notes</h2>
          <p className="text-muted">Consultation notes from your doctors</p>
        </div>
      </div>

      <div className="row">
        {notes.length > 0 ? (
          notes.map(note => (
            <div key={note.id} className="col-12 mb-4">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <div className="d-flex align-items-start mb-3">
                    <div className="me-3 text-danger" style={{ fontSize: '2rem' }}>
                      📝
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="card-title text-danger mb-1">
                        Consultation Notes
                      </h6>
                      <div className="d-flex flex-wrap gap-3 mb-2">
                        <div className="d-flex align-items-center text-muted small">
                          <User size={14} className="me-1" />
                          <span>Dr. {note.doctorName}</span>
                        </div>
                        <div className="d-flex align-items-center text-muted small">
                          <span className="badge bg-light text-dark">{note.doctorSpecialization}</span>
                        </div>
                        <div className="d-flex align-items-center text-muted small">
                          <Calendar size={14} className="me-1" />
                          <span>{new Date(note.date).toLocaleDateString()}</span>
                        </div>
                        <div className="d-flex align-items-center text-muted small">
                          <Clock size={14} className="me-1" />
                          <span>{note.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-light p-3 rounded">
                    <p className="mb-0">{note.message}</p>
                  </div>
                  
                  <div className="mt-2 text-end">
                    <small className="text-muted">
                      Added on {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString()}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="text-center py-5">
              <FileText size={64} className="text-muted mb-3" />
              <h5 className="text-muted">No notes available</h5>
              <p className="text-muted">
                Your consultation notes will appear here after appointments
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientNotes;