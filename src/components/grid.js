import React, { useEffect, useState, useRef } from 'react';
import './grid.css';

const SheetGrid = ({ user = 'nautanki', sheetID = 'sheet2' }) => {
  const [cellMap, setCellMap] = useState({});
  const [colWidths, setColWidths] = useState(() => Array(100).fill(100));
  const [rowHeights, setRowHeights] = useState(() => Array(500).fill(30));
  const cellRefs = useRef({});

  useEffect(() => {
    fetch(`http://localhost:3000/getSheet?user=${user}&sheetID=${sheetID}`)
      .then(res => res.json())
      .then(data => {
        const cellMap = {};
        data.data.forEach(rowObj => {
          rowObj.col.forEach(cell => {
            console.log(cell.value)
            cellMap[`${rowObj.row}-${cell.cell}`] = {
              value: cell.value,
              style: cell.style || {}
            };
          });
        });
        setCellMap(cellMap);
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
  

  const handleColumnResize = (index, e) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startWidth = colWidths[index];

    const onMouseMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.max(startWidth + delta, 40);
      setColWidths(prev => {
        const updated = [...prev];
        updated[index] = newWidth;
        return updated;
      });
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };


  
  const handleRowResize = (index, e) => {
    e.preventDefault();
    e.stopPropagation();

    const startY = e.clientY;
    const startHeight = rowHeights[index];

    const onMouseMove = (moveEvent) => {
      const delta = moveEvent.clientY - startY;
      const newHeight = Math.max(startHeight + delta, 20);
      setRowHeights(prev => {
        const updated = [...prev];
        updated[index] = newHeight;
        return updated;
      });
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
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
        ref={cellRefs.current[key]}
        className="grid-cell"
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) =>
          handleCellEdit({
            row,
            col,
            newValue: e.target.innerText,
            cellRef: cellRefs.current[key],
          })
        }
        style={{
          width: colWidths[col] || 100,
          height: rowHeights[row] || 30,
          color: style['font-color'] || 'black',
          backgroundColor: style.bg || 'white',
          fontWeight: style.bold === 'true' ? 'bold' : 'normal',
          textAlign: style.align || 'left',
          fontSize: style.size ? `${style.size}px` : '14px',
          border: '1px solid #ccc',
          padding: '5px',
          boxSizing: 'border-box',
          overflowWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          position: 'relative', // needed for resizers
        }}
      >
        {cell.value || ''}

        {/* COLUMN RESIZER */}
        {col < colWidths.length - 1 && (
          <div
            onMouseDown={(e) => handleColumnResize(col, e)}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '50px',
              height: '100%',
              cursor: 'col-resize',
              zIndex: 1,
            }}
          />
        )}

        {/* ROW RESIZER */}
        {row < rowHeights.length - 1 && (
          <div
            onMouseDown={(e) => handleRowResize(row, e)}
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              width: '100%',
              height: '50px',
              cursor: 'row-resize',
              zIndex: 2,
            }}
          />
        )}
      </div>
    );
  };



  return (
    <div className="grid-scroll-wrapper">
      <div className="grid-container">
        <div className="grid-scroll-wrapper">
          {[...Array(50)].map((_, row) => (
              
            <div className="grid-row" key={row}>
              {[...Array(50)].map((_, col) => renderCell(row, col))}
            </div>
              
          ))}
        </div>
      </div>
    </div>
  );
  
};

export default SheetGrid;
