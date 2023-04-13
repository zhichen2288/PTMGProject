import React, { useState, useEffect, useContext } from "react";
import { Button, Form, Tabs, Tab } from "@themesberg/react-bootstrap";
import { Container, Row, Col, InputGroup } from "react-bootstrap";
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
  const [rowsDeleted, setRowsDeleted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(
        `/api/students/${params["id"]}/transcript?action=viewtables`
      );
      //const tabLength = response.data.data["tabs"].length;
      const tabData = [];
      if (response.data && response.data.data) {
        const responseData = JSON.parse(response.data.data);
        if (responseData.tabContent && responseData.tabContent.length > 0) {
          responseData.tabContent.forEach((element) => {
            if (element.data === "") {
              tabData.push({
                tabName: element.name,
                data: "",
                gpa: element.GPA,
              });
            } else {
              tabData.push({
                tabName: element.name,
                data: JSON.parse(element.data),
                gpa: element.GPA,
              });
            }
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
    };
    fetchData();
    document.title = `View Table Data`;
  }, []);

  async function calculateGPA(e, tabName) {
    const response = await axios.get(
      `/api/students/${params["id"]}/transcript?action=calculateGPA&tabname=${tabName}`
    );
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

  function handleRowsDeletion(tabName, newData) {
    console.log(tabName, newData);
    const tabContent = data.tabData.find((e) => e.tabName === tabName);
    tabContent.data = newData.length > 0 ? newData : "";
    setData({
      ...data,
      tabData: data.tabData,
    });
    saveDataToDB(tabName);
  }

  function checkIfDuplicate(tabname, tabdata) {
    const rowsToAdd = context.state.consolidatedData;
    const combinedArr = _.unionWith(tabdata, rowsToAdd, _.isEqual);
    if (combinedArr.length > 0) {
      const tabContent = data.tabData.find((e) => e.tabName === tabname);
      tabContent.data = combinedArr;

      setData({
        ...data,
        tabData: data.tabData,
      });
      saveDataToDB("");
    }
  }

  async function saveDataToDB(tabName) {
    const response = await axios.post(
      `/api/students/${params["id"]}/updateConsolidatedData`,
      {
        data: data,
      }
    );
    if (response.status === 200) {
      setActiveTab(tabName === "" ? selectedTab : tabName);
      //alert("Data saved successfully");
    }
  }

  const handleAddRow = (tabname) => {
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
              {tab.data !== "" && (
                <ViewTable
                  data={tab.data}
                  rowSelection={tab.tabName === "main"}
                  clearSelection={clearSelectedRows}
                  onUpdateData={handleRowsDeletion}
                  tabName={tab.tabName}
                />
              )}

              <Row className="justify-content-md-center">
                {tab.tabName !== "main" && (
                  <Col md="auto">
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
                {tab.tabName === "main" && (
                  <Col md="auto">
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
                )}

                <Col md="auto">
                  {" "}
                  <InputGroup className="mb-3">
                    <Button
                      onClick={(e) => {
                        calculateGPA(e, tab.tabName);
                      }}
                      variant="primary"
                    >
                      Calculate GPA
                    </Button>
                    <Form.Control
                      placeholder={`  ${tab.tabName} GPA`}
                      readOnly={true}
                      id="gpaText"
                      name="gpaText"
                      onChange={handleChange}
                      value={tab.GPA}
                    />
                  </InputGroup>
                </Col>
              </Row>
            </Tab>
          ))}
        </Tabs>
      ) : (
        <p>No data to display.</p>
      )}
    </>
  );
};
