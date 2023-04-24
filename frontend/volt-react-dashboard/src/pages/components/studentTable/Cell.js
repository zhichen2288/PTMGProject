import React, { useEffect, useState, useContext } from "react";
import ContentEditable from "react-contenteditable";
import { usePopper } from "react-popper";
import { ActionTypes, DataTypes } from "../../utils/studentTable";
import "../../../scss/style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinusSquare } from "@fortawesome/free-solid-svg-icons";
import StateContext from "../../../context/stateContext";

export default function Cell({
  value: initialValue,
  row: { index },
  column: { id, dataType, options },
  dataDispatch,
  table_idx,
}) {
  const [value, setValue] = useState({ value: initialValue, update: false });
  const [selectRef, setSelectRef] = useState(null);
  const [selectPop, setSelectPop] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addSelectRef, setAddSelectRef] = useState(null);
  const { styles, attributes } = usePopper(selectRef, selectPop, {
    placement: "bottom-start",
    strategy: "fixed",
  });
  const context = useContext(StateContext);

  function handleOptionKeyDown(e) {
    if (e.key === "Enter") {
      if (e.target.value !== "") {
        dataDispatch({
          type: ActionTypes.ADD_OPTION_TO_COLUMN,
          option: e.target.value,
          columnId: id,
        });
      }
      setShowAdd(false);
    }
  }

  function handleAddOption(e) {
    setShowAdd(true);
  }

  function handleOptionBlur(e) {
    if (e.target.value !== "") {
      dataDispatch({
        type: ActionTypes.ADD_OPTION_TO_COLUMN,
        option: e.target.value,
        columnId: id,
      });
    }
    setShowAdd(false);
  }

  function onChange(e) {
    setValue({ value: e.target.value, update: false });
  }

  // function getCellElement() {
  //   return (
  //     <ContentEditable
  //       html={(value.value && value.value.toString()) || ""}
  //       onChange={onChange}
  //       onBlur={() => setValue((old) => ({ value: old.value, update: true }))}
  //       className="data-input"
  //     />
  //   );
  // }
  useEffect(() => {
    if (addSelectRef && showAdd) {
      addSelectRef.focus();
    }
  }, [addSelectRef, showAdd]);

  function getCellElement() {
    let columnId = id;
    let rowId = index;
    let invalidCell = false;
    let message = "";
    if (context.state.highlightCellData !== "") {
      for (const [key, value] of Object.entries(
        context.state.highlightCellData
      )) {
        for (let [k, v] of Object.entries(value)) {
          if (key === table_idx.toString()) {
            k = parseInt(k);
            k = k % 7;
            const invalidRows = v.rows;
            if (columnId === k.toString() && invalidRows.includes(rowId)) {
              invalidCell = true;
              message = v.message;
            }
            //} else {
            //message = v.toString();
          }
        }
      }
    }

    switch (dataType) {
      case "text":
        return (
          <ContentEditable
            title={message === "" ? "" : message}
            html={(value.value && value.value.toString()) || ""}
            onChange={onChange}
            onBlur={() =>
              setValue((old) => ({ value: old.value, update: true }))
            }
            className={`data-input invalidCell-${invalidCell}`}
          />
        );
      case "options":
        return (
          <span
            className="delete-row-btn"
            onClick={() => {
              let result = window.confirm("Are you sure you want to delete?");
              if (result) {
                dataDispatch({
                  type: ActionTypes.DELETE_ROW,
                  rowIndex: index,
                });
              }
            }}
            title="Delete row"
          >
            <FontAwesomeIcon icon={faMinusSquare} />
          </span>
        );
      default:
        return <span></span>;
    }
  }

  useEffect(() => {
    setValue({ value: initialValue, update: false });
  }, [initialValue]);

  useEffect(() => {
    if (value.update) {
      dataDispatch({
        type: ActionTypes.UPDATE_CELL,
        columnId: id,
        rowIndex: index,
        value: value.value,
      });
    }
  }, [value, dataDispatch, id, index]);

  return getCellElement();
}
