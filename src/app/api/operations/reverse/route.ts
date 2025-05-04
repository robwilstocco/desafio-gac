import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { IOperation, IUser } from '@/app/types/types';

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

const updateUser = async (user: IUser) => {
  return axios.patch(`http://localhost:3001/users/${user.id}`, {
    balance: user.balance,
    operations: user.operations,
  });
};

export async function POST(req: NextRequest) {
  try {
    const { userId, reversionId } = await req.json();
    if (!userId || !reversionId) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    const user = await getUserById(userId);
    const operation = user.operations.find((op) => op.id === reversionId);
    if (!operation) {
      return NextResponse.json({ error: 'Operação não encontrada.' }, { status: 400 });
    }
    if (operation.reverted) {
      return NextResponse.json({ error: 'Operação já revertida.' }, { status: 400 });
    }

    //DEPOSITO
    if (operation.operationType === 'Depósito') {
      user.balance -= operation.value;
    } //TRANSFERENCIA ENVIADA
    else if (
      operation.operationType === 'Transferência enviada' &&
      operation.transferedTo
    ) {
      const receiver = await getUserByAccountNumber(operation.transferedTo);
      if (!receiver) {
        return NextResponse.json(
          { error: 'Conta de destino não encontrada.' },
          { status: 404 }
        );
      }

      user.balance += operation.value;

      receiver.balance -= operation.value;
      receiver.operations = receiver.operations.map((op) => {
        return op.id === reversionId
          ? { ...op, operationType: 'Revertida', reverted: true }
          : op;
      });

      await updateUser(receiver);
    } // TRANSFERENCIA RECEBIDA
    else if (
      operation.operationType === 'Transferência enviada' &&
      operation.receivedFrom
    ) {
      const sender = await getUserByAccountNumber(operation.receivedFrom);
      if (!sender) {
        return NextResponse.json(
          { error: 'Conta remetente não encontrada.' },
          { status: 404 }
        );
      }

      user.balance -= operation.value;

      sender.balance += operation.value;
      sender.operations = sender.operations.map((op) => {
        return op.id === reversionId
          ? { ...op, operationType: 'Revertida', reverted: true }
          : op;
      });

      await updateUser(sender);
    }

    user.operations = user.operations.map((op) => {
      return op.id === reversionId
        ? { ...op, operationType: 'Revertida', reverted: true }
        : op;
    });

    await updateUser(user);

    return NextResponse.json({
      message: 'Operação revertida com sucesso.',
      balance: user.balance,
      operations: user.operations.reverse(),
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: 'Erro ao processar reversão da transação.' },
      { status: 500 }
    );
  }
}
