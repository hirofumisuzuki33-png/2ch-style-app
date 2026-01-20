import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Eye, Copy, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface Run {
  id: number;
  toolId: number;
  toolName: string;
  inputJson: string;
  outputText: string;
  status: string;
  createdAt: string;
}

export default function RunsPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchRuns = () => {
    fetch('/api/runs')
      .then((res) => res.json())
      .then((data) => setRuns(data))
      .catch((error) => {
        console.error('Error fetching runs:', error);
        toast({
          title: 'エラー',
          description: '履歴の取得に失敗しました',
          variant: 'destructive',
        });
      });
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/runs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');

      setRuns((prev) => prev.filter((run) => run.id !== id));
      toast({
        title: '削除完了',
        description: '履歴を削除しました',
      });
    } catch (error) {
      console.error('Error deleting run:', error);
      toast({
        title: 'エラー',
        description: '削除に失敗しました',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAll = async () => {
    try {
      const res = await fetch('/api/runs', { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete all failed');

      setRuns([]);
      toast({
        title: '削除完了',
        description: 'すべての履歴を削除しました',
      });
    } catch (error) {
      console.error('Error deleting all runs:', error);
      toast({
        title: 'エラー',
        description: '削除に失敗しました',
        variant: 'destructive',
      });
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'コピー完了',
      description: 'クリップボードにコピーしました',
    });
  };

  const handleViewDetail = (run: Run) => {
    setSelectedRun(run);
    setDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold">生成履歴</h1>
            <p className="text-muted-foreground mt-2">
              過去に生成したテキストの履歴を確認できます
            </p>
          </div>
          {runs.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  すべて削除
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                  <AlertDialogDescription>
                    すべての生成履歴が削除されます。この操作は取り消せません。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAll}>
                    削除する
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </motion.div>

        <Separator />

        {runs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-lg text-muted-foreground">
                まだ生成履歴がありません
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                ツールを使ってテキストを生成してみましょう
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {runs.map((run, index) => (
              <motion.div
                key={run.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{run.toolName}</CardTitle>
                          <Badge variant={run.status === 'success' ? 'default' : 'destructive'}>
                            {run.status === 'success' ? '成功' : 'エラー'}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(run.createdAt), 'yyyy年MM月dd日 HH:mm')}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetail(run)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(run.outputText)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>履歴を削除しますか？</AlertDialogTitle>
                              <AlertDialogDescription>
                                この操作は取り消せません。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>キャンセル</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(run.id)}>
                                削除する
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-sm line-clamp-3 whitespace-pre-wrap">
                        {run.outputText}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedRun?.toolName}</DialogTitle>
              <DialogDescription>
                {selectedRun && format(new Date(selectedRun.createdAt), 'yyyy年MM月dd日 HH:mm')}
              </DialogDescription>
            </DialogHeader>
            {selectedRun && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">入力内容</h3>
                  <div className="bg-muted rounded-lg p-4 text-sm">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(JSON.parse(selectedRun.inputJson), null, 2)}
                    </pre>
                  </div>
                </div>
                <Separator />
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">生成結果</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(selectedRun.outputText)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      コピー
                    </Button>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-sm">
                    <p className="whitespace-pre-wrap">{selectedRun.outputText}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
