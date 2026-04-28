import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CustomSelect = ({ value, onChange, options = [], className = "", icon: Icon, align = "left" }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(option => option.value === value);
  const containerRef = useRef(null);

  const handleToggle = (e) => {
    e.preventDefault(); // Prevent any form submission or unexpected behavior
    setIsOpen(!isOpen);
  };

  const handleSelect = (selectedValue) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`custom-select-container ${className} align-${align}`} ref={containerRef}>
      <button
        type="button"
        className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="trigger-content">
          {Icon && <Icon size={18} className="trigger-icon" />}
          <span className="truncate">{selectedOption ? selectedOption.label : t('common.select')}</span>
        </div>
        <ChevronDown size={16} className={`chevron ${isOpen ? 'rotate' : ''}`} />
      </button>
      {isOpen && (
        <div className={`custom-select-options align-${align}`} role="listbox">
          {options.map(option => (
            <div
              key={option.value}
              className={`custom-select-option ${option.value === value ? 'selected' : ''}`}
              onClick={() => handleSelect(option.value)}
              role="option"
              aria-selected={option.value === value}
            >
              <span className="option-label">{option.label}</span>
              {option.value === value && <div className="selected-indicator" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
