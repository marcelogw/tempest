'use client'

import { useState, useMemo } from 'react'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
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
import { Badge } from '@/components/ui/badge'
import { useExpenseStore, type Category } from '@/lib/expense-store'
import { CategoryFormDialog } from './category-form-dialog'
import { useToast } from '@/hooks/use-toast'

type SortableCategoryItemProps = {
  category: Category
  expenseCount: number
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

function SortableCategoryItem({
  category,
  expenseCount,
  onEdit,
  onDelete,
}: SortableCategoryItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const IconComponent = category.icon
    ? (Icons as unknown as Record<string, LucideIcon>)[category.icon]
    : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card hover:bg-accent/50 flex items-center gap-3 rounded-lg border p-3"
    >
      <button
        className="cursor-grab touch-none active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <Icons.GripVertical className="text-muted-foreground h-5 w-5" />
      </button>

      <div className="flex flex-1 items-center gap-3">
        {IconComponent && <IconComponent className="h-5 w-5" style={{ color: category.color }} />}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium" style={{ color: category.color }}>
              {category.label}
            </span>
            {category.isSystem && (
              <Badge variant="outline" className="text-xs">
                Sistema
              </Badge>
            )}
          </div>
          <span className="text-muted-foreground text-xs">
            {expenseCount} {expenseCount === 1 ? 'despesa' : 'despesas'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={() => onEdit(category)}>
          <Icons.Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(category)}
          disabled={category.isSystem}
        >
          <Icons.Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

type CategorySettingsProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategorySettings({ open, onOpenChange }: CategorySettingsProps) {
  const { categories, reorderCategories, deleteCategory, monthlyData } = useExpenseStore()
  const { toast } = useToast()

  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add')
  const [editingCategory, setEditingCategory] = useState<Category | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  // Sort categories by order
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.order - b.order)
  }, [categories])

  // Count expenses for each category
  const expenseCounts = useMemo(() => {
    const counts: Record<string, number> = {}

    Object.values(monthlyData).forEach((monthData) => {
      monthData.fixedExpenses.forEach((expense) => {
        counts[expense.category] = (counts[expense.category] || 0) + 1
      })
      monthData.variableExpenses.forEach((expense) => {
        counts[expense.category] = (counts[expense.category] || 0) + 1
      })
    })

    return counts
  }, [monthlyData])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = sortedCategories.findIndex((c) => c.id === active.id)
      const newIndex = sortedCategories.findIndex((c) => c.id === over.id)

      const reordered = arrayMove(sortedCategories, oldIndex, newIndex)
      const orderedIds = reordered.map((c) => c.id)
      reorderCategories(orderedIds)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormMode('edit')
    setFormDialogOpen(true)
  }

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!categoryToDelete) return

    try {
      deleteCategory(categoryToDelete.id)
      toast({
        title: 'Sucesso',
        description: `Categoria "${categoryToDelete.label}" excluída. Despesas movidas para "Outros".`,
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao excluir categoria.',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  const handleAddNew = () => {
    setEditingCategory(undefined)
    setFormMode('add')
    setFormDialogOpen(true)
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-[540px]">
          <SheetHeader>
            <SheetTitle>Categorias de Despesas</SheetTitle>
            <SheetDescription>
              Personalize as categorias para organizar suas despesas. Arraste para reordenar.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <Button onClick={handleAddNew} className="w-full">
              <Icons.Plus className="mr-2 h-4 w-4" />
              Nova Categoria
            </Button>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedCategories.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {sortedCategories.map((category) => (
                    <SortableCategoryItem
                      key={category.id}
                      category={category}
                      expenseCount={expenseCounts[category.id] || 0}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </SheetContent>
      </Sheet>

      <CategoryFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        category={editingCategory}
        mode={formMode}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              {categoryToDelete && (
                <>
                  Você está prestes a excluir a categoria <strong>{categoryToDelete.label}</strong>.
                  {expenseCounts[categoryToDelete.id] > 0 && (
                    <>
                      <br />
                      <br />
                      <strong>
                        {expenseCounts[categoryToDelete.id]}{' '}
                        {expenseCounts[categoryToDelete.id] === 1 ? 'despesa' : 'despesas'}
                      </strong>{' '}
                      serão automaticamente movidas para a categoria "Outros".
                    </>
                  )}
                  <br />
                  <br />
                  Esta ação não pode ser desfeita.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
