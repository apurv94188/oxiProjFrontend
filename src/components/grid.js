import React, { useEffect, useState, useRef } from 'react';
import './grid.css';

const SheetGrid = ({ user = 'nautanki', sheetID = 'sheet2' }) => {
  const [cellMap, setCellMap] = useState({});
  const [colWidths, setColWidths] = useState(() => Array(100).fill(100));
  const [rowHeights, setRowHeights] = useState(() => Array(500).fill(30));
  const [contextMenu, setContextMenu] = useState(null);
  const cellRefs = useRef({});

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => {
      window.removeEventListener('click', closeMenu);
    };
  }, []);

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

  
  const handleCellEdit = async ({ row, col, newValue, cellRef, style}) => {
    const key = `${row}-${col}`;
    cellMap[key] = cellMap[key] || {value:'',style:{}}
    const prevCellValue = cellMap[key].value;
    console.log('changed value', style);
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
          style: style || {}
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


  
  const updateCellStyle = async (prop, style) => {
    console.log('updating style', prop, style, contextMenu);
    const {row, col} = contextMenu;
    const key = `${row}-${col}`;
    cellMap[key] = cellMap[key] || {value:'',style:{}}
    //const prevCellStyle = cellMap[key].style;
    try{
      const response = await fetch('http://localhost:3000/api/updateCell', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: 'nautanki',
          sheetID: 'sheet2',
          row,
          cell: col,
          value: cellMap[key].value,
          style: style || {}
        }),
      });
      const result = await response.json();
      if (result.success) {
        setCellMap(prev => {
        const existing = prev[key]  || {value:'', style: {} };
        return {
          ...prev,
          [key]: {
            ...existing,
            style: {
              ...existing.style,
              [prop]: style
            }
          }
        };
      });
      } else {
        console.warn('Cell not updated — check row/col values. Rolling back to',cellMap[key].value);
        
      }
      
     
    } catch (err) {
      console.error('Failed to update cell:', err);
      // if (cellRef.current) {
      //   cellRef.current.innerText = prevCellValue || '';
      // }
    }
    setContextMenu(null);
  }
  

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
            style: style
          })
        }
        
        onContextMenu = {(e) => {
          e.preventDefault();
          setContextMenu({
            x: e.clientX,
            y: e.clientY,
            row,
            col
          });
        }}

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
          {[...Array(7)].map((_, row) => (
              
            <div className="grid-row" key={row}>
              {[...Array(5)].map((_, col) => renderCell(row, col))}
            </div>
              
          ))}
        </div>
      </div>
      {contextMenu && (
        <div
          style = {{
            position: 'absolute',
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            padding: '10px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            zIndex: 1000,
          }}
          onClick={() => setContextMenu(null)}
        >
          <div onClick={() => updateCellStyle('bold', 'true')}>Toggle Bold</div>
          <div onClick={() => updateCellStyle('italic', 'true')}>Toggle Italic</div>
          <div onClick={() => updateCellStyle('bg', 'yellow')}>Set Background Yellow</div>
          <div onClick={() => updateCellStyle('font-color', 'red')}>Set Font Color Red</div>  
        </div>
      )}
    </div>

    
  );
  
};

export default SheetGrid;
