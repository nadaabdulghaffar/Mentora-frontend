import apiClient from "./api";

const CREATE_COMMUNITY_ENDPOINT =
  import.meta.env.VITE_CREATE_COMMUNITY_ENDPOINT ||
  "/Community";

export const extractErrorMessage = (error: any): string => {
  const status = error?.response?.status;
  const url = String(error?.config?.url || "");

  if (status === 404 && url.includes("Community")) {
    return "Create Community API is not available on backend yet. Please add a Community controller endpoint or set VITE_CREATE_COMMUNITY_ENDPOINT to the correct route.";
  }

  return (
    error?.response?.data?.message ||
    error?.response?.data?.errors?.[0] ||
    error?.message ||
    "Something went wrong"
  );
};

export interface CreateCommunityPayload {
  domainId: string | number;
  name: string;
  description: string;
  image?: File | null;
}

export const createCommunity = async (payload: CreateCommunityPayload): Promise<any> => {
  // If there's an image, send as multipart/form-data
  if (payload.image) {
    const fd = new FormData();
    fd.append("domainId", String(payload.domainId));
    fd.append("name", payload.name);
    fd.append("description", payload.description);
    fd.append("image", payload.image as File);

    const res = await apiClient.post(CREATE_COMMUNITY_ENDPOINT, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }

  const res = await apiClient.post(CREATE_COMMUNITY_ENDPOINT, {
    domainId: payload.domainId,
    name: payload.name,
    description: payload.description,
  });

  return res.data;
};

export default { createCommunity, extractErrorMessage };
