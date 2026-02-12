'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  Users,
  Shield,
  Building2,
  Activity,
  TrendingUp,
  UserCheck,
  UserX,
  Wrench,
  ArrowRight,
  Sparkles,
  BarChart3,
  Lock,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { DEPARTMENTS } from '@/lib/constants';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
  usersByDepartment: Record<string, number>;
  recentActivity: number;
}

// Fixed particle positions
const PARTICLE_POSITIONS = [
  { left: 10, top: 20 },
  { left: 90, top: 15 },
  { left: 50, top: 80 },
  { left: 25, top: 45 },
  { left: 75, top: 60 },
  { left: 15, top: 75 },
  { left: 85, top: 35 },
  { left: 40, top: 10 },
  { left: 60, top: 90 },
  { left: 30, top: 55 },
  { left: 70, top: 25 },
  { left: 5, top: 65 },
  { left: 95, top: 50 },
  { left: 45, top: 30 },
  { left: 55, top: 70 },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    adminUsers: 0,
    usersByDepartment: {},
    recentActivity: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const allUsers = await usersApi.getAll();

      const users = allUsers.filter((u: any) => !u.isAdmin);
      const adminUsers = allUsers.filter((u: any) => u.isAdmin).length;

      const usersByDepartment: Record<string, number> = {};
      DEPARTMENTS.forEach(dept => {
        usersByDepartment[dept] = 0;
      });

      let activeUsers = 0;

      users.forEach((u: any) => {
        if (u.isActive) activeUsers++;
        if (u.department) {
          usersByDepartment[u.department] =
            (usersByDepartment[u.department] || 0) + 1;
        }
      });

      setStats({
        totalUsers: users.length,
        activeUsers,
        inactiveUsers: users.length - activeUsers,
        adminUsers,
        usersByDepartment,
        recentActivity: users.filter((u: any) => {
          if (!u.lastLoginAt) return false;
          const lastLogin = new Date(u.lastLoginAt);
          const dayAgo = new Date();
          dayAgo.setDate(dayAgo.getDate() - 1);
          return lastLogin > dayAgo;
        }).length,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Хандах эрхгүй</h2>
          <p className="text-slate-400">
            Зөвхөн админ хэрэглэгч үзэх боломжтой.
          </p>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-slate-400">Ачаалж байна...</p>
        </motion.div>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Хэрэглэгчид',
      description: 'Хэрэглэгч удирдах',
      icon: Users,
      href: '/admin/users',
      gradient: 'from-blue-500 to-cyan-500',
      shadowColor: 'shadow-blue-500/20',
    },
    {
      title: 'Хэлтсүүд',
      description: 'Хэлтэс удирдах',
      icon: Building2,
      href: '/admin/departments',
      gradient: 'from-purple-500 to-pink-500',
      shadowColor: 'shadow-purple-500/20',
    },
    {
      title: 'Хэрэгслүүд',
      description: 'Эрх олгох',
      icon: Wrench,
      href: '/admin/tools',
      gradient: 'from-emerald-500 to-teal-500',
      shadowColor: 'shadow-emerald-500/20',
    },
  ];

  const statCards = [
    {
      title: 'Нийт хэрэглэгч',
      value: stats.totalUsers,
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      description: 'Бүртгэлтэй',
    },
    {
      title: 'Идэвхтэй',
      value: stats.activeUsers,
      icon: UserCheck,
      gradient: 'from-emerald-500 to-emerald-600',
      description: 'Эрхтэй',
    },
    {
      title: 'Идэвхгүй',
      value: stats.inactiveUsers,
      icon: UserX,
      gradient: 'from-red-500 to-red-600',
      description: 'Хаагдсан',
    },
    {
      title: '24 цагт',
      value: stats.recentActivity,
      icon: Activity,
      gradient: 'from-amber-500 to-orange-500',
      description: 'Нэвтэрсэн',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-amber-600/10 to-transparent rounded-full blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-orange-600/10 to-transparent rounded-full blur-3xl"
          animate={{ x: [0, -100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />

        {/* Floating particles */}
        {PARTICLE_POSITIONS.map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-500/30 rounded-full"
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
      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Админ удирдлага</h1>
              <p className="text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Тавтай морилно уу, {user.name}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8"
        >
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <Badge className="bg-slate-700/50 text-slate-300 border-0">
                        {stat.description}
                      </Badge>
                    </div>
                    <div className="text-4xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <p className="text-slate-400 text-sm">{stat.title}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            Түргэн үйлдэл
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link href={action.href}>
                    <Card
                      className={`group cursor-pointer bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:border-slate-600 transition-all shadow-xl ${action.shadowColor}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={`p-4 rounded-2xl bg-gradient-to-br ${action.gradient} shadow-lg`}
                            >
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
                                {action.title}
                              </h3>
                              <p className="text-sm text-slate-400">
                                {action.description}
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Department Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                Хэлтсүүдийн статистик
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(stats.usersByDepartment)
                  .filter(([_, count]) => count > 0)
                  .sort((a, b) => b[1] - a[1])
                  .map(([dept, count], index) => (
                    <motion.div
                      key={dept}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-700/30 border border-slate-700/50"
                    >
                      <span className="text-slate-300 truncate">{dept}</span>
                      <Badge className="bg-amber-500/20 text-amber-400 border-0 font-bold">
                        {count}
                      </Badge>
                    </motion.div>
                  ))}
                {Object.entries(stats.usersByDepartment).filter(
                  ([_, count]) => count > 0
                ).length === 0 && (
                  <div className="col-span-full text-center py-8 text-slate-400">
                    Хэрэглэгч бүртгэгдээгүй байна
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                Системийн мэдээлэл
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-xl bg-slate-700/30 border border-slate-700/50">
                  <p className="text-slate-400 text-sm mb-1">Админ эрхтэй</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.adminUsers}{' '}
                    <span className="text-sm font-normal text-slate-400">
                      хүн
                    </span>
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-700/30 border border-slate-700/50">
                  <p className="text-slate-400 text-sm mb-1">Идэвхтэй хувь</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {stats.totalUsers > 0
                      ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
                      : 0}
                    %
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-700/30 border border-slate-700/50">
                  <p className="text-slate-400 text-sm mb-1">Хэлтсүүдийн тоо</p>
                  <p className="text-2xl font-bold text-white">
                    {DEPARTMENTS.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
