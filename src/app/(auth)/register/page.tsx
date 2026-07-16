"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { register as registerAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { handleGoogleLogin } from '@/lib/googleAuth';
import {
  HiMail,
  HiUser,
  HiStar,
  HiHome,
  HiEye,
  HiEyeOff,
} from 'react-icons/hi';
import { toast } from 'react-toastify';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Za-z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum(['user', 'agent']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'user' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setError('');
    try {
      const res = await registerAPI({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      const { user, token } = res.data.data || res.data;
      setAuth(user, token);
      toast.success('Account created successfully!');
      router.push('/');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed. Please try again.';
      setError(message);
    }
  };

  const handleGoogleClick = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const { user, token } = await handleGoogleLogin();
      setAuth(user, token);
      toast.success('Account created successfully!');
      router.push('/');
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-dark mb-1">Create Account</h1>
      <p className="text-muted text-sm mb-4">Join HomeNest and start exploring properties today</p>

      {/* Google Register Button */}
      <motion.button
        type="button"
        onClick={handleGoogleClick}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-60 shadow-sm cursor-pointer"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {googleLoading ? 'Creating account...' : 'Continue with Google'}
      </motion.button>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-white text-muted">or create with email</span>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-4 md:p-6 hover:shadow-xl transition-shadow duration-300">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3 flex items-center gap-2 overflow-hidden"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Full Name</label>
            <div className="relative">
              <HiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                placeholder="Enter your full name"
                className={`w-full pl-11 pr-4 py-2.5 border rounded-2xl text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:shadow-sm focus:shadow-md focus:shadow-primary/5 ${
                  errors.name ? 'border-red-400 bg-red-50/50' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                }`}
                {...register('name')}
              />
            </div>
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1">Email Address</label>
            <div className="relative">
              <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="email"
                placeholder="you@example.com"
                className={`w-full pl-11 pr-4 py-2.5 border rounded-2xl text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:shadow-sm focus:shadow-md focus:shadow-primary/5 ${
                  errors.email ? 'border-red-400 bg-red-50/50' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                }`}
                {...register('email')}
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          {/* Password Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Password</label>
              <div className="relative">
                <HiEyeOff className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 chars"
                  className={`w-full pl-10 pr-9 py-2.5 border rounded-2xl text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:shadow-sm focus:shadow-md focus:shadow-primary/5 ${
                    errors.password ? 'border-red-400 bg-red-50/50' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-dark transition-colors cursor-pointer"
                >
                  {showPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Confirm</label>
              <div className="relative">
                <HiEyeOff className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat"
                  className={`w-full pl-10 pr-9 py-2.5 border rounded-2xl text-sm text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:shadow-sm focus:shadow-md focus:shadow-primary/5 ${
                    errors.confirmPassword ? 'border-red-400 bg-red-50/50' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                  }`}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-dark transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          {/* Role Selection — Compact inline */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2">I want to...</label>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                type="button"
                onClick={() => setValue('role', 'user')}
                className={`relative p-3 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${
                  selectedRole === 'user'
                    ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                    : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedRole === 'user' ? 'bg-primary/10' : 'bg-slate-100'
                  }`}>
                    <HiHome className={`w-4 h-4 ${selectedRole === 'user' ? 'text-primary' : 'text-muted'}`} />
                  </div>
                  <div>
                    <span className={`text-xs font-semibold block ${selectedRole === 'user' ? 'text-primary' : 'text-dark'}`}>
                      Find a Property
                    </span>
                    <span className="text-[11px] text-muted">Browse & rent homes</span>
                  </div>
                </div>
                {selectedRole === 'user' && (
                  <motion.div
                    className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>

              <motion.button
                type="button"
                onClick={() => setValue('role', 'agent')}
                className={`relative p-3 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${
                  selectedRole === 'agent'
                    ? 'border-secondary bg-secondary/5 shadow-sm shadow-secondary/10'
                    : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedRole === 'agent' ? 'bg-secondary/10' : 'bg-slate-100'
                  }`}>
                    <HiStar className={`w-4 h-4 ${selectedRole === 'agent' ? 'text-secondary' : 'text-muted'}`} />
                  </div>
                  <div>
                    <span className={`text-xs font-semibold block ${selectedRole === 'agent' ? 'text-secondary' : 'text-dark'}`}>
                      List Properties
                    </span>
                    <span className="text-[11px] text-muted">Post as an agent</span>
                  </div>
                </div>
                {selectedRole === 'agent' && (
                  <motion.div
                    className="absolute top-2 right-2 w-4 h-4 bg-secondary rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-6 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:from-primary-dark hover:to-primary transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-sm"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </motion.button>
        </form>
      </div>
    </>
  );
}