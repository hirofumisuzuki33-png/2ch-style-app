import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, Sparkles, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

export function Sidebar() {
  const router = useRouter();

  const menuItems = [
    { icon: Home, label: 'HOME', href: '/', exact: true },
    { icon: Sparkles, label: 'テキスト生成', href: '/tools', exact: false },
    { icon: Settings, label: '設定', href: '/settings', exact: true },
  ];

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="p-4 border-b bg-[#ffffee]">
        <h1 className="text-xl font-bold text-foreground">
          テキスト生成掲示板
        </h1>
      </div>

      <Separator />

      <div className="px-3 py-3 border-b">
        <div className="flex items-center gap-2 bg-muted p-2 border border-border">
          <div className="flex h-8 w-8 items-center justify-center bg-primary">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold post-name">名無しさん＠お腹いっぱい。</p>
            <Badge variant="secondary" className="text-xs">
              freeプラン
            </Badge>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        <nav className="space-y-1 py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? router.pathname === item.href
              : router.pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 text-sm border-l-4',
                  isActive
                    ? 'bg-[#ffffee] border-primary font-bold'
                    : 'border-transparent hover:bg-muted link-2ch'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator />

      <div className="p-2">
        <Link
          href="/runs"
          className={cn(
            'flex items-center gap-2 px-2 py-1.5 text-sm border-l-4',
            router.pathname === '/runs'
              ? 'bg-[#ffffee] border-primary font-bold'
              : 'border-transparent hover:bg-muted link-2ch'
          )}
        >
          <Sparkles className="h-4 w-4" />
          生成履歴
        </Link>
      </div>
    </div>
  );
}
