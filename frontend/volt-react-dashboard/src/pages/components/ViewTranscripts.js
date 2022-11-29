import React, { useState, useEffect, useReducer } from "react";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  Button,
  Row,
  Col,
  Image,
  Accordion,
} from "@themesberg/react-bootstrap";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faPlus } from "@fortawesome/free-solid-svg-icons";
import axios from "../utils/http-axios";
import { JsonToTable } from "react-json-to-table";
//Ry
import reducer from "../reducers/tableReducer";
import Table from "./Tables";
import { ActionTypes, makeData } from "../utils/studentTable";

export default () => {
  debugger
  let params = useParams();

  const [state, dispatch] = useReducer(reducer.reducer, reducer.initialState);

  const [studentName, setStudentName] = useState("");
  const [tables, setTables] = useState([]);

  // useEffect(() => {
  //   dispatch({ type: ActionTypes.ENABLE_RESET });
  // }, [state.data]);

  // useEffect(() => {
  //   if (tables.length === 0) {
  //     fetchData();
  //     document.title = `View Transcripts`;
  //     console.log("viewing transcripts of student: ");
  //   }
  //   console.log(studentName);
  // }, [studentName]);

  // const fetchData = async () => {
  //   const response = await axios
  //     .get(`/api/students/${params["id"]}/transcript?action=view`)
  //     .then((response) => {
  //       //console.log(response.data['tables']);
  //       setTables(response.data["tables"]);
  //       setStudentName(response.data["student_name"]);
  //     })
  //     .catch();
  // };

  // const columns = [
  //   {
  //     //=(alldata) => [console.log(alldata[0]),
  //     dataField: "index",
  //     text: "index",
  //   },
  //   {
  //     dataField: "Course Title",
  //     text: "Course Title",
  //   },
  //   {
  //     dataField: "Credit",
  //     text: "Credit",
  //   },
  //   {
  //     dataField: "Score",
  //     text: "Score",
  //   },
  //   {
  //     dataField: "Grade Point",
  //     text: "Grade Point",
  //   },
  // ];

  // const EditCell = ({ rowData, onChange, ...props }) => {
  //   tables.map((table) => {
  //     rowData = JSON.parse(table.table_data)["data"];

  //     console.log(JSON.parse(table.table_data)["schema"]["fields"]);
  //   });
  //   console.log("obgynnnnnnnnnnnnnnnnnnnnnnnn");
  //   console.log(rowData);
  //   console.log("rowDatazzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz");
  //   return (
  //     <Cell {...props}>
  //       {rowData !== null ? (
  //         <input className="input" defaultValue={JSON.stringify(rowData)} />
  //       ) : (
  //         rowData
  //       )}
  //     </Cell>
  //   );
  // };

  //Ry---modified
  // const onSaveData = async () => {
  //   // const columns = Array.from(tableEl.querySelectorAll("th")).map(
  //   //   (it) => it.textContent
  //   // );
  //   // const rows = tableEl.querySelectorAll("tbody > tr");
  //   // return Array.from(rows).map((row) => {
  //   //   const cells = Array.from(row.querySelectorAll("td"));
  //   //   return columns.reduce((obj, col, idx) => {
  //   //     obj[col] = cells[idx].textContent;
  //   //     return obj;
  //   //   }, {});
  //   // });

  //   console.log("Save data");
  // };
  console.log("state", state);

  useEffect(() => {
    dispatch({ type: ActionTypes.CALL_API });
    const fetchData = async () => {
      const response = await makeData(params["id"]);
      if (response.data.length > 1) {
        debugger
        dispatch({ type: ActionTypes.SUCCESS, data: response.data });
      }
    };
    fetchData();
  }, []);

  async function SaveTableData(e) {
    debugger
    let data = [];
    let stateObject = [...state.data];

    stateObject.map((i) => {
      let stateDBObject = {};
      stateDBObject["page"] = i.page;
      stateDBObject["table_data"] = JSON.stringify(i.table_data);
      stateDBObject["table_num"] = i.table_num;
      stateDBObject["image_path"] = i.image_path;
      data.push(stateDBObject);
    });

    const response = await axios.post(
      `/api/students/${params["id"]}/updateTranscript`,
      {
        data: data,
      }
    );
  }

  function tableUpdate(e, idx) {
    dispatch({ type: ActionTypes.UPDATE_TABLE_CONFIG, table_idx: idx });
  }

  return (
    <>
      <div className="d-lg-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
        <div className="mb-4 mb-lg-0">
          <Breadcrumb
            className="d-none d-md-inline-block"
            listProps={{ className: "breadcrumb-dark breadcrumb-transparent" }}
          >
            <Breadcrumb.Item>
              <FontAwesomeIcon icon={faHome} />
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Students List</Breadcrumb.Item>
            <Breadcrumb.Item active>Prepared Transcripts</Breadcrumb.Item>
          </Breadcrumb>
          <h4>Prepared Transcripts</h4>
          <p className="mb-0">
            You are viewing the processed transcript of student [{studentName}].
          </p>
        </div>
        <div className="btn-toolbar mb-2 mb-md-0">
          <Button variant="primary" size="sm">
            <FontAwesomeIcon icon={faPlus} className="me-2" /> Add New Student
          </Button>
        </div>
      </div>
      <Accordion defaultActiveKey="0">
        {state.data &&
          state.data.map((table, idx) => {
            // let columnNames = JSON.parse(table.table_data)["schema"]["fields"];
            // const newColumnNames = columnNames.map((v) => ({
            //   ...v,
            //   dataField: v.name,
            //   text: v.name,
            // }));
            console.log("state", state);

            return (
              <Accordion.Item eventKey={idx} key={"table-" + idx}>
                <Accordion.Header onClick={(e) => tableUpdate(e, idx)}>
                  Table {idx} on Page {table.page}
                </Accordion.Header>
                <Accordion.Body>
                  <Row>
                    <Col>
                      <Image src={table.image_path} />
                    </Col>
                    {/* Ry*/}
                    <Col>
                      {/* <BootstrapTable
                      key={`$(table.page) "+" $(table.table_num)`}
                      keyField="index"
                      data={JSON.parse(table.table_data)["data"]}
                      columns={newColumnNames}
                      // cellEdit={cellEditFactory({
                      //   mode: "click",
                      //   blurToSave: true,
                      // })}
                    /> */}
                      {/* <JsonToTable
                      hover
                      className="user-table align-items-center"
                      json={table.table_data.data}
                    /> */}
                      {/* 
                    <Button type="submit" id="btn" onClick={onSaveData}>
                      save
                    </Button> */}
                      <Table
                        columns={table.table_data.columns}
                        data={table.table_data.data}
                        table_idx={idx}
                        page_idx={table.page}
                        dispatch={dispatch}
                        skipReset={state.skipReset}
                      />
                    </Col>
                  </Row>
                  {/* <Row>
                  <Col>
                    <EditCell />
                  </Col>
                </Row> */}
                </Accordion.Body>
              </Accordion.Item>
            );
          })}
      </Accordion>
      <Row>
        <Col>
          <Link
            to={{
              pathname: `/ViewTableData/${params["id"]}`,
            }}
          >
            <Button> View Table Data </Button>
          </Link>
          <Button onClick={(e) => SaveTableData(e)}>Save Table Data</Button>
        </Col>
      </Row>
    </>
  );
};