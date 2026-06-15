import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [permisos, setPermisos] = useState({
    can_view_estudiantes: true,
    can_edit: true,
    can_download: true
  });
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (data) {
        setUserProfile(data);
        
        // Determinar permisos base según el rol
        let basePerms = {
          can_view_estudiantes: true,
          can_view_agenda: true,
          can_view_ia: true,
          can_edit: true,
          can_download: true
        };

        if (data.rol === 'Lector' || data.rol === 'Pendiente') {
          basePerms = {
            can_view_estudiantes: false,
            can_view_agenda: false,
            can_view_ia: false,
            can_edit: false,
            can_download: false
          };
        }

        let calculatedPerms = { ...basePerms };

        // Si tiene permisos JSON configurados, sobrescriben la base
        if (data.permisos) {
          calculatedPerms = { ...calculatedPerms, ...data.permisos };
        }
        setPermisos(calculatedPerms);
      } else {
        // Fallback for when profile doesn't exist yet
        setUserProfile({ rol: 'Pendiente' });
        setPermisos({ can_view_estudiantes: false, can_edit: false, can_download: false });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, userProfile, permisos, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
