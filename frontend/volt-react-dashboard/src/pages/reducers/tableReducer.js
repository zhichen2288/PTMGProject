import React, { useEffect, useReducer } from "react";
import Table from "../components/Tables";
import produce from "immer";

import {
  shortId,
  makeData,
  ActionTypes,
  DataTypes,
} from "../utils/studentTable";
import update from "immutability-helper";
const initialState = {
  data: "",
  skipReset: false,
  table_idx: 0,
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
      });

    case ActionTypes.ENABLE_RESET:
      return update(state, { skipReset: { $set: true } });

    case ActionTypes.CALL_API:
      return {
        ...state,
      };

    case ActionTypes.SUCCESS:
      return {
        ...state,
        data: action.data,
      };

    default:
      return state;
  }
}

let exported = {
  reducer,
  initialState,
};
export default exported;
