import { Service } from '../../shared/kernel'
import { MainContext } from '../context'
import { BrowserWindow } from 'electron'

export interface themeConfig {
  name: string
  id: string
  mode: 'light' | 'dark'
  config: {
    tdesign: Record<string, string>
    custom: Record<string, string>
  }
}

declare module '../../shared/kernel' {
  interface Context {
    themes: ThemeService
  }
}

export class ThemeService extends Service {
  private currentThemeId: string = 'light-default'
  private customThemes: themeConfig[] = []
  private readonly builtinThemes: themeConfig[] = [
    {
      name: '极简浅色',
      id: 'light-default',
      mode: 'light',
      config: {
        tdesign: {
          brandColor: '#0052D9',
          warningColor: '#ED7B2F',
          errorColor: '#D54941',
          successColor: '#2BA471'
        },
        custom: {
          '--ss-bg-color': 'linear-gradient(180deg, #f7fbff 0%, #f1f7ff 55%, #f8f9fc 100%)',
          '--ss-card-bg': '#ffffff',
          '--ss-text-main': '#181818',
          '--ss-text-secondary': '#666666',
          '--ss-border-color': '#dcdcdc',
          '--ss-header-bg': 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)',
          '--ss-sidebar-bg': 'rgba(255, 255, 255, 0.88)',
          '--ss-item-hover': '#f3f3f3',
          '--ss-sidebar-text': '#181818',
          '--ss-sidebar-active-bg': 'rgba(0, 0, 0, 0.06)',
          '--ss-sidebar-active-text': '#181818'
        }
      }
    },
    {
      name: '极客深蓝',
      id: 'dark-default',
      mode: 'dark',
      config: {
        tdesign: {
          brandColor: '#0052D9',
          warningColor: '#E37318',
          errorColor: '#D32029',
          successColor: '#248232'
        },
        custom: {
          '--ss-bg-color': 'linear-gradient(180deg, #0f1220 0%, #101524 55%, #0b0d16 100%)',
          '--ss-card-bg': '#1e1e1e',
          '--ss-text-main': '#ffffff',
          '--ss-text-secondary': '#a0a0a0',
          '--ss-border-color': '#333333',
          '--ss-header-bg': 'rgba(30, 30, 30, 0.92)',
          '--ss-sidebar-bg': 'rgba(30, 30, 30, 0.92)',
          '--ss-item-hover': '#2c2c2c',
          '--ss-sidebar-text': '#ffffff',
          '--ss-sidebar-active-bg': 'rgba(255, 255, 255, 0.10)',
          '--ss-sidebar-active-text': '#ffffff'
        }
      }
    },
    {
      name: '冷静青蓝',
      id: 'dark-cyan',
      mode: 'dark',
      config: {
        tdesign: {
          brandColor: '#16A085',
          warningColor: '#F39C12',
          errorColor: '#E74C3C',
          successColor: '#1ABC9C'
        },
        custom: {
          '--ss-bg-color': 'linear-gradient(180deg, #050b10 0%, #06121a 55%, #05070a 100%)',
          '--ss-card-bg': '#0f1a23',
          '--ss-text-main': '#E5F7FF',
          '--ss-text-secondary': '#7FA4B8',
          '--ss-border-color': '#1F3645',
          '--ss-header-bg': 'rgba(15, 26, 35, 0.92)',
          '--ss-sidebar-bg': 'rgba(15, 26, 35, 0.92)',
          '--ss-item-hover': '#182635',
          '--ss-sidebar-text': '#E5F7FF',
          '--ss-sidebar-active-bg': '#182635',
          '--ss-sidebar-active-text': '#E5F7FF'
        }
      }
    },
    {
      name: '清新马卡龙',
      id: 'light-pastel',
      mode: 'light',
      config: {
        tdesign: {
          brandColor: '#FF9AA2',
          warningColor: '#FFB347',
          errorColor: '#FF6F69',
          successColor: '#B5EAD7'
        },
        custom: {
          '--ss-bg-color': 'linear-gradient(180deg, #fff7f1 0%, #fff1f1 55%, #f7f7fb 100%)',
          '--ss-card-bg': '#ffffff',
          '--ss-text-main': '#3A3A3A',
          '--ss-text-secondary': '#8A8A8A',
          '--ss-border-color': '#F1D3D3',
          '--ss-header-bg': 'rgba(255, 255, 255, 0.88)',
          '--ss-sidebar-bg': 'rgba(255, 255, 255, 0.90)',
          '--ss-item-hover': '#FFE7E0',
          '--ss-sidebar-text': '#3A3A3A',
          '--ss-sidebar-active-bg': '#FFE7E0',
          '--ss-sidebar-active-text': '#3A3A3A'
        }
      }
    }
  ]

  constructor(ctx: MainContext) {
    super(ctx, 'themes')
    this.registerIpc()
  }

  private get mainCtx() {
    return this.ctx as MainContext
  }

  public async init() {
    await this.mainCtx.settings.initialize()
    await this.loadSavedTheme()
    await this.loadCustomThemes()
  }

  private async loadSavedTheme() {
    try {
      const savedThemeId = this.mainCtx.settings.getValue('current_theme_id')
      if (savedThemeId && typeof savedThemeId === 'string') {
        const themes = this.getThemeList()
        const exists = themes.some((t) => t.id === savedThemeId)
        if (exists) {
          this.currentThemeId = savedThemeId
        }
      }
    } catch (e) {
      this.mainCtx.logger.warn('Failed to load saved theme', { meta: e })
    }
  }

  private async saveCurrentTheme() {
    try {
      await this.mainCtx.settings.setValue('current_theme_id', this.currentThemeId)
    } catch (e) {
      this.mainCtx.logger.warn('Failed to save theme', { meta: e })
    }
  }

  private async loadCustomThemes() {
    try {
      const v = this.mainCtx.settings.getValue('themes_custom')
      if (Array.isArray(v)) {
        this.customThemes = v.filter((t) => t && typeof t === 'object') as any
      } else {
        this.customThemes = []
      }
    } catch {
      this.customThemes = []
    }
  }

  private async saveCustomThemes() {
    await this.mainCtx.settings.setValue('themes_custom', this.customThemes)
  }

  private registerIpc() {
    this.mainCtx.handle('theme:list', async () => {
      return { success: true, data: this.getThemeList() }
    })

    this.mainCtx.handle('theme:current', async () => {
      const theme = this.getThemeById(this.currentThemeId)
      return { success: true, data: theme }
    })

    this.mainCtx.handle('theme:set', async (event, themeId: string) => {
      const senderId = event?.sender?.id
      if (typeof senderId === 'number') {
        if (!this.mainCtx.permissions.requirePermission(event, 'admin'))
          return { success: false, message: 'Permission denied' }
      }
      this.currentThemeId = themeId
      await this.saveCurrentTheme()
      this.notifyThemeUpdate()
      return { success: true }
    })

    this.mainCtx.handle('theme:save', async (event, theme: themeConfig) => {
      if (!this.mainCtx.permissions.requirePermission(event, 'admin'))
        return { success: false, message: 'Permission denied' }

      try {
        if (!theme?.id || !theme?.name) {
          return { success: false, message: 'Invalid theme' }
        }
        const isBuiltin = this.builtinThemes.some((t) => t.id === theme.id)
        if (isBuiltin) {
          return { success: false, message: 'Cannot overwrite builtin themes' }
        }

        const normalized: themeConfig = {
          name: String(theme.name),
          id: String(theme.id),
          mode: theme.mode === 'dark' ? 'dark' : 'light',
          config: {
            tdesign: { ...(theme.config?.tdesign || {}) },
            custom: { ...(theme.config?.custom || {}) }
          }
        }

        const idx = this.customThemes.findIndex((t) => t.id === normalized.id)
        if (idx >= 0) this.customThemes[idx] = normalized
        else this.customThemes.unshift(normalized)

        await this.saveCustomThemes()
        this.notifyThemeUpdate()
        return { success: true }
      } catch (e) {
        return { success: false, message: String(e) }
      }
    })

    this.mainCtx.handle('theme:delete', async (event, themeId: string) => {
      if (!this.mainCtx.permissions.requirePermission(event, 'admin'))
        return { success: false, message: 'Permission denied' }

      try {
        const id = String(themeId || '').trim()
        if (!id) return { success: false, message: 'Invalid theme id' }
        if (this.builtinThemes.some((t) => t.id === id)) {
          return { success: false, message: 'Cannot delete builtin themes' }
        }

        const before = this.customThemes.length
        this.customThemes = this.customThemes.filter((t) => t.id !== id)
        if (this.customThemes.length === before) {
          return { success: false, message: 'Theme not found' }
        }

        await this.saveCustomThemes()
        if (this.currentThemeId === themeId) {
          this.currentThemeId = 'light-default'
          await this.saveCurrentTheme()
        }
        this.notifyThemeUpdate()
        return { success: true }
      } catch (e) {
        return { success: false, message: String(e) }
      }
    })
  }

  private getThemeList(): themeConfig[] {
    return [...this.builtinThemes, ...this.customThemes]
  }

  private getThemeById(id: string): themeConfig | null {
    const list = this.getThemeList()
    return list.find((t) => t.id === id) || list[0] || null
  }

  private notifyThemeUpdate() {
    const theme = this.getThemeById(this.currentThemeId)
    if (!theme) return

    const windows = BrowserWindow.getAllWindows()
    for (const win of windows) {
      win.webContents.send('theme:updated', theme)
    }
  }
}
