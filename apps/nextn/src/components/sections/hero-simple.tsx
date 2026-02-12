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
  Settings,
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
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
    <div className="min-h-[calc(100vh-120px)] flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12 overflow-hidden relative">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-600/15 to-teal-600/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />

        {/* Floating dots */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 4 + 1,
              height: Math.random() * 4 + 1,
              background: `radial-gradient(circle, ${
                i % 3 === 0
                  ? 'rgba(59, 130, 246, 0.8)'
                  : i % 3 === 1
                    ? 'rgba(168, 85, 247, 0.8)'
                    : 'rgba(16, 185, 129, 0.8)'
              }, transparent)`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Date & Time Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center gap-3 mb-8"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 text-slate-300">
            <Calendar className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium">{currentDate}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 text-slate-300">
            <Clock className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium">{currentTime}</span>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Welcome Section */}
          <div className="space-y-8">
            {/* Role Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-400/30 backdrop-blur-xl"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/50 rounded-full blur-sm" />
                <div className="relative w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              </div>
              <Shield className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {user?.position || 'Ажилтан'}
                {user?.isAdmin && ' • Админ'}
              </span>
            </motion.div>

            {/* Greeting */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3"
              >
                <Sparkles className="h-6 w-6 text-amber-400 animate-pulse" />
                <span className="text-xl font-medium text-slate-300">
                  {getGreeting()}
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight"
              >
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
                  {user?.name || 'Хэрэглэгч'}
                </span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-400" />
                  <p className="text-lg text-slate-300 font-medium">
                    {user?.department || 'Дотоод Аудитын Газар'}
                  </p>
                </div>
                {user?.userId && (
                  <p className="text-sm text-slate-500 font-mono pl-7">
                    ID: {user.userId}
                  </p>
                )}
              </motion.div>
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="p-4 rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span className="text-xs text-slate-400 font-medium">
                    Идэвхтэй эрх
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {user?.isActive ? 'Нээлттэй' : 'Хаалттай'}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs text-slate-400 font-medium">
                    Системийн хэрэглэгч
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">2026</p>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/departments')}
                className="group relative flex items-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Building2 className="h-5 w-5 relative z-10" />
                <span className="relative z-10">Миний хэлтэс</span>
                <ArrowRight className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/tools')}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-slate-700/50 bg-slate-800/50 backdrop-blur-xl text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400 font-semibold transition-all"
              >
                <Wrench className="h-5 w-5" />
                <span>Хэрэгслүүд</span>
              </motion.button>

              {user?.isAdmin && (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/admin')}
                  className="flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-purple-500/50 bg-purple-500/10 backdrop-blur-xl text-purple-400 hover:bg-purple-500/20 font-semibold transition-all"
                >
                  <Settings className="h-5 w-5" />
                  <span>Админ</span>
                </motion.button>
              )}
            </motion.div>
          </div>

          {/* Right - Profile Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative flex items-center justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Animated rotating rings */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent, rgba(59, 130, 246, 0.5), transparent, rgba(168, 85, 247, 0.5), transparent)',
                  width: '110%',
                  height: '110%',
                  left: '-5%',
                  top: '-5%',
                }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    'conic-gradient(from 180deg, transparent, rgba(16, 185, 129, 0.5), transparent, rgba(236, 72, 153, 0.5), transparent)',
                  width: '105%',
                  height: '105%',
                  left: '-2.5%',
                  top: '-2.5%',
                }}
                animate={{ rotate: -360 }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-2xl" />

              {/* Profile Container */}
              <motion.div
                className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-3xl overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 shadow-2xl"
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10" />
                
                {user?.profileImage ? (
                  <Image
                    src={user.profileImage}
                    alt={user.name || 'Profile'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 256px, (max-width: 1024px) 320px, 384px"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <User className="h-32 w-32 sm:h-40 sm:w-40 text-slate-600" />
                    </motion.div>
                  </div>
                )}

                {/* Info overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold text-lg">
                        {user?.name || 'Хэрэглэгч'}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {user?.position || 'Ажилтан'}
                      </p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${user?.isActive ? 'bg-emerald-500' : 'bg-red-500'} shadow-lg`} />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
