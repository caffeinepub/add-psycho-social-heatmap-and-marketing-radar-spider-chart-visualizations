import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Moon, Sun, BarChart3, TrendingUp, Settings, Home, ShoppingCart, FileText } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useNavigate, useRouterState } from '@tanstack/react-router';

export function Header() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/analysis', label: 'Analisis', icon: BarChart3 },
    { path: '/purchase-intention', label: 'Intensi Pembelian', icon: ShoppingCart },
    { path: '/report', label: 'Strategic Report', icon: FileText },
    { path: '/metrics', label: 'Metrik', icon: TrendingUp },
    { path: '/settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 backdrop-blur dark:border-white/10 dark:from-blue-800 dark:via-blue-900 dark:to-blue-950">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2 font-semibold text-white transition-opacity hover:opacity-90"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-white shadow-sm backdrop-blur-sm">
              <BarChart3 className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline-block">Analisis Emosi Motor Listrik</span>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: item.path })}
                  className={
                    isActive
                      ? 'gap-2 bg-white/25 text-white shadow-sm backdrop-blur-sm hover:bg-white/30'
                      : 'gap-2 text-white/90 hover:bg-white/15 hover:text-white'
                  }
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-white/90 hover:bg-white/15 hover:text-white"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white/90 hover:bg-white/15 hover:text-white">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <nav className="flex flex-col gap-2 pt-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path;
                  return (
                    <Button
                      key={item.path}
                      variant={isActive ? 'default' : 'ghost'}
                      className={
                        isActive
                          ? 'justify-start gap-3 shadow-sm'
                          : 'justify-start gap-3 hover:bg-primary/10 hover:text-primary'
                      }
                      onClick={() => navigate({ to: item.path })}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2} />
                      <span className="text-base">{item.label}</span>
                    </Button>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
