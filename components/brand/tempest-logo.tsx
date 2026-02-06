'use client'

import { cn } from '@/lib/utils'

interface TempestLogoProps {
  variant?: 'full' | 'icon' | 'wordmark'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
  className?: string
  colorScheme?: 'brand' | 'mono-light' | 'mono-dark'
}

const sizeMap = {
  xs: { icon: 24, full: 120, wordmark: 96 },
  sm: { icon: 32, full: 160, wordmark: 128 },
  md: { icon: 48, full: 220, wordmark: 172 },
  lg: { icon: 64, full: 280, wordmark: 216 },
  xl: { icon: 96, full: 400, wordmark: 304 },
}

export function TempestLogo({
  variant = 'full',
  size = 'md',
  animated = false,
  className,
  colorScheme = 'brand',
}: TempestLogoProps) {
  const dimensions = sizeMap[size]

  const colors = {
    brand: {
      primary: '#1A8FE3',     // Bright blue - trust, calm
      secondary: '#22C997',   // Teal green - growth, success
      accent: '#FF7849',      // Warm coral - energy, friendliness
      text: '#1E293B',        // Dark slate - readability
    },
    'mono-light': {
      primary: '#FFFFFF',
      secondary: '#FFFFFF',
      accent: '#FFFFFF',
      text: '#FFFFFF',
    },
    'mono-dark': {
      primary: '#1E293B',
      secondary: '#1E293B',
      accent: '#1E293B',
      text: '#1E293B',
    },
  }

  const c = colors[colorScheme]

  if (variant === 'icon') {
    return (
      <svg
        width={dimensions.icon}
        height={dimensions.icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(animated && 'tempest-logo-animated', className)}
        role="img"
        aria-label="Tempest logo"
      >
        <rect width="64" height="64" rx="16" fill={c.primary} />
        {/* Wind swirl icon mark */}
        <g className={animated ? 'tempest-swirl' : undefined}>
          {/* Top arc */}
          <path
            d="M18 24C18 24 24 16 34 16C42 16 46 22 46 26C46 30 42 32 38 32"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Middle arc */}
          <path
            d="M14 32C14 32 22 26 32 26C42 26 48 32 48 36C48 40 44 42 40 42"
            stroke={c.secondary}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />
          {/* Bottom arc */}
          <path
            d="M18 40C18 40 24 34 32 34C38 34 42 38 42 42C42 46 38 48 34 48"
            stroke={c.accent}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
          />
        </g>
        {/* Small circle accent */}
        <circle cx="46" cy="26" r="3" fill={c.secondary} opacity="0.9" />
        <circle cx="40" cy="42" r="2.5" fill={c.accent} opacity="0.85" />
      </svg>
    )
  }

  if (variant === 'wordmark') {
    return (
      <svg
        width={dimensions.wordmark}
        height={dimensions.icon}
        viewBox="0 0 172 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(animated && 'tempest-logo-animated', className)}
        role="img"
        aria-label="Tempest wordmark"
      >
        <text
          x="0"
          y="36"
          fontFamily="var(--font-sans), system-ui, sans-serif"
          fontSize="38"
          fontWeight="700"
          letterSpacing="-1"
          fill={c.text}
        >
          Tempest
        </text>
        {/* Underline swirl accent */}
        <path
          d="M2 44C2 44 40 38 86 38C132 38 170 44 170 44"
          stroke={c.primary}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
      </svg>
    )
  }

  // Full logo: icon + wordmark
  return (
    <svg
      width={dimensions.full}
      height={dimensions.icon}
      viewBox="0 0 220 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(animated && 'tempest-logo-animated', className)}
      role="img"
      aria-label="Tempest logo"
    >
      {/* Icon mark */}
      <rect width="48" height="48" rx="12" fill={c.primary} />
      <g className={animated ? 'tempest-swirl' : undefined}>
        <path
          d="M12 18C12 18 17 12 24 12C30 12 33 16.5 33 19.5C33 22.5 30 24 27 24"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M9 24C9 24 16 19.5 24 19.5C32 19.5 36 24 36 27C36 30 33 31.5 30 31.5"
          stroke={c.secondary}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
        <path
          d="M12 30C12 30 17 25.5 24 25.5C29 25.5 32 28.5 32 31.5C32 34.5 29 36 26 36"
          stroke={c.accent}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
      </g>
      <circle cx="33" cy="19.5" r="2.2" fill={c.secondary} opacity="0.9" />
      <circle cx="30" cy="31.5" r="1.8" fill={c.accent} opacity="0.85" />

      {/* Wordmark */}
      <text
        x="60"
        y="35"
        fontFamily="var(--font-sans), system-ui, sans-serif"
        fontSize="32"
        fontWeight="700"
        letterSpacing="-0.5"
        fill={c.text}
      >
        Tempest
      </text>
    </svg>
  )
}

export function TempestIconMark({
  size = 32,
  animated = false,
  className,
}: {
  size?: number
  animated?: boolean
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(animated && 'tempest-swirl-container', className)}
      role="img"
      aria-label="Tempest icon"
    >
      <rect width="64" height="64" rx="16" fill="#1A8FE3" />
      <g className={animated ? 'tempest-swirl' : undefined}>
        <path
          d="M18 24C18 24 24 16 34 16C42 16 46 22 46 26C46 30 42 32 38 32"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M14 32C14 32 22 26 32 26C42 26 48 32 48 36C48 40 44 42 40 42"
          stroke="#22C997"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
        <path
          d="M18 40C18 40 24 34 32 34C38 34 42 38 42 42C42 46 38 48 34 48"
          stroke="#FF7849"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
      </g>
      <circle cx="46" cy="26" r="3" fill="#22C997" opacity="0.9" />
      <circle cx="40" cy="42" r="2.5" fill="#FF7849" opacity="0.85" />
    </svg>
  )
}
