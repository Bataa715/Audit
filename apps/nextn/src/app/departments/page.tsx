'use client';

import { useState, useEffect } from 'react';
import { departmentsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Loader2,
  Building2,
  Users,
  Briefcase,
  Target,
  History,
  Mail,
  User,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface DepartmentUser {
  id: string;
  name: string;
  email: string;
  position?: string;
  isActive?: boolean;
}

interface DepartmentData {
  id: string;
  name: string;
  description?: string;
  manager?: string;
  employeeCount?: number;
  users?: DepartmentUser[];
  createdAt?: string;
  updatedAt?: string;
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
];

export default function DepartmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [department, setDepartment] = useState<DepartmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.department) {
      loadDepartment();
    } else {
      setIsLoading(false);
    }
  }, [user?.department]);

  const loadDepartment = async () => {
    if (!user?.department) return;

    try {
      const data = await departmentsApi.getByName(user.department);
      setDepartment(data);
    } catch (error) {
      console.error('Error loading department:', error);
      toast({
        title: 'Алдаа',
        description: 'Хэлтсийн мэдээлэл ачаалахад алдаа гарлаа.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 text-center"
        >
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-400">Ачаалж байна...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
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
            Энэ хуудсыг үзэхийн тулд нэвтэрнэ үү.
          </p>
        </motion.div>
      </div>
    );
  }

  if (!user.department || !department) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Хэлтэс тодорхойгүй
          </h2>
          <p className="text-slate-400">
            Таны хэлтэс тодорхойлогдоогүй байна. Админтай холбогдоно уу.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-600/10 to-transparent rounded-full blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-600/10 to-transparent rounded-full blur-3xl"
          animate={{ x: [0, -100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />

        {/* Floating particles */}
        {PARTICLE_POSITIONS.map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-500/30 rounded-full"
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
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {department.name}
              </h1>
              <p className="text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                Миний хэлтсийн мэдээлэл
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-400" />
                    Чиг үүрэг
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Хэлтсийн үндсэн үүрэг, зорилго
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {department.description ? (
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {department.description}
                    </p>
                  ) : (
                    <p className="text-slate-500 italic">
                      Тайлбар оруулаагүй байна. Админ энэ мэдээллийг нэмж болно.
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Team Members */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-400" />
                    Хамт олон
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Хэлтсийн ажилтнуудын жагсаалт
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {department.users && department.users.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {department.users.map((member, index) => (
                        <motion.div
                          key={member.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center gap-3 p-4 rounded-xl bg-slate-700/30 border border-slate-700/50 hover:border-blue-500/50 transition-colors"
                        >
                          <Avatar className="h-12 w-12 border-2 border-blue-500/30">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-semibold">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">
                              {member.name}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              {member.position && (
                                <span className="flex items-center gap-1">
                                  <Briefcase className="h-3 w-3" />
                                  {member.position}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{member.email}</span>
                            </div>
                          </div>
                          {member.id === user.id && (
                            <Badge className="bg-blue-500/20 text-blue-400 border-0 shrink-0">
                              <User className="h-3 w-3 mr-1" />
                              Та
                            </Badge>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 italic text-center py-8">
                      Ажилтан бүртгэгдээгүй байна
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-white text-lg">
                    Статистик
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-400" />
                        <span className="text-sm text-slate-300">
                          Нийт ажилтан
                        </span>
                      </div>
                      <span className="text-3xl font-bold text-white">
                        {department.users?.length ||
                          department.employeeCount ||
                          0}
                      </span>
                    </div>
                  </div>

                  {department.manager && (
                    <div className="p-4 rounded-xl bg-slate-700/30 border border-slate-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-400">Менежер</span>
                      </div>
                      <p className="font-medium text-white">
                        {department.manager}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-lg">
                    <History className="h-5 w-5 text-blue-400" />
                    Түүх
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {department.createdAt && (
                    <div className="p-3 rounded-lg bg-slate-700/30">
                      <p className="text-xs text-slate-400 mb-1">Үүсгэсэн</p>
                      <p className="text-sm font-medium text-white">
                        {new Date(department.createdAt).toLocaleDateString(
                          'mn-MN',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </p>
                    </div>
                  )}
                  {department.updatedAt && (
                    <div className="p-3 rounded-lg bg-slate-700/30">
                      <p className="text-xs text-slate-400 mb-1">
                        Сүүлд шинэчилсэн
                      </p>
                      <p className="text-sm font-medium text-white">
                        {new Date(department.updatedAt).toLocaleDateString(
                          'mn-MN',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
