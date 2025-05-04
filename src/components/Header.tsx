'use client';
import { ISession } from '@/app/types/types';
import { signOut } from 'next-auth/react';
import { FaRegUserCircle } from 'react-icons/fa';

export default function Header({ user }: ISession) {
  return (
    <header className="h-24 px-[20%] max-xl:px-5 flex justify-between items-center bg-blue-900 text-white text-lg">
      <p>Grupo Adriano Cobuccio</p>
      <div className="flex justify-center items-center gap-3">
        <p>{user?.name}</p>
        <ul className="menu menu-horizontal px-1">
          <li>
            <details>
              <summary>
                <FaRegUserCircle className=" h-8 w-8 text-blue-500" />
              </summary>
              <ul className="bg-blue-900 rounded-t-none p-2">
                <li>
                  <button onClick={() => signOut()}>Logout</button>
                </li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
    </header>
  );
}
