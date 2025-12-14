import { supabase } from "./supabase";
import { isMockMode } from "./mock-data";

// Usuário mock para desenvolvimento
const mockUser = {
  id: "mock-user-id",
  email: "teste@gmail.com",
  created_at: new Date().toISOString(),
};

const mockSession = {
  user: mockUser,
  access_token: "mock-token",
  expires_at: Date.now() + 3600000,
};

export const auth = {
  async signIn(email: string, password: string) {
    if (isMockMode()) {
      // Simular delay de requisição
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Validar credenciais mock
      if (email === "teste@gmail.com" && password === "123") {
        // Salvar sessão mock no localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("mock-session", JSON.stringify(mockSession));
        }
        return { user: mockUser, session: mockSession };
      }
      throw new Error("Credenciais inválidas");
    }

    if (!supabase) throw new Error("Supabase não configurado");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    if (isMockMode()) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("mock-session");
      }
      return;
    }

    if (!supabase) throw new Error("Supabase não configurado");
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getUser() {
    if (isMockMode()) {
      if (typeof window !== "undefined") {
        const session = localStorage.getItem("mock-session");
        if (session) {
          return JSON.parse(session).user;
        }
      }
      return null;
    }

    if (!supabase) throw new Error("Supabase não configurado");
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async getSession() {
    if (isMockMode()) {
      if (typeof window !== "undefined") {
        const session = localStorage.getItem("mock-session");
        if (session) {
          return JSON.parse(session);
        }
      }
      return null;
    }

    if (!supabase) throw new Error("Supabase não configurado");
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },
};

