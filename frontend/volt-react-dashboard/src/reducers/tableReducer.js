import produce from "immer";

import { shortId, ActionTypes, DataTypes } from "../pages/utils/studentTable";

import update from "immutability-helper";

const initialState = {
  data: "",
  skipReset: false,
  table_idx: 0,
  highlightCellData: "",
  images: [],
  consolidatedData: [],
  resetConsolidatedData: false,
};

function reducer(state, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_TABLE_CONFIG:
      return produce(state, (draft) => {
        draft.table_idx = action.table_idx;
      });

    case ActionTypes.ADD_OPTION_TO_COLUMN:
      const optionIndex = state.columns.findIndex(
        (column) => column.id === action.columnId
      );
      return update(state, {
        skipReset: { $set: true },
        columns: {
          [optionIndex]: {
            options: {
              $push: [
                {
                  label: action.option,
                  backgroundColor: action.backgroundColor,
                },
              ],
            },
          },
        },
      });

    case ActionTypes.ADD_ROW:
      return produce(state, (draft) => {
        draft.data[action.table_idx].table_data.data.push({});
      });

    case ActionTypes.UPDATE_COLUMN_HEADER:
      const index = state.data[state.table_idx].table_data.columns.findIndex(
        (column) => column.id === action.columnId
      );
      return produce(state, (draft) => {
        draft.data[state.table_idx].table_data.columns[index].label =
          action.label;
      });

    case ActionTypes.UPDATE_CELL:
      return produce(state, (draft) => {
        draft.data[state.table_idx].table_data.data[action.rowIndex][
          action.columnId
        ] = action.value;
        draft.resetConsolidatedData = true;
      });

    case ActionTypes.RESET_CONSOLIDATED_DATA:
      return produce(state, (draft) => {
        draft.resetConsolidatedData = false;
      });

    case ActionTypes.ADD_COLUMN_TO_LEFT:
      const leftIndex = state.data[
        state.table_idx
      ].table_data.columns.findIndex((column) => column.id === action.columnId);
      let leftId = shortId();
      let newColumn = {
        id: leftId,
        label: "Column",
        accessor: leftId,
        dataType: DataTypes.TEXT,
        disableResizing: false,
      };
      return produce(state, (draft) => {
        draft.data[state.table_idx].table_data.columns.splice(
          leftIndex,
          0,
          newColumn
        );
      });

    case ActionTypes.ADD_COLUMN_TO_RIGHT:
      const rightIndex = state.columns.findIndex(
        (column) => column.id === action.columnId
      );
      const rightId = shortId();
      return update(state, {
        skipReset: { $set: true },
        columns: {
          $splice: [
            [
              rightIndex + 1,
              0,
              {
                id: rightId,
                label: "Column",
                accessor: rightId,
                dataType: DataTypes.TEXT,
                created: action.focus && true,
                options: [],
              },
            ],
          ],
        },
      });

    case ActionTypes.DELETE_COLUMN:
      const deleteIndex = state.columns.findIndex(
        (column) => column.id === action.columnId
      );
      return update(state, {
        skipReset: { $set: true },
        columns: { $splice: [[deleteIndex, 1]] },
      });

    case ActionTypes.DELETE_ROW:
      return produce(state, (draft) => {
        delete draft.data[state.table_idx].table_data.data.splice(
          action.rowIndex,
          1
        );
        draft.data[state.table_idx].table_data.data.forEach((element, i) => {
          element["0"] = i + 1;
        });
        draft.highlightCellData = "";
        draft.resetConsolidatedData = true;
      });

    case ActionTypes.HIGHLIGHT_CELL:
      return produce(state, (draft) => {
        draft.highlightCellData = action.data;
      });

    case ActionTypes.ENABLE_RESET:
      return update(state, { skipReset: { $set: true } });

    case ActionTypes.CALL_API:
      return {
        ...state,
        data: "",
      };

    case ActionTypes.SUCCESS:
      return {
        ...state,
        data: action.data,
      };

    case ActionTypes.SAVE_IMAGE_DATA: //imageCroppers/imageCrop.js
      return produce(state, (draft) => {
        let payload = {
          index: action.index,
          imageSrc: action.imgSrc,
          pageNumber: action.pageNumber,
          tableNumber: action.tableNumber,
        };
        draft.images.push(payload);
      });

    case ActionTypes.SAVE_PAGE_DATA: //imageCroppers/imageCrop.js
      const updatedState = produce(state, (draft) => {
        draft.images = draft.images.filter(
          (obj) => obj["pageNumber"] !== action.pageNumber
        );
      });

      return produce(updatedState, (draft) => {
        let payload = {
          index: action.index,
          imageSrc: action.imgSrc,
          pageNumber: action.pageNumber,
          tableNumber: action.tableNumber,
        };
        draft.images.push(payload);
      });

    case ActionTypes.DELETE_IMAGE_DATA: //imageCroppers/scroller.js
      debugger;

      return produce(state, (draft) => {
        delete draft.images.splice(action.index, 1);
      });

    case ActionTypes.CLEAR_IMAGE_DATA: //students.js
      return produce(state, (draft) => {
        draft.images = [];
      });

    case ActionTypes.SAVE_SELECTED_ROWS: //viewTabel.js
      if (action.data.length > 0) {
        return produce(state, (draft) => {
          draft.consolidatedData = [];
          draft.consolidatedData = action.data;
        });
      }

    default:
      return state;
  }
}

let exported = {
  reducer,
  initialState,
};

export default exported;
