import React, { useEffect, useState } from 'react';
import './DynamicTable.css';

const DynamicTable = () => {
  const [tableData, setTableData] = useState([]);
  const [docId, setDocId] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/gettable')
      .then(res => res.json())
      .then(data => {
        setTableData(data[0].data || []);
        setDocId(data[0]._id); // MongoDB _id for updates
      });
  }, []);

  const handleBlur = async (e, row, col) => {
    const newValue = e.target.innerText;
    
    await fetch('http://localhost:3000/updatedSheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: docId, row, col, newValue })
    });
  };

  return (
    <div id="table-container">
      {tableData.map((rowObj, rowIndex) => (
        <div className="table-row" key={rowIndex}>
          {rowObj.cell.map((cell, colIndex) => {
            const style = cell.style || {};
            return (
              <div
                key={colIndex}
                className="table-cell"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleBlur(e, rowObj.row, cell.col)}
                style={{
                  color: style.color || 'black',
                  backgroundColor: style.bg || 'white',
                  fontWeight: style.bold === 'true' ? 'bold' : 'normal'
                }}
              >
                {cell.value}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default DynamicTable;
