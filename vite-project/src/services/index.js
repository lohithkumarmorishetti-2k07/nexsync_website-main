import axiosInstance from "@/api/axiosInstance";

export async function registerService(formData) {
  try {
    const { data } = await axiosInstance.post("/auth/register", {
      ...formData,
      role: "user",
    });
    return data;
  } catch (error) {
    // Re-throw the error so it can be handled in the component
    throw error;
  }
}

export async function loginService(formData) {
  try {
    const { data } = await axiosInstance.post("/auth/login", {
      ...formData,
    });   
    return data;
  } catch (error) {
    // Re-throw the error so it can be handled in the component
    throw error;
  }
}

export async function checkAuthService(){
  try {
    const {data} = await axiosInstance.get("/auth/check-auth");
    return data;
  } catch (error) {
    // Re-throw the error so it can be handled in the component
    throw error;
  }
}
