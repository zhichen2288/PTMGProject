import React, { useState, useEffect, useContext } from "react";
import { Button, Form, Tabs, Tab } from "@themesberg/react-bootstrap";
import { Container, Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";
// import { JsonToTable } from "react-json-to-table";
import axios from "../utils/http-axios";
import ViewTable from "./ViewTable";
import StateContext from "../../context/stateContext";
const _ = require("lodash");

export default () => {
  let params = useParams();
  const context = useContext(StateContext);

  const [studentName, setStudentName] = useState("");
  const [data, setData] = useState({});
  const [calcgpaText, setcalcgpaText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("");
  const [activeTab, setActiveTab] = useState("main");
  const [clearSelectedRows, setClearSelectedRows] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(
        `/api/students/${params["id"]}/transcript?action=viewtables`
      );
      //const tabLength = response.data.data["tabs"].length;
      const tabData = [];
      debugger;
      if (response.data && response.data.data) {
        const responseData = JSON.parse(response.data.data);
        if (responseData.tabContent && responseData.tabContent.length > 0) {
          responseData.tabContent.forEach((element) => {
            tabData.push({
              tabName: element.name,
              data: JSON.parse(element.data),
              gpa: element.GPA,
            });
          });
          setData({
            tabs: responseData.tabs,
            tabData: tabData,
          });
        }
      } else {
        setData({
          tabs: [],
          tabData: [],
        });
      }

      setStudentName(response.data["student_name"]);
      setIsLoading(false);

      console.log(response);
    };
    fetchData();
    document.title = `View Table Data`;
  }, []);

  async function calculateGPA(e) {
    const response = await axios.get(
      `/api/students/${params["id"]}/transcript?action=calculateGPA`
    );
    console.log(response);
    if (response.data.result) {
      setcalcgpaText(response.data.result);
    }
  }

  const handleChange = (event) => {
    setcalcgpaText(event.target.value);
  };

  const handleSave = (tabname, data) => {
    if (selectedTab !== "") {
      const tabContent = data.tabData.find((e) => e.tabName === selectedTab);
      checkIfDuplicate(selectedTab, tabContent.data);
      setSelectedTab("");
      setClearSelectedRows(true);
    } else {
      alert("Please select a tab other than main to add rows");
    }
  };

  function checkIfDuplicate(tabname, data) {
    const rowsToAdd = context.state.consolidatedData;
    const combinedArr = _.unionWith(data, rowsToAdd, _.isEqual);
    console.log("uniqueRows", combinedArr);
  }

  const handleAddRow = (tabname) => {
    debugger;
    setSelectedTab(tabname);
    setActiveTab("main");
  };

  return (
    <>
      <div className="d-lg-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
        <div className="mb-4 mb-lg-0">
          <h4>Transcript</h4>
          <p className="mb-0">
            You are viewing the processed transcript of student: {studentName}.
          </p>
        </div>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : data.tabData.length > 0 ? (
        <Tabs
          activeKey={activeTab}
          id="section-tab"
          className="mb-3"
          onSelect={(k) => setActiveTab(k)}
        >
          {data.tabData.map((tab, index) => (
            <Tab key={index} eventKey={tab.tabName} title={tab.tabName}>
              <ViewTable
                data={tab.data}
                rowSelection={tab.tabName === "main"}
                clearSelection={clearSelectedRows}
              />

              <Container>
                <Row className="justify-content-md-center">
                  {tab.tabName !== "main" && (
                    <Col sm={2}>
                      {" "}
                      <Button
                        onClick={() => {
                          handleAddRow(tab.tabName);
                        }}
                        variant="primary"
                      >
                        Add Row
                      </Button>
                    </Col>
                  )}

                  <Col sm={2}>
                    {" "}
                    <Button
                      onClick={() => {
                        handleSave(tab.tabName, data);
                      }}
                      variant="primary"
                    >
                      Save
                    </Button>
                  </Col>
                  <Col sm={4}>
                    {" "}
                    <Button
                      onClick={(e) => {
                        calculateGPA(e);
                      }}
                      variant="primary"
                    >
                      Calculate GPA
                    </Button>
                  </Col>
                  <Col sm={4}>
                    {" "}
                    <Form.Control
                      placeholder="GPA..."
                      readOnly={true}
                      id="gpaText"
                      name="gpaText"
                      onChange={handleChange}
                      value={calcgpaText}
                    />
                    {/* <div className="vr" /> */}
                  </Col>
                </Row>
              </Container>
            </Tab>
          ))}
        </Tabs>
      ) : (
        <p>No data to display.</p>
      )}
    </>
  );
};
