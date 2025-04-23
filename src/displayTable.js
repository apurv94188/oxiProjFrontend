// App.jsx
import React, { useState } from 'react';

const Table = () => {
  const [tableData, setTableData] = useState([]);

  const handleFileUpload = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(reader.result, 'text/xml');
      const rows = Array.from(xmlDoc.getElementsByTagName('row')).map(row => {
        return Array.from(row.getElementsByTagName('cell')).map(cell => {
          const value = cell.textContent;
          const style = {
            color: cell.getAttribute('color') || 'black',
            fontWeight: cell.getAttribute('bold') === 'true' ? 'bold' : 'normal',
            fontStyle: cell.getAttribute('italic') === 'true' ? 'italic' : 'normal',
            backgroundColor: cell.getAttribute('bg') || 'transparent'
          };
          return { value, style };
        });
      });
      setTableData(rows);
    };
    reader.readAsText(e.target.files[0]);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>XML Table Formatter</h2>
      <input type="file" accept=".xml" onChange={handleFileUpload} />
      <table border="1" cellPadding="10" style={{ marginTop: 20 }}>
        <tbody>
          {tableData.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={cell.style}>{cell.value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
