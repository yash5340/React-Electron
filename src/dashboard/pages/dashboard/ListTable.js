import React, { useMemo } from 'react';
import {
  Paper,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  TableFooter,
  TablePagination,
  makeStyles,
  styled,
  TableSortLabel,
  Typography,
} from '@material-ui/core';
import { usePagination, useSortBy, useTable } from 'react-table';


import { ListHeaderCell } from './listTable/ListHeaderCell';
import { ListTablePaginationActions } from './listTable/ListTablePaginationActions';
import { ListRowActions, APPROVAL_STATUS } from './listTable/ListRowActions';
import { Colors } from '../../../common/constants/Colors';
import { SnackbarAlert } from '../../../common/components/SnackbarAlert';
import DenyApplicationModal from './DenyApplicationModal';
import AccessPassDetailsModal from './AccessPassDetailsModal';
import { useUpdateAccessPass } from '../../../common/hooks';


const listTableStyles = makeStyles({
  table: {
    minWidth: 500,
  },
  striped0: {
    backgroundColor: Colors.RowStripeGray,
  },
  striped1: {
    backgroundColor: Colors.White,
  },
});

export function ListTable({ value }) {
  const classes = listTableStyles();

  const {
    headerGroups,
    prepareRow,
    rows,
    page,
    state: { pageIndex, pageSize },
    gotoPage,
    setPageSize,
    getTableProps,
    getTableBodyProps,
  } = useTable(
    {
      columns: useMemo(
        () => [
          { Header: 'Company', accessor: 'company' },
          { Header: 'Name', accessor: 'name' },
          { Header: 'APOR type', accessor: 'aporType' },
          { Header: 'ID Type', accessor: 'idType' },
          { Header: 'ID Number', accessor: 'id' },
          { Header: 'Approval Action', accessor: 'status' },
        ],
        []
      ),
      data: useMemo(() => value, [value]),
    },
    useSortBy,

    // ! `usePagination()` must come after `useSortBy()`
    usePagination
  );

  /** API Hooks */
  const { execute: executeUpdate, dataUpdate, isLoadingUpdate, errorUpdate } = useUpdateAccessPass();

  /** Modals' States  */
  const [isDenyModalOpen, setIsDenyModalOpen] = React.useState(false);
  const [isDetailsOpen, setIsdDetailsOpen] = React.useState(false);
  const [accessPassReferenceId, setAccessPassReferenceId] = React.useState('');
  const [openApproval, setOpenApproval] = React.useState(false);
  const [rowUser, setRowUser] = React.useState(''); // for displaying success

  const handleChangePage = (event, newPage) => {
    gotoPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPageSize(+event.target.value);
    gotoPage(0);
  };

  const handleApproveActionClick = (cellValues) => {
    const { referenceId, status, name } = cellValues;
    if (status !== APPROVAL_STATUS.Pending) {
      return;
    }
    setOpenApproval({ open: true, user: name });
    executeUpdate(referenceId, { status: APPROVAL_STATUS.Approved })
    setOpenApproval({ open: !isLoadingUpdate })
  }

  const handleDenyActionClick = (referenceId) => {
    setIsDenyModalOpen(true);
    setAccessPassReferenceId(referenceId);
  }

  const handleViewDetailsClick = (referenceId) => {
    setIsdDetailsOpen(true);
    setAccessPassReferenceId(referenceId);
  };

  const totalRecordsCount = rows.length;
  const lastColumnIndex = 5;

  return (
    <React.Fragment>
      <TableContainer component={Paper}>
        <Table
          {...getTableProps()}
          className={classes.table}
          stickyHeader
          aria-label="sticky header pagination table"
        >
          <TableHead>
            <TableRow>
              {headerGroups.map((headerGroup) =>
                headerGroup.headers.map((column, index) => (
                  <ListHeaderCell align={index === lastColumnIndex ? 'center' : 'left'}
                    {...column.getHeaderProps(column.getSortByToggleProps())}>
                    <TableSortLabel
                      active={column.isSorted}
                      direction={column.isSortedDesc ? 'desc' : 'asc'}
                    >
                      {column.render('Header')}
                      {column.isSorted ? (
                        <StyledSortAccessibilityLabel component="span">
                          {column.isSortedDesc ? 'sorted descending' : 'sorted ascending'}
                        </StyledSortAccessibilityLabel>
                      ) : null}
                    </TableSortLabel>
                  </ListHeaderCell>
                ))
              )}
            </TableRow>
          </TableHead>
          <TableBody {...getTableBodyProps()}>
            {page.map((row, index) => {
              prepareRow(row);
              return (
                <TableRow {...row.getRowProps()} className={classes[`striped${index % 2}`]}>

                  {row.cells.map((cell, index) => {
                    return index === lastColumnIndex ? (
                      // Last cell is status with custom component
                      <TableCell align="center" key={index}>
                        <ListRowActions
                          status={cell.row.values.status}
                          onApproveClick={() => handleApproveActionClick(cell.row.values)}
                          onDenyClick={() => handleDenyActionClick(cell.row.values.idNumber)}
                          onViewDetailsClick={() => handleViewDetailsClick(cell.row.values.idNumber)} // TODO: Pass Reference ID
                        ></ListRowActions>
                      </TableCell>
                    ) : (
                        <TableCell {...cell.getCellProps()}>{cell.render('Cell')}</TableCell>
                      );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                colSpan={4}
                count={totalRecordsCount}
                rowsPerPage={pageSize}
                page={pageIndex}
                SelectProps={{
                  inputProps: { 'aria-label': 'rows per page' },
                  native: true,
                }}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                ActionsComponent={ListTablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
      <DenyApplicationModal
        open={isDenyModalOpen}
        handleClose={() => setIsDenyModalOpen(false)}
        accessPassReferenceId={accessPassReferenceId}
      />
      <AccessPassDetailsModal
        open={isDetailsOpen}
        handleClose={() => setIsdDetailsOpen(false)}
        accessPassReferenceId={accessPassReferenceId}
      />

      <SnackbarAlert open={openApproval.open} autoHideDuration={2500} onClose={(event, reason) => {
        if (reason !== 'clickaway') setOpenApproval({ open: false });
      }} message={`Approved ${openApproval.user}`}></SnackbarAlert>
    </React.Fragment>
  );
}

const StyledSortAccessibilityLabel = styled(Typography)({
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: 1,
  margin: -1,
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  top: 20,
  width: 1,
});

export default ListTable;
