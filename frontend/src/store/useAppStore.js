import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAppStore = create(
  persist(
    (set) => ({
      // Prediction slice
      prediction: null,
      predictionStatus: 'idle',
      predictionError: null,
      uploadProgress: 0,
      previewUrl: null,

      setPrediction: (result) => set({ prediction: result, predictionStatus: 'done', predictionError: null }),
      setPredictionStatus: (status) => set({ predictionStatus: status }),
      setPredictionError: (err) => set({ predictionError: err, predictionStatus: 'error' }),
      setUploadProgress: (pct) => set({ uploadProgress: pct }),
      setPreviewUrl: (url) => set({ previewUrl: url }),
      resetPrediction: () => set({ prediction: null, predictionStatus: 'idle', predictionError: null, uploadProgress: 0, previewUrl: null }),

      // History slice
      history: [],
      addToHistory: (entry) => set((state) => ({ history: [entry, ...state.history].slice(0, 20) })),
      clearHistory: () => set({ history: [] }),
      removeFromHistory: (id) => set((state) => ({ history: state.history.filter((h) => h.id !== id) })),

      // Health slice
      backendHealth: null,
      setBackendHealth: (status) => set({ backendHealth: status }),

      // UI slice
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'tomato-ai-store',
      partialize: (state) => ({ history: state.history, sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
)

export default useAppStore
