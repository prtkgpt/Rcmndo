"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  SearchIcon,
  BookmarkIcon,
  UserIcon,
  PlusIcon,
} from "@/components/ui/icons";

const navItems = [
  { href: "/feed", icon: HomeIcon, label: "Home" },
  { href: "/search", icon: SearchIcon, label: "Discover" },
  { href: "/recommend", icon: PlusIcon, label: "Add", isAction: true },
  { href: "/watchlist", icon: BookmarkIcon, label: "Watchlist" },
  { href: "/profile", icon: UserIcon, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="flex items-center justify-around h-20 max-w-lg mx-auto px-2 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-rose-400 flex items-center justify-center shadow-lg shadow-primary/30 btn-press">
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-2 min-w-[64px] transition-all ${
                isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-colors ${isActive ? "bg-primary/10" : ""}`}>
                <Icon className={`w-6 h-6 ${isActive ? "stroke-[2.5]" : ""}`} />
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isActive ? "text-primary" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
