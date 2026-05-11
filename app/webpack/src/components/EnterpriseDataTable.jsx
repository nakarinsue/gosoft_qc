import React, { useState } from 'react';
import { FilterMatchMode } from 'primereact/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Loader2 } from 'lucide-react';

// --- CSS Imports ---
import 'primereact/resources/themes/lara-light-indigo/theme.css'; 
import 'primereact/resources/primereact.min.css';                 
import 'primeicons/primeicons.css';                               
// 📍 อย่าลืมแก้ไข Path นี้ให้ชี้ไปที่ไฟล์ AssignFile.css ของคุณ
import '../styles/AssignFile.css'; 

export default function EnterpriseDataTable({
    data = [],
    columns = [],
    loading = false,
    dataKey = "id",
    globalFilterFields = [],
    searchPlaceholder = "Search records...",
    emptyMessage = "No records found.",
    actionButtons = null,
    rows = 10,
    rowsPerPageOptions = [10, 20, 50, 100],
    selection = null,                 // 📍 เพิ่มบรรทัดนี้
    onSelectionChange = undefined
}) {
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    const [globalFilterValue, setGlobalFilterValue] = useState('');

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const renderHeader = () => {
        return (
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 py-3 bg-white border-b border-slate-100 shrink-0">
                {globalFilterFields.length > 0 ? (
                    <IconField iconPosition="left" className="w-full lg:w-[400px]">
                        <InputIcon className="pi pi-search text-slate-400" />
                        <InputText 
                            value={globalFilterValue} 
                            onChange={onGlobalFilterChange} 
                            placeholder={searchPlaceholder} 
                            className="w-full !rounded-[1.5rem] !py-3 !pl-10 !bg-slate-50 !border-slate-200 hover:!border-indigo-300 focus:!ring-indigo-500/20 font-bold text-sm" 
                        />
                    </IconField>
                ) : <div />}
                
                {actionButtons && (
                    <div className="flex flex-wrap items-center justify-end gap-3 w-full lg:w-auto">
                        {actionButtons}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-2 sm:p-5 flex-1 flex flex-col min-h-0 overflow-hidden">
            {loading ? (
                <div className="flex-1 flex justify-center items-center text-indigo-500">
                    <Loader2 className="animate-spin" size={40} />
                </div>
            ) : (
                <DataTable 
                    value={data} 
                    selection={selection}                     // 📍 เพิ่มบรรทัดนี้
                    onSelectionChange={onSelectionChange}
                    paginator 
                    rows={rows} 
                    rowsPerPageOptions={rowsPerPageOptions} 
                    header={renderHeader()} 
                    filters={filters} 
                    onFilter={(e) => setFilters(e.filters)}
                    globalFilterFields={globalFilterFields} 
                    emptyMessage={<div className="p-10 text-center text-slate-400 font-black uppercase tracking-widest">{emptyMessage}</div>} 
                    className="custom-datatable p-datatable-lg flex-1 flex flex-col min-h-0" 
                    dataKey={dataKey}
                    scrollable={true}
                    scrollHeight="flex"
                >
                    {columns.map((col, index) => (
                        <Column 
                            key={index}
                            selectionMode={col.selectionMode} 
                            headerStyle={col.headerStyle}
                            field={col.field} 
                            header={col.header} 
                            body={col.body} 
                            sortable={col.sortable !== false} 
                            filter={col.filter} 
                            filterElement={col.filterElement}
                            style={col.style} 
                        />
                    ))}
                </DataTable>
            )}
        </div>
    );
}