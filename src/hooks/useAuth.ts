import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useGameStore } from '../store/useGameStore';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const { user, profile, setUser, setProfile, setIsLoading } = useGameStore();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          // Wait a bit for the database trigger to create the profile
          if (event === 'SIGNED_UP') {
            setTimeout(() => fetchProfile(session.user.id), 1000);
          } else {
            fetchProfile(session.user.id);
          }
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setProfile]);

  const fetchProfile = async (userId: string) => {
    try {
      // Check if Supabase is properly configured
      if (!supabase) {
        console.warn('Supabase not configured. Please set up environment variables.');
        setProfile(null);
        return;
      }

      // First check if the profiles table exists by trying a simple query
      const { error: tableCheckError } = await supabase
        .from('profiles')
        .select('user_id')
        .limit(1);

      if (tableCheckError && (tableCheckError.code === 'PGRST301' || tableCheckError.code === 'PGRST116')) {
        // Table doesn't exist or database not ready
        console.warn('Database tables not ready:', tableCheckError);
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.warn('Error fetching profile:', error);
      setProfile(null);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setIsLoading(true);
      
      // Validate inputs
      if (!email || !password || !username) {
        toast.error('All fields are required');
        return { error: 'All fields are required' };
      }

      if (password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return { error: 'Password must be at least 6 characters' };
      }

      if (username.length < 3) {
        toast.error('Username must be at least 3 characters');
        return { error: 'Username must be at least 3 characters' };
      }

      // Check if username is available (with error handling for missing table)
      try {
        const { data: existingProfiles, error: checkError } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username)
          .limit(1);

        if (checkError && checkError.code !== 'PGRST116' && checkError.code !== 'PGRST301') {
          console.warn('Database not ready, proceeding with signup:', checkError);
        } else if (existingProfiles && existingProfiles.length > 0) {
          toast.error('Username already taken');
          return { error: 'Username already taken' };
        }
      } catch (dbError) {
        console.warn('Database check failed, proceeding with signup:', dbError);
      }

      // Sign up with user metadata (username will be used by database trigger)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            full_name: username
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        if (error.message.includes('User already registered')) {
          toast.error('An account with this email already exists');
        } else if (error.message.includes('Invalid email')) {
          toast.error('Please enter a valid email address');
        } else if (error.message.includes('Password')) {
          toast.error('Password must be at least 6 characters');
        } else {
          toast.error(error.message || 'Error creating account');
        }
        return { error: error.message };
      }

      if (data.user) {
        // The database trigger should create the profile automatically
        // If database isn't ready, we'll handle it gracefully
        toast.success('Account created successfully! Please check your email to verify your account.');
        return { data };
      }
    } catch (error) {
      console.error('Error signing up:', error);
      toast.error('Error creating account. Please try again.');
      return { error: 'Error creating account' };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Validate inputs
      if (!email || !password) {
        toast.error('Email and password are required');
        return { error: 'Email and password are required' };
      }

      // Add timeout and retry logic
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      const authPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const { data, error } = await Promise.race([authPromise, timeoutPromise]);

      if (error) {
        console.error('Login error:', error);
        if (error.message.includes('timeout') || error.message.includes('Failed to fetch')) {
          toast.error('Connection timeout. Please check your internet connection and try again.');
        } else if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please check your email and confirm your account');
        } else {
          toast.error(error.message || 'Error signing in');
        }
        return { error: error.message };
      }

      if (data.user) {
        toast.success('Signed in successfully!');
        return { data };
      }
    } catch (error) {
      console.error('Error signing in:', error);
      if (error.message.includes('timeout') || error.message.includes('Failed to fetch')) {
        toast.error('Connection timeout. Please check your internet connection and Supabase connection.');
      } else {
        toast.error('Error signing in. Please try again.');
      }
      return { error: 'Error signing in' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast.error(error.message || 'Error signing out');
        return { error: error.message };
      }
      toast.success('Signed out successfully!');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  return {
    user,
    profile,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
};