import React, { useState } from "react";

export default function DropdownComponent({ options, onChange }) {

    const [selectedOption, setSelectedOption] = useState("protoLong");

    const handleOptionChange = (event) => {
        const newSelectedOption = event.target.value;
        setSelectedOption(newSelectedOption);
        onChange(newSelectedOption);
    };

    return (
        <div className="relative w-full lg:max-w-sm">
        <select
            className="w-full p-2.5 text-gray-500 bg-white border rounded-md shadow-sm outline-none appearance-none focus:border-indigo-600"
            value={selectedOption}
            onChange={handleOptionChange}
        >
            {options.map((option) => (
            <option key={option.value} value={option.value}>
                {option.label}
            </option>
            ))}
        </select>
        </div>
    );
}
