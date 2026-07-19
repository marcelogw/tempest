/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useIsMobile } from '@/hooks/use-mobile'

describe('useIsMobile', () => {
  let matchMediaMock: any

  beforeEach(() => {
    matchMediaMock = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }
    window.matchMedia = vi.fn().mockReturnValue(matchMediaMock)
    window.innerWidth = 1024
  })

  it('returns true when mobile', () => {
    window.innerWidth = 375
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('updates when resize event triggers', () => {
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    act(() => {
      window.innerWidth = 375
      // Call the event listener passed to addEventListener
      const listener = matchMediaMock.addEventListener.mock.calls[0][1]
      listener()
    })

    expect(result.current).toBe(true)
  })
})
