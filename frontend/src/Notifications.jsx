import "./Notifications.css";
import DashboardLayout from "./DashboardLayout";
import EmptyState from "./components/EmptyState/EmptyState";

import { useEffect, useState } from "react";

import {
  FaBell,
  FaSearch,
  FaCheckCircle,
  FaCalendarAlt,
  FaBriefcase,
  FaEye,
  FaStar,
  FaArrowRight,
  FaClock,
} from "react-icons/fa";

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "./services/notificationService";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const data = await getNotifications();

      if (Array.isArray(data)) {
        setNotifications(data);
      } else if (Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      } else if (Array.isArray(data.data)) {
        setNotifications(data.data);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (
        !notification.isRead &&
        notification._id
      ) {
        await markAsRead(notification._id);

        setNotifications((prev) =>
          prev.map((item) =>
            item._id === notification._id
              ? {
                  ...item,
                  isRead: true,
                  status: "Read",
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
          status: "Read",
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);

      setNotifications((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifications = notifications
    .filter((item) => {
      const keyword = search.toLowerCase();

      return (
        item?.message
          ?.toLowerCase()
          .includes(keyword) ||
        item?.title
          ?.toLowerCase()
          .includes(keyword) ||
        item?.type
          ?.toLowerCase()
          .includes(keyword)
      );
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );

  const unreadCount = notifications.filter(
    (item) =>
      item.isRead === false ||
      item.status === "Unread"
  ).length;

  const applicationCount =
    notifications.filter(
      (item) =>
        item.type === "Application"
    ).length;

  const interviewCount =
    notifications.filter(
      (item) =>
        item.type === "Interview"
    ).length;

  const offerCount = notifications.filter(
    (item) =>
      item.type === "Offer" ||
      item.type === "Hired"
  ).length;

  if (loading) {
    return (
      <DashboardLayout role="candidate">
        <div className="notifications-page">
          <h2>Loading Notifications...</h2>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="candidate">
        <div className="notifications-page">
          <h2>{error}</h2>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="candidate">
      <div className="notifications-page">
        <div className="notifications-header">
          <div>
            <p className="page-tag">
              NOTIFICATION CENTER
            </p>

            <h1>Notifications</h1>

            <p className="page-desc">
              Track interviews,
              applications and
              recruiter updates in one
              place.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <button
              onClick={handleMarkAllRead}
            >
              Mark All Read
            </button>

            <div className="search-box">
              <FaSearch />

              <input
                type="text"
                placeholder="Search Notifications..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />
            </div>
          </div>
        </div>

        <div className="notification-overview">
          <div className="overview-card">
            <FaBell />
            <div>
              <h2>{unreadCount}</h2>
              <p>
                Unread Notifications
              </p>
            </div>
          </div>

          <div className="overview-card">
            <FaBriefcase />
            <div>
              <h2>
                {applicationCount}
              </h2>
              <p>Applications</p>
            </div>
          </div>

          <div className="overview-card">
            <FaCalendarAlt />
            <div>
              <h2>
                {interviewCount}
              </h2>
              <p>
                Upcoming Interviews
              </p>
            </div>
          </div>

          <div className="overview-card">
            <FaStar />
            <div>
              <h2>{offerCount}</h2>
              <p>Job Offer</p>
            </div>
          </div>
        </div>

        <div className="notifications-container">
          <div className="notifications-left">
            {filteredNotifications.length >
            0 ? (
              filteredNotifications.map(
                (item) => (
                  <div
                    className="notification-card"
                    key={item._id}
                    onClick={() =>
                      handleNotificationClick(
                        item
                      )
                    }
                  >
                    <div className="notification-icon">
                      {item.type ===
                      "Interview" ? (
                        <FaCalendarAlt />
                      ) : item.type ===
                        "Application" ? (
                        <FaCheckCircle />
                      ) : item.type ===
                        "Resume" ? (
                        <FaEye />
                      ) : (
                        <FaBriefcase />
                      )}
                    </div>

                    <div className="notification-content">
                      <div className="notification-top">
                        <div>
                          <h3>
                            {item.title ||
                              "Notification"}
                          </h3>

                          <span className="company-name">
                            {item.sender ||
                              item.company ||
                              "System"}
                          </span>
                        </div>

                        <span
                          className={`status ${
                            item.isRead
                              ? "read"
                              : "unread"
                          }`}
                        >
                          {item.isRead
                            ? "Read"
                            : "Unread"}
                        </span>
                      </div>

                      <p>
                        {item.message}
                      </p>

                      <div className="notification-bottom">
                        <span>
                          <FaClock />

                          {item.createdAt
                            ? new Date(
                                item.createdAt
                              ).toLocaleString()
                            : "Recently"}
                        </span>

                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                          }}
                        >
                          <button>
                            View Details
                            <FaArrowRight />
                          </button>

                          <button
                            onClick={(
                              e
                            ) => {
                              e.stopPropagation();
                              handleDelete(
                                item._id
                              );
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )
            ) : (
              <EmptyState
                type="notification"
                title="No Notifications"
                description="You're all caught up! New notifications will appear here."
                buttonText="Refresh"
                onButtonClick={
                  fetchNotifications
                }
              />
            )}
          </div>

          <div className="notifications-right">
            <div className="side-card">
              <h2>Categories</h2>

              <div className="category">
                <span>
                  📄 Applications
                </span>
                <strong>
                  {applicationCount}
                </strong>
              </div>

              <div className="category">
                <span>
                  📅 Interviews
                </span>
                <strong>
                  {interviewCount}
                </strong>
              </div>

              <div className="category">
                <span>⭐ Offers</span>
                <strong>
                  {offerCount}
                </strong>
              </div>

              <div className="category">
                <span>
                  🔔 Unread
                </span>
                <strong>
                  {unreadCount}
                </strong>
              </div>
            </div>

            <div className="side-card">
              <h2>
                Recent Activity
              </h2>

              <ul className="activity-list">
                {filteredNotifications
                  .slice(0, 5)
                  .map((item) => (
                    <li
                      key={item._id}
                    >
                      {item.message}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Notifications;