import React, { useState, useEffect } from "react";
import {
  Breadcrumb,
  Button,
  Col,
  Form,
  Card,
  Container,
} from "@themesberg/react-bootstrap";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import studentServices from "../utils/studentServices";
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
  const [dropdownVal, setDropdownVal] = useState(undefined);

  const history = useHistory();

  useEffect(() => {
    console.log(studentInfo);
  }, [studentInfo]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "otherUniversityName") {
      setStudentInfo({ ...studentInfo, ["university"]: value });
    } else {
      setStudentInfo({ ...studentInfo, [name]: value });
    }
  };

  const handleDropdownChange = (event) => {
    setDropdownVal(event.value);
    setStudentInfo({ ...studentInfo, ["university"]: event.value });
  };

  const handleAddStudent = (event) => {
    event.preventDefault();
    if (studentInfo.name === "") {
      return alert("Please enter student name!");
    } else if (studentInfo.university === "") {
      return alert("Please enter university name!");
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
                <Form.Group className="mb-3" controlId="studentName">
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
                <Form.Group className="mb-3" controlId="universityName">
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
                {dropdownVal === "Other" && (
                  <Form.Group className="mb-3" controlId="otherUniversityName">
                    <Form.Label>University Name</Form.Label>
                    <Form.Control
                      placeholder="Enter University Name"
                      name="otherUniversityName"
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                )}
                <Form.Group className="mb-3" controlId="departmentName">
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
