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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useExpenseStore, type Category } from '@/lib/expense-store'
import { CategoryFormDialog } from './category-form-dialog'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type SortableCategoryCardProps = {
  category: Category
  expenseCount: number
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

function SortableCategoryCard({
  category,
  expenseCount,
  onEdit,
  onDelete,
}: SortableCategoryCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const IconComponent = category.icon
    ? (Icons as unknown as Record<string, LucideIcon>)[category.icon]
    : null

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
      onMouseEnter={(e) => (e.currentTarget.style.borderLeftColor = category.color)}
      onMouseLeave={(e) => (e.currentTarget.style.borderLeftColor = 'transparent')}
    >
      {/* Grip Handle */}
      <button
        className="cursor-grab touch-none active:cursor-grabbing"
        aria-label="Arrastar categoria"
        {...attributes}
        {...listeners}
      >
        <Icons.GripVertical className="text-muted-foreground h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" />
      </button>

      {/* Icon */}
      <div
        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
        style={{ backgroundColor: `${category.color}20` }}
      >
        {IconComponent ? (
          <IconComponent className="h-3 w-3" style={{ color: category.color }} />
        ) : (
          <Icons.Tag className="h-3 w-3" style={{ color: category.color }} />
        )}
      </div>

      {/* Content Area */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <h3 className="truncate text-sm font-semibold" style={{ color: category.color }}>
          {category.label}
        </h3>
        {category.isSystem && (
          <Badge variant="outline" className="flex-shrink-0 text-xs">
            Sistema
          </Badge>
        )}
      </div>

      {/* Counter */}
      <Badge variant="secondary" className="flex-shrink-0">
        {expenseCount}
      </Badge>

      {/* Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            aria-label={`Opções para ${category.label}`}
          >
            <Icons.MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(category)}>
            <Icons.Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(category)}
            disabled={category.isSystem}
            className="text-destructive focus:text-destructive"
          >
            <Icons.Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function CategoriesView() {
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
      <div className="bg-background flex flex-1 flex-col overflow-hidden">
        <div className="border-b p-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Gerenciar Categorias</h1>
                <p className="text-muted-foreground mt-1">
                  Personalize as categorias para organizar suas despesas. Arraste para reordenar.
                </p>
              </div>
              <Button onClick={handleAddNew} size="lg" className="gap-2">
                <Icons.Plus className="h-5 w-5" />
                Nova Categoria
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedCategories.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="border-border overflow-hidden rounded-lg border shadow-sm">
                  {sortedCategories.map((category) => (
                    <SortableCategoryCard
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
        </div>
      </div>

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
