// ExcelGridWithXmlStyles.jsx
import React, { useState } from 'react';
import './grid.css';

const ExcelGridWithXmlStyles = () => {
  const [data, setData] = useState([]);
  const [fileName, setFileName] = useState('styled-grid.xml');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(reader.result, 'text/xml');

      const rows = Array.from(xmlDoc.getElementsByTagName('row')).map(row =>
        Array.from(row.getElementsByTagName('cell')).map(cell => ({
          value: cell.textContent,
          style: {
            color: cell.getAttribute('color') || 'black',
            backgroundColor: cell.getAttribute('bg') || 'white',
            fontWeight: cell.getAttribute('bold') === 'true' ? 'bold' : 'normal',
            fontStyle: cell.getAttribute('italic') === 'true' ? 'italic' : 'normal',
          }
        }))
      );

      setData(rows);
    };
    reader.readAsText(file);
  };

  const handleChange = (rowIdx, colIdx, newText) => {
    const updated = [...data];
    updated[rowIdx][colIdx].value = newText;
    setData(updated);
  };

  const downloadAsXml = () => {
    let xmlString = `<table>\n`;
    data.forEach(row => {
      xmlString += `  <row>\n`;
      row.forEach(cell => {
        const { color, backgroundColor, fontWeight, fontStyle } = cell.style;
        const bold = fontWeight === 'bold' ? 'true' : 'false';
        const italic = fontStyle === 'italic' ? 'true' : 'false';
        xmlString += `    <cell color="${color}" bold="${bold}" italic="${italic}" bg="${backgroundColor}">${cell.value}</cell>\n`;
      });
      xmlString += `  </row>\n`;
    });
    xmlString += `</table>`;

    const blob = new Blob([xmlString], { type: 'application/xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: 20 }}>
      <div className="toolbar">
        <input type="file" accept=".xml" onChange={handleFileUpload} />
        <button onClick={downloadAsXml}>Save</button>
      </div>

      <div className="grid-container" style={{ marginTop: 20 }}>
        {data.map((row, rowIdx) => (
          <div className="grid-row" key={rowIdx}>
            {row.map((cell, colIdx) => (
              <div
                className="grid-cell"
                key={colIdx}
                contentEditable
                suppressContentEditableWarning
                style={cell.style}
                onBlur={(e) => handleChange(rowIdx, colIdx, e.target.textContent)}
              >
                {cell.value}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExcelGridWithXmlStyles;
