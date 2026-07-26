import { IpcChannels } from '@/shared/IpcChannels'
import { merge } from 'lodash-es'
import { proxy, subscribe } from 'valtio'
import i18n, { getInitLanguage, SupportedLanguage, supportedLanguages } from '../i18n/i18n'
import { getKeyboardShortcutDefaultSettings } from '@/shared/defaultSettings'

interface Settings {
  /* === DIY 视觉控制台 === */
  glassOpacity: number         // 玻璃透明度 0-1
  glassBlur: number            // 模糊力度 px
  glassSaturate: number        // 饱和度百分比
  starfieldCount: number       // 星空粒子数量
  starfieldDrift: number       // 星空漂移速度
  activeVisualPreset: number   // 当前预设槽位 0-3
  visualPresets: { name: string; glassOpacity: number; glassBlur: number; glassSaturate: number; starfieldCount: number; starfieldDrift: number }[]

  accentColor: string
  language: SupportedLanguage
  qqCookie: string
  miguCookie: string
  jooxCookie: string
  enableFindTrackOnYouTube: boolean
  httpProxyForYouTube?: {
    proxy: string
    host: string
    port: number
    protocol: 'http' | 'https'
    auth?: {
      username: string
      password: string
    }
  }
  playAnimatedArtworkFromApple: boolean
  priorityDisplayOfAlbumArtistDescriptionFromAppleMusic: boolean
  displayPlaylistsFromNeteaseMusic: boolean
  closeWindowInMinimize: boolean
  showBackgroundImage: boolean
  unlock: boolean
  theme: string
  showDesktopLyrics: boolean
  keyboardShortcuts: KeyboardShortcutSettings
  showTrackListName: boolean
  enableBreathingEffect: boolean
  enableStarfield: boolean
}

const initSettings: Settings = {
  glassOpacity: 0.55,
  glassBlur: 24,
  glassSaturate: 160,
  starfieldCount: 160,
  starfieldDrift: 1,
  activeVisualPreset: -1,
  visualPresets: [
    { name: '', glassOpacity: 0.55, glassBlur: 24, glassSaturate: 160, starfieldCount: 160, starfieldDrift: 1 },
    { name: '', glassOpacity: 0.55, glassBlur: 24, glassSaturate: 160, starfieldCount: 160, starfieldDrift: 1 },
    { name: '', glassOpacity: 0.55, glassBlur: 24, glassSaturate: 160, starfieldCount: 160, starfieldDrift: 1 },
    { name: '', glassOpacity: 0.55, glassBlur: 24, glassSaturate: 160, starfieldCount: 160, starfieldDrift: 1 },
  ],

  accentColor: 'yellow',
  language: getInitLanguage(),
  qqCookie: '',
  miguCookie: '',
  jooxCookie: '',
  enableFindTrackOnYouTube: false,
  playAnimatedArtworkFromApple: true,
  priorityDisplayOfAlbumArtistDescriptionFromAppleMusic: true,
  displayPlaylistsFromNeteaseMusic: true,
  closeWindowInMinimize: false,
  showBackgroundImage: false,
  httpProxyForYouTube: {
    proxy: '',
    host: '',
    port: 0,
    protocol: 'http',
  },
  unlock: true,
  theme: 'dark',
  showDesktopLyrics: false,
  keyboardShortcuts: getKeyboardShortcutDefaultSettings(),
  showTrackListName: false,
  enableBreathingEffect: true,
  enableStarfield: true,
}

const STORAGE_KEY = 'settings'

let statesInStorage = {}
try {
  statesInStorage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
} catch {
  // ignore
}

const settings = proxy<Settings>(merge(initSettings, statesInStorage))

subscribe(settings, () => {
  if (settings.language !== i18n.language && supportedLanguages.includes(settings.language)) {
    i18n.changeLanguage(settings.language)
  }
  // 同步electron set settings
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  window.ipcRenderer?.send(IpcChannels.SyncSettings, JSON.parse(JSON.stringify(settings)))
})
export default settings
