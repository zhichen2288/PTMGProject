import axios from "./http-axios";

const uploadTranscripts = (file, validPagesMask, studentId, snippedImages) => {
  let formData = new FormData();

  formData.append("file", file);

  let validPages = [];
  for (let i = 0; i < validPagesMask.length; i++) {
    console.log(validPagesMask[i], typeof validPagesMask[i]);
    if (validPagesMask[i] === true) {
      validPages.push(i);
    }
  }
  console.log(validPagesMask, validPages);

  formData.append("validPages", validPages);
  // Convert the base64 encodings to files and add them to the FormData object
  const images = snippedImages.map((encoding) => {
    const binary = atob(encoding.imageSrc.split(",")[1]);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }

    const file = new File(
      [new Uint8Array(array)],
      `p${encoding.pageNumber}-t${encoding.tableNumber}.png`,
      {
        type: "image/png",
      }
    );
    formData.append("snippedImages", file);
    return file;
  });

  // formData.append("studentId", studentId);

  return axios.post(`/api/students/${studentId}/transcript`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const getFiles = () => {
  return axios.get("/files");
};

export default {
  uploadTranscripts,
  // getFiles,
};
