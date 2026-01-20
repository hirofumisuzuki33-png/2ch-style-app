import { useState, useEffect, useCallback, useRef } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { CategoryChips } from '@/components/tools/category-chips';
import { ToolCard } from '@/components/tools/tool-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Loader2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  count: number;
}

interface Tool {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  subCategory?: string;
  isPremium: boolean;
  metricValue: number;
}

export default function ToolsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const observerTarget = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // カテゴリ取得
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((error) => {
        console.error('Error fetching categories:', error);
        toast({
          title: 'エラー',
          description: 'カテゴリの取得に失敗しました',
          variant: 'destructive',
        });
      });
  }, [toast]);

  // ツール取得
  const fetchTools = useCallback(
    async (reset = false) => {
      const currentOffset = reset ? 0 : offset;
      if (currentOffset === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const params = new URLSearchParams({
          limit: '20',
          offset: currentOffset.toString(),
          sort: 'popular',
        });

        if (selectedCategoryId) {
          params.append('categoryId', selectedCategoryId.toString());
        }

        if (searchQuery) {
          params.append('q', searchQuery);
        }

        const res = await fetch(`/api/tools?${params}`);
        const data = await res.json();

        if (reset) {
          setTools(data.tools);
        } else {
          setTools((prev) => [...prev, ...data.tools]);
        }

        setHasMore(data.hasMore);
        setOffset(currentOffset + data.tools.length);
      } catch (error) {
        console.error('Error fetching tools:', error);
        toast({
          title: 'エラー',
          description: 'ツールの取得に失敗しました',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [offset, selectedCategoryId, searchQuery, toast]
  );

  // 初回読み込みとフィルタ変更時
  useEffect(() => {
    setOffset(0);
    fetchTools(true);
  }, [selectedCategoryId, searchQuery]);

  // 無限スクロール
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchTools(false);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loading, fetchTools]);

  // 検索のデバウンス
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const getCategoryName = (categoryId: number) => {
    return categories.find((c) => c.id === categoryId)?.name;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">すべての生成ツール</h1>
              <p className="text-muted-foreground mt-2">
                目的に合わせたテキスト生成ツールを選択してください
              </p>
            </div>
            <Link href="/tools/create">
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                新しいツールを作成
              </Button>
            </Link>
          </div>
        </motion.div>

        <CategoryChips
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="例）ブログ"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : tools.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg text-muted-foreground">
              条件に一致するツールが見つかりませんでした
            </p>
          </div>
        ) : (
          <>
            <motion.div
              className="grid gap-4 md:grid-cols-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {tools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ToolCard tool={tool} categoryName={getCategoryName(tool.categoryId)} />
                </motion.div>
              ))}
            </motion.div>

            <div ref={observerTarget} className="flex justify-center py-8">
              {loadingMore && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>読み込み中...</span>
                </div>
              )}
              {!hasMore && tools.length > 0 && (
                <p className="text-muted-foreground">すべてのツールを表示しました</p>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
