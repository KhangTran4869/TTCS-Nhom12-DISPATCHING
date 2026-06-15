import { useState, useEffect } from "react";
import {
  Truck,
  MapPin,
  Navigation,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Play,
  CircleAlert,
  Power,
  Loader,
  Star,
} from "lucide-react";

function DriverDashboard({ user, showToast, onLogout }) {
  const [driverProfile, setDriverProfile] = useState(null);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Incident Report form state
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentType, setIncidentType] = useState("traffic");
  const [incidentDesc, setIncidentDesc] = useState("");
  const [reportingIncident, setReportingIncident] = useState(false);

  // Delivery History state
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  // Fetch driver profile and current active assignment
  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // 1. Tìm hồ sơ Driver tương ứng với user_id của người đang đăng nhập
      const driversRes = await fetch("/api/drivers");
      const driversResult = await driversRes.json();

      if (driversResult.success) {
        const foundDriver = driversResult.data.find(
          (d) => d.user_id && d.user_id._id === user._id,
        );

        if (foundDriver) {
          setDriverProfile(foundDriver);

          // 2. Tìm phân công (assignment) đang active
          const assignmentsRes = await fetch("/api/dispatch-assignments");
          const assignmentsResult = await assignmentsRes.json();

          if (assignmentsResult.success) {
            // Lọc ra các phân công dành cho driver này và chưa hoàn thành/huỷ
            const active = assignmentsResult.data.find(
              (a) =>
                a.driver_id &&
                a.driver_id._id === foundDriver._id &&
                ["assigned", "accepted", "in_progress", "arrived"].includes(
                  a.assignment_status,
                ),
            );
            setActiveAssignment(active || null);

            // Lọc lịch sử đơn hàng của bản thân
            const history = assignmentsResult.data.filter(
              (a) =>
                a.driver_id &&
                a.driver_id._id === foundDriver._id &&
                ["completed", "cancelled", "rejected"].includes(
                  a.assignment_status,
                ),
            );
            setDeliveryHistory(history);
          }
        } else {
          showToast(
            "Không tìm thấy hồ sơ tài xế cho tài khoản này.",
            "warning",
          );
        }
      }
    } catch (error) {
      console.error(error);
      showToast("Lỗi khi tải thông tin tài xế", "danger");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Toggle Driver Duty status
  const toggleDutyStatus = async () => {
    if (!driverProfile) return;
    setUpdatingStatus(true);

    const nextStatus =
      driverProfile.current_status === "off" ? "available" : "off";

    try {
      const response = await fetch(`/api/drivers/${driverProfile._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_status: nextStatus }),
      });
      const result = await response.json();
      if (result.success) {
        setDriverProfile(result.data);
        showToast(
          `Trạng thái của bạn đã cập nhật thành: ${nextStatus === "available" ? "Sẵn sàng làm việc" : "Nghỉ làm"}`,
          "success",
        );
      } else {
        showToast("Cập nhật trạng thái thất bại", "danger");
      }
    } catch (error) {
      showToast("Lỗi kết nối API", "danger");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Update Assignment Status (accepted, rejected, in_progress, completed)
  // Update Assignment Status (accepted, rejected, in_progress, completed)
  const updateAssignmentStatus = async (status) => {
    if (!activeAssignment) return;
    setUpdatingStatus(true);

    try {
      // 1. Cập nhật trạng thái assignment
      const response = await fetch(
        `/api/dispatch-assignments/${activeAssignment._id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignment_status: status }),
        },
      );

      const result = await response.json();

      if (!result.success) {
        showToast(
          result.message || "Cập nhật trạng thái chuyến đi thất bại",
          "danger",
        );
        return;
      }

      // 2. Nếu driver từ chối chuyến đi
      if (status === "rejected") {
        setActiveAssignment(null);
        await fetchData(true);
        return;
      }

      if (status === "accepted") {
        showToast("Đã chấp nhận đơn hàng", "success");
      } else if (status === "completed") {
        showToast("Đơn hàng đã được giao thành công", "success");
      }

      if (status === "completed" || status === "cancelled") {
        setActiveAssignment(null);
        await fetchData(true);
      } else {
        await fetchData(true);
      }
    } catch (error) {
      console.error(error);
      showToast("Lỗi kết nối API", "danger");
    } finally {
      setUpdatingStatus(false);
    }
  };



  // Submit Incident Report
  const handleSubmitIncident = async (e) => {
    e.preventDefault();
    if (!incidentDesc) {
      showToast("Vui lòng nhập mô tả sự cố", "warning");
      return;
    }

    setReportingIncident(true);
    try {
      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignment_id: activeAssignment._id,
          reported_by: user._id,
          incident_type: incidentType,
          description: incidentDesc,
          status: "reported",
        }),
      });
      const result = await response.json();

      if (result.success) {
        showToast("Đã gửi báo cáo sự cố tới phòng điều phối!", "warning");
        setShowIncidentModal(false);
        setIncidentDesc("");
      } else {
        showToast("Báo cáo sự cố thất bại", "danger");
      }
    } catch (error) {
      showToast("Lỗi hệ thống", "danger");
    } finally {
      setReportingIncident(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <Loader style={{ animation: "statusPulse 1s infinite" }} size={40} />
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      {/* Cột trái: Thông tin tài xế & trạng thái làm việc */}
      <div className="col-4">
        <div className="card animate-fade-in" style={{ marginBottom: "24px" }}>
          <div className="card-title">
            <Truck size={18} color="#818cf8" />
            Hồ Sơ Tài Xế
          </div>

          {driverProfile ? (
            <div className="list-detail">
              <div className="list-detail-item">
                <span className="list-detail-label">Họ và tên</span>
                <span className="list-detail-value">{user?.full_name}</span>
              </div>
              <div className="list-detail-item">
                <span className="list-detail-label">Số điện thoại</span>
                <span className="list-detail-value">
                  {user?.phone || "Chưa cập nhật"}
                </span>
              </div>
              <div className="list-detail-item">
                <span className="list-detail-label">Số bằng lái</span>
                <span className="list-detail-value">
                  {driverProfile.license_number}
                </span>
              </div>
              <div className="list-detail-item">
                <span className="list-detail-label">Hạng bằng lái</span>
                <span className="list-detail-value">
                  {driverProfile.license_type}
                </span>
              </div>
              <div className="list-detail-item">
                <span className="list-detail-label">Kinh nghiệm</span>
                <span className="list-detail-value">
                  {driverProfile.experience_years} năm
                </span>
              </div>
              <div
                className="list-detail-item"
                style={{ borderBottom: "none", paddingBottom: 0 }}
              >
                <span className="list-detail-label">Đánh giá</span>
                <span
                  className="list-detail-value"
                  style={{
                    color: "var(--warning-text)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Star
                    size={14}
                    style={{ fill: "var(--warning)", color: "var(--warning)" }}
                  />
                  {driverProfile.rating} / 5
                </span>
              </div>

              <div
                style={{
                  marginTop: "24px",
                  paddingTop: "20px",
                  borderTop: "1px solid var(--border-color)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                    }}
                  >
                    Trạng thái hoạt động:
                  </span>
                  <span
                    className={`badge ${driverProfile.current_status === "available" ? "badge-success" : driverProfile.current_status === "off" ? "badge-danger" : "badge-warning"}`}
                  >
                    <span
                      className={`badge-dot`}
                      style={{
                        backgroundColor:
                          driverProfile.current_status === "available"
                            ? "var(--success)"
                            : driverProfile.current_status === "off"
                              ? "var(--danger)"
                              : "var(--warning)",
                      }}
                    ></span>
                    {driverProfile.current_status === "available"
                      ? "Rảnh (Sẵn sàng)"
                      : driverProfile.current_status === "off"
                        ? "Nghỉ làm việc"
                        : driverProfile.current_status === "assigned"
                          ? "Đã phân công"
                          : "Đang đi giao"}
                  </span>
                </div>

                <button
                  className={`btn ${driverProfile.current_status === "off" ? "btn-success" : "btn-danger"}`}
                  onClick={toggleDutyStatus}
                  disabled={
                    updatingStatus ||
                    ["assigned", "on_trip"].includes(
                      driverProfile.current_status,
                    )
                  }
                  style={{ width: "100%", gap: "8px" }}
                >
                  <Power size={16} />
                  {driverProfile.current_status === "off"
                    ? "Bật Sẵn Sàng Làm Việc"
                    : "Tắt Sẵn Sàng (Nghỉ)"}
                </button>
                {["assigned", "on_trip"].includes(
                  driverProfile.current_status,
                ) && (
                    <p
                      style={{
                        fontSize: "11px",
                        color: "var(--danger-text)",
                        textAlign: "center",
                      }}
                    >
                      *Bạn không thể đổi trạng thái khi đang có đơn hàng.
                    </p>
                  )}
                <button
                  className="btn btn-secondary"
                  onClick={onLogout}
                  style={{ width: "100%", marginTop: "8px", gap: "6px" }}
                >
                  Đăng xuất tài khoản
                </button>
              </div>
            </div>
          ) : (
            <p>Không có hồ sơ tài xế.</p>
          )}
        </div>

        {/* Nút Refresh nhanh */}
        <button
          className="btn btn-secondary"
          onClick={fetchData}
          style={{ width: "100%" }}
        >
          Cập nhật thông tin đơn hàng
        </button>
      </div>

      {/* Cột phải: Đơn hàng phân công & Bản đồ định vị */}
      <div className="col-8">
        {activeAssignment ? (
          <div
            className="card animate-fade-in"
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--border-color)",
                paddingBottom: "12px",
              }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Navigation size={20} color="var(--info)" />
                Chuyến Đi Hiện Tại: Code #
                {activeAssignment.order_id?.order_code ||
                  activeAssignment._id.substring(18)}
              </h2>
              <span
                className={`badge ${activeAssignment.assignment_status === "assigned"
                    ? "badge-primary"
                    : activeAssignment.assignment_status === "accepted"
                      ? "badge-info"
                      : "badge-warning"
                  }`}
              >
                {activeAssignment.assignment_status === "assigned"
                  ? "Mới phân công"
                  : activeAssignment.assignment_status === "accepted"
                    ? "Đã chấp nhận"
                    : "Đang thực hiện"}
              </span>
            </div>

            {/* Thông tin chi tiết đơn */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                background: "rgba(0,0,0,0.15)",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                  }}
                >
                  ĐIỂM NHẬN HÀNG
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#fff",
                    marginTop: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <MapPin size={14} color="var(--info)" />{" "}
                  {activeAssignment.order_id?.pickup_address}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    marginTop: "4px",
                  }}
                >
                  Người gửi: {activeAssignment.order_id?.sender_name} -{" "}
                  {activeAssignment.order_id?.sender_phone}
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                  }}
                >
                  ĐIỂM GIAO HÀNG
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#fff",
                    marginTop: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <MapPin size={14} color="var(--success)" />{" "}
                  {activeAssignment.order_id?.delivery_address}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    marginTop: "4px",
                  }}
                >
                  Người nhận: {activeAssignment.order_id?.receiver_name} -{" "}
                  {activeAssignment.order_id?.receiver_phone}
                </p>
              </div>
              <div
                style={{
                  gridColumn: "span 2",
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                  paddingTop: "10px",
                }}
              >
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Mô tả hàng hóa:{" "}
                  <strong>
                    {activeAssignment.order_id?.cargo_description ||
                      "Không ghi chú"}
                  </strong>{" "}
                  ({activeAssignment.order_id?.cargo_weight} kg)
                </p>
                {activeAssignment.note && (
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--warning-text)",
                      marginTop: "4px",
                    }}
                  >
                    Ghi chú điều phối: {activeAssignment.note}
                  </p>
                )}
              </div>
            </div>

            {/* Bảng điều khiển nút hành động */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "20px" }}>
              {activeAssignment.assignment_status === "assigned" && (
                <>
                  <button
                    className="btn btn-success"
                    onClick={() => updateAssignmentStatus("accepted")}
                    disabled={updatingStatus}
                    style={{ flex: 1, gap: "6px" }}
                  >
                    <CheckCircle2 size={16} /> Nhận Đơn Hàng
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => updateAssignmentStatus("rejected")}
                    disabled={updatingStatus}
                    style={{ flex: 1 }}
                  >
                    Từ Chối
                  </button>
                </>
              )}

              {activeAssignment.assignment_status === "accepted" && (
                <button
                  className="btn btn-primary"
                  onClick={() => updateAssignmentStatus("in_progress")}
                  disabled={updatingStatus}
                  style={{ width: "100%", gap: "8px" }}
                >
                  <Play size={16} /> Bắt Đầu Giao
                </button>
              )}

              {activeAssignment.assignment_status === "in_progress" && (
                <>
                  <button
                    className="btn btn-success"
                    onClick={() => updateAssignmentStatus("arrived")}
                    disabled={updatingStatus}
                    style={{ flex: 2, gap: "6px" }}
                  >
                    <CheckCircle2 size={16} /> Đã Đến Nơi
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() => setShowIncidentModal(true)}
                    style={{ flex: 1, gap: "6px" }}
                  >
                    <AlertTriangle size={16} /> Báo Sự Cố
                  </button>
                </>
              )}

              {activeAssignment.assignment_status === "arrived" && (
                <>
                  <button
                    className="btn btn-success"
                    onClick={() => updateAssignmentStatus("completed")}
                    disabled={updatingStatus}
                    style={{ flex: 2, gap: "6px" }}
                  >
                    <CheckCircle2 size={16} /> Hoàn Thành Đơn Hàng
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() => setShowIncidentModal(true)}
                    style={{ flex: 1, gap: "6px" }}
                  >
                    <AlertTriangle size={16} /> Báo Sự Cố
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div
            className="card animate-fade-in"
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            <ShieldCheck
              size={48}
              style={{
                color: "var(--text-muted)",
                marginBottom: "16px",
                opacity: 0.5,
              }}
            />
            <h3
              style={{ color: "#fff", fontSize: "18px", marginBottom: "8px" }}
            >
              Chưa có đơn hàng nào được phân công
            </h3>
            <p
              style={{ maxWidth: "400px", margin: "0 auto", fontSize: "14px" }}
            >
              Khi nhân viên điều phối gán đơn vận chuyển cho bạn, chi tiết lộ
              trình và các tác vụ vận chuyển sẽ lập tức hiển thị tại đây.
            </p>
          </div>
        )}

        {/* Lịch sử giao hàng */}
        <div className="card animate-fade-in" style={{ marginTop: "24px" }}>
          <div className="card-title" style={{ fontSize: "16px", fontWeight: 700 }}>
            <CheckCircle2 size={18} color="var(--success)" />
            Lịch Sử Giao Hàng của bạn
          </div>
          <div
            style={{
              maxHeight: "400px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginTop: "12px",
              paddingRight: "4px",
            }}
          >
            {deliveryHistory.length === 0 ? (
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "13px",
                  textAlign: "center",
                  padding: "20px 0",
                  margin: 0,
                }}
              >
                Chưa có lịch sử giao hàng.
              </p>
            ) : (
              deliveryHistory.map((a) => (
                <div
                  key={a._id}
                  style={{
                    padding: "14px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border-color)",
                    fontSize: "13px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "20px",
                  }}
                >
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                      <strong style={{ color: "#fff", fontSize: "14px" }}>
                        #{a.order_id?.order_code || "N/A"}
                      </strong>
                      <span
                        className={`badge ${a.assignment_status === "completed"
                            ? "badge-success"
                            : a.assignment_status === "rejected"
                              ? "badge-warning"
                              : "badge-danger"
                          }`}
                        style={{ fontSize: "10px", padding: "2px 6px" }}
                      >
                        {a.assignment_status === "completed"
                          ? "Thành công"
                          : a.assignment_status === "rejected"
                            ? "Từ chối"
                            : "Đã hủy"}
                      </span>
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "12px", marginBottom: "2px" }}>
                      Giao đến: {a.order_id?.delivery_address || "N/A"}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      Nặng: {a.order_id?.cargo_weight || 0} kg
                    </div>
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "12px", textAlign: "right" }}>
                    {a.end_time ? (
                      <div>
                        {new Date(a.end_time).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                        <br />
                        {new Date(a.end_time).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    ) : (
                      <div>
                        {new Date(a.updatedAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                        <br />
                        {new Date(a.updatedAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL BÁO CÁO SỰ CỐ */}
      {showIncidentModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <div className="modal-header">
              <h3
                className="modal-title"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "var(--danger-text)",
                }}
              >
                <CircleAlert size={18} />
                Báo Cáo Sự Cố Chuyến Đi
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowIncidentModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitIncident}>
              <div className="form-group">
                <label className="form-label">Loại sự cố</label>
                <select
                  className="form-control"
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                >
                  <option value="traffic">Kẹt xe nghiêm trọng</option>
                  <option value="accident">Tai nạn giao thông</option>
                  <option value="vehicle_breakdown">
                    Hỏng hóc phương tiện
                  </option>
                  <option value="customer_issue">Sự cố phía khách hàng</option>
                  <option value="other">Vấn đề khác</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Mô tả chi tiết sự cố</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Ghi rõ tình trạng hiện tại để phòng điều hành kịp thời hỗ trợ..."
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setShowIncidentModal(false)}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                  disabled={reportingIncident}
                >
                  Gửi Báo Cáo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriverDashboard;
