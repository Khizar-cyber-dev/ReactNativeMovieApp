import { View, Text, ActivityIndicator, ScrollView, Image, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {  getTrendingMovies,  getCurrentUser,  signOut as appwriteSignOut, account } from "@/services/appwrite";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import TrendingCard from "@/components/TrendingCard";

const Profile = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [trendingMovies, setTrendingMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        const currentAccount = await account.get().catch(() => null);
        if (!currentAccount) {
          router.replace('/(auth)/signIn');
          return;
        }
        const [userData, movies] = await Promise.all([
          getCurrentUser(),
          getTrendingMovies(),
        ]);

        setUser(userData);
        setTrendingMovies(movies || []);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await appwriteSignOut();
      setUser(null);
      setTrendingMovies([]);
      router.replace('/(auth)/signIn');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-primary items-center justify-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full h-64"
        resizeMode="cover"
      />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="items-center mt-16 mb-8">
          <View className="border-4 border-secondary rounded-full p-1">
            <Image
              source={user?.imageUrl ? { uri: user.imageUrl } : icons.person}
              className="w-24 h-24 rounded-full"
              resizeMode="contain"
            />
          </View>

          <Text className="text-white text-2xl font-bold mt-4">
            {user?.name || "Guest"}
          </Text>
          <Text className="text-gray-300 text-base mb-2">
            {user?.email || ""}
          </Text>
          <Text className="text-gray-400 text-sm">
            Joined:{" "}
            {user?.$createdAt
              ? new Date(user.$createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A"}
          </Text>
        </View>

        <TouchableOpacity
          className="bg-secondary rounded-xl p-3 items-center mb-8"
          onPress={handleLogout}
        >
          <Text className="text-white font-bold">Sign Out</Text>
        </TouchableOpacity>

        {trendingMovies.length > 0 ? (
          <View className="mb-8">
            <Text className="text-lg text-white font-bold mb-3">
              Your Trending Searches
            </Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={trendingMovies}
              contentContainerStyle={{ gap: 16, paddingRight: 20 }}
              renderItem={({ item, index }) => (
                <TrendingCard movie={item} index={index} />
              )}
              keyExtractor={(item) => item.$id}
            />
          </View>
        ) : (
          <View className="bg-secondary rounded-xl p-4 mb-8">
            <Text className="text-white text-center">
              Your trending searches will appear here
            </Text>
          </View>
        )}      
      </ScrollView>
    </View>
  );
};

export default Profile;