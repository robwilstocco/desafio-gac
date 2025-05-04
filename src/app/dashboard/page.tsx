import Header from '@/components/Header';
import DashboardClient from '@/components/DashboardClient';
import Footer from '@/components/Footer';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/');
  }
  return (
    <main className="h-screen flex flex-col bg-sky-200">
      <Header user={session.user} />
      <DashboardClient user={session.user} />
      <Footer />
    </main>
  );
}
