import React, { useEffect, useState } from 'react';
import './grid.css';

const SheetGrid = ({ user = 'nautanki', sheetID = 'sheet2' }) => {
  const [cellMap, setCellMap] = useState({});

  useEffect(() => {
    fetch(`http://localhost:3000/getSheet?user=${user}&sheetID=${sheetID}`)
      .then(res => res.json())
      .then(data => {
        const map = {};
        data.data.forEach(rowObj => {
          rowObj.col.forEach(cell => {
            map[`${rowObj.row}-${cell.cell}`] = {
              value: cell.value,
              style: cell.style || {}
            };
          });
        });
        setCellMap(map);
      })
      .catch(err => console.error('Failed to fetch sheet data:', err));
  }, [user, sheetID]);

  const renderCell = (row, col) => {
    const key = `${row}-${col}`;
    const cell = cellMap[key] || {};
    const style = cell.style || {};

    return (
      <div
        key={key}
        className="grid-cell"
        contentEditable
        suppressContentEditableWarning
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(50, 100px)',
          minWidth: '50px',
          color: style.color || 'black',
          backgroundColor: style.bg || 'white',
          fontWeight: style.bold === 'true' ? 'bold' : 'normal'
        }}
      >
        {cell.value || ''}
      </div>
    );
  };

  return (
    <div className="grid-scroll-wrapper">
      <div className="grid-container">
        <div className="grid-scroll-wrapper">
        {[...Array(50)].map((_, row) => (
            
                <div className="grid-row" key={row}>
                    {[...Array(100)].map((_, col) => renderCell(row, col))}
                </div>
            
        ))}
        </div>
      </div>
    </div>
  );
  
};

export default SheetGrid;
