'use client';

import { createBrowserSupabaseClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@supabase/supabase-js';

interface AuthButtonProps {
  user: User | null;
}

export default function AuthButton({ user }: AuthButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createBrowserSupabaseClient();

  // /login 페이지에서는 버튼을 보여주지 않음
  if (pathname === '/login') {
    return null;
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      router.refresh();
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  if (!user) {
    return (
      <Button
        variant="ghost"
        onClick={handleLogin}
        className="text-sm font-medium"
      >
        로그인하기
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-8 w-8">
        <AvatarImage
          src={user.user_metadata.avatar_url || user.user_metadata.picture}
          alt={user.email || '사용자 아바타'}
        />
        <AvatarFallback>
          {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
        </AvatarFallback>
      </Avatar>
      <Button
        variant="ghost"
        onClick={handleLogout}
        className="text-sm font-medium"
      >
        로그아웃
      </Button>
    </div>
  );
} 