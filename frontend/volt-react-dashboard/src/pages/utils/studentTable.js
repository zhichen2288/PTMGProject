import faker from "faker";
// import axios from "../utils/http-axios";

import axios from "axios";

export async function makeData(studentId) {
  let response = await getTableData(studentId);
  console.log(response);
  return {
    data: response.tableArray,
    skipReset: false,
    table_idx: 0,
  };
}

//Table reducer reference https://github.com/archit-p/editable-react-table

async function getTableData(studentId) {
  let tableArray = [];
  let studentName = "";

  const response = await axios.get(
    `/api/students/${studentId}/transcript?action=view`
  );
  if (response.status === 200) {
    debugger;
    let data = response.data;
    if (
      data.tables.length > 0 &&
      (data.tables[0].modified == undefined || data.tables[0].modified === 0)
    ) {
      studentName = data.student_name;
      data.tables.map((e) => {
        let tables = {};
        tables["page"] = e.page;
        tables["table_num"] = e.table_num;
        tables["table_data"] = e.table_data;
        tables["image_path"] = e.image_path;
        tableArray.push(tables);
      });
      tableArray.map((e) => {
        let columnObject = [];
        let rows = [];
        let columnNames = [];

        let parsedColumns = JSON.parse(e.table_data)["schema"]["fields"];
        let rowNames = JSON.parse(e.table_data)["data"];

        rowNames.map((e) => {
          e["ID"] = faker.mersenne.rand();
        });
        rowNames.forEach((element) => {
          if (element[""] || element[""] === "") {
            delete element[""];
          }
        });
        rows.push(...rowNames);
        parsedColumns.map((n) => {
          let names = {};
          if (n.name !== "") {
            names["id"] = n.name;
            names["accessor"] = n.name;
            names["label"] = n.name;
            names["width"] = 100;
            names["disableResizing"] = "false";
            names["dataType"] = DataTypes.TEXT;
            columnNames.push(names);
          }
        });
        columnNames.push({
          id: 999999,
          width: 20,
          label: "+",
          disableResizing: "true",
          dataType: "null",
        });
        columnObject.push(columnNames);
        e.table_data = { columns: columnNames, data: rowNames };
      });
    } else {
      studentName = data.student_name;
      tableArray = [...data.tables];

      tableArray.map((t) => {
        t.table_data = JSON.parse(t.table_data);
      });
    }
    // console.log("tablearray", tableArray);
  }
  return { tableArray, studentName };
}

export function shortId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

export const ActionTypes = Object.freeze({
  UPDATE_TABLE_CONFIG: "update_table_config",
  ADD_COLOR_TO_CELL: "add_color_to_cell",
  ADD_ROW: "add_row",
  UPDATE_COLUMN_TYPE: "update_column_type",
  UPDATE_COLUMN_HEADER: "update_column_header",
  UPDATE_CELL: "update_cell",
  ADD_COLUMN_TO_LEFT: "add_column_to_left",
  ADD_COLUMN_TO_RIGHT: "add_column_to_right",
  DELETE_COLUMN: "delete_column",
  ENABLE_RESET: "enable_reset",
  CALL_API: "call_api",
  SUCCESS: "success",
});

export const DataTypes = Object.freeze({
  NUMBER: "number",
  TEXT: "text",
  SELECT: "select",
});

export const universityNames = [
  {
    value: "Beijing Normal University Zhuhai",
    label: "Beijing Normal University Zhuhai",
  },
  {
    value:
      "Beijing Normal University Hong Kong Baptist University United International College",
    label:
      "Beijing Normal University Hong Kong Baptist University United International College",
  },
  {
    value: "Beijing University of Posts and Telecommunications",
    label: "Beijing University of Posts and Telecommunications",
  },
  {
    value: "Beijing University of Technology",
    label: "Beijing University of Technology",
  },
  {
    value: "Birla Institute Of Technology And Science",
    label: "Birla Institute Of Technology And Science",
  },
  {
    value: "Gujarat Technological University",
    label: "Gujarat Technological University",
  },
  {
    value: "Jawaharlal Nehru Technological University",
    label: "Jawaharlal Nehru Technological University",
  },
  {
    value: "Manipal Institute of Technology",
    label: "Manipal Institute of Technology",
  },
  { value: "Mumbai University", label: "Mumbai University" },
  { value: "NMIMS University", label: "NMIMS University" },
  { value: "Pune University", label: "Pune University" },
  {
    value: "Ramrao Adik Institute of Technology",
    label: "Ramrao Adik Institute of Technology",
  },
  { value: "Renmin University China", label: "Renmin University China" },
  {
    value: "Saraswati College of Engineering",
    label: "Saraswati College of Engineering",
  },
  {
    value: "Savitribai Phule Pune University",
    label: "Savitribai Phule Pune University",
  },
  {
    value: "Shanghai University of Finance and Economics",
    label: "Shanghai University of Finance and Economics",
  },
  {
    value: "SIES Graduate School of Technology",
    label: "SIES Graduate School of Technology",
  },
  {
    value: "SRM Institute of Technology",
    label: "SRM Institute of Technology",
  },
  {
    value: "St Francis Institute of Technology",
    label: "St Francis Institute of Technology",
  },
  { value: "University of Mumbai", label: "University of Mumbai" },
  {
    value: "Vellore Institute of Technology",
    label: "Vellore Institute of Technology",
  },
  {
    value: "Visvesvaraya Technological University",
    label: "Visvesvaraya Technological University",
  },
  { value: "Wuhan University", label: "Wuhan University" },
  { value: "Xihua University China", label: "Xihua University China" },
  {
    value:
      "Zhejiang University of Science and TechnologyZhongnan University of Economics and Law",
    label:
      "Zhejiang University of Science and TechnologyZhongnan University of Economics and Law",
  },
];
