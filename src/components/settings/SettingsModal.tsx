import React, { useState, useEffect } from "react";
import pkg from "../../../package.json";
import CustomDropdown from "../CustomDropdown";
import type { MailSettings } from "../../types";
import {
  getMailSettings,
  saveMailSettings,
  sendTestEmail,
  checkNotifications,
} from "../../tauri/api";

interface SettingsModalProps {
  onClose: () => void;
  theme: string;
  onThemeChange: (theme: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  theme,
  onThemeChange,
}) => {
  const [settings, setSettings] = useState<MailSettings>({
    email: "",
    app_password: "",
    notification_minutes: 1440, // Default: 1 day
  });
  const [status, setStatus] = useState<string>("");
  const appVersion = (pkg as any).version || "";

  // Helper state for UI (days, hours, minutes)
  const [notifyDays, setNotifyDays] = useState<string>("1");
  const [notifyHours, setNotifyHours] = useState<string>("0");
  const [notifyMinutes, setNotifyMinutes] = useState<string>("0");

  useEffect(() => {
    loadSettings();

    // Add Esc key handler
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const loadSettings = async () => {
    try {
      const loaded = await getMailSettings();
      setSettings(loaded);

      // Convert minutes to days/hours/minutes for display
      const totalMinutes = loaded.notification_minutes;
      const days = Math.floor(totalMinutes / 1440);
      const hours = Math.floor((totalMinutes % 1440) / 60);
      const minutes = totalMinutes % 60;

      setNotifyDays(days.toString());
      setNotifyHours(hours.toString());
      setNotifyMinutes(minutes.toString());
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const handleSave = async () => {
    try {
      // Convert days/hours/minutes to total minutes
      const totalMinutes =
        (parseInt(notifyDays) || 0) * 1440 +
        (parseInt(notifyHours) || 0) * 60 +
        (parseInt(notifyMinutes) || 0);

      const updatedSettings = {
        ...settings,
        notification_minutes: totalMinutes,
      };

      await saveMailSettings(updatedSettings);
      setSettings(updatedSettings);
      setStatus("Settings saved successfully!");
      setTimeout(() => setStatus(""), 3000);
    } catch (error) {
      setStatus("Failed to save settings.");
      console.error(error);
    }
  };

  const handleTestEmail = async () => {
    setStatus("Sending test email...");
    try {
      const result = await sendTestEmail();
      setStatus(result);
    } catch (error) {
      setStatus(`Error: ${error}`);
    }
  };

  const handleCheckNotifications = async () => {
    setStatus("Checking notifications...");
    try {
      const result = await checkNotifications();
      setStatus(result);
      // Auto-close status after 5 seconds
      setTimeout(() => setStatus(""), 5000);
    } catch (error) {
      setStatus(`Error: ${error}`);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Close only if clicking the overlay, not the content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        className="modal-content"
        style={{ maxWidth: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Settings</h2>

        <h3 style={{ marginTop: "0", marginBottom: "15px", fontSize: "18px" }}>
          Theme
        </h3>
        <div className="form-group">
          <label>Select Theme:</label>
          <CustomDropdown
            value={theme}
            onChange={(val) => onThemeChange(val as string)}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "high-contrast", label: "High Contrast" },
              { value: "tokyo-night", label: "Tokyo Night" },
              { value: "nord", label: "Nord" },
              { value: "dracula", label: "Dracula" },
              { value: "monokai", label: "Monokai" },
              { value: "monokai-dimmed", label: "Monokai Dimmed" },
              { value: "gruvbox", label: "Gruvbox" },
              { value: "solarized-dark", label: "Solarized Dark" },
            ]}
            style={{ width: "100%", padding: "8px", marginBottom: "20px" }}
          />
        </div>

        <h3 style={{ marginBottom: "15px", fontSize: "18px" }}>
          Gmail Notifications
        </h3>

        <div className="form-group">
          <label>Gmail Address:</label>
          <input
            type="email"
            value={settings.email}
            onChange={(e) =>
              setSettings({ ...settings, email: e.target.value })
            }
            placeholder="example@gmail.com"
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>

        <div className="form-group">
          <label>App Password:</label>
          <input
            type="password"
            value={settings.app_password}
            onChange={(e) =>
              setSettings({ ...settings, app_password: e.target.value })
            }
            placeholder="xxxx xxxx xxxx xxxx"
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
          <small
            style={{
              display: "block",
              marginBottom: "10px",
              color: "var(--text-tertiary)",
            }}
          >
            Use an App Password generated from your Google Account settings
            (Security {">"} 2-Step Verification {">"} App passwords).
          </small>
        </div>

        <div className="form-group">
          <label>Notify before:</label>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <div style={{ maxWidth: "70px" }}>
              <input
                type="number"
                min="0"
                value={notifyDays}
                onChange={(e) => setNotifyDays(e.target.value)}
                style={{ width: "100%", padding: "5px", fontSize: "13px" }}
              />
              <small
                style={{
                  display: "block",
                  marginTop: "1px",
                  color: "var(--text-tertiary)",
                  fontSize: "11px",
                }}
              >
                Days
              </small>
            </div>
            <div style={{ maxWidth: "70px" }}>
              <input
                type="number"
                min="0"
                max="23"
                value={notifyHours}
                onChange={(e) => setNotifyHours(e.target.value)}
                style={{ width: "100%", padding: "5px", fontSize: "13px" }}
              />
              <small
                style={{
                  display: "block",
                  marginTop: "1px",
                  color: "var(--text-tertiary)",
                  fontSize: "11px",
                }}
              >
                Hours
              </small>
            </div>
            <div style={{ maxWidth: "70px" }}>
              <input
                type="number"
                min="0"
                max="59"
                value={notifyMinutes}
                onChange={(e) => setNotifyMinutes(e.target.value)}
                style={{ width: "100%", padding: "5px", fontSize: "13px" }}
              />
              <small
                style={{
                  display: "block",
                  marginTop: "1px",
                  color: "var(--text-tertiary)",
                  fontSize: "11px",
                }}
              >
                Minutes
              </small>
            </div>
          </div>
        </div>

        {status && (
          <div
            style={{
              marginBottom: "15px",
              padding: "10px",
              backgroundColor: "var(--bg-tertiary)",
              borderRadius: "6px",
              color:
                status.startsWith("Error") || status.startsWith("Failed")
                  ? "var(--danger)"
                  : "var(--accent-success)",
              maxHeight: "200px",
              overflowY: "auto",
              whiteSpace: "pre-wrap",
              fontSize: "12px",
            }}
          >
            {status}
          </div>
        )}

        <div
          className="modal-actions"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleTestEmail}
              style={{ backgroundColor: "var(--accent-primary)" }}
            >
              Test Email
            </button>
            <button
              onClick={handleCheckNotifications}
              style={{ backgroundColor: "var(--accent-success)" }}
            >
              Check Now
            </button>
          </div>
          <div>
            <button
              onClick={onClose}
              style={{ marginRight: "10px", backgroundColor: "var(--muted)" }}
            >
              Close
            </button>
            <button
              onClick={handleSave}
              style={{ backgroundColor: "var(--accent-success)" }}
            >
              Save
            </button>
          </div>
        </div>
        <div
          style={{
            marginTop: "8px",
            textAlign: "right",
            color: "var(--muted)",
            fontSize: "13px",
          }}
        >
          Version: {appVersion}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
