import { Text, View, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInAccount, createNewUser } from '@/services/appwrite';
import { images } from '@/constants/images';

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
});

type AuthFormValues = z.infer<typeof authSchema>;

const AuthForm = ({ isSignUp }: { isSignUp: boolean }) => {
  const { control, handleSubmit, formState: { errors } } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
  });
  const router = useRouter();

  const handleAuth = async (data: AuthFormValues) => {
    try {
      if (isSignUp) {
        await createNewUser(data.email, data.password, data.name || '');
        Alert.alert('Success', 'Account created. Please sign in.');
        router.push('/(auth)/signIn');
      } else {
        await signInAccount({ email: data.email, password: data.password });
        router.push('/search');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    }
  };

  return (
    <View className="flex-1 justify-center px-8 bg-white">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-gray-800 text-center">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </Text>
        <Text className="text-gray-500 text-center mt-2">
          {isSignUp ? 'Sign up to get started' : 'Sign in to continue'}
        </Text>
      </View>

      {isSignUp && (
        <View className="mb-4">
          <Controller
            name="name"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Full Name"
                placeholderTextColor="#9CA3AF"
                value={value}
                onChangeText={onChange}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-800"
              />
            )}
          />
          {errors.name && (
            <Text className="text-red-500 text-sm mt-1">{errors.name.message}</Text>
          )}
        </View>
      )}

      <View className="mb-4">
        <Controller
          name="email"
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="Email Address"
              placeholderTextColor="#9CA3AF"
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-800"
            />
          )}
        />
        {errors.email && (
          <Text className="text-red-500 text-sm mt-1">{errors.email.message}</Text>
        )}
      </View>

      <View className="mb-6">
        <Controller
          name="password"
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              value={value}
              onChangeText={onChange}
              secureTextEntry
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-800"
            />
          )}
        />
        {errors.password && (
          <Text className="text-red-500 text-sm mt-1">{errors.password.message}</Text>
        )}
      </View>

      <TouchableOpacity
        onPress={handleSubmit(handleAuth)}
        className="bg-blue-600 py-4 rounded-lg shadow"
      >
        <Text className="text-white font-semibold text-center">
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push(isSignUp ? '/(auth)/signIn' : '/(auth)/signUp')}
        className="mt-4"
      >
        <Text className="text-gray-600 text-center">
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthForm;