import { useState, useMemo } from "react";

interface SortConfig {
  key: number;
  direction: "asc" | "desc";
}

interface UseTableProps {
  data?: (string | React.ReactNode)[][];
  sortable?: boolean;
  paginated?: boolean;
  pageSize?: number;
}

export function useTable({ data, sortable = false, paginated = false, pageSize = 10 }: UseTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const processedData = useMemo(() => {
    if (!data) return [];
    let items = [...data];

    if (sortable && sortConfig !== null) {
      items.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        const aStr = typeof aVal === "string" ? aVal : "";
        const bStr = typeof bVal === "string" ? bVal : "";

        if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return items;
  }, [data, sortConfig, sortable]);

  const totalPages = Math.ceil(processedData.length / pageSize);
  
  const paginatedData = useMemo(() => {
    if (!paginated) return processedData;
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, paginated, currentPage, pageSize]);

  const requestSort = (index: number) => {
    if (!sortable) return;
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === index && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: index, direction });
  };

  return {
    sortConfig,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData,
    requestSort,
  };
}


