'use client'

import { Check } from 'lucide-react'
import { CATEGORY_COLOR_PALETTE } from '@/lib/expense-store'
import { cn } from '@/lib/utils'

type ColorSelectorProps = {
  selectedColor: string
  onColorSelect: (color: string) => void
}

export function ColorSelector({ selectedColor, onColorSelect }: ColorSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Cor</label>
      <div className="grid grid-cols-10 gap-2">
        {CATEGORY_COLOR_PALETTE.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onColorSelect(color)}
            className={cn(
              'relative h-8 w-8 rounded-md border-2 transition-all hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:outline-none',
              selectedColor === color
                ? 'border-foreground ring-foreground ring-2 ring-offset-2'
                : 'border-transparent'
            )}
            style={{ backgroundColor: color }}
            aria-label={`Selecionar cor ${color}`}
          >
            {selectedColor === color && (
              <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-lg" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
