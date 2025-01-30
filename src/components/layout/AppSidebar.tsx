import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import {
  Package,
  DollarSign,
  Users,
  BarChart,
  Menu,
  LogOut,
  User
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  { icon: Package, label: "Products", href: "/products" },
  { icon: DollarSign, label: "Sales", href: "/sales" },
  { icon: Users, label: "Debts", href: "/debts" },
  { icon: BarChart, label: "Reports", href: "/reports" },
];

export function AppSidebar() {
  const { collapsed, toggle } = useSidebar();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/landing');
  };

  return (
    <aside
      className={cn(
        "border-r bg-background/80 backdrop-blur-xl transition-all duration-300 ease-in-out flex flex-col h-screen",
        collapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <div className="flex h-[60px] items-center border-b px-4">
        <Button variant="ghost" size="icon" onClick={toggle}>
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      <nav className="flex flex-col gap-2 p-4 flex-1">
        {menuItems.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            to={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
              pathname === href ? "bg-accent" : "transparent"
            )}
          >
            <Icon className="h-4 w-4" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 px-3 py-2 text-sm">
          <User className="h-4 w-4" />
          {!collapsed && <span className="truncate">{user?.email}</span>}
        </div>
        <Button
          variant="ghost"
          className="w-full flex items-center gap-3 justify-start mt-2"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  );
}