import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Todo List</h1>
          <Link
            href="/login"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Login
          </Link>
        </div>
      </header>

      <section className="flex-1 flex flex-col justify-center items-center text-center px-6 py-4">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Organize Your Tasks Easily
        </h2>
        <p className="text-gray-600 text-lg mb-6">
          Manage your daily activities with our simple and effective Todo List app
        </p>
        <Link
          href="/register"
          className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-600"
        >
          Get Started
        </Link>
      </section>

      <section className="bg-white py-12">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Why Choose Our Todo List?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-200 p-6 rounded-lg text-center">
              <h4 className="text-xl font-semibold mb-2 text-blue-600">Easy to Use</h4>
              <p className="text-gray-600">Simple and intuitive UI to help you stay productive.</p>
            </div>
            <div className="bg-gray-200 p-6 rounded-lg text-center">
              <h4 className="text-xl font-semibold mb-2 text-blue-600">Stay Organized</h4>
              <p className="text-gray-600">Categorize tasks and track your progress efficiently.</p>
            </div>
            <div className="bg-gray-200 p-6 rounded-lg text-center">
              <h4 className="text-xl font-semibold mb-2 text-blue-600">Cloud Sync</h4>
              <p className="text-gray-600">Access your tasks from any device anytime.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-white text-center py-4 mt-auto">
        <p>&copy; 2025 Todo List App. All rights reserved.</p>
      </footer>
    </div>
  );
}