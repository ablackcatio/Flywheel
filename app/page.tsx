import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="container mx-auto h-screen flex items-center justify-center">
        <div className="w-full h-full max-h-[800px]">
          <ChatInterface />
        </div>
      </div>
    </main>
  );
}

