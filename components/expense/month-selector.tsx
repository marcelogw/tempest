'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const MONTHS_PT = [
  { value: '01', label: 'Janeiro', short: 'Jan' },
  { value: '02', label: 'Fevereiro', short: 'Fev' },
  { value: '03', label: 'Março', short: 'Mar' },
  { value: '04', label: 'Abril', short: 'Abr' },
  { value: '05', label: 'Maio', short: 'Mai' },
  { value: '06', label: 'Junho', short: 'Jun' },
  { value: '07', label: 'Julho', short: 'Jul' },
  { value: '08', label: 'Agosto', short: 'Ago' },
  { value: '09', label: 'Setembro', short: 'Set' },
  { value: '10', label: 'Outubro', short: 'Out' },
  { value: '11', label: 'Novembro', short: 'Nov' },
  { value: '12', label: 'Dezembro', short: 'Dez' },
]

interface MonthSelectorProps {
  currentMonth: string
  onMonthChange: (month: string) => void
}

export function MonthSelector({ currentMonth, onMonthChange }: MonthSelectorProps) {
  const formatMonth = (monthStr: string) => {
    const d = new Date(monthStr + '-01')
    return d.toLocaleDateString('pt-BR', { month: 'long' })
  }

  const getCurrentMonthNumber = () => {
    const [, month] = currentMonth.split('-')
    return month
  }

  const handleMonthSelect = (monthValue: string) => {
    const [year] = currentMonth.split('-')
    const newMonth = `${year}-${monthValue}`
    onMonthChange(newMonth)
  }

  const changeMonth = (direction: 'prev' | 'next') => {
    const [year, month] = currentMonth.split('-').map(Number)
    let newYear = year
    let newMonthNum = month

    if (direction === 'next') {
      newMonthNum += 1
      if (newMonthNum > 12) {
        newMonthNum = 1
        newYear += 1
      }
    } else {
      newMonthNum -= 1
      if (newMonthNum < 1) {
        newMonthNum = 12
        newYear -= 1
      }
    }

    const newMonth = `${newYear}-${String(newMonthNum).padStart(2, '0')}`
    onMonthChange(newMonth)
  }

  return (
    <div className="flex items-center gap-2" data-testid="month-selector">
      <Button
        variant="outline"
        size="icon"
        onClick={() => changeMonth('prev')}
        className="h-8 w-8 bg-transparent"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Select value={getCurrentMonthNumber()} onValueChange={handleMonthSelect}>
        <SelectTrigger className="h-8 min-w-[140px]">
          <SelectValue>
            <span className="font-semibold capitalize">{formatMonth(currentMonth)}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {MONTHS_PT.map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={() => changeMonth('next')}
        className="h-8 w-8 bg-transparent"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
