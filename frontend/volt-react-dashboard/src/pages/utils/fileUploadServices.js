import axios from "./http-axios";

const uploadTranscripts = (file, validPagesMask, studentId) => {
    let formData = new FormData();

    formData.append("file", file);

    let validPages = [];
    for (let i = 0; i < validPagesMask.length; i++) {
        console.log(validPagesMask[i], typeof(validPagesMask[i]))
        if (validPagesMask[i] === true) {
            validPages.push(i);
        }
    }
    console.log(validPagesMask, validPages);

    formData.append("validPages", validPages);
    // formData.append("studentId", studentId);

    return axios.post(`/api/students/${studentId}/transcript`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        }
    })
};

const getFiles = () => {
    return axios.get("/files");
};

export default {
    uploadTranscripts,
    // getFiles,
};
