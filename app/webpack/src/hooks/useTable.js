import { useState, useMemo } from 'react';

export const useTable = (data, initialPageSize = 10, externalSearchTerm = null) => {
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const searchTerm = externalSearchTerm !== null ? externalSearchTerm : internalSearchTerm;
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(item => 
      Object.values(item).some(val => 
        String(val || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const handleSearch = (term) => {
    if (externalSearchTerm === null) setInternalSearchTerm(term);
    setCurrentPage(1);
  };

  return {
    data: paginatedData,
    totalItems: filteredData.length,
    totalPages,
    currentPage,
    pageSize,
    searchTerm,
    setPageSize,
    handlePageChange,
    handleSearch
  };
};