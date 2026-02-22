'use client'

import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface MonthSelectorProps {
  currentMonth: string
  onMonthChange: (month: string) => void
}

export function MonthSelector({ currentMonth, onMonthChange }: MonthSelectorProps) {
  const i = useTranslations()

  const MONTHS = [
    { value: '01', label: i('months.january'), short: i('monthsShort.jan') },
    { value: '02', label: i('months.february'), short: i('monthsShort.feb') },
    { value: '03', label: i('months.march'), short: i('monthsShort.mar') },
    { value: '04', label: i('months.april'), short: i('monthsShort.apr') },
    { value: '05', label: i('months.may'), short: i('monthsShort.may') },
    { value: '06', label: i('months.june'), short: i('monthsShort.jun') },
    { value: '07', label: i('months.july'), short: i('monthsShort.jul') },
    { value: '08', label: i('months.august'), short: i('monthsShort.aug') },
    { value: '09', label: i('months.september'), short: i('monthsShort.sep') },
    { value: '10', label: i('months.october'), short: i('monthsShort.oct') },
    { value: '11', label: i('months.november'), short: i('monthsShort.nov') },
    { value: '12', label: i('months.december'), short: i('monthsShort.dec') },
  ]

  const formatMonth = (monthStr: string) => {
    const [, month] = monthStr.split('-')
    const monthIndex = parseInt(month) - 1
    return MONTHS[monthIndex].label
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

  const getMonthStyle = (monthValue: string) => {
    const now = new Date()
    const currentRealMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const [year] = currentMonth.split('-')
    const monthKey = `${year}-${monthValue}`

    if (monthKey === currentRealMonth) {
      return 'text-primary font-semibold' // Current month
    } else if (monthKey < currentRealMonth) {
      return 'text-muted-foreground' // Past months
    } else {
      return 'text-foreground/70' // Future months
    }
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
          {MONTHS.map((month) => (
            <SelectItem
              key={month.value}
              value={month.value}
              className={getMonthStyle(month.value)}
            >
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
