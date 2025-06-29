'use client';
import { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export default function UploadPage() {
  const [tableData, setTableData] = useState<Record<string, any>[] | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [selectedOperator, setSelectedOperator] = useState("");
  const [ruleValue, setRuleValue] = useState("");
  const [rules, setRules] = useState<
    { column: string; operator: string; value: string }[]
  >([]);

  const addRule = () => {
    if (!selectedColumn || !selectedOperator || !ruleValue) return;
    const newRule = { column: selectedColumn, operator: selectedOperator, value: ruleValue };
    setRules((prev) => [...prev, newRule]);
    setSelectedColumn("");
    setSelectedOperator("");
    setRuleValue("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const data = event.target?.result;
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'csv') {
        const parsed = Papa.parse<Record<string, any>>(data as string, {
          header: true,
          skipEmptyLines: true,
        });
        setTableData(parsed.data);
        const cols = parsed.data.length > 0 ? Object.keys(parsed.data[0]) : [];
        setColumns(cols);
      } else if (['xlsx', 'xls'].includes(fileExtension!)) {
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });
        setTableData(jsonData);
        const cols = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
        setColumns(cols);
      } else {
        alert('Unsupported file type!');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
  <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4">
    <h1 className="text-3xl font-bold mb-6">Upload CSV or Excel File</h1>

    {/* Upload Button Styled */}
    <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl text-white font-semibold transition duration-200">
      Choose File
      <input
        type="file"
        accept=".csv, .xlsx, .xls"
        onChange={handleFileUpload}
        className="hidden"
      />
    </label>

    {/* Show filename if uploaded */}
    {tableData && (
      <p className="mt-2 text-green-400 text-sm italic">File uploaded successfully</p>
    )}

    {tableData && columns.length > 0 && (
      <>
        {/* Data Table */}
        <div className="overflow-x-auto mt-10">
          <table className="min-w-full border border-white border-collapse">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col} className="border border-white px-3 py-1 text-left">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, idx) => (
                <tr key={idx}>
                  {columns.map((col) => (
                    <td key={col} className="border border-white px-3 py-1">{row[col]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rule Input UI (same as before) */}
        {/* ...Your Rule UI code... */}
      </>
    )}
  </div>
);

}
