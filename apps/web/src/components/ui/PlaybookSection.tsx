'use client'

import { useState } from 'react'
import { PlaybookDay } from '@/types'
import { Copy, Check, Lock, CalendarBlank, LightningA, VideoCamera, Slideshow, Smiley, Trophy, Megaphone } from '@phosphor-icons/react'

// ── Tier gate helper ─────────────────────────────────────────

interface PlaybookSectionProps {
  playbook: PlaybookDay[] | null
  userTier: string
  analysisId: string
}

// ── Icon map per content type ────────────────────────────────

const CONTENT_TYPE_ICONS: Record<string, React.ReactNode> = {
  'Contrarian Post':    <LightningA size={16} weight="duotone" />,
  'Educational':        <CalendarBlank size={16} weight="duotone" />,
  'Story Post':         <VideoCamera size={16} weight="duotone" />,
  'Hot Take':           <Megaphone size={16} weight="duotone" />,
  'Relatable':          <Smiley size={16} weight="duotone" />,
  'Authority Post':     <Trophy size={16} weight="duotone" />,
  'Carousel':           <Slideshow size={16} weight="duotone" />,
}

// ── Color map per content type ───────────────────────────────

const CONTENT_TYPE_COLORS: Record<string, string> = {
  'Contrarian Post': 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  'Educational':     'text-blue-400  bg-blue-400/10  border-blue-400/20',
  'Story Post':      'text-purple-400 bg-purple-400/10 border-purple-400/20',
  'Hot Take':        'text-red-400   bg-red-400/10   border-red-400/20',
  'Relatable':       'text-green-400 bg-green-400/10 border-green-400/20',
  'Authority Post':  'text-amber-400 bg-amber-400/10 border-amber-400/20',
  'Carousel':        'text-cyan-400  bg-cyan-400/10  border-cyan-400/20',
}

// ── Day Card Component ───────────────────────────────────────

function DayCard({ day, index }: { day: PlaybookDay; index: number }) {
  const [copied, setCopied] = useState(false)

  const colorClass = CONTENT_TYPE_COLORS[day.content_type]
    || 'text-text-s bg-bg-overlay border-border-def'

  const icon = CONTENT_TYPE_ICONS[day.content_type] || <CalendarBlank size={16} weight="duotone" />

  const handleCopyHook = () => {
    navigator.clipboard.writeText(day.hook)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="rounded-xl border border-border-def bg-bg-surface p-5 hover:border-border-str transition-all duration-150 hover:-translate-y-0.5"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Day header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-text-m font-medium tracking-widest uppercase">
            Day {day.day}
          </span>
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium font-body ${colorClass}`}>
            {icon}
            {day.content_type}
          </span>
        </div>

        {/* Copy Hook button */}
        <button
          onClick={handleCopyHook}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-bg-elevated hover:bg-accent/10 hover:text-accent border border-border-def hover:border-accent/30 text-text-s transition-all duration-150"
          title="Copy hook to clipboard"
        >
          {copied
            ? <><Check size={12} weight="bold" className="text-positive" /> Copied</>
            : <><Copy size={12} /> Copy Hook</>
          }
        </button>
      </div>

      {/* Hook */}
      <div className="mb-3">
        <p className="text-xs text-text-m uppercase tracking-wider font-mono mb-1.5">Hook</p>
        <blockquote className="border-l-2 border-accent pl-3 text-text-p font-body text-sm leading-relaxed italic">
          "{day.hook}"
        </blockquote>
      </div>

      {/* Angle */}
      <div className="mb-3">
        <p className="text-xs text-text-m uppercase tracking-wider font-mono mb-1.5">Angle</p>
        <p className="text-text-s font-body text-sm leading-relaxed">{day.angle}</p>
      </div>

      {/* Format badge */}
      <div className="flex items-center gap-2 pt-3 border-t border-border-sub">
        <VideoCamera size={13} className="text-text-m" weight="duotone" />
        <span className="text-xs text-text-m font-body">Suggested Format:</span>
        <span className="text-xs text-text-s font-mono bg-bg-elevated px-2 py-0.5 rounded-md border border-border-def">
          {day.format}
        </span>
      </div>
    </div>
  )
}

// ── Locked Day Card (Free → Paid upsell) ─────────────────────

function LockedDayCard({ day }: { day: number }) {
  return (
    <div className="rounded-xl border border-border-def bg-bg-surface p-5 relative overflow-hidden">
      {/* Blurred content */}
      <div className="blur-sm pointer-events-none select-none opacity-40">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-mono text-text-m uppercase tracking-widest">Day {day}</span>
          <span className="text-xs px-2 py-0.5 rounded-full border border-border-def text-text-s bg-bg-elevated">
            ██████ Post
          </span>
        </div>
        <div className="border-l-2 border-border-str pl-3 mb-3">
          <p className="text-sm text-text-s italic">
            "████ ████████ ████ ████ ████████ ██ ████ ███████"
          </p>
        </div>
        <p className="text-sm text-text-m mb-3">████████ ████████ ██████ ████ ████ ████████ ███ ████.</p>
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-surface/80 backdrop-blur-[2px] rounded-xl">
        <Lock size={20} className="text-text-m mb-2" weight="duotone" />
        <p className="text-xs text-text-s font-body mb-3">
          Day {day} unlocked on Creator plan
        </p>
        <a
          href="/pricing"
          className="text-xs px-3 py-1.5 rounded-lg bg-accent text-bg-base font-body font-medium hover:bg-accent-dim transition-colors"
        >
          Upgrade — ₹499/mo
        </a>
      </div>
    </div>
  )
}

// ── Copy All Hooks Button ────────────────────────────────────

function CopyAllHooksButton({ playbook }: { playbook: PlaybookDay[] }) {
  const [copied, setCopied] = useState(false)

  const handleCopyAll = () => {
    const allHooks = playbook
      .map(d => `Day ${d.day} (${d.content_type}):\n"${d.hook}"\nFormat: ${d.format}`)
      .join('\n\n')
    navigator.clipboard.writeText(allHooks)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <button
      onClick={handleCopyAll}
      className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-border-def bg-bg-elevated hover:border-accent/30 hover:bg-accent/5 hover:text-accent text-text-s transition-all duration-150"
    >
      {copied
        ? <><Check size={14} weight="bold" className="text-positive" /> All hooks copied!</>
        : <><Copy size={14} /> Copy all hooks</>
      }
    </button>
  )
}

// ── Main PlaybookSection Component ──────────────────────────

export function PlaybookSection({ playbook, userTier, analysisId }: PlaybookSectionProps) {
  const isFree = userTier === 'free'
  const isPaid = userTier === 'creator' || userTier === 'pro'

  // Handle null playbook (old analyses before feature launch)
  if (!playbook || playbook.length === 0) {
    return (
      <section id="playbook" className="space-y-4">
        <SectionHeader title="7-Day Content Playbook" count={0} />
        <div className="rounded-xl border border-border-def bg-bg-surface p-8 text-center">
          <CalendarBlank size={32} className="text-text-m mx-auto mb-3" weight="duotone" />
          <p className="text-text-s font-body text-sm">
            This analysis was created before the Playbook feature launched.
          </p>
          <p className="text-text-m font-body text-xs mt-1">
            Re-analyze the video to generate your 7-day content playbook.
          </p>
        </div>
      </section>
    )
  }

  // Days generated by AI (3 for free, 7 for paid)
  const generatedDays = playbook
  // Locked days to show as upsell (only for free users)
  const lockedDays = isFree ? [4, 5, 6, 7] : []

  return (
    <section id="playbook" className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SectionHeader
          title="7-Day Content Playbook"
          count={isPaid ? 7 : 3}
          subtitle={
            isFree
              ? '3 days · Upgrade for full 7-day playbook'
              : `${generatedDays.length} days of Instagram content ideas`
          }
        />
        {generatedDays.length > 0 && (
          <CopyAllHooksButton playbook={generatedDays} />
        )}
      </div>

      {/* Usage hint */}
      <div className="rounded-lg bg-accent/5 border border-accent/15 px-4 py-3 flex items-start gap-3">
        <LightningA size={16} className="text-accent mt-0.5 shrink-0" weight="duotone" />
        <p className="text-xs text-text-s font-body leading-relaxed">
          <span className="text-accent font-medium">How to use:</span>{' '}
          Each day is a complete Instagram content idea extracted from your video.
          Copy the hook and start recording — or use the angle to write your caption.
        </p>
      </div>

      {/* Generated days grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {generatedDays.map((day, index) => (
          <DayCard key={day.day} day={day} index={index} />
        ))}

        {/* Locked days (free users only) */}
        {lockedDays.map(dayNum => (
          <LockedDayCard key={dayNum} day={dayNum} />
        ))}
      </div>

      {/* Upgrade CTA bar (free users) */}
      {isFree && (
        <div className="rounded-xl border border-accent/20 bg-accent/5 p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-body font-medium text-text-p mb-0.5">
              Get 4 more days of content ideas
            </p>
            <p className="text-xs text-text-s font-body">
              Creator plan unlocks the full 7-day playbook with better hooks &amp; angles.
            </p>
          </div>
          <a
            href="/pricing"
            className="shrink-0 text-sm px-4 py-2 rounded-lg bg-accent text-bg-base font-body font-medium hover:bg-accent-dim transition-colors"
          >
            Upgrade — ₹499/mo
          </a>
        </div>
      )}
    </section>
  )
}

// ── Reusable section header ──────────────────────────────────

function SectionHeader({
  title,
  count,
  subtitle
}: {
  title: string
  count: number
  subtitle?: string
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-0.5">
        <div className="w-0.5 h-5 bg-accent rounded-full" />
        <h2 className="text-base font-body font-medium text-text-p">{title}</h2>
        {count > 0 && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-accent/10 text-accent font-mono border border-accent/20">
            {count} days
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-text-m font-body ml-2.5">{subtitle}</p>
      )}
    </div>
  )
}