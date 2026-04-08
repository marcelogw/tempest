'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  NotebookPen,
  Pin,
  ArrowUpCircle,
  ArrowDownCircle,
  Pencil,
  Trash2,
  Info,
  Plus,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { type Note } from '@/lib/expense-store'
import { formatCurrency } from '@/lib/formatters'
import { NoteFormDialog } from './note-form-dialog'
import { cn } from '@/lib/utils'

interface NotesSectionProps {
  notes: Note[]
  currentMonth: string
  onAdd: (note: Omit<Note, 'id' | 'createdAt'>) => void
  onUpdate: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => void
  onRemove: (id: string) => void
}

export function NotesSection({
  notes,
  currentMonth,
  onAdd,
  onUpdate,
  onRemove,
}: NotesSectionProps) {
  const i = useTranslations()
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  // Persistent notes from previous months appear first, then current month notes
  const persistentFromPast = notes.filter((n) => n.persistent && n.createdMonth < currentMonth)
  const thisMonthNotes = notes.filter((n) => n.createdMonth === currentMonth)
  const sorted = [...persistentFromPast, ...thisMonthNotes]

  return (
    <>
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-amber-500/10 p-1.5">
                <NotebookPen className="h-4 w-4 text-amber-500" />
              </div>
              <CardTitle className="text-base font-semibold">{i('notes.title')}</CardTitle>
              {notes.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {notes.length}
                </Badge>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 bg-transparent text-xs"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="mr-1 h-3 w-3" />
              {i('notes.add')}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="max-h-[320px] space-y-2 overflow-y-auto">
            {sorted.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">{i('notes.noNotes')}</p>
            ) : (
              sorted.map((note) => {
                const isPersistentFromPast = note.persistent && note.createdMonth < currentMonth

                return (
                  <div
                    key={note.id}
                    className="bg-secondary/50 hover:bg-secondary group flex items-center gap-2 rounded-lg p-3 transition-colors"
                  >
                    {/* Pin icon for persistent notes from previous months */}
                    {isPersistentFromPast && (
                      <Pin className="h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                    )}

                    {/* Value direction icon */}
                    {note.value !== undefined &&
                      (note.valueDirection === 'receivable' ? (
                        <ArrowUpCircle className="h-4 w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <ArrowDownCircle className="text-destructive h-4 w-4 flex-shrink-0" />
                      ))}

                    {/* Text and value */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'truncate text-sm font-medium',
                          note.done && 'text-muted-foreground line-through'
                        )}
                      >
                        {note.text}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        {note.value !== undefined && (
                          <span
                            className={cn(
                              'text-xs font-semibold',
                              note.valueDirection === 'receivable'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-destructive'
                            )}
                          >
                            {formatCurrency(note.value)}
                          </span>
                        )}
                        {isPersistentFromPast && (
                          <Badge
                            variant="outline"
                            className="border-amber-400 py-0 text-[10px] text-amber-500"
                          >
                            {i('notes.recurring')}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Done checkbox — always visible */}
                    <Checkbox
                      checked={note.done}
                      onCheckedChange={(checked) => onUpdate(note.id, { done: checked as boolean })}
                      aria-label={i('notes.done')}
                    />

                    {/* Hover-reveal action buttons */}
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground hover:bg-secondary h-7 w-7"
                        onClick={() => setEditingNote(note)}
                        aria-label={i('common.edit')}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7"
                        onClick={() => onRemove(note.id)}
                        aria-label={i('common.delete')}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>

                      {/* Info popover */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground hover:bg-secondary h-7 w-7"
                            aria-label={i('notes.details')}
                          >
                            <Info className="h-3.5 w-3.5" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 space-y-3 text-sm" align="end">
                          <p className="font-medium">{i('notes.details')}</p>
                          <p className="text-muted-foreground text-xs leading-relaxed">
                            {note.text}
                          </p>
                          <div className="text-muted-foreground space-y-1 text-xs">
                            <div>
                              <span className="font-medium">{i('notes.eventDate')}:</span>{' '}
                              {note.date}
                            </div>
                            <div>
                              <span className="font-medium">{i('notes.createdAt')}:</span>{' '}
                              {new Date(note.createdAt).toLocaleDateString()}
                            </div>
                            {isPersistentFromPast && (
                              <div>
                                <span className="font-medium">{i('notes.pendingSince')}:</span>{' '}
                                {note.createdMonth}
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add dialog */}
      <NoteFormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={onAdd}
        currentMonth={currentMonth}
      />

      {/* Edit dialog */}
      {editingNote && (
        <NoteFormDialog
          open={editingNote !== null}
          onOpenChange={(open) => !open && setEditingNote(null)}
          onSubmit={(updates) => {
            onUpdate(editingNote.id, updates)
          }}
          note={editingNote}
          currentMonth={currentMonth}
        />
      )}
    </>
  )
}
