'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

type ProfileIconPreset = {
  id: string;
  label: string;
};

export const PROFILE_ICON_PRESETS: ProfileIconPreset[] = [
  { id: 'person-aria', label: 'Aria' },
  { id: 'person-milo', label: 'Milo' },
  { id: 'person-naya', label: 'Naya' },
  { id: 'person-ryo', label: 'Ryo' },
  { id: 'person-lina', label: 'Lina' },
  { id: 'person-dion', label: 'Dion' },
  { id: 'person-sora', label: 'Sora' },
  { id: 'person-kiara', label: 'Kiara' },
];

const LEGACY_DICEBEAR_BACKGROUND = 'b6e3f4';

export function isProfileIconPreset(iconId?: string | null) {
  return PROFILE_ICON_PRESETS.some((preset) => preset.id === iconId);
}

function getInitials(name?: string | null) {
  return (name || 'Guest User')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0] || '')
    .join('')
    .toUpperCase();
}

function getLegacyAvatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=${LEGACY_DICEBEAR_BACKGROUND}`;
}

function FrontPortrait({ iconId }: { iconId: string }) {
  switch (iconId) {
    case 'person-aria':
      return (
        <svg viewBox="0 0 96 96" className="h-full w-full" aria-hidden="true">
          <rect width="96" height="96" rx="28" fill="#F7EFE9" />
          <circle cx="75" cy="20" r="9" fill="#E9D7CF" />
          <path d="M22 84c2-12 13-22 26-22s24 10 26 22H22Z" fill="#D98F82" />
          <path d="M31 84c3-9 10-15 17-15s14 6 17 15H31Z" fill="#F5FBFF" />
          <path d="M39 67h18l5 17H34l5-17Z" fill="#EAF0F7" />
          <circle cx="48" cy="38" r="15" fill="#F2C9B0" />
          <path d="M30 41c0-14 8-23 18-23 12 0 18 9 18 22-5-5-11-8-18-8-7 0-13 3-18 9Z" fill="#463236" />
          <path d="M35 44c4-4 8-6 13-6s10 2 13 6v4c0 8-5 15-13 15s-13-7-13-15v-4Z" fill="#F2C9B0" />
          <circle cx="43" cy="45" r="1.5" fill="#352927" />
          <circle cx="53" cy="45" r="1.5" fill="#352927" />
          <path d="M44 53c2 2 6 2 8 0" stroke="#C47C77" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'person-milo':
      return (
        <svg viewBox="0 0 96 96" className="h-full w-full" aria-hidden="true">
          <rect width="96" height="96" rx="28" fill="#ECF3FB" />
          <circle cx="20" cy="22" r="9" fill="#D4E3F0" />
          <path d="M22 84c2-12 13-22 26-22s24 10 26 22H22Z" fill="#7FA6C7" />
          <path d="M31 84c3-9 10-15 17-15s14 6 17 15H31Z" fill="#213044" />
          <path d="M39 67h18l5 17H34l5-17Z" fill="#314B6B" />
          <circle cx="48" cy="38" r="15" fill="#EEC39F" />
          <path d="M30 39c2-12 8-20 18-20 11 0 17 7 18 18-5-3-11-5-18-5-6 0-12 2-18 7Z" fill="#273546" />
          <path d="M35 43c4-4 8-6 13-6s10 2 13 6v5c0 8-5 14-13 14s-13-6-13-14v-5Z" fill="#EEC39F" />
          <circle cx="43" cy="45" r="1.5" fill="#30231F" />
          <circle cx="53" cy="45" r="1.5" fill="#30231F" />
          <path d="M44 53c2 1 6 1 8 0" stroke="#B87464" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'person-naya':
      return (
        <svg viewBox="0 0 96 96" className="h-full w-full" aria-hidden="true">
          <rect width="96" height="96" rx="28" fill="#F4EEF9" />
          <circle cx="75" cy="20" r="9" fill="#DDD3EE" />
          <path d="M22 84c2-12 13-22 26-22s24 10 26 22H22Z" fill="#C69FDE" />
          <path d="M31 84c3-9 10-15 17-15s14 6 17 15H31Z" fill="#FEFBFF" />
          <path d="M39 67h18l5 17H34l5-17Z" fill="#F4EEF9" />
          <circle cx="48" cy="38" r="15" fill="#F1C8B2" />
          <path d="M30 41c1-14 8-23 18-23 12 0 18 9 18 22-5-5-10-8-18-8-7 0-13 3-18 9Z" fill="#412C55" />
          <path d="M35 44c4-4 8-6 13-6s10 2 13 6v4c0 8-5 15-13 15s-13-7-13-15v-4Z" fill="#F1C8B2" />
          <circle cx="43" cy="45" r="1.5" fill="#332624" />
          <circle cx="53" cy="45" r="1.5" fill="#332624" />
          <path d="M44 53c2 2 6 2 8 0" stroke="#C38289" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'person-ryo':
      return (
        <svg viewBox="0 0 96 96" className="h-full w-full" aria-hidden="true">
          <rect width="96" height="96" rx="28" fill="#EEF5EF" />
          <circle cx="74" cy="74" r="9" fill="#D8E6D8" />
          <path d="M22 84c2-12 13-22 26-22s24 10 26 22H22Z" fill="#82AC88" />
          <path d="M31 84c3-9 10-15 17-15s14 6 17 15H31Z" fill="#F4F8F5" />
          <path d="M39 67h18l5 17H34l5-17Z" fill="#E5EFE6" />
          <circle cx="48" cy="38" r="15" fill="#EABF99" />
          <path d="M30 40c2-13 8-21 18-21 12 0 18 8 18 19-5-4-11-6-18-6s-13 2-18 8Z" fill="#282F26" />
          <path d="M35 44c4-4 8-6 13-6s10 2 13 6v4c0 8-5 15-13 15s-13-7-13-15v-4Z" fill="#EABF99" />
          <circle cx="43" cy="45" r="1.5" fill="#2F231D" />
          <circle cx="53" cy="45" r="1.5" fill="#2F231D" />
          <path d="M44 53c2 1 6 1 8 0" stroke="#B67462" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'person-lina':
      return (
        <svg viewBox="0 0 96 96" className="h-full w-full" aria-hidden="true">
          <rect width="96" height="96" rx="28" fill="#FFF2EE" />
          <circle cx="20" cy="74" r="9" fill="#FFDCD6" />
          <path d="M22 84c2-12 13-22 26-22s24 10 26 22H22Z" fill="#DB8F92" />
          <path d="M31 84c3-9 10-15 17-15s14 6 17 15H31Z" fill="#FFF8FA" />
          <path d="M39 67h18l5 17H34l5-17Z" fill="#FAF0F2" />
          <circle cx="48" cy="39" r="14" fill="#F2C7B0" />
          <path d="M30 43c0-15 8-24 18-24 12 0 18 9 18 22-5-5-11-8-18-8-7 0-13 3-18 10Z" fill="#60363D" />
          <path d="M35 45c4-4 8-6 13-6s10 2 13 6v4c0 8-5 14-13 14s-13-6-13-14v-4Z" fill="#F2C7B0" />
          <circle cx="43" cy="45" r="1.5" fill="#342625" />
          <circle cx="53" cy="45" r="1.5" fill="#342625" />
          <path d="M44 53c2 2 6 2 8 0" stroke="#C98587" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'person-dion':
      return (
        <svg viewBox="0 0 96 96" className="h-full w-full" aria-hidden="true">
          <rect width="96" height="96" rx="28" fill="#F0F2F5" />
          <circle cx="74" cy="20" r="9" fill="#DCE0E7" />
          <path d="M22 84c2-12 13-22 26-22s24 10 26 22H22Z" fill="#A6ADBF" />
          <path d="M31 84c3-9 10-15 17-15s14 6 17 15H31Z" fill="#313947" />
          <path d="M39 67h18l5 17H34l5-17Z" fill="#445063" />
          <circle cx="48" cy="38" r="15" fill="#E9BC96" />
          <path d="M30 39c2-11 8-19 18-19s17 7 18 17c-5-3-11-5-18-5s-12 2-18 7Z" fill="#31353C" />
          <path d="M35 43c4-4 8-6 13-6s10 2 13 6v5c0 8-5 14-13 14s-13-6-13-14v-5Z" fill="#E9BC96" />
          <circle cx="43" cy="45" r="1.5" fill="#2E211B" />
          <circle cx="53" cy="45" r="1.5" fill="#2E211B" />
          <path d="M44 53c2 1 6 1 8 0" stroke="#B57463" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'person-sora':
      return (
        <svg viewBox="0 0 96 96" className="h-full w-full" aria-hidden="true">
          <rect width="96" height="96" rx="28" fill="#EDF6FC" />
          <circle cx="75" cy="20" r="9" fill="#D2E7F3" />
          <path d="M22 84c2-12 13-22 26-22s24 10 26 22H22Z" fill="#87BFD5" />
          <path d="M31 84c3-9 10-15 17-15s14 6 17 15H31Z" fill="#F8FDFF" />
          <path d="M39 67h18l5 17H34l5-17Z" fill="#EFF7FB" />
          <circle cx="48" cy="38" r="15" fill="#F0C8AB" />
          <path d="M31 40c1-13 8-21 17-21 12 0 18 9 17 21-5-4-10-7-17-7-7 0-12 3-17 7Z" fill="#355265" />
          <path d="M35 44c4-4 8-6 13-6s10 2 13 6v4c0 8-5 15-13 15s-13-7-13-15v-4Z" fill="#F0C8AB" />
          <circle cx="43" cy="45" r="1.5" fill="#322521" />
          <circle cx="53" cy="45" r="1.5" fill="#322521" />
          <path d="M44 53c2 2 6 2 8 0" stroke="#C78174" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'person-kiara':
      return (
        <svg viewBox="0 0 96 96" className="h-full w-full" aria-hidden="true">
          <rect width="96" height="96" rx="28" fill="#F7F3EA" />
          <circle cx="20" cy="22" r="9" fill="#E8DCC5" />
          <path d="M22 84c2-12 13-22 26-22s24 10 26 22H22Z" fill="#C8A46F" />
          <path d="M31 84c3-9 10-15 17-15s14 6 17 15H31Z" fill="#FFF9F0" />
          <path d="M39 67h18l5 17H34l5-17Z" fill="#FBF4E8" />
          <circle cx="48" cy="38" r="15" fill="#F2C8AE" />
          <path d="M30 40c1-13 8-21 18-21 13 0 18 9 17 21-4-3-9-5-17-5-8 0-13 2-18 5Z" fill="#654B37" />
          <path d="M35 44c4-4 8-6 13-6s10 2 13 6v4c0 8-5 15-13 15s-13-7-13-15v-4Z" fill="#F2C8AE" />
          <circle cx="43" cy="45" r="1.5" fill="#31241F" />
          <circle cx="53" cy="45" r="1.5" fill="#31241F" />
          <path d="M44 53c2 2 6 2 8 0" stroke="#C98576" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

type ProfileAvatarProps = {
  iconId?: string | null;
  name?: string | null;
  className?: string;
  fallbackClassName?: string;
};

export function ProfileAvatar({ iconId, name, className, fallbackClassName }: ProfileAvatarProps) {
  const initials = getInitials(name);
  const preset = PROFILE_ICON_PRESETS.find((item) => item.id === iconId);

  if (preset) {
    return (
      <div className={cn('h-full w-full', className)} aria-hidden="true">
        <FrontPortrait iconId={preset.id} />
      </div>
    );
  }

  if (iconId) {
    return (
      <div className={cn('relative h-full w-full', className)}>
        <Image
          src={getLegacyAvatarUrl(iconId)}
          alt={name ? `${name} avatar` : 'Avatar'}
          fill
          unoptimized
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className={cn('flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#eef5ff_0%,#d4e4fb_100%)] text-primary', className)}>
      <span className={cn('text-sm font-black uppercase tracking-[0.08em]', fallbackClassName)}>{initials}</span>
    </div>
  );
}
