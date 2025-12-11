/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import AuthRepository from "@/services/repositories/AuthRepository";
import UserRepository from "@/services/repositories/UserRepository";
import { setCookie } from "cookies-next";
import { useAlert } from "@/app/context/alertContext";
import Loader from "@/components/loader";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);

  const { showAlert } = useAlert();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const { user } = await AuthRepository.login(email, password);
      const userData = await UserRepository.getById(user.uid);

      if (!userData) {
        showAlert("Você não é administrador.", "error");
        return;
      }

      setCookie("admin_user", JSON.stringify({ id: user.uid }), {
        maxAge: 60 * 60 * 24,
      });

      window.location.href = "/admin";
    } catch (err) {
      showAlert("Usuário não encontrado", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const { user } = await AuthRepository.register(email, password);

      const success = await UserRepository.create({
        id: user.uid,
        email,
        name,
        role: "guest",
        createdAt: new Date().toISOString(),
      });

      if (!success) {
        showAlert("Erro ao salvar usuário no banco de dados.", "error");
        return;
      }

      showAlert("Conta criada com sucesso!", "success");

      setCookie("admin_user", JSON.stringify({ id: user.uid }), {
        maxAge: 60 * 60 * 24,
      });

      setMode("login");
    } catch (error: any) {
      console.error(error);

      const code = error?.code || "";

      if (code === "auth/email-already-in-use") {
        showAlert("Este email já está em uso.", "error");
      } else if (code === "auth/invalid-email") {
        showAlert("O email informado é inválido.", "error");
      } else if (code === "auth/weak-password") {
        showAlert("A senha precisa ter pelo menos 6 caracteres.", "error");
      } else if (code === "auth/missing-password") {
        showAlert("Digite uma senha válida.", "error");
      } else if (code === "auth/operation-not-allowed") {
        showAlert("Cadastro de usuários está desativado no Firebase.", "error");
      } else {
        showAlert("Erro ao cadastrar: " + error.message, "error");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-card p-8">
        {/* Título */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {mode === "login" ? "Área de Administrador" : "Criar Conta"}
        </h2>

        {/* FORM LOGIN */}
        {mode === "login" && (
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full bg-primary-green hover:border-primary-green hover:bg-transparent hover:text-primary-green border border-transparent cursor-pointer text-white font-medium py-2.5 rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {loading ? <Loader /> : "Entrar"}
            </button>
          </form>
        )}

        {/* FORM CADASTRO */}
        {mode === "register" && (
          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full bg-primary-green hover:border-primary-green hover:bg-transparent hover:text-primary-green border border-transparent cursor-pointer text-white font-medium py-2.5 rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {loading ? <Loader /> : "Cadastrar"}
            </button>
          </form>
        )}

        {/* FOOTER: troca login/cadastro */}
        <div className="mt-4 text-center text-sm text-gray-600">
          {mode === "login" ? (
            <>
              Não tem uma conta?
              <button
                onClick={() => setMode("register")}
                className="text-primary-green hover:underline font-medium ml-2 cursor-pointer"
              >
                Cadastrar
              </button>
            </>
          ) : (
            <>
              Já tem uma conta?
              <button
                onClick={() => setMode("login")}
                className="text-primary-green hover:underline font-medium ml-2 cursor-pointer"
              >
                Entrar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
