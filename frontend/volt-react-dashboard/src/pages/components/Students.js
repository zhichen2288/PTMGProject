import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  Button,
  ButtonGroup,
  Row,
  Col,
  InputGroup,
  Form,
  Dropdown,
  Card,
  Table,
  Image,
  DropdownButton,
  Modal,
  Spinner,
  Container,
} from "@themesberg/react-bootstrap";
import LoadingOverlay from "react-loading-overlay";
// import { Document, Page } from "react-pdf/dist/esm/entry.webpack";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";

// import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faPlus,
  faCog,
  faCheck,
  faSearch,
  faSlidersH,
} from "@fortawesome/free-solid-svg-icons";
import axios from "../utils/http-axios";
import uploadService from "../utils/fileUploadServices";
import studentServices from "../utils/studentServices";
import { ActionTypes } from "../utils/studentTable";

import ImageCrop from "./imageCroppers/ImageCrop";
import StateContext from "../../context/stateContext";

const leftButton = "<";
const rightButton = ">";

export default () => {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;

  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [validPages, setValidPages] = useState([]);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isChecked, setIsChecked] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [currentRow, setCurrentRow] = useState("");
  const [canvasImage, SetCanvasImage] = useState("");
  const [count, setCount] = useState(1);

  const context = useContext(StateContext);

  useEffect(() => {
    context.dispatch({ type: ActionTypes.CALL_API });
    console.log("context", context.state);
  }, []);

  useEffect(() => {
    if (students.length === 0) {
      fetchData();
      document.title = `Students List`;
    }
    setIsChecked(validPages[pageNumber - 1]);
  }, [currentFile, pageNumber, validPages, loading]);

  const fetchData = async () => {
    const response = await axios
      .get("/api/students/")
      .then((response) => {
        setStudents(response.data);
      })
      .catch();
  };

  function handleCheckboxChange(event) {
    let newValidPages = [...validPages];
    newValidPages[pageNumber - 1] = event.target.checked;
    setValidPages(newValidPages);
  }

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setValidPages(new Array(numPages).fill(false));
  }

  function changePage(offset) {
    setCount(1);
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
    setIsChecked(validPages[pageNumber - 1]);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  const handleUploadTranscripts = (e, idx, studentId) => {
    setShowModal(true);
    setCurrentStudentId(studentId);
    setCurrentRow(idx);
  }; // on click the upload button

  const handlePrepareTranscripts = (student, idx, studentId) => {
    if (!(student.status.localeCompare("NEW") == 0)) {
      return alert("Please upload a new transcript");
    }
    setLoadingText("Preparing...");
    setLoading(true);
    studentServices
      .sendToPrepare(studentId)
      .then((res) => {
        changeStudentStatus(idx, ["status"], ["PREPARED"]);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
        alert("Please upload a valid transcript!");
      })
      .then(() => {
        setLoading(false);
        setLoadingText("...");
      });
  };

  //TODO: it doesn't upload the student list at the first try
  const handleCalculateGPA = (idx, studentId) => {
    setLoadingText("Calculating...");
    setLoading(true);
    studentServices
      .sendToCalculate(studentId)
      .then((res) => {
        const newGpa = res["data"]["gpa"];
        changeStudentStatus(idx, ["gpa", "status"], [newGpa, "COMPLETE"]);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .then(() => {
        setLoading(false);
        setLoadingText("...");
      });
  };

  const handleDeleteStudent = (idx, studentId) => {
    setLoadingText("Deleting...");
    setLoading(true);
    studentServices
      .sendToDestroy(studentId)
      .then((res) => {
        students.splice(idx, 1);
        setStudents(students);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .then(() => {
        setLoading(false);
        setLoadingText("...");
      });
  };

  const changeStudentStatus = (idx, columns, newStatuses) => {
    let items = [...students];
    let item = { ...items[idx] };
    for (let i = 0; i < columns.length; i++) {
      item[columns[i]] = newStatuses[i];
    }
    items[idx] = item;
    setStudents(items);
  };

  const handleClose = () => {
    setShowModal(false);
    setCurrentFile(null);
    setValidPages([]);
    setPageNumber(1);
    setCount(1);
    setIsChecked(false);
    setCurrentStudentId("");
    setCurrentRow("");
    SetCanvasImage("");
    clearImageData();
  };

  const handleSelectFile = (event) => {
    clearImageData();
    setCurrentFile(event.target.files[0]);
  };

  const clearImageData = () => {
    context.dispatch({
      type: ActionTypes.CLEAR_IMAGE_DATA,
    });
  };

  function deepCopy(arr) {
    return arr.map((obj) => Object.assign({}, obj));
  }

  const handleUpload = () => {
    debugger;
    let snippedImages = [];
    if (context.state.images.length >= 1) {
      snippedImages = deepCopy(context.state.images);
    } else {
      alert("No image to upload!");
      return;
    }

    uploadService
      .uploadTranscripts(
        currentFile,
        validPages,
        currentStudentId,
        snippedImages
      )
      .then(function (response) {
        // handle success
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .then(function () {
        // always executed
      });
    handleClose();
    changeStudentStatus(currentRow, ["status"], ["NEW"]);
    //TODO: set student status to processing
  };

  function incrementCount() {
    setCount(count + 1);
    return count;
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
          </Breadcrumb>
          <h4>Students List</h4>
        </div>
        <div className="btn-toolbar mb-2 mb-md-0">
          <Link
            className={"react-button"}
            variant="primary"
            size="sm"
            to={{
              pathname: `/add-student`,
            }}
          >
            {/*<FontAwesomeIcon icon={faPlus} className="me-2"/> Add New Student*/}
            <Button variant="primary" size="sm">
              <FontAwesomeIcon icon={faPlus} className="me-2" /> Add New Student
            </Button>
          </Link>
        </div>
      </div>
      <div className="table-settings mb-4">
        <Row className="justify-content-between align-items-center">
          <Col xs={9} lg={4} className="d-flex">
            <InputGroup className="me-2 me-lg-3">
              <InputGroup.Text>
                <FontAwesomeIcon icon={faSearch} />
              </InputGroup.Text>
              <Form.Control type="text" placeholder="Search" />
            </InputGroup>
            <Form.Select className="w-25">
              <option defaultChecked>All</option>
              <option value="1">New</option>
              <option value="2">Prepared</option>
              <option value="3">Complete</option>
            </Form.Select>
          </Col>
          <Col xs={3} lg={8} className="text-end">
            <Dropdown as={ButtonGroup} className="me-2">
              <Dropdown.Toggle
                split
                as={Button}
                variant="link"
                className="text-dark m-0 p-0"
              >
                <span className="icon icon-sm icon-gray">
                  <FontAwesomeIcon icon={faSlidersH} />
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu-right">
                <Dropdown.Item className="fw-bold text-dark">
                  Show
                </Dropdown.Item>
                <Dropdown.Item className="d-flex fw-bold">
                  10{" "}
                  <span className="icon icon-small ms-auto">
                    <FontAwesomeIcon icon={faCheck} />
                  </span>
                </Dropdown.Item>
                <Dropdown.Item className="fw-bold">20</Dropdown.Item>
                <Dropdown.Item className="fw-bold">30</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown as={ButtonGroup}>
              <Dropdown.Toggle
                split
                as={Button}
                variant="link"
                className="text-dark m-0 p-0"
              >
                <span className="icon icon-sm icon-gray">
                  <FontAwesomeIcon icon={faCog} />
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu-right">
                <Dropdown.Item className="fw-bold text-dark">
                  Show
                </Dropdown.Item>
                <Dropdown.Item className="d-flex fw-bold">
                  10{" "}
                  <span className="icon icon-small ms-auto">
                    <FontAwesomeIcon icon={faCheck} />
                  </span>
                </Dropdown.Item>
                <Dropdown.Item className="fw-bold">20</Dropdown.Item>
                <Dropdown.Item className="fw-bold">30</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>
      </div>
      <LoadingOverlay active={loading} spinner text={loadingText}>
        <Card
          border="light"
          className="table-wrapper table-responsive shadow-sm"
        >
          <Card.Body>
            <Table hover className="user-table align-items-center">
              <thead>
                <tr>
                  <th className="border-bottom">Name</th>
                  {/* <th className="border-bottom">GPA</th> */}
                  <th className="border-bottom">University</th>
                  <th className="border-bottom">Department</th>
                  <th className="border-bottom">Status</th>
                  <th className="border-bottom">Actions</th>
                  {/*<th className="border-bottom">Used</th>*/}
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => {
                  return (
                    <tr key={student.id}>
                      <td>
                        <Card.Link className="d-flex align-items-center">
                          <div className="d-block">
                            <span className="fw-bold">{student.name}</span>
                          </div>
                        </Card.Link>
                      </td>
                      {/* <td>{student["gpa"] != 0 ? student["gpa"] : "N/A"}</td> */}
                      <td>{student.education.university}</td>
                      <td>{student.education.department}</td>
                      <td>{student.status}</td>
                      <td>
                        <ButtonGroup className="me-2" aria-label="Actions">
                          <Button
                            title="Upload"
                            eventkey="1"
                            onClick={(e) => {
                              handleUploadTranscripts(e, idx, student.id);
                            }}
                            student-id={student.id}
                          >
                            Upload
                          </Button>

                          <Button
                            title="Prepare"
                            id="bg-nested-dropdown"
                            student-id={student.id}
                            onClick={() => {
                              handlePrepareTranscripts(
                                student,
                                idx,
                                student.id
                              );
                            }}
                          >
                            Process
                          </Button>

                          <DropdownButton
                            as={ButtonGroup}
                            title="Edit"
                            id="bg-nested-dropdown"
                          >
                            <Dropdown.Item
                              onClick={() =>
                                handleDeleteStudent(idx, student.id)
                              }
                            >
                              Remove
                            </Dropdown.Item>
                          </DropdownButton>

                          <DropdownButton
                            as={ButtonGroup}
                            title="Transcripts"
                            id="bg-nested-dropdown"
                          >
                            {!(student.status.localeCompare("NEW") == 0) ? (
                              <Link
                                className={"dropdown-item"}
                                to={{
                                  pathname: `/view-transcripts/${student.id}`,
                                }}
                              >
                                View Prepared Transcripts
                              </Link>
                            ) : (
                              <span> No transcripts found! </span>
                            )}
                          </DropdownButton>
                        </ButtonGroup>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </LoadingOverlay>
      <Modal
        show={showModal}
        onHide={handleClose}
        backdrop="static"
        centered={true}
        fullscreen={true}
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Transcript uploading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Please select the pdf and select valid pages.
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Control onChange={handleSelectFile} type="file" />
          </Form.Group>
          <Container fluid>
            {currentFile && (
              <>
                <Row>
                  <Col md={12}>
                    <Document
                      style={{ border: "1px solid black" }}
                      file={currentFile}
                      onLoadSuccess={onDocumentLoadSuccess}
                    >
                      {/* <Page
                        size="A4"
                        style={{ backgroundColor: "tomato" }}
                        devicePixelRatio={96}
                        pageNumber={pageNumber}
                        onLoadSuccess={loadComplete}
                        // style={"position:relative;"}
                        // style={{
                        //   flex: 1,
                        //   flexDirection: "column",
                        //   justifyContent: "center",
                        //   alignItems: "center",
                        // }}
                        width={450}
                      /> */}
                      <ImageCrop
                        pageNumber={pageNumber}
                        onIncrement={incrementCount}
                      ></ImageCrop>
                    </Document>
                  </Col>
                </Row>
                <Row>
                  <Col md={3}>
                    <ButtonGroup>
                      <Button
                        // variant="secondary"
                        disabled={pageNumber <= 1}
                        onClick={previousPage}
                      >
                        {leftButton}
                      </Button>
                      <Button disabled={true}>
                        Page {pageNumber || (numPages ? 1 : "--")} of{" "}
                        {numPages || "--"}
                      </Button>
                      <Button
                        // variant="secondary"
                        disabled={pageNumber >= numPages}
                        onClick={nextPage}
                      >
                        {rightButton}
                      </Button>
                    </ButtonGroup>
                  </Col>
                  <Col md={3}>
                    {/* <Form.Check
                      key={Math.random()}
                      type={"checkbox"}
                      id={`page-select`}
                      label={`select whole page`}
                      checked={isChecked}
                      onChange={handleCheckboxChange}
                    /> */}
                  </Col>
                </Row>
              </>
            )}
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!currentFile}
          >
            Upload
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
