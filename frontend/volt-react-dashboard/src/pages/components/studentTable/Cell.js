import React, { useEffect, useState } from "react";
import ContentEditable from "react-contenteditable";
import { usePopper } from "react-popper";
import { ActionTypes, DataTypes } from "../../utils/studentTable";
import "../../../scss/style.css";
export default function Cell({
  value: initialValue,
  row: { index },
  column: { id, dataType, options },
  dataDispatch,
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

  let element;
  debugger;
  switch (dataType) {
    case "text":
      element = (
        <ContentEditable
          html={(value.value && value.value.toString()) || ""}
          onChange={onChange}
          onBlur={() => setValue((old) => ({ value: old.value, update: true }))}
          className="data-input"
        />
      );
      break;
    case "options":
      element = (
        <span
          style={{
            cursor: "pointer",
            color: "blue",
            textDecoration: "underline",
          }}
          onClick={() => {
            alert("clicked");
          }}
        >
          Delete
        </span>
      );
      break;
    case "select":
      // element = (
      //   <>
      //     <div
      //       ref={setSelectRef}
      //       className="cell-padding d-flex cursor-default align-items-center flex-1"
      //       onClick={() => setShowSelect(true)}
      //     >
      //       {value.value && (
      //         <Relationship value={value.value} backgroundColor={getColor()} />
      //       )}
      //     </div>
      //     {showSelect && (
      //       <div className="overlay" onClick={() => setShowSelect(false)} />
      //     )}
      //     {showSelect && (
      //       <div
      //         className="shadow-5 bg-white border-radius-md"
      //         ref={setSelectPop}
      //         {...attributes.popper}
      //         style={{
      //           ...styles.popper,
      //           zIndex: 4,
      //           minWidth: 200,
      //           maxWidth: 320,
      //           padding: "0.75rem",
      //         }}
      //       >
      //         <div
      //           className="d-flex flex-wrap-wrap"
      //           style={{ marginTop: "-0.5rem" }}
      //         >
      //           {options.map((option) => (
      //             <div
      //               className="cursor-pointer"
      //               style={{ marginRight: "0.5rem", marginTop: "0.5rem" }}
      //               onClick={() => {
      //                 setValue({ value: option.label, update: true });
      //                 setShowSelect(false);
      //               }}
      //             >
      //               <Relationship
      //                 value={option.label}
      //                 backgroundColor={option.backgroundColor}
      //               />
      //             </div>
      //           ))}
      //           {showAdd && (
      //             <div
      //               style={{
      //                 marginRight: "0.5rem",
      //                 marginTop: "0.5rem",
      //                 width: 120,
      //                 padding: "2px 4px",
      //                 backgroundColor: grey(200),
      //                 borderRadius: 4,
      //               }}
      //             >
      //               <input
      //                 type="text"
      //                 className="option-input"
      //                 onBlur={handleOptionBlur}
      //                 ref={setAddSelectRef}
      //                 onKeyDown={handleOptionKeyDown}
      //               />
      //             </div>
      //           )}
      //           <div
      //             className="cursor-pointer"
      //             style={{ marginRight: "0.5rem", marginTop: "0.5rem" }}
      //             onClick={handleAddOption}
      //           >
      //             <Relationship
      //               value={
      //                 <span className="svg-icon-sm svg-text">
      //                   <PlusIcon />
      //                 </span>
      //               }
      //               backgroundColor={grey(200)}
      //             />
      //           </div>
      //         </div>
      //       </div>
      //     )}
      //   </>
      // );
      break;
    default:
      element = <span></span>;
      break;
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

  return element;
}
