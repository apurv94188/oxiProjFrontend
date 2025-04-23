import React, { useEffect, useState } from 'react';
import './grid.css';

const Grid = () => {
  const [cellMap, setCellMap] = useState({});

  useEffect(() => {
    fetch('http://localhost:3000/gettable')
      .then(res => res.json())
      .then(data => {
        const map = {};
        data.forEach(({ row, col, value, style }) => {
          map[`${row}-${col}`] = { value, style };
        });
        setCellMap(map);
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

  const renderCell = (row, col) => {
    const key = `${row}-${col}`;
    const cell = cellMap[key] || {};
    const style = cell.style || {};

    return (
      <div
        key={col}
        className="grid-cell"
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => handleBlur(e, rowObj.row, cell.col)}
        style={{
          color: style.color || 'black',
          backgroundColor: style.bg || 'white',
          fontWeight: style.bold === 'true' ? 'bold' : 'normal',
        }}
      >
        {cell.value || ''}
      </div>
    );
  };

  return (
    <div className="grid-container">
      {[...Array(20)].map((_, row) => (
        <div className="grid-row" key={row}>
          {[...Array(20)].map((_, col) => renderCell(row, col))}
        </div>
      ))}
    </div>
  );
};

export default Grid;
