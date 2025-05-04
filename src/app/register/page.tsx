'use client';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function Register() {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [repeatPassword, setRepeatPassword] = useState<string>('');
  const router = useRouter();

  const validate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !email || !password || !repeatPassword) {
      toast.error('Preencha todos os campos!');
      return;
    }
    if (password !== repeatPassword) {
      toast.error('As senhas não coincidem!');
      return;
    }

    try {
      await axios.post('/api/register', { name, email, password });
      toast.success('Cadastro realizado com sucesso!');
      setTimeout(() => router.push('/'), 2000);
    } catch (err) {
      const error = err as AxiosError;

      if (
        error.response &&
        error.response.data &&
        typeof error.response.data === 'object'
      ) {
        toast.error((error.response.data as any).error || 'Erro no cadastro.');
      } else {
        toast.error('Erro de conexão com o servidor.');
      }
      console.error(error);
    }
  };

  return (
    <div className="h-screen bg-sky-200 flex justify-center items-center">
      <form
        onSubmit={validate}
        className="bg-white w-96 max-w-full rounded-lg p-2 shadow-md"
      >
        <Link href='/'>
          <FaArrowLeft className="cursor-pointer ml-5 mt-5" />
        </Link>
        <div className="flex flex-col justify-center items-center p-8 pt-0">
          <h2 className="text-xl font-bold mb-3">Cadastro</h2>
          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend">Nome</legend>
            <input
              type="text"
              className="input input-primary"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <legend className="fieldset-legend">Email</legend>
            <input
              type="email"
              className="input input-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </fieldset>
          <div className="flex gap-3 w-full">
            <fieldset className="fieldset w-full">
              <legend className="fieldset-legend">Senha</legend>
              <input
                type="password"
                className="input input-primary"
                value={password}
                minLength={6}
                onChange={(e) => setPassword(e.target.value)}
              />
            </fieldset>
            <fieldset className="fieldset w-full">
              <legend className="fieldset-legend">Repita a senha</legend>
              <input
                type="password"
                className="input input-primary"
                value={repeatPassword}
                minLength={6}
                onChange={(e) => setRepeatPassword(e.target.value)}
              />
            </fieldset>
          </div>
          <button className="btn btn-primary mt-3 w-full" type="submit">
            Cadastre-se
          </button>
        </div>
      </form>
    </div>
  );
}
