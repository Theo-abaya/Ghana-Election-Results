const LoginPage = () => {
  return (
    <div className="flex justify-center items-center h-[70vh]">
      <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-xl font-bold text-center mb-4 text-blue-600">
          Login
        </h1>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded-md px-3 py-2"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-md px-3 py-2"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
