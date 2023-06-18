import React from 'react';

const DataForm = ({ buttonName, dates, handleChange, handleSubmit }) => {

    return (
        <div className="p-3 h-1/6 flex flex-wrap items-center border-2 shadow rounded-md">
            <form onSubmit={handleSubmit} className="flex flex-wrap w-full">
                <div className="flex items-center mb-2 justify-between w-full lg:w-1/2">
                    <label className="mr-4">From</label>
                    <input type="datetime-local" className="border border-gray-400 px-2 py-1 w-full" name="fromDate" value={dates.fromDate} onChange={handleChange} />
                </div>
                <div className="flex items-center mb-2 justify-between w-full lg:w-1/2">
                    <label className="mr-2 ml-2">to</label>
                    <input type="datetime-local" className="border border-gray-400 px-2 py-1 w-full flex-grow" name="toDate" value={dates.toDate} onChange={handleChange} />
                </div>
                <div className="flex justify-center w-full">
                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded mt-4">{buttonName}</button>
                </div>
            </form>
        </div>
    );
}

export default DataForm;