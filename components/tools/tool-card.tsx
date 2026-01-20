import { Lock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Tool {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  subCategory?: string;
  isPremium: boolean;
  metricValue: number;
  thumbnailUrl?: string;
}

interface ToolCardProps {
  tool: Tool;
  categoryName?: string;
}

export function ToolCard({ tool, categoryName }: ToolCardProps) {
  return (
    <Link href={`/tools/${tool.id}`}>
      <Card className={cn(
        'h-full cursor-pointer hover:bg-[#ffffee]',
        tool.isPremium && 'bg-[#fff8dc]'
      )}>
        <CardHeader>
          {tool.isPremium && (
            <div className="absolute right-3 top-3">
              <Lock className="h-4 w-4 text-primary" />
            </div>
          )}
          <div className="flex items-start gap-2 mb-2">
            {categoryName && (
              <Badge variant="secondary" className="text-xs">
                {categoryName}
              </Badge>
            )}
            {tool.subCategory && (
              <Badge variant="outline" className="text-xs">
                {tool.subCategory}
              </Badge>
            )}
          </div>
          <CardTitle className="text-base font-bold">{tool.name}</CardTitle>
          <CardDescription className="line-clamp-2 text-sm">
            {tool.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>{tool.metricValue.toLocaleString()} 回利用</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
