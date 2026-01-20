import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Category {
  id: number;
  name: string;
  count: number;
}

interface CategoryChipsProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

export function CategoryChips({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryChipsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        カテゴリを絞り込む
      </h3>
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedCategoryId === null ? 'default' : 'outline'}
          className={cn(
            'cursor-pointer transition-all hover:scale-105',
            selectedCategoryId === null && 'shadow-md'
          )}
          onClick={() => onSelectCategory(null)}
        >
          すべて
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category.id}
            variant={selectedCategoryId === category.id ? 'default' : 'outline'}
            className={cn(
              'cursor-pointer transition-all hover:scale-105',
              selectedCategoryId === category.id && 'shadow-md'
            )}
            onClick={() => onSelectCategory(category.id)}
          >
            {category.name} ({category.count})
          </Badge>
        ))}
      </div>
    </div>
  );
}
