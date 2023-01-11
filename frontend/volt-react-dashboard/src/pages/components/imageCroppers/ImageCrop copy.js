import React, { useState, useRef } from "react";
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

import "react-image-crop/dist/ReactCrop.css";

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

export default function App({ canvasData, currentFile }) {
  const [imgSrc, setImgSrc] = useState("");
  const previewCanvasRef = useRef(null);
  const imgRef = useRef(null);
  const [crop, setCrop] = useState(Crop);
  const [completedCrop, setCompletedCrop] = useState(PixelCrop);
  const [canvasImage, SetCanvasImage] = useState("");
  const [numPages, setNumPages] = useState(null);
  const [validPages, setValidPages] = useState([]);

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
    debugger;
    // const { width, height } = e.currentTarget;
    // setCrop(centerAspectCrop(width, height));
    const canvasElement = document.getElementsByClassName(
      "react-pdf__Page__canvas"
    );
    SetCanvasImage(canvasElement);
  }

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setValidPages(new Array(numPages).fill(false));
  }

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current.pageElement.current.children[0] &&
        previewCanvasRef.current
      ) {
        debugger;
        const imageSrc =
          imgRef.current.pageElement.current.children[0].toDataURL();
        let image = document.createElement("img");
        image.src = imageSrc;
        canvasPreview(image, previewCanvasRef.current, completedCrop);
      }
    },
    10,
    [completedCrop]
  );

  // useDebounceEffect(
  //   async () => {
  //     if (
  //       completedCrop?.width &&
  //       completedCrop?.height &&
  //       imgRef.current &&
  //       previewCanvasRef.current
  //     ) {
  //       canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop);
  //     }
  //   },
  //   10,
  //   [completedCrop]
  // );

  //if (canvasData && canvasData.length > 0) {
  //if (currentFile) {
  return (
    <div className="App">
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
        <Document file={currentFile} onLoadSuccess={onDocumentLoadSuccess}>
          <Page
            size="A4"
            devicePixelRatio={96}
            pageNumber={3}
            ref={imgRef}
            // style={"position:relative;"}
            // style={{
            //   flex: 1,
            //   flexDirection: "column",
            //   justifyContent: "center",
            //   alignItems: "center",
            // }}
            onLoadSuccess={loadComplete}
            width={450}
          />
        </Document>{" "}
      </ReactCrop>
      {/* )} */}
      <div>
        {!!completedCrop && (
          <canvas
            ref={previewCanvasRef}
            style={{
              border: "1px solid black",
              objectFit: "contain",
              width: completedCrop.width,
              height: completedCrop.height,
            }}
          />
        )}
      </div>
    </div>
  );
  // } else {
  //   return <></>;
  // }
}
