import React, { useState, useEffect } from "react";
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
} from "@themesberg/react-bootstrap";
import LoadingOverlay from "react-loading-overlay";
import { Document, Page, Outline } from "react-pdf/dist/esm/entry.webpack";
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

const leftButton = "<";
const rightButton = ">";

export default () => {
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
  // const [uploadProgress, setUploadProgress] = useState(0);
  // const [selectedFiles, setSelectedFiles] = useState(undefined);
  // const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (students.length === 0) {
      fetchData();
      document.title = `Students List`;
    }
    console.log("file selected:", currentFile, validPages);
    setIsChecked(validPages[pageNumber - 1]);
    // console.log(pageNumber, isChecked);
    // let testpages = [];
    // for (let i = 0; i < validPages.length; i++) {
    //     console.log(validPages[i], typeof (validPages[i]))
    //     if (validPages[i] === true) {
    //         testpages.push(i);
    //     }
    // }
    // console.log(loadingText)
  }, [currentFile, pageNumber, validPages, loading]);

  const fetchData = async () => {
    const response = await axios
      .get("/api/students/")
      .then((response) => {
        console.log(response.data);
        setStudents(response.data);
      })
      .catch();
    console.log(students);
  };

  function handleCheckboxChange(event) {
    let newValidPages = [...validPages];
    newValidPages[pageNumber - 1] = event.target.checked;
    setValidPages(newValidPages);
    // setIsChecked(!event.target.checked);
    console.log("box: ", event.target.checked, validPages);
  }

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setValidPages(new Array(numPages).fill(false));
  }

  function changePage(offset) {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
    setIsChecked(validPages[pageNumber - 1]);
    console.log("this page is", validPages[pageNumber - 1]);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  const handleUploadTranscripts = (e) => {
    setShowModal(true);
    console.log(e.target.getAttribute("student-id"));
    setCurrentStudentId(e.target.getAttribute("student-id"));
  }; // on click the upload button

  const handlePrepareTranscripts = (idx, studentId) => {
    setLoadingText("Preparing...");
    setLoading(true);
    studentServices
      .sendToPrepare(studentId)
      .then((res) => {
        console.log("result from the student services" + res);
        changeStudentStatus(idx, ["status"], ["PREPARED"]);
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

  //TODO: it doesn't upload the student list at the first try
  const handleCalculateGPA = (idx, studentId) => {
    setLoadingText("Calculating...");
    setLoading(true);
    studentServices
      .sendToCalculate(studentId)
      .then((res) => {
        const newGpa = res["data"]["gpa"];
        console.log(res["data"]["gpa"]);
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
        console.log(res);
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
    console.log(item);
    setStudents(items);
  };

  const handleClose = () => {
    setShowModal(false);
    setCurrentFile(null);
    setValidPages([]);
    setPageNumber(1);
    setIsChecked(false);
    setPageNumber(1);
    setCurrentStudentId("");
    console.log("selected file flushed");
  };
  const handleSelectFile = (event) => {
    setCurrentFile((prevFiles) => event.target.files[0]); //
  };
  const handleUpload = () => {
    uploadService
      .uploadTranscripts(currentFile, validPages, currentStudentId)
      .then(function (response) {
        // handle success
        console.log(response.data);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .then(function () {
        // always executed
      });
    handleClose();
    //TODO: set student status to processing
  };
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
                          <DropdownButton
                            as={ButtonGroup}
                            title="Process"
                            id="bg-nested-dropdown"
                          >
                            <Dropdown.Item
                              eventKey="1"
                              onClick={handleUploadTranscripts}
                              student-id={student.id}
                            >
                              Upload
                            </Dropdown.Item>

                            <Dropdown.Item
                              student-id={student.id}
                              onClick={() => {
                                handlePrepareTranscripts(idx, student.id);
                              }}
                            >
                              Prepare
                            </Dropdown.Item>
                            {/* {!(student.status.localeCompare("NEW") === 0) && (
                              <Dropdown.Item
                                student-id={student.id}
                                onClick={() => {
                                  handleCalculateGPA(idx, student.id);
                                }}
                              >
                                Calculate GPA
                              </Dropdown.Item>
                            )} */}
                          </DropdownButton>

                          <DropdownButton
                            as={ButtonGroup}
                            title="Transcripts"
                            id="bg-nested-dropdown"
                          >
                            {!(student.status.localeCompare("NEW") == 0) && (
                              <Link
                                className={"dropdown-item"}
                                // disabled={
                                //   student.status.localeCompare("NEW") === 0
                                // }
                                to={{
                                  pathname: `/view-transcripts/${student.id}`,
                                }}
                              >
                                View Prepared Transcripts
                              </Link>
                            )}
                          </DropdownButton>
                          <DropdownButton
                            as={ButtonGroup}
                            title="Edit"
                            id="bg-nested-dropdown"
                          >
                            {/* <Dropdown.Item student-id={student.id}>
                              Update
                            </Dropdown.Item> */}
                            <Dropdown.Item
                              onClick={() =>
                                handleDeleteStudent(idx, student.id)
                              }
                            >
                              Remove
                            </Dropdown.Item>
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
        keyboard={false}
        centered={true}
        // style={{width: 800, justifyContent: 'center', flexDirection: 'column', flex: 1}}
      >
        <Modal.Header closeButton>
          <Modal.Title>Transcript uploading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Please select the pdf and select valid pages.
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Control onChange={handleSelectFile} type="file" />
          </Form.Group>
          {currentFile && (
            <>
              <Document
                file={currentFile}
                onLoadSuccess={onDocumentLoadSuccess}
              >
                <Page
                  pageNumber={pageNumber}
                  // style={"position:relative;"}
                  style={{
                    flex: 1,
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  width={450}
                />
              </Document>
              <Form.Check
                key={Math.random()}
                type={"checkbox"}
                id={`page-select`}
                label={`select`}
                checked={isChecked}
                onChange={handleCheckboxChange}
              />
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
            </>
          )}
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
