import React, { useState, useEffect, useContext } from "react";
import { Button, Row, Col } from "@themesberg/react-bootstrap";
import { useTable, useRowSelect } from "react-table";
import StateContext from "../../context/stateContext";
import { ActionTypes } from "../utils/studentTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinusSquare } from "@fortawesome/free-solid-svg-icons";

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <>
        <input type="checkbox" ref={resolvedRef} {...rest} />
      </>
    );
  }
);

export default function ViewTable({
  data = [],
  rowSelection = false,
  clearSelection = false,
  onUpdateData,
  tabName,
}) {
  const context = useContext(StateContext);

  const columns = React.useMemo(() => {
    const baseColumns = Object.keys(data[0]).map((key) => ({
      Header: key,
      accessor: key,
    }));

    if (rowSelection) {
      return [
        {
          id: "selection",
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <div>
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            </div>
          ),
          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...baseColumns,
      ];
    } else {
      return [
        ...baseColumns,
        {
          Header: "Actions",
          Cell: ({ row }) => (
            <div>
              <button
                className="delete-row-btn"
                onClick={() => handleDelete(row)}
              >
                {" "}
                <FontAwesomeIcon icon={faMinusSquare} />
              </button>
            </div>
          ),
        },
      ];
    }
  }, [data, rowSelection]);

  const handleDelete = (row) => {
    const newData = data.filter((d) => d !== row.original);
    onUpdateData(tabName, newData);
    //   context.dispatch({ type: ActionTypes.SET_DATA, data: newData });
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    selectedFlatRows,
    state: { selectedRowIds },
  } = useTable(
    {
      columns,
      data,
    },
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => columns);
    }
  );

  useEffect(() => {
    context.dispatch({
      type: ActionTypes.SAVE_SELECTED_ROWS,
      data: selectedFlatRows.map((d) => d.original),
    });
  }, [selectedFlatRows]);

  useEffect(() => {}, [clearSelection]);

  return (
    <>
      {rowSelection && (
        <p>Selected Rows: {Object.keys(selectedRowIds).length}</p>
      )}
      <table className="viewtable" {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()}>{column.render("Header")}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {rowSelection && (
        <pre>
          <code>
            {JSON.stringify(
              {
                selectedRowIds: selectedRowIds,
                "selectedFlatRows[].original": selectedFlatRows.map(
                  (d) => d.original
                ),
              },
              null,
              2
            )}
          </code>
        </pre>
      )}
    </>
  );
}
