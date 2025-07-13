import React, { useEffect, useState, useRef } from 'react';
import './grid.css';

const SheetGrid = ({ user = 'nautanki', sheetID = 'sheet2' }) => {
  const [cellMap, setCellMap] = useState({});
  const cellRefs = useRef({});

  useEffect(() => {
    fetch(`http://localhost:3000/getSheet?user=${user}&sheetID=${sheetID}`)
      .then(res => res.json())
      .then(data => {
        const map = {};
        data.data.forEach(rowObj => {
          rowObj.col.forEach(cell => {
            console.log(cell.value)
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

  
  const handleCellEdit = async ({ row, col, newValue, cellRef }) => {
    const key = `${row}-${col}`;
    cellMap[key] = cellMap[key] || {value:'',style:{}}
    const prevCellValue = cellMap[key].value;

    if (cellMap[key].value === newValue) {
      return
    }
    
    try {
      const response = await fetch('http://localhost:3000/api/updateCell', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: 'nautanki',
          sheetID: 'sheet2',
          row,
          cell: col,
          value: newValue,
        }),
      });
  
      const result = await response.json();
      if (result.success) {
        setCellMap(prevMap => ({
          ...prevMap,
          [key]: {
            ...prevMap[key],
            value: newValue
          }
        }))
      } else {
        console.warn('Cell not updated — check row/col values. Rolling back to',cellMap[key].value);
        if (cellRef.current) {
          cellRef.current.innerText = prevCellValue || '';
        }
      }
    } catch (err) {
      console.error('Failed to update cell:', err);
      if (cellRef.current) {
        cellRef.current.innerText = prevCellValue || '';
      }
    }
  };
  

  const renderCell = (row, col) => {
    const key = `${row}-${col}`;
    const cell = cellMap[key] || {};
    const style = cell.style || {};

    if (!cellRefs.current[key]) {
      cellRefs.current[key] = React.createRef();
    }

    return (
      <div
        key={key}
        ref = {cellRefs.current[key]}
        className="grid-cell"
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => handleCellEdit({ row, col, newValue: e.target.innerText, cellRef: cellRefs.current[key] })}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(50, 100px)',
          minWidth: '75px',
          color: style.color || 'black',
          backgroundColor: style.bg || 'white',
          fontWeight: style.bold === 'true' ? 'bold' : 'normal',
          textAlign: style.align || 'left',
          fontSize: style.size ? `${style.size}px` : '14px',
          border: '1px solid #ccc',
          padding: '5px',
          boxSizing: 'border-box',
          overflowWrap: 'break-word',
          whiteSpace: 'pre-wrap'
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
