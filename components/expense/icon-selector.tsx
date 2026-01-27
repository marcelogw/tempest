'use client'

import { useState } from 'react'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

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
  const [search, setSearch] = useState('')

  const SelectedIconComponent = selectedIcon
    ? (Icons as unknown as Record<string, LucideIcon>)[selectedIcon]
    : null

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Ícone (opcional)</label>
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
                {SelectedIconComponent && <SelectedIconComponent className="h-4 w-4" />}
                <span>{selectedIcon}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Selecionar ícone...</span>
            )}
            <Icons.ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar ícone..." value={search} onValueChange={setSearch} />
            <CommandEmpty>Nenhum ícone encontrado.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                <CommandItem
                  value="none"
                  onSelect={() => {
                    onIconSelect(null)
                    setOpen(false)
                  }}
                >
                  <Icons.X className="mr-2 h-4 w-4" />
                  Sem ícone
                </CommandItem>
                {CATEGORY_ICONS.map((iconName) => {
                  const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[iconName]
                  if (!IconComponent) return null

                  return (
                    <CommandItem
                      key={iconName}
                      value={iconName}
                      onSelect={() => {
                        onIconSelect(iconName)
                        setOpen(false)
                      }}
                    >
                      <IconComponent className="mr-2 h-4 w-4" />
                      {iconName}
                      {selectedIcon === iconName && <Icons.Check className="ml-auto h-4 w-4" />}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
