export const getUser = () => {
  try {
    const raw = localStorage.getItem("user");

    if (!raw || raw === "undefined") return null;

    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const getToken = () => {
  const token = localStorage.getItem("token");
  return token && token !== "undefined" ? token : null;
};