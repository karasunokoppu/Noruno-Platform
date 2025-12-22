import { invoke } from "@tauri-apps/api/core";
import type { MailSettings } from "../types";

//Mail
export async function getMailSettings(): Promise<MailSettings> {
  try {
    return await invoke<MailSettings>("get_mail_settings");
  } catch (e) {
    console.error("getMailSettings failed", e);
    throw e;
  }
}

export async function saveMailSettings(settings: MailSettings): Promise<void> {
  try {
    await invoke("save_mail_settings", { settings });
  } catch (e) {
    console.error("saveMailSettings failed", e);
    throw e;
  }
}

export async function sendTestEmail(): Promise<string> {
  try {
    return await invoke<string>("send_test_email");
  } catch (e) {
    console.error("sendTestEmail failed", e);
    throw e;
  }
}

//Notifications
export async function checkNotifications(): Promise<string> {
  try {
    return await invoke<string>("check_notifications");
  } catch (e) {
    console.error("checkNotifications failed", e);
    throw e;
  }
}
