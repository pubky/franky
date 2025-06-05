import { BootstrapTest } from '@/components/BootstrapTest';
import { ClientTest } from '@/components/ClientTest';

export default function Page() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold my-4 pl-6">Testing App</h1>
      <ClientTest />
      <BootstrapTest />
    </div>
  );
}
