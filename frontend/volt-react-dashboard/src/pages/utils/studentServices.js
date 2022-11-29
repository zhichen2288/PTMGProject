import axios from "./http-axios";

const sendToPrepare = (studentId) => {
    const params = {
        action: "prepare"
    }

    return axios.get(`/api/students/${studentId}/transcript`, {params});
};

const sendToCalculate = (studentId) => {
    const params = {
        action: "calculate"
    }
    return axios.get(`/api/students/${studentId}/transcript`, {params});
};

const sendToDestroy = (studentId) => {
    return axios.delete(`/api/students/${studentId}/`, {});
};

const sendToCreate = (data) => {
    let formData = new FormData();
    const formattedData = {
        name: data.name,
        education:
            {
                university: data.university,
                department: data.department
            }
    }
    formData.append("data", formattedData)
    console.log(formattedData)
    // return axios.post(`/test`, formData);
    return axios({
        method: "post",
        url: "/api/students/",
        data: formattedData})
    // return axios.post(`/api/students/`, {formattedData});

}


export default {
    sendToPrepare,
    sendToCalculate,
    sendToDestroy,
    sendToCreate
    // getFiles,
};
