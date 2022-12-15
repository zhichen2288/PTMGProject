import React, { useState, useEffect } from "react";
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
  Accordion,
  FormCheck,
} from "@themesberg/react-bootstrap";
import { Link, useParams, useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faPlus,
  faCog,
  faCheck,
  faSearch,
  faSlidersH,
  faAngleLeft,
  faEnvelope,
  faUnlockAlt,
} from "@fortawesome/free-solid-svg-icons";
import axios from "../utils/http-axios";
import uploadService from "../utils/fileUploadServices";
import studentServices from "../utils/studentServices";
import Documentation from "../../components/Documentation";
import { Routes } from "../../routes";
import BgImage from "../../assets/img/illustrations/signin.svg";
import {
  faFacebookF,
  faGithub,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import Select from "react-select";
import { universityNames } from "../utils/studentTable";

export default () => {
  const initStudentInfo = {
    name: "",
    university: "",
    department: "",
  };
  const [studentInfo, setStudentInfo] = useState(initStudentInfo);
  const [selectedValue, setSelectedValue] = useState("");

  const history = useHistory();

  useEffect(() => {
    console.log(studentInfo);
  }, [studentInfo]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setStudentInfo({ ...studentInfo, [name]: value });
  };

  const handleDropdownChange = (event) => {
    debugger;
    setStudentInfo({ ...studentInfo, ["university"]: event.value });
  };

  const handleAddStudent = (event) => {
    event.preventDefault();
    debugger;
    if (studentInfo.name === "") {
      return alert("Please enter student name!");
    } else if (studentInfo.university === "") {
      return alert("Please enter university name!");
    } else if (studentInfo.department === "") {
      return alert("Please enter department name!");
    }

    studentServices
      .sendToCreate(studentInfo)
      .then((res) => {
        console.log(res);
        history.push("/students");
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .then(() => {});
  };
  const handleTest = (event) => {
    history.push("/students");
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
            <Breadcrumb.Item active>Add Student</Breadcrumb.Item>
          </Breadcrumb>
          <h4>Add Student</h4>
          <p className="mb-0">Add a new student here.</p>
        </div>
      </div>
      <article>
        <Container className="px-0">
          <Card className="d-flex flex-wrap flex-md-nowrap align-items-center py-4">
            <Col className="d-block mb-4 mb-md-0">
              <Form onSubmit={handleAddStudent}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Student Name</Form.Label>
                  <Form.Control
                    placeholder="Name"
                    name="name"
                    onChange={handleInputChange}
                  />
                  <Form.Text className="text-muted">
                    Please input a single word.
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>University</Form.Label>
                  <Select
                    name="university"
                    options={universityNames}
                    value={universityNames.find(
                      (o) => o.value === selectedValue
                    )}
                    onChange={(e) => handleDropdownChange(e)}
                  ></Select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Department</Form.Label>
                  <Form.Control
                    placeholder="Department"
                    name="department"
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  Submit
                </Button>
              </Form>
            </Col>
          </Card>
        </Container>
      </article>
    </>
  );
};

// export default () => {
//     const initStudentInfo = {
//         name: "",
//         university: "",
//         department: "",
//     }
//     const [studentInfo, setStudentInfo] = useState(initStudentInfo);
//     const history = useHistory();

//     useEffect(() => {
//         console.log(studentInfo)
//     }, [studentInfo]);

//     const handleInputChange = event => {
//         const {name, value} = event.target;
//         setStudentInfo({...studentInfo, [name]: value});
//     };

//     const handleAddStudent = event => {
//         event.preventDefault();
//         studentServices.sendToCreate(studentInfo)
//             .then(res => {
//                 console.log(res);
//                 history.push('/students')
//             })
//             .catch(function (error) {
//                 // handle error
//                 console.log(error);
//             }).then(() => {
//         });
//     }
//     const handleTest = event =>{
//         history.push('/students')
//     }

//     return (
//         <>
//             <div className="d-lg-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
//                 <div className="mb-4 mb-lg-0">
//                     <Breadcrumb className="d-none d-md-inline-block"
//                                 listProps={{className: "breadcrumb-dark breadcrumb-transparent"}}>
//                         <Breadcrumb.Item><FontAwesomeIcon icon={faHome}/></Breadcrumb.Item>
//                         <Breadcrumb.Item active>Students List</Breadcrumb.Item>
//                         <Breadcrumb.Item active>Add Student</Breadcrumb.Item>
//                     </Breadcrumb>
//                     <h4>Add Student</h4>
//                     <p className="mb-0">Add a new student here.</p>
//                 </div>
//             </div>
//             <article>
//                 <Container className="px-0">
//                     <Card className="d-flex flex-wrap flex-md-nowrap align-items-center py-4">
//                         <Col className="d-block mb-4 mb-md-0">
//                             <Form onSubmit={handleAddStudent}>
//                                 <Form.Group className="mb-3" controlId="formBasicEmail">
//                                     <Form.Label>Student Name</Form.Label>
//                                     <Form.Control placeholder="Name" name="name" onChange={handleInputChange}/>
//                                     <Form.Text className="text-muted">
//                                         Please input a single word.
//                                     </Form.Text>
//                                 </Form.Group>
//                                 <Form.Group className="mb-3" controlId="formBasicPassword">
//                                     <Form.Label>University</Form.Label>
//                                     <Form.Control placeholder="University" name="university"
//                                                   onChange={handleInputChange}/>
//                                 </Form.Group>
//                                 <Form.Group className="mb-3" controlId="formBasicPassword">
//                                     <Form.Label>Department</Form.Label>
//                                     <Form.Control placeholder="Department" name="department"
//                                                   onChange={handleInputChange}/>
//                                 </Form.Group>
//                                 <Button variant="primary" type="submit">
//                                     Submit
//                                 </Button>
//                             </Form>
//                         </Col>
//                     </Card>
//                 </Container>
//             </article>
//             <Button onClick={handleTest}>test</Button>
//         </>
//     );
// };
