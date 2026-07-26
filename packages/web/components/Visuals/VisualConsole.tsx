import { useState, useCallback } from 'react'
import { useSnapshot } from 'valtio'
import settings from '@/web/states/settings'
import { cx } from '@emotion/css'
import Icon from '@/web/components/Icon'

const PRESET_ICONS = ['🎨', '💎', '🌌', '✨']

/** Sync settings to CSS custom properties on <html> */
function syncCSSVars(s: typeof settings) {
  const root = document.documentElement
  root.style.setProperty('--glass-opacity', String(s.glassOpacity))
  root.style.setProperty('--glass-opacity-dark', String(Math.min(1, s.glassOpacity + 0.05)))
  root.style.setProperty('--glass-blur-px', s.glassBlur + 'px')
  root.style.setProperty('--glass-saturate-pct', s.glassSaturate + '%')
  root.style.setProperty('--starfield-count', String(s.starfieldCount))
  root.style.setProperty('--starfield-drift', String(s.starfieldDrift))
}

function Slider({ label, value, min, max, step = 1, unit = '', onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string
  onChange: (v: number) => void
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="mb-3">
      <div className="mb-1 flex justify-between text-xs text-neutral-400">
        <span>{label}</span>
        <span>{value}{unit}</span>
      </div>
      <div className="relative h-6 w-full cursor-pointer" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        onChange(Math.round((min + p * (max - min)) / step) * step)
      }}>
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-white/10">
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: pct + '%' }} />
        </div>
        <div
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-md transition-all"
          style={{ left: pct + '%' }}
        />
      </div>
    </div>
  )
}

export default function VisualConsole() {
  const snap = useSnapshot(settings)
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'玻璃' | '星空' | '存档'>('玻璃')

  const applyPreset = useCallback((idx: number) => {
    const p = settings.visualPresets[idx]
    if (!p.name) return
    settings.glassOpacity = p.glassOpacity
    settings.glassBlur = p.glassBlur
    settings.glassSaturate = p.glassSaturate
    settings.starfieldCount = p.starfieldCount
    settings.starfieldDrift = p.starfieldDrift
    settings.activeVisualPreset = idx
    syncCSSVars(settings)
  }, [])

  const savePreset = useCallback((idx: number) => {
    settings.visualPresets[idx] = {
      name: '存档 ' + (idx + 1),
      glassOpacity: settings.glassOpacity,
      glassBlur: settings.glassBlur,
      glassSaturate: settings.glassSaturate,
      starfieldCount: settings.starfieldCount,
      starfieldDrift: settings.starfieldDrift,
    }
    settings.activeVisualPreset = idx
  }, [])

  const handleChange = useCallback((key: string, value: number) => {
    (settings as any)[key] = value
    settings.activeVisualPreset = -1
    syncCSSVars(settings)
  }, [])

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="glass fixed bottom-6 left-6 z-40 flex h-12 w-12 items-center justify-center rounded-full text-white/70 transition-all hover:text-white"
        title="视觉控制台"
      >
        <Icon name="my" className="h-5 w-5" />
      </button>
    )
  }

  return (
    <div className="glass fixed bottom-6 left-6 z-40 flex max-h-[500px] w-[300px] flex-col overflow-hidden rounded-24 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <span className="text-sm font-medium text-white/80">视觉控制台 · DIY</span>
        <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white">
          <Icon name="x" className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 px-4 py-2">
        {(['玻璃', '星空', '存档'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cx(
              'rounded-full px-3 py-1 text-xs transition-colors',
              tab === t ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/70'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-3">
        {tab === '玻璃' && (
          <>
            <Slider label="玻璃透明度" value={Math.round(snap.glassOpacity * 100)} min={10} max={95} unit="%"
              onChange={v => handleChange('glassOpacity', v / 100)} />
            <Slider label="模糊力度" value={snap.glassBlur} min={4} max={80} unit="px"
              onChange={v => handleChange('glassBlur', v)} />
            <Slider label="饱和度" value={snap.glassSaturate} min={50} max={300} unit="%"
              onChange={v => handleChange('glassSaturate', v)} />
            <div className="mt-4 rounded-12 bg-white/5 p-3 text-xs text-white/40">
              拖拽滑杆即时预览效果。修改后当前存档标记为未保存。
            </div>
          </>
        )}

        {tab === '星空' && (
          <>
            <Slider label="星星数量" value={snap.starfieldCount} min={20} max={400} unit="颗"
              onChange={v => handleChange('starfieldCount', v)} />
            <Slider label="漂移速度" value={snap.starfieldDrift} min={0.1} max={5} step={0.1} unit="x"
              onChange={v => handleChange('starfieldDrift', v)} />
          </>
        )}

        {tab === '存档' && (
          <>
            <p className="mb-3 text-xs text-white/30">保存当前视觉参数到预设槽位，点击即可切换</p>
            <div className="grid grid-cols-2 gap-2">
              {settings.visualPresets.map((p, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <button
                    onClick={() => p.name ? applyPreset(i) : savePreset(i)}
                    className={cx(
                      'flex h-16 flex-col items-center justify-center gap-1 rounded-12 border border-white/10 transition-all',
                      settings.activeVisualPreset === i ? 'bg-brand-500/20 border-brand-500/40' : 'bg-white/5 hover:bg-white/10'
                    )}
                  >
                    <span className="text-lg">{PRESET_ICONS[i]}</span>
                    <span className="text-[10px] text-white/50">{p.name || '空槽'}</span>
                  </button>
                  {p.name && (
                    <button
                      onClick={() => savePreset(i)}
                      className="rounded-8 bg-white/5 py-0.5 text-[10px] text-white/30 hover:bg-white/10"
                    >
                      覆盖保存
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Status bar */}
      <div className="border-t border-white/10 px-5 py-2 text-[10px] text-white/30">
        {snap.activeVisualPreset >= 0
          ? `当前预设: ${snap.visualPresets[snap.activeVisualPreset].name}`
          : '自定义参数 · 未关联存档'}
      </div>
    </div>
  )
}
