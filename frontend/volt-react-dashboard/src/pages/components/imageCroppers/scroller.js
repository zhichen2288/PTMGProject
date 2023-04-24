import React, { useState, useContext } from "react";
import {
  Row,
  Col,
  Modal,
  Container,
  Card,
  CardGroup,
  Alert,
} from "@themesberg/react-bootstrap";
import StateContext from "../../../context/stateContext";
import { ActionTypes } from "../../utils/studentTable";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWindowClose } from "@fortawesome/free-solid-svg-icons";

export default function Scroller() {
  const [showModal, setShowModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const context = useContext(StateContext);

  const handleClose = () => {
    setShowModal(false);
    setSelectedImageIndex(null); // reset the selected image index when closing the modal
  };

  const handleModalShow = (e, index) => {
    if (index >= 0 && index < context.state.images.length) {
      setSelectedImageIndex(index);
      setShowModal(true);
    }
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
                  className="delete-icon"
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
      </div>
    );
  };

  return (
    <Container
      className="scroller"
      style={{ height: "700px", overflowY: "scroll", border: "1px solid #ddd" }}
    >
      <Alert variant="primary">
        <Alert.Heading>Images Container</Alert.Heading>
        <p>
          Select the portion of image by dragging mouse and click{" "}
          <b>Add Image</b> button to save for upload.
        </p>
      </Alert>

      <CardGroup>
        {context.state &&
          context.state.images.map((image, index) => {
            return buildCard(image, index);
          })}
      </CardGroup>

      {context.state.images && context.state.images.length > 0 && (
        <Modal show={showModal} onHide={handleClose} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>
              {`page-${context.state.images[selectedImageIndex]?.pageNumber}, table-${context.state.images[selectedImageIndex]?.tableNumber}`}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <img
              style={{ border: "1px solid black" }}
              src={context.state.images[selectedImageIndex]?.imageSrc}
            />
          </Modal.Body>
        </Modal>
      )}
    </Container>
  );
}

// export default function Scroller() {
//   const [showModal, setShowModal] = useState(false);
//   const [indexImageCount, setIndexImageCount] = useState(0);

//   const context = useContext(StateContext);

//   const handleClose = () => setShowModal(false);

//   const handleModalShow = (e, index) => {
//     if (index >= 0 && index < context.state.images.length) {
//       setIndexImageCount(index);
//       setShowModal(true);
//     }
//   };

//   const deleteCard = (e, index) => {
//     context.dispatch({
//       type: ActionTypes.DELETE_IMAGE_DATA,
//       index: index,
//     });
//   };

//   const buildCard = (image, index) => {
//     return (
//       <div key={index} className="col" style={{ marginLeft: "150px" }}>
//         <Card className="pokemonUI" key={index} style={{ width: "10rem" }}>
//           <Card.Header
//             style={{ cursor: "pointer" }}
//             onClick={(e) => {
//               handleModalShow(e, index);
//             }}
//           >
//             <Row>
//               <Col md={8}>
//                 {`page-${image.pageNumber}, table-${image.tableNumber}`}
//               </Col>
//               <Col md={4}>
//                 <FontAwesomeIcon
//                   onClick={(e) => {
//                     deleteCard(e, index);
//                   }}
//                   icon={faWindowClose}
//                 />
//               </Col>
//             </Row>
//           </Card.Header>
//           <Card.Img alt="image" variant="top" src={image.imageSrc} />
//         </Card>
//         {context.state.images && context.state.images.length > 0 && (
//           <Modal show={showModal} onHide={handleClose} size="lg" centered>
//             <Modal.Header closeButton>
//               <Modal.Title>
//                 {`page-${context.state.images[indexImageCount]?.pageNumber}, table-${context.state.images[indexImageCount]?.tableNumber}`}
//               </Modal.Title>
//             </Modal.Header>
//             <Modal.Body>
//               <img
//                 style={{ border: "1px solid black" }}
//                 src={context.state.images[indexImageCount]?.imageSrc}
//               />
//             </Modal.Body>
//           </Modal>
//         )}
//         {/*  */}
//       </div>
//     );
//   };

//   return (
//     <Container
//       className="scroller"
//       style={{ height: "700px", overflowY: "scroll", border: "1px solid #ddd" }}
//     >
//       <Alert variant="primary">
//         <Alert.Heading>Images Container</Alert.Heading>
//         <p>
//           Select the portion of image by dragging mouse and click{" "}
//           <b>Add Image</b> button to save for upload.
//         </p>
//       </Alert>

//       <CardGroup>
//         {context.state &&
//           context.state.images.map((image, index) => {
//             return buildCard(image, index);
//           })}
//       </CardGroup>
//     </Container>
//   );
// }
