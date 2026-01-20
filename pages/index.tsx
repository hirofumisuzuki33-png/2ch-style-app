import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, History, Settings as SettingsIcon } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const features = [
    {
      icon: Sparkles,
      title: 'テキスト生成',
      description: '18種類以上のツールで多様なコンテンツを生成',
      href: '/tools',
      color: 'bg-purple-500',
    },
    {
      icon: TrendingUp,
      title: 'カスタムツール作成',
      description: '独自のプロンプトで専用ツールを作成',
      href: '/tools/create',
      color: 'bg-blue-500',
    },
    {
      icon: History,
      title: '生成履歴',
      description: '過去の生成結果を確認・再利用',
      href: '/runs',
      color: 'bg-green-500',
    },
    {
      icon: SettingsIcon,
      title: '設定',
      description: 'APIキーとモデルの設定',
      href: '/settings',
      color: 'bg-orange-500',
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="bg-[#ffffee] border border-border p-3">
          <h1 className="text-2xl font-bold post-name">
            ■ テキスト生成掲示板へようこそ
          </h1>
          <p className="text-sm mt-2">
            AIを活用して、高品質なコンテンツを素早く生成
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.title} href={feature.href}>
                <Card className="h-full cursor-pointer hover:bg-[#ffffee]">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="bg-primary p-2">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-lg font-bold">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <Card className="bg-[#ffffee] border-2 border-primary">
          <CardHeader>
            <CardTitle className="text-2xl post-name">＞＞ 今すぐ始めましょう</CardTitle>
            <CardDescription className="text-sm">
              最新のGemini 2.5 AIモデルで、プロフェッショナルなテキストを生成
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/tools" className="flex-1">
                <Button size="lg" className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" />
                  ツール一覧を見る
                </Button>
              </Link>
              <Link href="/tools/create" className="flex-1">
                <Button size="lg" variant="outline" className="w-full">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  カスタムツールを作成
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
