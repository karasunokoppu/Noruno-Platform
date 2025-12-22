import { invoke } from "@tauri-apps/api/core";
import { Memo } from "../types";

//Memo
export async function getMemos(): Promise<Memo[]> {
  try {
    return await invoke<Memo[]>("get_memos");
  } catch (e) {
    console.error("getMemos failed", e);
    throw e;
  }
}

export async function createMemo(
  title: string,
  content: string,
  folderId: string | null,
  tags: string[],
): Promise<Memo[]> {
  try {
    return await invoke<Memo[]>("create_memo", {
      title: title,
      content: content,
      folderId: folderId,
      tags: tags,
    });
  } catch (e) {
    console.error("createMemo failed", e);
    throw e;
  }
}

export async function updateMemo(
  memoId: string,
  title: string,
  content: string,
  folderId: string | null,
  tags: string[],
): Promise<Memo[]> {
  try {
    return await invoke<Memo[]>("update_memo", {
      memoId: memoId,
      title: title,
      content: content,
      folderId: folderId,
      tags: tags,
    });
  } catch (e) {
    console.error("updateMemo failed", e);
    throw e;
  }
}

export async function deleteMemo(memoId: string): Promise<Memo[]> {
  try {
    return await invoke<Memo[]>("delete_memo", { memoId: memoId });
  } catch (e) {
    console.error("deleteMemo failed", e);
    throw e;
  }
}
