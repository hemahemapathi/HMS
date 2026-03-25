import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const MobileSelect = ({ options, value, onChange, placeholder = "Select option", disabled = false }) => {
  const [showModal, setShowModal] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (optionValue) => {
    if (!disabled) {
      onChange(optionValue);
      setShowModal(false);
    }
  };

  return (
    <>
      {/* Mobile Button */}
      <div className="d-md-none">
        <button
          type="button"
          className={`form-control text-start d-flex justify-content-between align-items-center ${disabled ? 'disabled' : ''}`}
          onClick={() => !disabled && setShowModal(true)}
          disabled={disabled}
        >
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Desktop Select */}
      <div className="d-none d-md-block">
        <select 
          className="form-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile Modal */}
      {showModal && !disabled && (
        <div className="modal show d-block d-flex align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
          <div className="modal-dialog mx-auto" style={{ maxWidth: '300px', fontSize: '14px' }}>
            <div className="modal-content" style={{ fontSize: '14px' }}>
              <div className="modal-header py-2 px-3">
                <span className="modal-title" style={{ fontSize: '16px', fontWeight: '600' }}>Select Option</span>
                <button 
                  type="button" 
                  className="btn-close" 
                  style={{ fontSize: '12px', width: '20px', height: '20px' }}
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body p-0">
                {options.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    className={`btn w-100 text-start border-0 ${value === option.value ? 'bg-danger text-white' : 'btn-light'}`}
                    style={{ padding: '12px 16px', fontSize: '14px' }}
                    onClick={() => handleSelect(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileSelect;