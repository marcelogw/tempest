'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type Note } from '@/lib/expense-store'

type NoteFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (note: Omit<Note, 'id' | 'createdAt'>) => void
  note?: Note
  currentMonth: string
}

export function NoteFormDialog({
  open,
  onOpenChange,
  onSubmit,
  note,
  currentMonth,
}: NoteFormDialogProps) {
  const i = useTranslations()
  const today = new Date().toISOString().split('T')[0]

  const [text, setText] = useState(note?.text ?? '')
  const [value, setValue] = useState(note?.value?.toString() ?? '')
  const [valueDirection, setValueDirection] = useState<'payable' | 'receivable'>(
    note?.valueDirection ?? 'payable'
  )
  const [date, setDate] = useState(note?.date ?? today)
  const [persistent, setPersistent] = useState(note?.persistent ?? false)

  useEffect(() => {
    if (open) {
      setText(note?.text ?? '')
      setValue(note?.value?.toString() ?? '')
      setValueDirection(note?.valueDirection ?? 'payable')
      setDate(note?.date ?? today)
      setPersistent(note?.persistent ?? false)
    }
  }, [open, note, today])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return

    const parsedValue = value.trim() ? parseFloat(value.replace(',', '.')) : undefined

    onSubmit({
      text: text.trim(),
      value: parsedValue,
      valueDirection: parsedValue !== undefined ? valueDirection : undefined,
      date,
      persistent,
      done: note?.done ?? false,
      createdMonth: note?.createdMonth ?? currentMonth,
    })
    onOpenChange(false)
  }

  const isEditing = !!note

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? i('notes.editNote') : i('notes.add')}</DialogTitle>
          <DialogDescription>{i('notes.persistentDescription')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="note-text">{i('notes.text')}</Label>
            <Textarea
              id="note-text"
              placeholder={i('notes.textPlaceholder')}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note-value">{i('notes.value')}</Label>
            <div className="relative">
              <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                R$
              </span>
              <Input
                id="note-value"
                type="number"
                step="0.01"
                min="0"
                placeholder={i('notes.valuePlaceholder')}
                className="pl-10"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
          </div>

          {value.trim() && (
            <div className="space-y-2">
              <Label>{i('notes.valueDirection')}</Label>
              <RadioGroup
                value={valueDirection}
                onValueChange={(v) => setValueDirection(v as 'payable' | 'receivable')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="payable" id="dir-payable" />
                  <Label htmlFor="dir-payable" className="font-normal">
                    {i('notes.payable')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="receivable" id="dir-receivable" />
                  <Label htmlFor="dir-receivable" className="font-normal">
                    {i('notes.receivable')}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="note-date">{i('notes.date')}</Label>
            <Input
              id="note-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="flex items-start space-x-3 rounded-md border p-3">
            <Checkbox
              id="note-persistent"
              checked={persistent}
              onCheckedChange={(checked) => setPersistent(checked as boolean)}
              className="mt-0.5"
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="note-persistent"
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {i('notes.persistent')}
              </Label>
              <p className="text-muted-foreground text-xs">{i('notes.persistentDescription')}</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-transparent"
            >
              {i('common.cancel')}
            </Button>
            <Button type="submit">{i('notes.saveChanges')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
