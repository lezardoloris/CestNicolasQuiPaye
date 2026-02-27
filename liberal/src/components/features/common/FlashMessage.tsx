'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export default function FlashMessage() {
  useEffect(() => {
    const flash = document.cookie
      .split('; ')
      .find((row) => row.startsWith('liberal_flash='));

    if (flash) {
      const message = decodeURIComponent(flash.split('=')[1]);
      toast.info(message);
      // Delete the cookie
      document.cookie = 'liberal_flash=; max-age=0; path=/';
    }
  }, []);

  return null;
}
