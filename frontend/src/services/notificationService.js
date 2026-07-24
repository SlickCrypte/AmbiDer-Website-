import API from "./api";

export const getNotifications = async () => {
  try {
    const response = await API.get("/notifications");
    return response.data;
  } catch (error) {
    console.error("Get Notifications Error:", error);

    throw new Error(
      error.response?.data?.message ||
      "Failed to load notifications."
    );
  }
};

export const getUnreadCount = async () => {
  try {
    const response = await API.get(
      "/notifications/unread"
    );

    return response.data;
  } catch (error) {
    console.error("Get Unread Count Error:", error);

    throw new Error(
      error.response?.data?.message ||
      "Failed to load unread count."
    );
  }
};

export const markAsRead = async (id) => {
  try {
    const response = await API.put(
      `/notifications/${id}/read`
    );

    return response.data;
  } catch (error) {
    console.error("Mark As Read Error:", error);

    throw new Error(
      error.response?.data?.message ||
      "Failed to mark notification as read."
    );
  }
};

export const markAllAsRead = async () => {
  try {
    const response = await API.put(
      "/notifications/read/all"
    );

    return response.data;
  } catch (error) {
    console.error("Mark All Read Error:", error);

    throw new Error(
      error.response?.data?.message ||
      "Failed to mark all notifications as read."
    );
  }
};

export const deleteNotification = async (
  id
) => {
  try {
    const response = await API.delete(
      `/notifications/${id}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Delete Notification Error:",
      error
    );

    throw new Error(
      error.response?.data?.message ||
      "Failed to delete notification."
    );
  }
};