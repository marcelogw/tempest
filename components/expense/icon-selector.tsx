'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

// Curated list of icons suitable for expense categories
const CATEGORY_ICONS = [
  'ShoppingCart',
  'ShoppingBag',
  'Store',
  'Car',
  'Bike',
  'Plane',
  'Train',
  'Bus',
  'Fuel',
  'Heart',
  'Pill',
  'Activity',
  'Stethoscope',
  'Hospital',
  'PartyPopper',
  'Gamepad2',
  'Music',
  'Film',
  'Tv',
  'Camera',
  'Utensils',
  'Coffee',
  'Pizza',
  'Wine',
  'IceCream',
  'GraduationCap',
  'BookOpen',
  'School',
  'Home',
  'Building',
  'Building2',
  'Warehouse',
  'Factory',
  'RefreshCw',
  'Repeat',
  'CreditCard',
  'Wallet',
  'DollarSign',
  'Euro',
  'Banknote',
  'Calendar',
  'Clock',
  'Zap',
  'Sparkles',
  'Star',
  'Award',
  'Target',
  'TrendingUp',
  'Gift',
  'Package',
  'Box',
  'Shirt',
  'Watch',
  'Smartphone',
  'Laptop',
  'Headphones',
  'GameController',
  'Wifi',
  'Phone',
  'Mail',
  'MessageSquare',
  'Users',
  'User',
  'Baby',
  'Dog',
  'Cat',
  'PawPrint',
  'Leaf',
  'Trees',
  'Flower',
  'Sprout',
  'Droplet',
  'Flame',
  'Lightbulb',
  'Scissors',
  'Wrench',
  'Hammer',
  'Tool',
  'MoreHorizontal',
  'MoreVertical',
  'Plus',
  'Minus',
  'X',
]

type IconSelectorProps = {
  selectedIcon: string | null
  onIconSelect: (icon: string | null) => void
}

export function IconSelector({ selectedIcon, onIconSelect }: IconSelectorProps) {
  const [open, setOpen] = useState(false)

  const SelectedIconComponent = selectedIcon
    ? (Icons as unknown as Record<string, LucideIcon>)[selectedIcon]
    : null

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Ícone</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedIcon ? (
              <div className="flex items-center gap-2">
                {SelectedIconComponent && <SelectedIconComponent className="h-5 w-5" />}
              </div>
            ) : (
              <span className="text-muted-foreground">Selecionar ícone...</span>
            )}
            <Icons.ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <ScrollArea className="h-[300px]">
            <div className="p-4">
              <div className="grid grid-cols-6 gap-2">
                <Button
                  variant={!selectedIcon ? 'default' : 'outline'}
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => {
                    onIconSelect(null)
                    setOpen(false)
                  }}
                  title="Sem ícone"
                >
                  <Icons.X className="h-5 w-5" />
                </Button>
                {CATEGORY_ICONS.map((iconName) => {
                  const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[iconName]
                  if (!IconComponent) return null

                  return (
                    <Button
                      key={iconName}
                      variant={selectedIcon === iconName ? 'default' : 'outline'}
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => {
                        onIconSelect(iconName)
                        setOpen(false)
                      }}
                      title={iconName}
                    >
                      <IconComponent className="h-5 w-5" />
                    </Button>
                  )
                })}
              </div>
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  )
}
