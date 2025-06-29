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
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Upload CSV or Excel File</h1>
      <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} className="mb-6" />

      {tableData && columns.length > 0 && (
        <>
          {/* Data Table */}
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full border border-white border-collapse">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="border border-white px-3 py-1 text-left">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, idx) => (
                  <tr key={idx}>
                    {columns.map((col) => (
                      <td key={col} className="border border-white px-3 py-1">
                        {row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Rule Input UI */}
          <div className="mt-10 w-full max-w-2xl bg-zinc-900 p-4 rounded-xl text-white">
            <h2 className="text-lg font-bold mb-4">Define Business Rules</h2>

            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <select
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
                className="p-2 bg-zinc-800 border border-zinc-700 rounded"
              >
                <option value="">Select Column</option>
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>

              <select
                value={selectedOperator}
                onChange={(e) => setSelectedOperator(e.target.value)}
                className="p-2 bg-zinc-800 border border-zinc-700 rounded"
              >
                <option value="">Select Operator</option>
                <option value="==">=</option>
                <option value="!=">≠</option>
                <option value=">">&gt;</option>
                <option value="<">&lt;</option>
                <option value=">=">&ge;</option>
                <option value="<=">&le;</option>
              </select>

              <input
                type="text"
                placeholder="Value"
                value={ruleValue}
                onChange={(e) => setRuleValue(e.target.value)}
                className="p-2 bg-zinc-800 border border-zinc-700 rounded text-white"
              />

              <button
                onClick={addRule}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
              >
                Add Rule
              </button>
            </div>

            {rules.length > 0 && (
              <ul className="list-disc pl-6">
                {rules.map((rule, index) => (
                  <li key={index}>
                    {rule.column} {rule.operator} {rule.value}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
