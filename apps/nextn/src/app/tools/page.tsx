'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi } from '@/lib/api';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ListTodo,
  Dumbbell,
  Wrench,
  Lock,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  gradient: string;
  shadowColor: string;
  isNew?: boolean;
}

const allTools: Tool[] = [
  {
    id: 'todo',
    title: 'Хийх зүйлсийн жагсаалт',
    description: 'Өдөр тутмын ажлуудаа үр дүнтэй төлөвлөж, хянах',
    icon: ListTodo,
    href: '/tools/todo',
    gradient: 'from-emerald-500 to-teal-500',
    shadowColor: 'shadow-emerald-500/20',
  },
  {
    id: 'fitness',
    title: 'Биеийн тамир',
    description: 'Өдөр тутмын дасгалын хөтөлбөр, хяналт',
    icon: Dumbbell,
    href: '/tools/fitness',
    gradient: 'from-orange-500 to-red-500',
    shadowColor: 'shadow-orange-500/20',
    isNew: true,
  },
];

// Fixed particle positions
const PARTICLE_POSITIONS = [
  { left: 15, top: 25 },
  { left: 85, top: 10 },
  { left: 45, top: 80 },
  { left: 70, top: 35 },
  { left: 25, top: 60 },
  { left: 90, top: 70 },
  { left: 10, top: 90 },
  { left: 55, top: 15 },
  { left: 35, top: 45 },
  { left: 80, top: 55 },
  { left: 5, top: 40 },
  { left: 60, top: 95 },
];

export default function ToolsPage() {
  const { user } = useAuth();
  const [allowedTools, setAllowedTools] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserPermissions = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      if (user.isAdmin) {
        setAllowedTools(allTools.map(t => t.id));
        setIsLoading(false);
        return;
      }

      try {
        const freshUserData = await usersApi.getOne(user.id);
        setAllowedTools(freshUserData.allowedTools || []);
      } catch (error) {
        console.error('Error fetching user permissions:', error);
        setAllowedTools(user.allowedTools || []);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserPermissions();
  }, [user]);

  const availableTools = allTools.filter(tool =>
    allowedTools.includes(tool.id)
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <motion.div
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-600/10 to-transparent rounded-full blur-3xl"
            animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Нэвтрэх шаардлагатай
          </h2>
          <p className="text-slate-400">
            Хэрэгслүүдийг ашиглахын тулд нэвтэрнэ үү.
          </p>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 text-center"
        >
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-slate-400">Ачаалж байна...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-600/10 to-transparent rounded-full blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-pink-600/10 to-transparent rounded-full blur-3xl"
          animate={{ x: [0, -100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />

        {/* Floating particles */}
        {PARTICLE_POSITIONS.map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-500/30 rounded-full"
            style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{
              duration: 3 + (i % 4),
              repeat: Infinity,
              delay: (i % 8) * 0.3,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
              <Wrench className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Хэрэгслүүд
              </h1>
              <p className="text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Дотоод аудитын ажилтанд зориулсан хэрэгслүүд
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tools Grid */}
        {availableTools.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availableTools.map((tool, index) => {
                const Icon = tool.icon;

                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link href={tool.href}>
                      <div
                        className={`relative p-1 rounded-3xl bg-gradient-to-br ${tool.gradient} shadow-2xl ${tool.shadowColor}`}
                      >
                        <Card className="group bg-slate-900/90 backdrop-blur-xl border-0 rounded-[22px] h-full cursor-pointer overflow-hidden">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <motion.div
                                className={`p-4 rounded-2xl bg-gradient-to-br ${tool.gradient} shadow-lg`}
                                whileHover={{ rotate: [0, -10, 10, 0] }}
                                transition={{ duration: 0.5 }}
                              >
                                <Icon className="w-7 h-7 text-white" />
                              </motion.div>
                              <div className="flex items-center gap-2">
                                {tool.isNew && (
                                  <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    Шинэ
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-2">
                            <CardTitle className="text-xl mb-3 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 group-hover:bg-clip-text transition-all">
                              {tool.title}
                            </CardTitle>
                            <CardDescription className="text-slate-400 leading-relaxed mb-4">
                              {tool.description}
                            </CardDescription>
                            <div className="flex items-center gap-2 text-slate-400 group-hover:text-white transition-colors">
                              <span className="text-sm font-medium">Нээх</span>
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Available tools count */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-10 text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50">
                <Wrench className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-slate-400">
                  Нийт {availableTools.length} хэрэгсэл ашиглах боломжтой
                </span>
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[50vh] text-center"
          >
            <div className="p-8 rounded-3xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 mb-6">
              <Lock className="w-16 h-16 text-slate-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Хэрэгсэл олдсонгүй
            </h2>
            <p className="text-slate-400 max-w-md">
              Танд ашиглах боломжтой хэрэгсэл байхгүй байна. Админтай холбогдож
              эрх авна уу.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
