import { createServerSupabaseClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import AuthButton from './auth/AuthButton';

export default async function Navbar() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="flex items-center flex-1">
          <Image
            src="/next.svg"
            alt="Next.js Logo"
            width={100}
            height={20}
            priority
            className="dark:invert"
          />
        </div>
        <div className="flex items-center gap-4">
          <AuthButton user={user} />
        </div>
      </div>
    </nav>
  );
} 