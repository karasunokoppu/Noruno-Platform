import { invoke } from "@tauri-apps/api/core";
import type { Task } from "../types";
//Task
export async function getTasks(): Promise<Task[]> {
  try {
    return await invoke<Task[]>("get_tasks");
  } catch (e) {
    console.error("getTasks failed", e);
    throw e;
  }
}

export async function addTask(
  description: string,
  startDate: string | undefined,
  dueDate: string,
  group: string,
  details: string,
  notificationMinutes: number | undefined,
  dependencies: null,
): Promise<Task[]> {
  try {
    return await invoke<Task[]>("add_task", {
      description: description,
      startDate: startDate,
      dueDate: dueDate,
      group: group,
      details: details,
      notificationMinutes: notificationMinutes,
      dependencies: dependencies,
    });
  } catch (e) {
    console.error("addTask failed", e);
    throw e;
  }
}

export async function updateTask(task: Task): Promise<Task[]> {
  try {
    return await invoke<Task[]>("update_task", {
      id: task.id,
      description: task.description,
      startDate: task.start_date || null,
      dueDate: task.due_date,
      group: task.group,
      details: task.details,
      notificationMinutes: task.notification_minutes || null,
      dependencies: task.dependencies || null,
    });
  } catch (e) {
    console.error("updateTask failed", e);
    throw e;
  }
}

export async function deleteTask(id: number): Promise<Task[]> {
  try {
    return await invoke<Task[]>("delete_task", { id });
  } catch (e) {
    console.error("deleteTask failed", e);
    throw e;
  }
}

export async function completeTask(id: number): Promise<Task[]> {
  try {
    return await invoke<Task[]>("complete_task", { id });
  } catch (e) {
    console.error("completeTask failed", e);
    throw e;
  }
}

//Task => Group

export async function getGroups(): Promise<string[]> {
  try {
    return await invoke<string[]>("get_groups");
  } catch (e) {
    console.error("getGroups failed", e);
    throw e;
  }
}

export async function createGroups(name: string): Promise<string[]> {
  try {
    return await invoke<string[]>("create_group", { name });
  } catch (e) {
    console.error("createGroups failed", e);
    throw e;
  }
}

export async function deleteGroups(name: string): Promise<string[]> {
  try {
    return await invoke<string[]>("delete_group", { name });
  } catch (e) {
    console.error("deleteGroups failed", e);
    throw e;
  }
}

export async function renameGroups(oldName: string, newName: string) {
  try {
    return await invoke<any>("rename_group", { oldName, newName });
  } catch (e) {
    console.error("deleteGroups failed", e);
    throw e;
  }
}

//Task => Subtask
export async function addSubtask(
  taskid: number,
  description: string,
): Promise<Task[]> {
  try {
    return await invoke<Task[]>("add_subtask", {
      taskId: taskid,
      description: description.trim(),
    });
  } catch (e) {
    console.error("addSubtask failed", e);
    throw e;
  }
}

export async function toggleSubtask(
  taskid: number,
  subTaskId: number,
): Promise<Task[]> {
  try {
    return await invoke<Task[]>("toggle_subtask", {
      taskId: taskid,
      subtaskId: subTaskId,
    });
  } catch (e) {
    console.error("toggleSubtask failed", e);
    throw e;
  }
}

export async function deleteSubtask(
  taskid: number,
  subTaskId: number,
): Promise<Task[]> {
  try {
    return await invoke<Task[]>("delete_subtask", {
      taskId: taskid,
      subtaskId: subTaskId,
    });
  } catch (e) {
    console.error("deleteSubtask failed", e);
    throw e;
  }
}

export async function updateSubtask(
  taskId: number,
  subtaskId: number,
  description: string,
  completed: boolean,
): Promise<Task[]> {
  try {
    return await invoke<Task[]>("update_subtask", {
      taskId,
      subtaskId,
      description,
      completed,
    });
  } catch (e) {
    console.error("updateSubtask failed", e);
    throw e;
  }
}

//Task => Folder
export async function getFolders(): Promise<any[]> {
  try {
    return await invoke<any[]>("get_folders");
  } catch (e) {
    console.error("getFolders failed", e);
    throw e;
  }
}

export async function deleteFolder(id: string): Promise<any[]> {
  try {
    return await invoke<any[]>("delete_folder", { id });
  } catch (e) {
    console.error("deleteFolder failed", e);
    throw e;
  }
}
