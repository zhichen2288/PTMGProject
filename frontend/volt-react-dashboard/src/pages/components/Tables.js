import React from "react";
import clsx from "clsx";
import {
  useTable,
  useBlockLayout,
  useResizeColumns,
  useSortBy,
} from "react-table";

import Cell from "./studentTable/Cell";
import Header from "./studentTable/Header";
import { FixedSizeList } from "react-window";
import { ActionTypes, DataTypes } from "../utils/studentTable";
import scrollbarWidth from "../components/studentTable/scrollbarWidth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faPlusSquare } from "@fortawesome/free-solid-svg-icons";

import "../../scss/style.css";

const defaultColumn = {
  minWidth: 50,
  width: 150,
  maxWidth: 400,
  Cell: Cell,
  Header: Header,
};

export default function Table({
  columns,
  data,
  table_idx,
  page_idx,
  dispatch: dataDispatch,
  skipReset,
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    totalColumnsWidth,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      dataDispatch,
      autoResetRowState: !skipReset,
    },
    useBlockLayout,
    useResizeColumns,
    useSortBy
  );

  const RenderRow = React.useCallback(
    ({ index, style }) => {
      const row = rows[index];
      prepareRow(row);
      return (
        <div {...row.getRowProps({ style })} className="tr">
          {row.cells.map((cell) => (
            <div {...cell.getCellProps()} className="td">
              {cell.render("Cell")}
            </div>
          ))}
        </div>
      );
    },
    [prepareRow, rows]
  );

  function isTableResizing() {
    for (let headerGroup of headerGroups) {
      for (let column of headerGroup.headers) {
        if (column.isResizing) {
          return true;
        }
      }
    }
    return false;
  }

  return (
    <>
      <div
        {...getTableProps()}
        className={clsx("table", isTableResizing() && "noselect")}
      >
        <div>
          {headerGroups.map((headerGroup) => (
            <div {...headerGroup.getHeaderGroupProps()} className="tr">
              {headerGroup.headers.map((column) => column.render("Header"))}
            </div>
          ))}
        </div>
        <div {...getTableBodyProps()}>
          <FixedSizeList
            height={window.innerHeight - 100}
            itemCount={rows.length}
            itemSize={40}
            width={totalColumnsWidth + scrollbarWidth}
          >
            {RenderRow}
          </FixedSizeList>
          <div
            className="tr add-row"
            onClick={() =>
              dataDispatch({
                type: ActionTypes.ADD_ROW,
                table_idx: table_idx,
                page_idx: page_idx,
              })
            }
          >
            <span className="svg-icon svg-gray icon-margin">
              <FontAwesomeIcon icon={faPlusSquare} style={{ color: "green" }} />
            </span>
            New
          </div>
        </div>
      </div>
    </>
  );
}
