import { ServiceProvider } from "@/services/ServiceProvider";

export const handleLogin = async (
  email: string,
  password: string,
  setError: (msg: string) => void
) => {
  try {
    await ServiceProvider.auth.signIn(email, password);
  } catch (err: any) {
    setError(err.message || "ログインに失敗しました");
  }
};
