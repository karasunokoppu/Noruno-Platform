import { invoke } from "@tauri-apps/api/core";
import type { CalendarEvent } from "../types";

//Calender
export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    return await invoke<CalendarEvent[]>("get_calendar_events");
  } catch (e) {
    console.error("getCalendarEvents failed", e);
    throw e;
  }
}

export async function updateCalendarEvents(
  eventData: any,
): Promise<CalendarEvent[]> {
  try {
    return await invoke<CalendarEvent[]>("update_calendar_event", eventData);
  } catch (e) {
    console.error("updateSubtask failed", e);
    throw e;
  }
}

export async function createCalendarEvents(
  eventData: any,
): Promise<CalendarEvent[]> {
  try {
    return await invoke<CalendarEvent[]>("create_calendar_event", eventData);
  } catch (e) {
    console.error("createCalendarEvents failed", e);
    throw e;
  }
}

export async function deleteCalendarEvents(
  id: string,
): Promise<CalendarEvent[]> {
  try {
    return await invoke<CalendarEvent[]>("delete_calendar_event", { id });
  } catch (e) {
    console.error("deleteCalendarEvents failed", e);
    throw e;
  }
}
