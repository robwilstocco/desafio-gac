'use client';
import { IOperation, ISession, IUser, OperationType } from '@/app/types/types';
import axios, { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Operation from './Operation';
import { toast } from 'react-toastify';

export default function DashboardClient({ user }: ISession) {
  const [userData, setUserData] = useState<IUser | null>(null);
  const [hideBalance, setHideBalance] = useState(false);
  const [operationType, setOperationType] = useState<OperationType>('default');
  const [value, setValue] = useState(0);
  const [transferAccount, setTransferAccount] = useState('');

  useEffect(() => {
    async function getUser() {
      console.log(user)
      try {
        const res = await axios.get(`http://localhost:3001/users?email=${user?.email}`);
        setUserData(res.data[0]);
      } catch (err) {
        toast.error('Erro ao carregar dados do usuário.');
        console.error(err);
      }
    }

    getUser();
  }, [user?.email]);

  const clearFields = () => {
    setValue(0);
    setTransferAccount('');
    setOperationType('default');
  };

  const handleOperation = async (
    endpoint: string,
    payload: object,
    onSuccess: (data: { balance: number; operations: IOperation[] }) => void
  ) => {
    try {
      const res = await axios.post(endpoint, payload);
      onSuccess(res.data);
    } catch (err) {
      const error = err as AxiosError;
      const errorMessage =
        error.response?.data && typeof error.response.data === 'object'
          ? (error.response.data as any).error
          : 'Erro de conexão com o servidor.';
      toast.error(errorMessage);
      console.error(error);
    } finally {
      clearFields();
    }
  };

  const handleDeposit = () => {
    if (!userData) return;
    if (value <= 0) return toast.error('Digite apenas valores positivos!');
    handleOperation(
      '/api/operations/deposit',
      { userId: userData.id, value },
      (data) => {
        setUserData({
          ...userData,
          balance: data.balance,
          operations: data.operations,
        });
      }
    );
  };

  const handleTransfer = () => {
    if (!userData) return;
    if (value <= 0) return toast.error('Digite apenas valores positivos!');
    if (transferAccount === userData.accountNumber)
      return toast.error('Não é permitido transferir para si!');
    handleOperation(
      '/api/operations/transfer',
      { userId: userData.id, accountNumber: transferAccount, value },
      (data) => {
        setUserData({
          ...userData,
          balance: data.balance,
          operations: data.operations,
        });
      }
    );
  };

  const handleReverse = (reversionId: string) => {
    if (!userData) return;
    handleOperation(
      '/api/operations/reverse',
      { userId: userData.id, reversionId },
      (data) => {
        setUserData({
          ...userData,
          balance: data.balance,
          operations: data.operations,
        });
      }
    );
  };

  const handleSubmit = () => {
    if (operationType === 'deposit') handleDeposit();
    else if (operationType === 'transfer') handleTransfer();
  };

  return (
    <div className="h-[80%] flex flex-col flex-1 px-[20%] max-xl:px-5 gap-10 p-10">
      <div className="bg-white h-6/10 w-full flex flex-col shadow-xl/30 p-10 rounded-lg gap-5">
        <div>
          <div className="flex justify-between items-center">
            <h2 className="text-3xl">Olá, {user?.name}</h2>
            <div className="flex gap-2 text-xl">
              <h3 className="font-bold">Número da conta:</h3>
              <p className="text-lg">{userData?.accountNumber}</p>
            </div>
          </div>
          <hr />
        </div>
        <div className="h-[90%] flex p-10">
          <div className="flex-2">
            <div className="flex gap-3 items-center">
              <h3 className="text-2xl font-bold">Saldo em conta</h3>
              <button
                className="cursor-pointer text-blue-900"
                onClick={() => setHideBalance(!hideBalance)}
              >
                {hideBalance ? (
                  <FaEyeSlash className="w-6 h-6" />
                ) : (
                  <FaEye className="w-6 h-6" />
                )}
              </button>
            </div>
            <p className="text-xl">
              {hideBalance ? '*****' : `R$ ${userData?.balance}`}
            </p>
          </div>
          <div className="divider lg:divider-horizontal" />
          <div className="flex-2 mx-10">
            <h3 className="text-2xl font-bold">Histórico</h3>
            <div className="h-[90%] overflow-y-auto my-5 flex flex-col gap-5">
              {userData?.operations
                ?.slice()
                .reverse()
                .map((operation) => (
                  <Operation
                    key={operation.id}
                    operationData={operation}
                    hidden={hideBalance}
                    onReverse={(id) => {
                      handleReverse(id);
                    }}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white h-4/10 w-full flex flex-col shadow-xl/30 p-10 rounded-lg gap-5">
        <div>
          <h2 className="text-3xl">Operações</h2>
          <hr />
        </div>
        <div className="flex flex-col gap-2 w-1/3 max-md:w-full">
          <select
            className="select select-primary w-full"
            value={operationType}
            onChange={(e) => setOperationType(e.target.value as OperationType)}
          >
            <option disabled value="default">
              Selecione uma operação
            </option>
            <option value="deposit">Depósito</option>
            <option value="transfer">Transferência</option>
          </select>
          <div className="flex w-full gap-2">
            {operationType === 'transfer' && (
              <fieldset className="fieldset flex-4">
                <legend className="fieldset-legend">Conta</legend>
                <input
                  type="text"
                  className="input input-primary"
                  value={transferAccount}
                  onChange={(e) => setTransferAccount(e.target.value)}
                />
              </fieldset>
            )}

            <fieldset className="fieldset flex-2">
              <legend className="fieldset-legend">Valor</legend>
              <input
                type="number"
                className="input input-primary"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
              />
            </fieldset>
          </div>

          <button
            className="btn btn-primary w-full max-md:w-full mt-5"
            disabled={operationType === 'default'}
            onClick={handleSubmit}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
