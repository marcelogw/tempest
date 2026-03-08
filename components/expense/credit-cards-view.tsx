'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import * as Icons from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useExpenseStore, type CreditCard } from '@/lib/expense-store'
import { formatCurrency } from '@/lib/formatters'
import { CreditCardFormDialog } from './credit-card-form-dialog'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type SortableCreditCardCardProps = {
  card: CreditCard
  installmentCount: number
  usagePercentage: number | null
  onEdit: (card: CreditCard) => void
  onDelete: (card: CreditCard) => void
  onDetails: (card: CreditCard) => void
  i: (key: string, values?: Record<string, string | number>) => string
}

function SortableCreditCardCard({
  card,
  installmentCount,
  usagePercentage,
  onEdit,
  onDelete,
  onDetails,
  i,
}: SortableCreditCardCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getUsageBadgeVariant = (
    percentage: number | null
  ): 'default' | 'secondary' | 'destructive' => {
    if (percentage === null) return 'secondary'
    if (percentage >= 90) return 'destructive'
    if (percentage >= 70) return 'default'
    return 'secondary'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex items-center gap-3 px-4 py-3',
        'border-border/50 border-b last:border-b-0',
        'border-l-4 border-l-transparent',
        'transition-all duration-200',
        isDragging
          ? 'bg-secondary/80 ring-primary z-10 shadow-lg ring-2'
          : 'hover:bg-secondary/50 hover:shadow-md'
      )}
      onMouseEnter={(e) => (e.currentTarget.style.borderLeftColor = card.color)}
      onMouseLeave={(e) => (e.currentTarget.style.borderLeftColor = 'transparent')}
    >
      <button
        className="cursor-grab touch-none active:cursor-grabbing"
        aria-label={i('ui.creditCards.dragCard')}
        {...attributes}
        {...listeners}
      >
        <Icons.GripVertical className="text-muted-foreground h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" />
      </button>

      <div
        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
        style={{ backgroundColor: `${card.color}20` }}
      >
        <Icons.CreditCard className="h-3 w-3" style={{ color: card.color }} />
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <h3 className="truncate text-sm font-semibold" style={{ color: card.color }}>
          {card.name}
        </h3>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {card.limit !== null ? formatCurrency(card.limit) : i('ui.creditCards.noLimit')}
        </Badge>
        {usagePercentage !== null && (
          <Badge variant={getUsageBadgeVariant(usagePercentage)} className="text-xs">
            {usagePercentage.toFixed(1)}%
          </Badge>
        )}
        <Badge variant="secondary">{installmentCount}</Badge>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            aria-label={i('ui.creditCards.optionsFor', { name: card.name })}
          >
            <Icons.MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(card)}>
            <Icons.Pencil className="mr-2 h-4 w-4" />
            {i('common.edit')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDetails(card)}>
            <Icons.Info className="mr-2 h-4 w-4" />
            {i('ui.creditCards.details')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(card)}
            className="text-destructive focus:text-destructive"
          >
            <Icons.Trash2 className="mr-2 h-4 w-4" />
            {i('common.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function CreditCardsView() {
  const {
    creditCards,
    installments,
    reorderCreditCards,
    deleteCreditCard,
    getCardUsagePercentage,
  } = useExpenseStore()
  const { toast } = useToast()
  const i = useTranslations()

  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add')
  const [editingCard, setEditingCard] = useState<CreditCard | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [cardToDelete, setCardToDelete] = useState<CreditCard | null>(null)
  const [reassignCardId, setReassignCardId] = useState<string>('')
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [detailsCard, setDetailsCard] = useState<CreditCard | null>(null)

  const sortedCards = useMemo(() => {
    return [...creditCards].sort((a, b) => a.order - b.order)
  }, [creditCards])

  const installmentCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    installments.forEach((inst) => {
      counts[inst.card] = (counts[inst.card] || 0) + 1
    })
    return counts
  }, [installments])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = sortedCards.findIndex((c) => c.id === active.id)
      const newIndex = sortedCards.findIndex((c) => c.id === over.id)

      const reordered = arrayMove(sortedCards, oldIndex, newIndex)
      const orderedIds = reordered.map((c) => c.id)
      reorderCreditCards(orderedIds)
    }
  }

  const handleEdit = (card: CreditCard) => {
    setEditingCard(card)
    setFormMode('edit')
    setFormDialogOpen(true)
  }

  const handleDetails = (card: CreditCard) => {
    setDetailsCard(card)
    setDetailsDialogOpen(true)
  }

  const handleDeleteClick = (card: CreditCard) => {
    setCardToDelete(card)
    setReassignCardId('')
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!cardToDelete) return

    const affectedCount = installmentCounts[cardToDelete.id] || 0

    try {
      deleteCreditCard(cardToDelete.id, affectedCount > 0 ? reassignCardId : undefined)
      toast({
        title: i('toast.success.deleted'),
        description: i('ui.creditCards.cardDeletedSuccess', { name: cardToDelete.name }),
      })
    } catch (error) {
      toast({
        title: i('errors.generic'),
        description: error instanceof Error ? error.message : i('ui.creditCards.deleteCardError'),
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setCardToDelete(null)
      setReassignCardId('')
    }
  }

  const handleAddNew = () => {
    setEditingCard(undefined)
    setFormMode('add')
    setFormDialogOpen(true)
  }

  const affectedInstallmentsCount = cardToDelete ? installmentCounts[cardToDelete.id] || 0 : 0
  const availableCardsForReassign = sortedCards.filter((c) => c.id !== cardToDelete?.id)

  return (
    <>
      <div className="bg-background flex flex-1 flex-col overflow-hidden">
        <div className="border-b p-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {i('ui.creditCards.manageCards')}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {i('ui.creditCards.manageDescription')}
                </p>
              </div>
              <Button onClick={handleAddNew} size="lg" className="gap-2">
                <Icons.Plus className="h-5 w-5" />
                {i('ui.creditCards.newCard')}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl">
            {sortedCards.length === 0 ? (
              <div className="bg-muted/50 flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-12">
                <Icons.CreditCard className="text-muted-foreground h-12 w-12" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold">{i('ui.creditCards.noCardsTitle')}</h3>
                  <p className="text-muted-foreground mt-1">{i('ui.creditCards.noCardsSubtext')}</p>
                </div>
                <Button onClick={handleAddNew} className="gap-2">
                  <Icons.Plus className="h-4 w-4" />
                  {i('ui.creditCards.createFirstCard')}
                </Button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sortedCards.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="border-border overflow-hidden rounded-lg border shadow-sm">
                    {sortedCards.map((card) => (
                      <SortableCreditCardCard
                        key={card.id}
                        card={card}
                        installmentCount={installmentCounts[card.id] || 0}
                        usagePercentage={getCardUsagePercentage(card.id)}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        onDetails={handleDetails}
                        i={i}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>

      <CreditCardFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        card={editingCard}
        mode={formMode}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{i('ui.creditCards.confirmDeletion')}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>{i('ui.creditCards.sureDeleteCard', { name: cardToDelete?.name ?? '' })}</p>
                {affectedInstallmentsCount > 0 && (
                  <>
                    <p className="text-destructive font-medium">
                      {i('ui.creditCards.cardHasInstallments', {
                        count: affectedInstallmentsCount,
                      })}
                    </p>
                    <div className="space-y-2">
                      <label htmlFor="reassign-card" className="text-sm font-medium">
                        {i('ui.creditCards.reassignInstallments')}
                      </label>
                      <Select value={reassignCardId} onValueChange={setReassignCardId}>
                        <SelectTrigger id="reassign-card">
                          <SelectValue placeholder={i('ui.creditCards.selectCard')} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCardsForReassign.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: c.color }}
                                />
                                {c.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{i('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={affectedInstallmentsCount > 0 && !reassignCardId}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {i('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${detailsCard?.color}20` }}
              >
                <Icons.CreditCard className="h-4 w-4" style={{ color: detailsCard?.color }} />
              </div>
              <span style={{ color: detailsCard?.color }}>{detailsCard?.name}</span>
            </DialogTitle>
          </DialogHeader>

          {detailsCard && (
            <div className="space-y-6">
              <div className="bg-muted/50 grid grid-cols-3 gap-4 rounded-lg p-4">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">{i('ui.creditCards.limit')}</p>
                  <p className="text-lg font-semibold">
                    {detailsCard.limit !== null
                      ? formatCurrency(detailsCard.limit)
                      : i('ui.creditCards.noLimit')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">{i('ui.creditCards.usage')}</p>
                  <p className="text-lg font-semibold">
                    {getCardUsagePercentage(detailsCard.id) !== null
                      ? `${getCardUsagePercentage(detailsCard.id)!.toFixed(1)}%`
                      : i('ui.creditCards.na')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">
                    {i('ui.creditCards.installments')}
                  </p>
                  <p className="text-lg font-semibold">
                    {installments.filter((i) => i.card === detailsCard.id).length}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">{i('ui.creditCards.activeInstallments')}</h3>
                {installments.filter((i) => i.card === detailsCard.id).length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    {i('ui.creditCards.noActiveInstallments')}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {installments
                      .filter((i) => i.card === detailsCard.id)
                      .map((inst) => {
                        const [startYear, startMonth] = inst.startMonth.split('-').map(Number)
                        const endDate = new Date(
                          startYear,
                          startMonth - 1 + inst.totalInstallments - 1,
                          1
                        )
                        const endMonth = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`
                        const totalValue = inst.amountPerInstallment * inst.totalInstallments

                        return (
                          <div
                            key={inst.id}
                            className="border-border flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="flex-1 space-y-1">
                              <p className="font-medium">{inst.name}</p>
                              <p className="text-muted-foreground text-xs">
                                {formatCurrency(inst.amountPerInstallment)} ×{' '}
                                {inst.totalInstallments} = {formatCurrency(totalValue)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">{inst.totalInstallments}x</p>
                              <p className="text-muted-foreground text-xs">
                                {inst.startMonth.replace('-', '/')} - {endMonth.replace('-', '/')}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
