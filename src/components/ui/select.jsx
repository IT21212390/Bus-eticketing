import React, { useState, useRef, useEffect } from 'react';

export const Select = ({ options, onValueChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    setSelectedOption(option);
    onValueChange(option.id);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={selectRef}>
      <div
        className="px-3 py-2 border rounded cursor-pointer bg-white flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption ? selectedOption.name : placeholder}</span>
        <span className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-auto">
          {options.map(option => (
            <div
              key={option.id}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelect(option)}
            >
              {option.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;