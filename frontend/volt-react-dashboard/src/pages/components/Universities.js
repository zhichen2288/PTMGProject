import React, {useState, useEffect} from "react";
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
    Modal
} from "@themesberg/react-bootstrap";
import {Document, Page, Outline} from 'react-pdf/dist/esm/entry.webpack';
// import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faHome, faPlus, faCog, faCheck, faSearch, faSlidersH} from '@fortawesome/free-solid-svg-icons';
import axios from "../utils/http-axios"
import uploadService from "../utils/fileUploadServices"

const leftButton = "<";
const rightButton = ">";

export default () => {
    const [universities, setUniversities] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentFile, setCurrentFile] = useState(null);
    const [validPages, setValidPages] = useState([]);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [isChecked, setIsChecked] = useState(false);
    const [currentStudentId, setCurrentStudentId] = useState("");
    // const [uploadProgress, setUploadProgress] = useState(0);
    // const [selectedFiles, setSelectedFiles] = useState(undefined);
    // const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (universities.length === 0) {
            fetchData();
            document.title = `Universities List`;
        }
        console.log('file selected:', currentFile, validPages);
        setIsChecked(validPages[pageNumber - 1]);
        // console.log(pageNumber, isChecked);
    }, [currentFile, pageNumber, validPages]);

    const fetchData = async () => {
        const response = await axios.get("/api/universities/")
            .then((response) => {
                console.log(response.data);
                setUniversities(response.data);
            }).catch();
        console.log(universities);
    }

    function handleCheckboxChange(event) {
        let newValidPages = [...validPages];
        newValidPages[pageNumber - 1] = event.target.checked;
        setValidPages(newValidPages);
        // setIsChecked(!event.target.checked);
        console.log('box: ', event.target.checked, validPages);
    }

    function onDocumentLoadSuccess({numPages}) {
        setNumPages(numPages);
        setValidPages(new Array(numPages).fill(false));
    }

    function changePage(offset) {
        setPageNumber(prevPageNumber => prevPageNumber + offset);
        setIsChecked(validPages[pageNumber - 1]);
        console.log('this page is', validPages[pageNumber - 1]);
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
    const handleClose = () => {
        setShowModal(false);
        setCurrentFile(null);
        setValidPages([]);
        setPageNumber(1);
        setIsChecked(false);
        setPageNumber(1);
        setCurrentStudentId("");
        console.log('selected file flushed');
    };
    const handleSelectFile = (event) => {
        setCurrentFile(prevFiles => (event.target.files[0]));  //
    };
    const handleUpload = () => {
        uploadService.uploadTranscripts(currentFile, validPages, currentStudentId)
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
    };
    return (
        <>
            <div className="d-lg-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                <div className="mb-4 mb-lg-0">
                    <Breadcrumb className="d-none d-md-inline-block"
                                listProps={{className: "breadcrumb-dark breadcrumb-transparent"}}>
                        <Breadcrumb.Item><FontAwesomeIcon icon={faHome}/></Breadcrumb.Item>
                        <Breadcrumb.Item active>Universities List</Breadcrumb.Item>
                    </Breadcrumb>
                    <h4>Universities List</h4>
                    <p className="mb-0">The universities sitting in our Database.</p>
                </div>
                <div className="btn-toolbar mb-2 mb-md-0">
                    <Button variant="primary" size="sm">
                        <FontAwesomeIcon icon={faPlus} className="me-2"/> Add New University
                    </Button>
                </div>

            </div>
            <div className="table-settings mb-4">
                <Row className="justify-content-between align-items-center">
                    <Col xs={9} lg={4} className="d-flex">
                        <InputGroup className="me-2 me-lg-3">
                            <InputGroup.Text>
                                <FontAwesomeIcon icon={faSearch}/>
                            </InputGroup.Text>
                            <Form.Control type="text" placeholder="Search"/>
                        </InputGroup>
                        <Form.Select className="w-25">
                            <option defaultChecked>All</option>
                            <option value="1">Active</option>
                            <option value="2">Inactive</option>
                            <option value="3">Pending</option>
                            <option value="3">Canceled</option>
                        </Form.Select>
                    </Col>
                    <Col xs={3} lg={8} className="text-end">
                        <Dropdown as={ButtonGroup} className="me-2">
                            <Dropdown.Toggle split as={Button} variant="link" className="text-dark m-0 p-0">
                    <span className="icon icon-sm icon-gray">
                        <FontAwesomeIcon icon={faSlidersH}/>
                    </span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="dropdown-menu-right">
                                <Dropdown.Item className="fw-bold text-dark">Show</Dropdown.Item>
                                <Dropdown.Item className="d-flex fw-bold">
                                    10 <span className="icon icon-small ms-auto"><FontAwesomeIcon
                                    icon={faCheck}/></span>
                                </Dropdown.Item>
                                <Dropdown.Item className="fw-bold">20</Dropdown.Item>
                                <Dropdown.Item className="fw-bold">30</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                        <Dropdown as={ButtonGroup}>
                            <Dropdown.Toggle split as={Button} variant="link" className="text-dark m-0 p-0">
                    <span className="icon icon-sm icon-gray">
                        <FontAwesomeIcon icon={faCog}/>
                    </span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="dropdown-menu-right">
                                <Dropdown.Item className="fw-bold text-dark">Show</Dropdown.Item>
                                <Dropdown.Item className="d-flex fw-bold">
                                    10 <span className="icon icon-small ms-auto"><FontAwesomeIcon
                                    icon={faCheck}/></span>
                                </Dropdown.Item>
                                <Dropdown.Item className="fw-bold">20</Dropdown.Item>
                                <Dropdown.Item className="fw-bold">30</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                </Row>
            </div>

            <Card border="light" className="table-wrapper table-responsive shadow-sm">
                <Card.Body>
                    <Table hover className="user-table align-items-center">
                        <thead>
                        <tr>
                            <th className="border-bottom">Name</th>
                            <th className="border-bottom">Actions</th>
                            {/*<th className="border-bottom">Used</th>*/}
                        </tr>
                        </thead>
                        <tbody>
                        {universities.map((university, idx) => {
                            return (
                                <tr key={university.id}>
                                    <td>
                                        <Card.Link className="d-flex align-items-center">
                                            <div className="d-block">
                                                <span className="fw-bold">{university.name}</span>
                                            </div>
                                        </Card.Link>
                                    </td>
                                    {/*<td>{student.name}</td>*/}
                                    {/*<td>{university.name}</td>*/}
                                    <td>
                                        <ButtonGroup className="me-2" aria-label="Actions">
                                            <Button>Edit</Button>
                                            <Button>Remove</Button>
                                        </ButtonGroup>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </>
    );
};

