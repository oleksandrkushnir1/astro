import React, { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import directus from '../lib/directus';
import type { MySchema } from '../lib/directus';

type User = MySchema['directus_users'] | null;

type UserContextType = {
  user: User;
  loading: boolean;
};

const UserContext = createContext<UserContextType | null>(null);

interface UserProviderProps { // Keep interface for props (stylistic choice)
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use Awaited to get the resolved type of the Promise
        const me = await directus.users.me.read();
        setUser(me);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};