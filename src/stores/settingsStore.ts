import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { preferencesService } from '../services/api'

type UserSettings = {
  voiceOnNewOrder: boolean
}

type SettingsState = {
  byUser: Record<string, UserSettings>
  getForUser: (userId: string) => UserSettings
  setVoiceOnNewOrder: (userId: string, enabled: boolean) => void
  loadFromBackend: (userId: string) => Promise<void>
  saveToBackend: (userId: string) => Promise<void>
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      byUser: {},
      getForUser: (userId: string) => {
        const s = get().byUser[userId]
        return s ?? { voiceOnNewOrder: true }
      },
      setVoiceOnNewOrder: (userId: string, enabled: boolean) => {
        set((state) => ({
          byUser: { ...state.byUser, [userId]: { ...(state.byUser[userId] ?? { voiceOnNewOrder: true }), voiceOnNewOrder: enabled } }
        }))
      },
      loadFromBackend: async (userId: string) => {
        try {
          const prefs = await preferencesService.get(userId)
          set((state) => ({ byUser: { ...state.byUser, [userId]: prefs } }))
        } catch (e) {
          // Silencioso: se falhar, manter local
        }
      },
      saveToBackend: async (userId: string) => {
        const prefs = get().getForUser(userId)
        try {
          await preferencesService.update(userId, prefs)
        } catch (e) {
          // Silencioso
        }
      }
    }),
    {
      name: 'settings-store',
      version: 1
    }
  )
)