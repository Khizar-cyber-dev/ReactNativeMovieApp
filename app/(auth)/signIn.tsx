import React, { useEffect } from 'react';
import AuthForm from '@/components/AuthForm';
import { View, Image } from 'react-native';
import { images } from '@/constants/images';
import { useRouter } from 'expo-router';
import { isAuthenticated } from '@/services/appwrite';

const signIn = () => {
  const router = useRouter();
    
      useEffect(() => {
        const checkAuth = async () => {
          const auth = await isAuthenticated();
          if (!auth) {
            router.push('/');
          }
        };
        checkAuth();
      }, [router]);
  return(
    <>
      <View className=''>
        {/* <Image
                source={images.bg}
                className="absolute w-full z-0"
                resizeMode="cover"
              /> */}
        <AuthForm isSignUp={false} />;
      </View>
    </>
  )
};

export default signIn;