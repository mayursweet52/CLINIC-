import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TopbarProps {
  user?: {
    name: string;
    role: string;
  };
}

export function Topbar({ user }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center w-full max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search patients, appointments..." 
            className="w-full appearance-none bg-background pl-9 shadow-none md:w-2/3 lg:w-full"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
        </button>
        <div className="flex items-center gap-3 border-l pl-4">
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-sm font-medium">{user?.name || "Staff Member"}</span>
            <span className="text-xs text-muted-foreground capitalize">{user?.role || "Receptionist"}</span>
          </div>
          <Avatar className="h-9 w-9">
            <AvatarImage src="" alt="User Avatar" />
            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
