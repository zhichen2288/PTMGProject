import React, { useState, useContext } from "react";
import {
  Breadcrumb,
  Button,
  ButtonGroup,
  Row,
  Col,
  InputGroup,
  Form,
  Dropdown,
  Table,
  Image,
  DropdownButton,
  Modal,
  Spinner,
  Container,
  Card,
  CardGroup,
} from "@themesberg/react-bootstrap";
import StateContext from "../../../context/stateContext";
import { ActionTypes } from "../../utils/studentTable";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWindowClose } from "@fortawesome/free-solid-svg-icons";

export default function Scroller() {
  const [showModal, setShowModal] = useState(false);
  const [indexImageCount, setIndexImageCount] = useState(0);
  const context = useContext(StateContext);

  const handleClose = () => setShowModal(false);

  const handleModalShow = (e, index) => {
    setIndexImageCount(index);
    setShowModal(true);
  };

  const deleteCard = (e, index) => {
    context.dispatch({
      type: ActionTypes.DELETE_IMAGE_DATA,
      index: index,
    });
  };

  const buildCard = (image, index) => {
    return (
      <div key={index} className="col" style={{ marginLeft: "150px" }}>
        <Card className="pokemonUI" key={index} style={{ width: "10rem" }}>
          <Card.Header
            style={{ cursor: "pointer" }}
            onClick={(e) => {
              handleModalShow(e, index);
            }}
          >
            <Row>
              <Col md={8}>
                {`page-${image.pageNumber}, table-${image.tableNumber}`}
              </Col>
              <Col md={4}>
                <FontAwesomeIcon
                  onClick={(e) => {
                    deleteCard(e, index);
                  }}
                  icon={faWindowClose}
                />
              </Col>
            </Row>
          </Card.Header>
          <Card.Img alt="image" variant="top" src={image.imageSrc} />
        </Card>
        <Modal show={showModal} onHide={handleClose} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>
              {`page-${context.state.images[indexImageCount].pageNumber}, table-${context.state.images[indexImageCount].tableNumber}`}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <img src={context.state.images[indexImageCount].imageSrc} />
          </Modal.Body>
        </Modal>
      </div>
    );
  };

  return (
    <Container
      className="scroller"
      style={{ height: "700px", overflowY: "scroll" }}
    >
      <CardGroup>
        {context.state &&
          context.state.images.map((image, index) => {
            return buildCard(image, index);
          })}
      </CardGroup>
    </Container>
  );
}
