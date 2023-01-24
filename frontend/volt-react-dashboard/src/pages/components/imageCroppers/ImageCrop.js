import React, { useState, useRef, useContext } from "react";
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

import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";

import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from "react-image-crop";

import { canvasPreview } from "./canvasPreview";
import useDebounceEffect from "../../hooks/useDebounceEffect";
import StateContext from "../../../context/stateContext";
import "react-image-crop/dist/ReactCrop.css";
import { ActionTypes } from "../../utils/studentTable";
import Scroller from "./scroller";

//https://codesandbox.io/s/react-image-crop-demo-with-react-hooks-forked-upgd3i?file=/src/App.tsx

// This is to demonstate how to make and center a % aspect crop
// which is a bit trickier so we use some helper functions.
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;

  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function App({ pageNumber, onIncrement }) {
  const [imgSrc, setImgSrc] = useState("");
  const previewCanvasRef = useRef(null);
  const imgRef = useRef(null);
  const [crop, setCrop] = useState({
    unit: "%",
    width: 100,
  });
  const [completedCrop, setCompletedCrop] = useState(PixelCrop);
  const [canvasImage, SetCanvasImage] = useState("");
  const [validImages, setValidImages] = useState([]);
  const [indexImageCount, setIndexImageCount] = useState(0);

  const context = useContext(StateContext);

  function onSelectFile(e) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Makes crop preview update between images.
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImgSrc(reader.result?.toString() || "")
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  function loadComplete(e) {
    // const { width, height } = e.currentTarget;
    // setCrop(centerAspectCrop(width, height));
    const canvasElement = document.getElementsByClassName(
      "react-pdf__Page__canvas"
    );
    SetCanvasImage(canvasElement[0]);
  }

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current.pageElement.current.children[0] &&
        previewCanvasRef.current
      ) {
        const imageSrc = canvasImage.toDataURL();
        const image = await loadImgPromise(imageSrc);
        canvasPreview(image, previewCanvasRef.current, completedCrop);
      }
    },
    10,
    [completedCrop]
  );

  function handleImageSelect() {
    if (completedCrop) {
      debugger;
      const imageSrc = previewCanvasRef.current.toDataURL();
      const updatedCount = onIncrement();
      setIndexImageCount(indexImageCount + 1);

      context.dispatch({
        type: ActionTypes.SAVE_IMAGE_DATA,
        imgSrc: imageSrc,
        pageNumber: pageNumber,
        tableNumber: updatedCount,
        index: indexImageCount,
      });
    }
  }

  const loadImgPromise = (url) =>
    new Promise((ok, fail) => {
      let img = document.createElement("img");
      img.onload = () => {
        ok(img);
      };
      img.onerror = fail;
      img.src = url;
    });

  //if (canvasData && canvasData.length > 0) {
  //if (currentFile) {
  return (
    <Container fluid>
      <Row>
        <Col md={8}>
          {/* <div className="Crop-Controls">
        <input type="file" accept="image/*" onChange={onSelectFile} />
      </div> */}
          {/* {!!canvasData && ( */}
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
          >
            {/* <img
              ref={imgRef}
              alt="Crop me"
              src={canvasData[0].toDataURL()}
              onLoad={onImageLoad}
            /> */}
            <Page
              size="A4"
              devicePixelRatio={96}
              pageNumber={pageNumber}
              ref={imgRef}
              // style={"position:relative;"}
              // style={{
              //   flex: 1,
              //   flexDirection: "column",
              //   justifyContent: "center",
              //   alignItems: "center",
              // }}
              onLoadSuccess={loadComplete}
              width={1000}
            />
          </ReactCrop>
          {/* )} */}
          <div>
            {!!completedCrop && (
              <>
                {" "}
                <canvas
                  ref={previewCanvasRef}
                  style={{
                    border: "1px solid black",
                    objectFit: "contain",
                    width: completedCrop.width,
                    height: completedCrop.height,
                    display: "none",
                  }}
                />
                <Button variant="primary" size="lg" onClick={handleImageSelect}>
                  Add Image
                </Button>
              </>
            )}
          </div>
        </Col>
        <Col md={3}>
          <Scroller></Scroller>
        </Col>
      </Row>
    </Container>
  );
  // } else {
  //   return <></>;
  // }
}
