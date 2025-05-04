'use client';
import { FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  const validate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    const res = await signIn('credentials', {
      ...data,
      redirect: false,
    });

    if (res?.error) {
      toast.error('Email ou senha inválidos!');
    } else if (res?.ok) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="h-screen bg-sky-200 flex justify-center items-center">
      <form
        onSubmit={validate}
        className="bg-white w-96 max-w-full rounded-lg p-12 flex flex-col justify-center items-center gap-4 shadow-md"
      >
        <h2 className="text-xl font-bold mb-3">Informe seu Login</h2>
        <input
          required
          name="email"
          type="email"
          placeholder="Email"
          className="input input-primary w-full"
        />
        <input
          required
          name="password"
          type="password"
          placeholder="Senha"
          className="input input-primary w-full"
        />
        <div className="flex w-full justify-end px-3">
          <Link href="/register" >
            <p className=" text-gray-500 font-bold text-right text-sm">Cadastre-se</p>
          </Link>
        </div>
        <button className="btn btn-primary mt-3 w-full" type="submit">
          Login
        </button>
      </form>
    </div>
  );
}
