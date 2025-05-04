import { IOperation } from '@/app/types/types';
import { FaUndo } from 'react-icons/fa';

interface IOperationClient {
  operationData: IOperation;
  hidden: boolean;
  onReverse?: (id: string) => void;
}
export default function Operation({
  operationData,
  hidden,
  onReverse,
}: IOperationClient) {
  const { id, date, operationType, value, reverted } = operationData;
  let color = '';
  switch (operationType) {
    case 'Depósito':
    case 'Transferência recebida':
      color = 'bg-green-50';
      break;
    case 'Transferência enviada':
      color = 'bg-red-50';
      break;
    default:
      color = 'bg-gray-200';
  }
  return (
    <div className={`flex justify-between items-center text-md w-4/5 ${color} p-2`}>
      <div>
        <p>{date}</p>
        <p>{operationType}</p>
        <p>{hidden ? '*****' : `R$ ${value}`}</p>
      </div>
      {!reverted && onReverse && (
        <FaUndo
          className="h-4 w-4 m-4 cursor-pointer hover:text-red-600 transition"
          onClick={() => onReverse(id)}
          title="Reverter operação"
        />
      )}
    </div>
  );
}
