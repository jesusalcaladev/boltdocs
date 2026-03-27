import React from "react";
import { useTable } from "../../hooks/useTable";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import "./Table.css";

export interface TableProps {
  headers?: string[];
  data?: (string | React.ReactNode)[][];
  children?: React.ReactNode;
  className?: string;
  sortable?: boolean;
  paginated?: boolean;
  pageSize?: number;
}

export function Table({
  headers,
  data,
  children,
  className = "",
  sortable = false,
  paginated = false,
  pageSize = 10,
}: TableProps) {
  const {
    sortConfig,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData,
    requestSort,
  } = useTable({ data, sortable, paginated, pageSize });

  const renderSortIcon = (index: number) => {
    if (!sortable) return null;
    if (sortConfig?.key !== index) return <ChevronDown size={14} className="ld-table-sort-icon ld-table-sort-icon--hidden" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="ld-table-sort-icon" /> : <ChevronDown size={14} className="ld-table-sort-icon" />;
  };

  const tableContent = children ? (
    children
  ) : (
    <>
      {headers && (
        <thead>
          <tr>
            {headers.map((header, i) => (
              <th 
                key={i} 
                onClick={() => requestSort(i)}
                className={sortable ? "ld-table-header--sortable" : ""}
              >
                <div className="ld-table-header-content">
                  {header}
                  {renderSortIcon(i)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
      )}
      {paginatedData && (
        <tbody>
          {paginatedData.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      )}
    </>
  );

  return (
    <div className={`ld-table-container ${className}`.trim()}>
      <div className="ld-table-wrapper">
        <table className="ld-table">{tableContent}</table>
      </div>
      
      {paginated && totalPages > 1 && (
        <div className="ld-table-pagination">
          <div className="ld-table-pagination-info">
            Page {currentPage} of {totalPages}
          </div>
          <div className="ld-table-pagination-controls">
            <button 
              onClick={() => setCurrentPage(1)} 
              disabled={currentPage === 1}
              className="ld-table-pagination-btn"
            >
              <ChevronsLeft size={16} />
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1}
              className="ld-table-pagination-btn"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
              disabled={currentPage === totalPages}
              className="ld-table-pagination-btn"
            >
              <ChevronRight size={16} />
            </button>
            <button 
              onClick={() => setCurrentPage(totalPages)} 
              disabled={currentPage === totalPages}
              className="ld-table-pagination-btn"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
