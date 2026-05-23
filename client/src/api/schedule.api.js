import api from "./axios.instance.js";

export const createSchedule = (data)    => api.post("/schedules", data);
export const getMySchedule  = ()        => api.get("/schedules/me");
export const updateSchedule = (id, d)   => api.put(`/schedules/${id}`, d);
export const deleteSchedule = (id)      => api.delete(`/schedules/${id}`);
