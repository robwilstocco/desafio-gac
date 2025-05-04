import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { IOperation, IUser } from '@/app/types/types';

const getFormattedDate = () => {
  const date = new Date();
  return `${date.toLocaleDateString('pt-br')} ${date.toTimeString().split(' ')[0]}`;
};

const getUserById = async (id: string): Promise<IUser> => {
  const res = await axios.get(`http://localhost:3001/users/${id}`);
  return res.data;
};

const getUserByAccountNumber = async (accountNumber: string): Promise<IUser | null> => {
  const res = await axios.get(
    `http://localhost:3001/users?accountNumber=${accountNumber}`
  );
  return res.data[0] || null;
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
    const { userId, accountNumber, value } = await req.json();
    if (!userId || !value || !accountNumber) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    const sender = await getUserById(userId);
    const receiver = await getUserByAccountNumber(accountNumber);

    if (!receiver) {
      return NextResponse.json(
        { error: 'Conta de destino não encontrada.' },
        { status: 400 }
      );
    }

    if (sender.balance < value) {
      return NextResponse.json(
        { error: 'Saldo insuficiente para realizar esta transferência.' },
        { status: 400 }
      );
    }

    const date = getFormattedDate();
    const operationId = uuid();

    //sender
    const senderBalance = sender.balance - value;
    const senderOperation = {
      id: operationId,
      date,
      operationType: 'Transferência enviada',
      transferedTo: receiver.accountNumber,
      value: -value,
      reverted: false,
    };
    const updatedSenderOperations = [...sender.operations, senderOperation];
    await updateUser(sender.id, senderBalance, updatedSenderOperations);

    //receiver
    const receiverBalance = receiver.balance + value;
    const receiverOperation = {
      id: operationId,
      date,
      operationType: 'Transferência recebida',
      receivedFrom: sender.accountNumber,
      value,
      reverted: false,
    };
    const updatedReceiverOperations = [...receiver.operations, receiverOperation];
    await updateUser(receiver.id, receiverBalance, updatedReceiverOperations);

    return NextResponse.json({
      message: 'Transferência realizada com sucesso.',
      balance: sender.balance - value,
      operations: [...sender.operations, senderOperation],
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: 'Erro ao processar transferência.' },
      { status: 500 }
    );
  }
}
