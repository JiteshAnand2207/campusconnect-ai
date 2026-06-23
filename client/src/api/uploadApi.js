import api from "./axios";

export const uploadSingleFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/uploads/single", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const uploadMultipleFiles = async (files) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await api.post("/uploads/multiple", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
