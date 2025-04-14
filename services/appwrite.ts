import { Client, Databases, ID, Query, Avatars, Account } from "react-native-appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;
const USER_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID!;

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  
  export const avatars = new Avatars(client);
  export const database = new Databases(client);
  export const account = new Account(client);

export const updateSearchCount = async (query: string, movie: Movie) => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("searchTerm", query),
    ]);

    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];
      await database.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        existingMovie.$id,
        {
          count: existingMovie.count + 1,
        }
      );
    } else {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm: query,
        movie_id: movie.id,
        title: movie.title,
        count: 1,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      });
    }
  } catch (error) {
    console.error("Error updating search count:", error);
    throw error;
  }
};

export const getTrendingMovies = async (): Promise<
  TrendingMovie[] | undefined
> => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc("count"),
    ]);

    return result.documents as unknown as TrendingMovie[];
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export async function createNewUser(
  email: string,
  password: string,
  name: string
){
 try{
  const user = await account.create(ID.unique(), email, password, name);
  if (!user) throw new Error("Failed to create Appwrite account");
  const avatarUrl = avatars.getInitials(user.name).toString();

  const newUser = await saveToDB({
    name: user.name,
    email: user.email,
    accoundId: user.$id,
    imageUrl: avatarUrl,
  });

  return newUser;
 } catch(err){
  console.error("Error creating user:", err);
  throw err;
 }
};

export async function saveToDB(user: {
  name: string,
  email: string,
  accoundId: string,
  imageUrl: string,
}){
  try{
    const newUser = await database.createDocument(
      DATABASE_ID,
      USER_COLLECTION_ID,
      ID.unique(),
      {
        name: user.name,
        email: user.email,
        accountId: user.accoundId,
      }
    )
    return newUser;
  }catch(err){
    console.error("Error saving user to DB:", err);
    throw err;
  }
}


export async function signInAccount(user: { email: string, password: string }) {
  try {
    console.log('Signing in user:', user);
    try {
      const activeSession = await account.get();
      console.log('Active session found:', activeSession);

      await account.deleteSession('current');
      console.log('Active session deleted.');
    } catch (sessionError) {
      console.log('No active session found. Proceeding to sign in...');
    }

    const session = await account.createEmailPasswordSession(user.email, user.password);
    console.log('Session created:', session);
    return session;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export async function getCurrentUser() {
  try {
    const currentAccount = await account.get();
    console.log('Current account details:', currentAccount);

    const currentUser = await database.listDocuments(
      DATABASE_ID,
      USER_COLLECTION_ID,
      [Query.equal('accountId', currentAccount.$id)]
    );

    if (!currentUser || currentUser.total === 0) {
      throw new Error('User not found in database');
    }

    console.log('Current user document:', currentUser.documents[0]);
    return currentUser.documents[0];
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

export async function isAuthenticated() {
  try {
    const session = await account.get();
    return !!session;
  } catch {
    return false;
  }
}

export async function signOut() {
  try {
    await account.deleteSession('current');
    console.log('User signed out successfully.');
  } catch (error) {
    console.error('Error signing out:', error);
  }
}