import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { Workbook } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css";
import debounce from "lodash/debounce";
import { 
  FileSpreadsheet, ArrowLeft, PlusCircle, Trash2, Download, Upload, 
  FileText, CheckCircle2, AlertTriangle, X
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

export default function ProjectSpreadsheet({ projectId, onClose }) {
  const [sheetsList, setSheetsList] = useState([]);
  const [currentSheet, setCurrentSheet] = useState(null);
  const [sheetNameInput, setSheetNameInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" | "editor"
  const [toast, setToast] = useState({ open: false, msg: "", sev: "success" });

  const currentSheetRef = useRef(null);
  const workbookDataRef = useRef([]);
  const lastSavedDataRef = useRef("");

  // FortuneSheet workbook data
  const [workbookData, setWorkbookData] = useState([]);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

  const showToast = (msg, sev = "success") => {
    setToast({ open: true, msg, sev });
    setTimeout(() => setToast({ open: false, msg: "", sev: "success" }), 3000);
  };

  const fetchSheets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/sheets/project/${projectId}`, getHeaders());
      setSheetsList(res.data || []);
    } catch (err) {
      console.error(err);
      showToast("Failed to load project spreadsheets.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheets();
  }, [projectId]);

  // Converter to FortuneSheet format from old schemas (for backward compatibility)
  const convertToFortuneSheet = (sheet) => {
    if (sheet.metadata?.workbookData) {
      return sheet.metadata.workbookData;
    }
    const columns = sheet.columns || [];
    const rows = sheet.rows || [];
    
    const dataRow = [];
    rows.forEach((r, ri) => {
      const rowCells = [];
      columns.forEach((c, ci) => {
        const cellVal = r[c];
        const val = typeof cellVal === "object" ? cellVal.value : cellVal || "";
        const cellObj = {
          v: val,
          m: String(val),
        };
        if (typeof cellVal === "object") {
          if (cellVal.bold) cellObj.bl = 1;
          if (cellVal.italic) cellObj.it = 1;
          if (cellVal.underline) cellObj.un = 1;
          if (cellVal.color) cellObj.fc = cellVal.color;
          if (cellVal.bg) cellObj.bg = cellVal.bg;
          if (cellVal.align) {
            if (cellVal.align === "left") cellObj.ht = 1;
            else if (cellVal.align === "center") cellObj.ht = 0;
            else if (cellVal.align === "right") cellObj.ht = 2;
          }
        }
        rowCells.push(cellObj);
      });
      dataRow.push(rowCells);
    });

    return [{
      name: sheet.name || "Sheet1",
      status: 1,
      order: 0,
      row: Math.max(dataRow.length, 100),
      column: Math.max(columns.length, 26),
      config: {},
      data: dataRow
    }];
  };

  const loadSheetIntoEditor = (sheet) => {
    setCurrentSheet(sheet);
    currentSheetRef.current = sheet;
    const converted = convertToFortuneSheet(sheet);
    setWorkbookData(converted);
    workbookDataRef.current = converted;
    // Store celldata-format string so comparison in handleSheetDataChange is consistent
    lastSavedDataRef.current = JSON.stringify(converted);
    setViewMode("editor");
  };

  const handleSyncSheetImmediate = async (rawData) => {
    const sheet = currentSheetRef.current;
    if (!sheet) return;

    // Convert dense 2D `data` arrays → sparse `celldata` before saving.
    // FortuneSheet's Workbook component reads `celldata` on initialization.
    const celldataSheets = convertToCelldata(rawData);

    const dataStr = JSON.stringify(celldataSheets);
    lastSavedDataRef.current = dataStr;

    try {
      const res = await axios.put(`${API_BASE}/api/sheets/project/${projectId}/${sheet._id}`, {
        name: sheet.name,
        columns: sheet.columns,
        rows: sheet.rows,
        metadata: {
          ...sheet.metadata,
          workbookData: celldataSheets
        }
      }, getHeaders());

      // Update ref ONLY — no state update to avoid FortuneSheet re-initialization
      currentSheetRef.current = res.data;
    } catch (err) {
      console.error("Autosave error:", err);
    }
  };

  // Debounced auto-save function
  const debouncedSave = useMemo(
    () =>
      debounce(async (data) => {
        await handleSyncSheetImmediate(data);
      }, 1500),
    [projectId]
  );

  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  /**
   * FortuneSheet's onChange returns sheets with a dense 2D `data` array.
   * But FortuneSheet's Workbook component only reads `celldata` (sparse format)
   * when initializing from the `data` prop.
   * We must convert data→celldata before saving and use celldata on reload.
   */
  const convertToCelldata = (sheets) => {
    return sheets.map((sheet) => {
      const celldata = [];
      if (sheet.data && Array.isArray(sheet.data)) {
        sheet.data.forEach((row, r) => {
          if (Array.isArray(row)) {
            row.forEach((cell, c) => {
              if (cell !== null && cell !== undefined) {
                celldata.push({ r, c, v: cell });
              }
            });
          }
        });
      } else if (sheet.celldata) {
        // already sparse — keep as-is
        return sheet;
      }
      const { data, ...rest } = sheet;
      return { ...rest, celldata };
    });
  };

  const handleSheetDataChange = (rawData) => {
    // Convert to sparse celldata first, then compare — since we save celldata,
    // the lastSavedDataRef also stores the celldata JSON string.
    const celldataSheets = convertToCelldata(rawData);
    const dataStr = JSON.stringify(celldataSheets);
    if (dataStr === lastSavedDataRef.current) {
      return; // No real cell changes, skip (cursor moves, selection, etc.)
    }
    workbookDataRef.current = rawData;
    debouncedSave(rawData);
  };

  const createDefaultWorkbookData = (name) => {
    return [{
      name: name,
      color: "",
      status: 1,
      order: 0,
      row: 100,
      column: 26,
      config: {},
      index: 0,
      data: Array.from({ length: 100 }, () => Array.from({ length: 26 }, () => null))
    }];
  };

  const handleCreateSheet = async (e) => {
    e.preventDefault();
    if (!sheetNameInput.trim()) return;
    try {
      const defaultData = createDefaultWorkbookData(sheetNameInput.trim());
      const res = await axios.post(`${API_BASE}/api/sheets/project/${projectId}`, {
        name: sheetNameInput.trim(),
        columns: ["Column A", "Column B", "Column C"],
        rows: [],
        metadata: {
          workbookData: defaultData
        }
      }, getHeaders());
      showToast("Spreadsheet created!");
      setSheetNameInput("");
      loadSheetIntoEditor(res.data);
      fetchSheets();
    } catch (err) {
      showToast("Creation failed.", "error");
    }
  };

  const handleDeleteSheet = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this spreadsheet?")) return;
    try {
      await axios.delete(`${API_BASE}/api/sheets/project/${projectId}/${id}`, getHeaders());
      showToast("Spreadsheet deleted.");
      if (currentSheet?._id === id) {
        setCurrentSheet(null);
        setViewMode("list");
      }
      fetchSheets();
    } catch (err) {
      showToast("Deletion failed.", "error");
    }
  };

  const getColLetter = (index) => String.fromCharCode(65 + index);

  // XLS / CSV Import & Export with styles mapping
  const handleImportXLSX = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary", cellStyles: true, cellNF: true, cellDates: true });
        
        const newWorkbookData = wb.SheetNames.map((name, sIdx) => {
          const ws = wb.Sheets[name];
          const range = XLSX.utils.decode_range(ws['!ref'] || "A1:Z100");
          
          const maxRow = Math.max(range.e.r + 1, 100);
          const maxCol = Math.max(range.e.c + 1, 26);
          
          const data = Array.from({ length: maxRow }, () =>
            Array.from({ length: maxCol }, () => null)
          );
          
          const config = {
            columnlen: {},
            rowlen: {},
            merge: {}
          };
          
          for (let r = 0; r <= range.e.r; r++) {
            for (let c = 0; c <= range.e.c; c++) {
              const cellRef = XLSX.utils.encode_cell({ r, c });
              const cell = ws[cellRef];
              if (cell) {
                const cellObj = {
                  v: cell.v,
                  m: cell.w || String(cell.v),
                };
                
                if (cell.f) {
                  cellObj.f = "=" + cell.f;
                }
                
                if (cell.s) {
                  if (cell.s.font) {
                    if (cell.s.font.bold) cellObj.bl = 1;
                    if (cell.s.font.italic) cellObj.it = 1;
                    if (cell.s.font.underline) cellObj.un = 1;
                    if (cell.s.font.color?.rgb) cellObj.fc = "#" + cell.s.font.color.rgb;
                    if (cell.s.font.sz) cellObj.fs = cell.s.font.sz;
                    if (cell.s.font.name) cellObj.ff = cell.s.font.name;
                  }
                  if (cell.s.fill) {
                    if (cell.s.fill.fgColor?.rgb) cellObj.bg = "#" + cell.s.fill.fgColor.rgb;
                  }
                  if (cell.s.alignment) {
                    if (cell.s.alignment.horizontal === "center") cellObj.ht = 0;
                    else if (cell.s.alignment.horizontal === "left") cellObj.ht = 1;
                    else if (cell.s.alignment.horizontal === "right") cellObj.ht = 2;
                    
                    if (cell.s.alignment.vertical === "center") cellObj.vt = 0;
                    else if (cell.s.alignment.vertical === "top") cellObj.vt = 1;
                    else if (cell.s.alignment.vertical === "bottom") cellObj.vt = 2;
                  }
                }
                data[r][c] = cellObj;
              }
            }
          }
          
          if (ws['!merges']) {
            ws['!merges'].forEach(m => {
              const mergeId = `${m.s.r}_${m.s.c}`;
              config.merge[mergeId] = {
                r: m.s.r,
                c: m.s.c,
                rs: m.e.r - m.s.r + 1,
                cs: m.e.c - m.s.c + 1
              };
            });
          }
          
          if (ws['!cols']) {
            ws['!cols'].forEach((col, cIdx) => {
              if (col.wpx) {
                config.columnlen[cIdx] = col.wpx;
              } else if (col.width) {
                config.columnlen[cIdx] = col.width * 8;
              }
            });
          }
          
          return {
            name: name,
            status: sIdx === 0 ? 1 : 0,
            order: sIdx,
            row: maxRow,
            column: maxCol,
            config: config,
            data: data
          };
        });
        
        setWorkbookData(newWorkbookData);
        handleSyncSheetImmediate(newWorkbookData);
        showToast("XLSX Imported successfully!");
      } catch (err) {
        console.error(err);
        showToast("Import failed", "error");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExportXLSX = () => {
    if (workbookData.length === 0) return showToast("No spreadsheet data to export.", "error");
    const wb = XLSX.utils.book_new();
    
    workbookData.forEach(sheet => {
      const data2D = [];
      const rows = sheet.data || [];
      rows.forEach(r => {
        const rowArr = r.map(c => {
          if (!c) return "";
          if (c.f) return c.f;
          return c.v !== undefined ? c.v : "";
        });
        data2D.push(rowArr);
      });
      
      const ws = XLSX.utils.aoa_to_sheet(data2D);
      
      if (sheet.config?.columnlen) {
        ws['!cols'] = Object.entries(sheet.config.columnlen).map(([cIdx, len]) => ({
          wpx: Number(len)
        }));
      }
      
      if (sheet.config?.merge) {
        ws['!merges'] = Object.values(sheet.config.merge).map(m => ({
          s: { r: m.r, c: m.c },
          e: { r: m.r + m.rs - 1, c: m.c + m.cs - 1 }
        }));
      }
      
      XLSX.utils.book_append_sheet(wb, ws, sheet.name);
    });
    
    XLSX.writeFile(wb, `${currentSheet.name.replace(/\s+/g, "_")}.xlsx`);
    showToast("Workbook exported successfully!");
  };

  const handleExportPDF = () => {
    if (workbookData.length === 0) return showToast("No data to export.", "error");
    const doc = new jsPDF();
    
    const activeSheet = workbookData.find(s => s.status === 1) || workbookData[0];
    doc.setFont("helvetica", "bold");
    doc.text(activeSheet.name, 14, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 22);

    const headers = ["#"];
    const colCount = activeSheet.column || 10;
    const rowCount = activeSheet.row || 50;

    for (let c = 0; c < Math.min(colCount, 8); c++) {
      headers.push(String.fromCharCode(65 + c));
    }

    const data = [];
    for (let r = 0; r < Math.min(rowCount, 40); r++) {
      const rowArr = [r + 1];
      for (let c = 0; c < Math.min(colCount, 8); c++) {
        const cell = activeSheet.data?.[r]?.[c];
        rowArr.push(cell ? (cell.m !== undefined ? cell.m : String(cell.v || "")) : "");
      }
      data.push(rowArr);
    }

    doc.table(14, 30, data, headers, { autoSize: true });
    doc.save(`${activeSheet.name.replace(/\s+/g, "_")}.pdf`);
    showToast("PDF report saved!");
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-[#F0F4F8] montserrat-regular text-[#1F2328] overflow-hidden">
      
      {/* ── Top Bar ── */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-[#D1DCEB]/50 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={viewMode === "editor" ? async () => { await debouncedSave.flush(); fetchSheets(); setViewMode("list"); } : onClose} 
            className="neu-flat-sm neu-action-btn p-2 rounded-full text-[#656D76] hover:text-[#0969DA]"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
              <FileSpreadsheet size={16} className="text-[#107C41]" />
              {viewMode === "editor" ? currentSheet?.name : "Project Spreadsheets"}
            </h2>
            <p className="text-[9px] font-bold text-[#656D76] uppercase">Excel Document Manager</p>
          </div>
        </div>

        {viewMode === "editor" && (
          <div className="flex items-center gap-4">
            <label className="neu-flat-sm neu-action-btn px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-700 bg-white flex items-center gap-1.5 cursor-pointer border border-[#D1DCEB]/50">
              <Upload size={12} className="text-[#0969DA]" /> Import XLSX
              <input type="file" accept=".xlsx" onChange={handleImportXLSX} className="hidden" />
            </label>
            <button onClick={handleExportXLSX} className="neu-flat-sm neu-action-btn px-3 py-1.5 rounded-lg text-[10px] font-bold text-[#107C41] bg-white flex items-center gap-1.5 border border-[#D1DCEB]/50">
              <Download size={12} /> Export XLSX
            </button>
            <button onClick={handleExportPDF} className="neu-flat-sm neu-action-btn px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-700 bg-white flex items-center gap-1.5 border border-[#D1DCEB]/50">
              <FileText size={12} /> Print PDF
            </button>
            <button 
              onClick={() => {
                debouncedSave.flush();
                showToast("Workbook saved successfully!");
              }} 
              className="neu-flat-sm neu-action-btn px-3 py-1.5 rounded-lg text-[10px] font-bold text-white bg-[#107C41] flex items-center gap-1.5 border border-[#107C41]/30 hover:bg-[#107C41]/90"
            >
              Save Workbook
            </button>
            <span className="text-[9px] font-bold uppercase text-[#107C41] bg-[#107C41]/10 px-2.5 py-1 rounded-md border border-[#107C41]/20">
              Auto-Saved
            </span>
          </div>
        )}
      </div>

      {/* ── Content View ── */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {viewMode === "list" ? (
          /* LIST DIRECTORY */
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            <div className="neu-flat rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
              <div>
                <h3 className="text-xs font-extrabold text-[#656D76] uppercase tracking-wider">Spreadsheet Directory</h3>
                <p className="text-[10px] font-medium text-[#656D76]">Manage project-specific spreadsheets. Double click a card to open.</p>
              </div>

              <form onSubmit={handleCreateSheet} className="flex gap-2 w-full md:w-auto">
                <input 
                  required type="text" value={sheetNameInput} onChange={e => setSheetNameInput(e.target.value)}
                  placeholder="Sheet name (e.g. Project Budget)" 
                  className="flex-1 neu-pressed rounded-xl p-2.5 text-xs outline-none font-bold bg-[#F0F4F8]"
                />
                <button type="submit" className="px-5 py-2.5 bg-[#107C41] text-white text-xs font-bold uppercase rounded-xl neu-action-btn flex items-center gap-1.5 shadow-md">
                  <PlusCircle size={14} /> Add Sheet
                </button>
              </form>
            </div>

            {loading ? (
              <div className="py-20 text-center"><div className="w-8 h-8 border-4 border-gray-300 border-t-[#107C41] rounded-full animate-spin mx-auto mb-2" /></div>
            ) : sheetsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sheetsList.map(sheet => (
                  <div
                    key={sheet._id}
                    onDoubleClick={() => loadSheetIntoEditor(sheet)}
                    className="neu-flat rounded-2xl p-5 flex flex-col justify-between gap-4 border-t-4 border-[#107C41] bg-white cursor-pointer transition-all hover:scale-[1.01]"
                    title="Double click to open sheet"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl neu-pressed-sm flex items-center justify-center text-[#107C41]">
                          <FileSpreadsheet size={20} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 truncate max-w-[150px]">{sheet.name}</h4>
                          <p className="text-[9px] font-bold text-[#656D76] uppercase mt-0.5">Project Spread</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSheet(sheet._id, e)}
                        className="p-2 rounded-lg text-[#D1242F] hover:bg-red-50/50 neu-flat-sm neu-action-btn border border-red-200/10"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div className="text-[10px] font-medium text-[#656D76] border-t border-[#D1DCEB]/50 pt-3 flex justify-between">
                      <span>Columns: <strong className="text-slate-800">{sheet.metadata?.workbookData?.[0]?.column || 26}</strong></span>
                      <span>Rows: <strong className="text-slate-800">{sheet.metadata?.workbookData?.[0]?.row || 100}</strong></span>
                    </div>

                    <div className="text-center text-[9px] font-bold text-[#107C41] uppercase bg-[#107C41]/5 rounded-lg py-1.5 border border-[#107C41]/20">
                      Double click to edit
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="neu-flat rounded-2xl p-16 flex flex-col items-center justify-center text-center bg-white">
                <FileSpreadsheet size={48} className="text-[#656D76] opacity-30 mb-3" />
                <h4 className="text-sm font-bold text-[#1F2328]">No Spreadsheets Created</h4>
                <p className="text-xs text-[#656D76] mt-1">Create a new spreadsheet from the input above to begin tracking project values.</p>
              </div>
            )}
          </div>
        ) : (
          /* FORTUNESHEET WORKSPACE CONTAINER */
          <div className="flex-1 w-full h-full relative bg-white overflow-hidden">
            <Workbook
              ref={null}
              data={workbookData}
              onChange={handleSheetDataChange}
            />
          </div>
        )}
      </div>

      {/* Toast Alert */}
      {toast.open && (
        <div className="fixed bottom-6 right-6 z-[999999] flex items-center gap-4 bg-white shadow-xl border border-[#D1DCEB] rounded-xl p-4 max-w-sm">
          <div className={`p-2 rounded-full shrink-0 ${toast.sev === 'error' ? 'text-[#D1242F] bg-red-50' : 'text-[#1A7F37] bg-green-50'}`}>
             {toast.sev === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          </div>
          <span className="text-xs font-bold text-slate-800">{toast.msg}</span>
          <button type="button" onClick={() => setToast({ open: false, msg: "", sev: "success" })} className="rounded-lg p-1 text-[#656D76] ml-auto shrink-0"><X size={12} /></button>
        </div>
      )}
    </div>
  );
}
