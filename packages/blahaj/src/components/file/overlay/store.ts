import { create } from "zustand";

interface FileOverlayStore {
  fileId: string | null;
  previousPath: string | null;
}

export const useFileOverlayStore = create<FileOverlayStore>((set) => ({
  fileId: null,
  previousPath: null,
}));

export const setFileOverlay = (fileId: string | null) => {
  useFileOverlayStore.setState((state) => {
    if (fileId) {
      const previousPath = window.location.pathname;
      window.history.pushState(null, "", `/file/${fileId}`);
      return { fileId, previousPath };
    } else {
      window.history.pushState(null, "", state.previousPath ?? "/");
      return { fileId: null, previousPath: null };
    }
  });
};
