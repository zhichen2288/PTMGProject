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
} from "@themesberg/react-bootstrap";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faHome, faPlus, faCog, faCheck, faSearch, faSlidersH} from '@fortawesome/free-solid-svg-icons';
import ETicon from "../../assets/img/ET-icon-copyright-free.jpg";
import axios from '../utils/http-axios';


export default () => {
    const [enginesUsage, setEnginesUsage] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get("/get-usage")
                .then((response)=>{
                    console.log(response.data);
                    setEnginesUsage(response.data['enginesUsage']);
                }).
                catch();
            console.log(enginesUsage);
        }
        document.title = `Engines List`;
        fetchData();
    },[]);
    return (
        <>
            <div className="d-lg-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
                <div className="mb-4 mb-lg-0">
                    <Breadcrumb className="d-none d-md-inline-block"
                                listProps={{className: "breadcrumb-dark breadcrumb-transparent"}}>
                        <Breadcrumb.Item><FontAwesomeIcon icon={faHome}/></Breadcrumb.Item>
                        <Breadcrumb.Item active>Engines List</Breadcrumb.Item>
                    </Breadcrumb>
                    <h4>Engines List</h4>
                    <p className="mb-0">The engines we are providing.</p>
                </div>
                <div className="btn-toolbar mb-2 mb-md-0">
                    <Button variant="primary" size="sm">
                        <FontAwesomeIcon icon={faPlus} className="me-2"/> Add New Engine
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
                            <th className="border-bottom">Plan</th>
                            <th className="border-bottom">Credits</th>
                            <th className="border-bottom">Queued</th>
                            <th className="border-bottom">Used</th>
                        </tr>
                        </thead>
                        <tbody>

                        <tr>
                            <td>
                                <Card.Link className="d-flex align-items-center">
                                    {/*<Image src="https://www.extracttable.com/img/logo.svg" className="user-avatar rounded-circle me-3"/>*/}
                                    <Image src={ETicon} className="user-avatar rounded-circle me-3"/>
                                    <div className="d-block">
                                        <span className="fw-bold">ExtraTable</span>
                                    </div>
                                </Card.Link>
                            </td>
                            <td>EXTRA</td>
                            <td>{enginesUsage.length>0 && enginesUsage[0]['credits']}</td>
                            <td>{enginesUsage.length>0 && enginesUsage[0]['queued']}</td>
                            <td>{enginesUsage.length>0 && enginesUsage[0]['used']}</td>
                        </tr>


                        </tbody>
                    </Table>
                </Card.Body>
            </Card>


        </>
    );
};

