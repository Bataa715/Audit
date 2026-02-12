'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Building2,
  Wrench,
  Calendar,
  Clock,
  Sparkles,
  User,
  Code,
  Settings,
} from 'lucide-react';
import Image from 'next/image';

export default function Hero() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const currentDate = new Date().toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const currentTime = new Date().toLocaleTimeString('mn-MN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Өглөөний мэнд';
    if (hour < 18) return 'Өдрийн мэнд';
    return 'Оройн мэнд';
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col justify-center px-4 md:px-8 py-6 overflow-hidden relative">
      {/* Background stars effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Top Section - Date & Time */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 text-muted-foreground mb-8"
        >
          <Calendar className="h-4 w-4" />
          <span className="text-sm">{currentDate}</span>
          <span className="text-muted-foreground/50">•</span>
          <Clock className="h-4 w-4" />
          <span className="text-sm">{currentTime}</span>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Welcome Message */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Role Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30"
            >
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <Code className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {user?.position || 'Ажилтан'}
              </span>
            </motion.div>

            {/* Greeting */}
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <Sparkles className="h-5 w-5" />
                <span className="text-lg font-mono">{getGreeting()}</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold"
              >
                <span className="bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                  {user?.name || 'Хэрэглэгч'}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg text-muted-foreground font-mono"
              >
                {user?.department || 'Дотоод Аудитын Газар'}
              </motion.p>

              {user?.userId && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55 }}
                  className="text-sm text-muted-foreground/70 font-mono"
                >
                  ID: {user.userId}
                </motion.p>
              )}
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center gap-3 pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/departments')}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary to-purple-500 text-white font-medium shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow"
              >
                <Building2 className="h-4 w-4" />
                Миний хэлтэс
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/tools')}
                className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-primary/50 text-primary hover:bg-primary/10 font-medium transition-colors"
              >
                <Wrench className="h-4 w-4" />
                Хэрэгслүүд
              </motion.button>

              {user?.isAdmin && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/admin')}
                  className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-purple-500/50 text-purple-500 hover:bg-purple-500/10 font-medium transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Админ
                </motion.button>
              )}
            </motion.div>
          </motion.div>

          {/* Right - Profile Image with Animated Border */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative flex items-center justify-center"
          >
            {/* Animated rotating border */}
            <motion.div
              className="absolute w-[220px] h-[220px] md:w-[280px] md:h-[280px] rounded-full"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent, var(--primary), transparent, var(--primary), transparent)',
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* Second rotating border (opposite direction) */}
            <motion.div
              className="absolute w-[200px] h-[200px] md:w-[260px] md:h-[260px] rounded-full"
              style={{
                background:
                  'conic-gradient(from 180deg, transparent, rgba(147, 51, 234, 0.5), transparent, rgba(6, 182, 212, 0.5), transparent)',
              }}
              animate={{ rotate: -360 }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* Inner glow */}
            <div className="absolute w-[180px] h-[180px] md:w-[240px] md:h-[240px] rounded-full bg-gradient-to-br from-primary/20 via-purple-500/10 to-cyan-500/20 blur-md" />

            {/* Profile Image Container */}
            <motion.div
              className="relative w-[170px] h-[170px] md:w-[230px] md:h-[230px] rounded-full overflow-hidden border-4 border-background shadow-2xl shadow-primary/30"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
              {user?.profileImage ? (
                <Image
                  src={user.profileImage}
                  alt={user.name || 'Profile'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 170px, 230px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <User className="h-20 w-20 md:h-28 md:w-28 text-primary/60" />
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
