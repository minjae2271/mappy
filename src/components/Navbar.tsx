"use client";

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import AuthButton from './auth/AuthButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useRouter, usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';

const regions = [
  { id: 'korea', name: 'Korea' },
  { id: 'usa', name: 'USA' },
  { id: 'europe', name: 'Europe' }
] as const;

export type Region = typeof regions[number]['id'];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const currentRegion = pathname?.split('/')[1] as Region;
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleRegionSelect = (region: Region) => {
    router.push(`/${region}`);
  };

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="flex items-center flex-1 gap-4">
          <Image
            src="/next.svg"
            alt="Next.js Logo"
            width={100}
            height={20}
            priority
            className="dark:invert"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1">
                {regions.find(r => r.id === currentRegion)?.name || 'Select Region'} <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {regions.map((region) => (
                <DropdownMenuItem 
                  key={region.id}
                  onClick={() => handleRegionSelect(region.id)}
                  className={currentRegion === region.id ? 'bg-accent' : ''}
                >
                  {region.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-4">
          <AuthButton user={user} />
        </div>
      </div>
    </nav>
  );
} 