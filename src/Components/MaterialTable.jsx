    import { useMemo } from 'react';
    import {
    MaterialReactTable,
    useMaterialReactTable,
    } from 'material-react-table';

    const Datatable = ({data,columns}) => {
       
    
        const table = useMaterialReactTable({
        columns,
        data,
        //optionally override the default column widths
        defaultColumn: {
            maxSize: 400,
            minSize: 80,
            size: 160, //default size is usually 180
        },
       
        enableColumnResizing: true,
        columnResizeMode: 'onChange',
        initialState: {
            pagination: {
              pageSize: 5, // Set the number of records per page
            }}, //default
        });
    
        return <MaterialReactTable table={table} />;
    };
    
    export default Datatable;