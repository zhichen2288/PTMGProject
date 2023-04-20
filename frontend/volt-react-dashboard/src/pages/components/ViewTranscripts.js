import React, { useState, useEffect, useContext } from "react";
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
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";

//Ry
import StateContext from "../../context/stateContext";
import Table from "./Tables";
import { ActionTypes, makeData } from "../utils/studentTable";

export default () => {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;

  let params = useParams();

  const [studentName, setStudentName] = useState("");
  const [tables, setTables] = useState([]);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isMaximized, setIsMaximized] = useState(true);

  const context = useContext(StateContext);

  function toggleMaximize() {
    setIsMaximized(!isMaximized);
  }

  useEffect(() => {
    context.dispatch({ type: ActionTypes.CALL_API });
    const fetchData = async () => {
      const response = await makeData(params["id"]);
      if (response.data.length > 0) {
        context.dispatch({ type: ActionTypes.SUCCESS, data: response.data });
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    saveTableData();
    console.log("before", context.state.resetConsolidatedData);
    if (context.state.resetConsolidatedData) {
      resetConsolidatedData();
      console.log("after", context.state.resetConsolidatedData);
    }
  }, [context.state]);

  async function saveTableData() {
    if (context.state.data === "") return;
    //let result = window.confirm("Please make sure all changes are correct!");
    //if (!result) return;
    let data = [];
    let stateObject = [...context.state.data];

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

  // useEffect(() => {}, [context.state.resetConsolidatedData]);

  async function resetConsolidatedData() {
    const response = await axios.get(
      `/api/students/${params["id"]}/transcript?action=reset_consolidated_data`
    );
    if (response.status === 200) {
      context.dispatch({
        type: ActionTypes.RESET_CONSOLIDATED_DATA,
      });
    }
  }

  async function checkTableData(e) {
    const response = await axios.get(
      `/api/students/${params["id"]}/transcript?action=check_transcript_data`
    );
    if (response.status === 200) {
      let data = response.data;
      context.dispatch({
        type: ActionTypes.HIGHLIGHT_CELL,
        data: JSON.parse(data.data),
      });
    }
  }

  function tableUpdate(e, idx) {
    context.dispatch({ type: ActionTypes.UPDATE_TABLE_CONFIG, table_idx: idx });
  }

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <>
      <div className="d-lg-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
        <div className="mb-4 mb-lg-0">
          <Breadcrumb
            className="d-none d-md-inline-block"
            listProps={{ className: "breadcrumb-dark breadcrumb-transparent" }}
          >
            <Breadcrumb.Item href="..">
              <FontAwesomeIcon icon={faHome} />
            </Breadcrumb.Item>
            <Breadcrumb.Item href="../#/students">
              Students List{" "}
            </Breadcrumb.Item>
            <Breadcrumb.Item active href={`../view-transcripts/${params.id}`}>
              Prepared Transcripts
            </Breadcrumb.Item>
          </Breadcrumb>
          <h4>Prepared Transcripts</h4>
          {/* <p className="mb-0">
            You are viewing the processed transcript of student [{studentName}].
          </p> */}
        </div>
      </div>
      <Accordion defaultActiveKey="0">
        {context.state.data &&
          context.state.data.map((table, idx) => {
            let pdfImagePath = table.image_path.substring(
              0,
              table.image_path.lastIndexOf("\\") + 1
            );
            pdfImagePath = pdfImagePath + `${studentName}-raw-transcripts.pdf`;
            let serverUrl = "http://localhost:8000" + table.image_path;
            return (
              <Accordion.Item eventKey={idx} key={"table-" + idx}>
                <Accordion.Header onClick={(e) => tableUpdate(e, idx)}>
                  Table {idx} on Page {table.page}
                </Accordion.Header>
                <Accordion.Body>
                  <Row>
                    <Col>
                      <Image
                        alt="image"
                        src={serverUrl}
                        onClick={toggleMaximize}
                        style={{
                          maxWidth: isMaximized
                            ? "100%"
                            : window.innerWidth + "px",
                        }}
                      />
                      {/* <Document
                        file={pdfImagePath}
                        onLoadSuccess={onDocumentLoadSuccess}
                      >
                        <Page pageNumber={pageNumber} />
                      </Document> */}
                    </Col>
                    {/* Ry*/}
                    <Col>
                      {/* <JsonToTable
                      hover
                      className="user-table align-items-center"
                      json={table.table_data.data}
                    /> */}

                      <Table
                        columns={table.table_data.columns}
                        data={table.table_data.data}
                        table_idx={idx}
                        page_idx={table.page}
                        dispatch={context.dispatch}
                        skipReset={context.state.skipReset}
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
      <div className="d-lg-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
        <Row xs="auto">
          <Col>
            <Button onClick={(e) => checkTableData(e)}>Check Table Data</Button>
          </Col>
          <Col>
            <Button onClick={(e) => saveTableData()}>Save Table Data</Button>
          </Col>
          <Col>
            <Link
              to={{
                pathname: `/ViewTableData/${params["id"]}`,
              }}
            >
              <Button> View Table Data </Button>
            </Link>
          </Col>
        </Row>
      </div>
    </>
  );
};
