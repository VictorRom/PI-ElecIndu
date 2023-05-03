import { useState } from "react";

const RangeSlider = () => {
    const [value, setValue] = useState(0);

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <div className="w-full py-2">
      <div className="relative pt-1">
        <input
          type="range"
          min="0"
          max="23"
          step="1"
          value={value}
          onChange={handleChange}
          className="w-full h-3 bg-gray-300 rounded appearance-none"
        />
        {Array.from(Array(23), (_, index) => (
          <div
            key={index}
            className={`absolute pb-8 top-0 h-3 w-3 rounded-full transition-all duration-300 ${
              value >= index ? "bg-indigo-500" : "bg-gray-300"
            }`}
            style={{ left: `${(index / 23) * 100}%` }}
          >
            <div className='text-xs text-gray-500 -mt-4'>{index}h</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RangeSlider;

