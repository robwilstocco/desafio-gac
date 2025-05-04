import { NextResponse } from 'next/server';
import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { IUser } from '@/app/types/types';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  const salt = bcrypt.genSaltSync(10);

  const body = await req.json();
  const { email, name, password } = body;
  const encryptedPassword: string = bcrypt.hashSync(password, salt);

  try {
    const res = await axios.get(`http://localhost:3001/users?email=${email}`);
    if (res.data.length > 0) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 });
    }

    const newUser: IUser = {
      id: uuid(),
      accountNumber: uuid(),
      name,
      email,
      password: encryptedPassword,
      balance: 0,
      operations: [],
    };

    await axios.post('http://localhost:3001/users', newUser);

    return NextResponse.json(
      { message: 'Usuário criado com sucesso' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro no cadastro', error);
    return NextResponse.json({ error: 'Erro no servidor interno' }, { status: 500 });
  }
}
