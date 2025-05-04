import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { IOperation, IUser } from '@/app/types/types';

const getFormattedDate = () => {
  const date = new Date();
  return `${date.toLocaleDateString('pt-br')} ${date.toTimeString().split(' ')[0]}`;
};

const getUserData = async (userId: string): Promise<IUser> => {
  const userRes = await axios.get(`http://localhost:3001/users/${userId}`);
  return userRes.data;
};

const updateUser = async (
  userId: string,
  balance: number,
  operations: IOperation[]
) => {
  return axios.patch(`http://localhost:3001/users/${userId}`, {
    balance,
    operations,
  });
};

export async function POST(req: NextRequest) {
  try {
    const { userId, value } = await req.json();

    if (!userId || typeof value !== 'number' || value <= 0) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    const user = await getUserData(userId);
    const updatedBalance = user.balance + value;
    const operationId = uuid();
    const newOperation = {
      id: operationId,
      date: getFormattedDate(),
      operationType: 'Depósito',
      value,
      reverted: false,
    };
    const updatedOperations = [...user.operations, newOperation];

    await updateUser(userId, updatedBalance, updatedOperations);

    return NextResponse.json({
      message: 'Depósito realizado com sucesso.',
      balance: updatedBalance,
      operations: updatedOperations,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: 'Erro ao processar o depósito.' },
      { status: 500 }
    );
  }
}
