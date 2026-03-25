import { useState } from 'react';

const TimePickerModal = ({ isOpen, onClose, value, onChange, title }) => {
  const [selectedHour, setSelectedHour] = useState(value ? value.split(':')[0] : '09');
  const [selectedMinute, setSelectedMinute] = useState(value ? value.split(':')[1] : '00');

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  const handleConfirm = () => {
    onChange(`${selectedHour}:${selectedMinute}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block d-flex align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
      <div className="modal-dialog mx-auto" style={{ maxWidth: '320px' }}>
        <div className="modal-content">
          <div className="modal-header py-2 px-3">
            <span className="modal-title" style={{ fontSize: '16px', fontWeight: '600' }}>{title}</span>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body p-3">
            <div className="d-flex justify-content-center gap-3">
              <div className="text-center">
                <label className="form-label small">Hour</label>
                <select 
                  className="form-select form-select-sm"
                  value={selectedHour}
                  onChange={(e) => setSelectedHour(e.target.value)}
                  style={{ width: '80px' }}
                >
                  {hours.map(hour => (
                    <option key={hour} value={hour}>{hour}</option>
                  ))}
                </select>
              </div>
              <div className="align-self-end pb-2">
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>:</span>
              </div>
              <div className="text-center">
                <label className="form-label small">Minute</label>
                <select 
                  className="form-select form-select-sm"
                  value={selectedMinute}
                  onChange={(e) => setSelectedMinute(e.target.value)}
                  style={{ width: '80px' }}
                >
                  {minutes.map(minute => (
                    <option key={minute} value={minute}>{minute}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer py-2 px-3">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button type="button" className="btn btn-danger btn-sm" onClick={handleConfirm}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimePickerModal;