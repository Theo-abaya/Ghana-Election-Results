export default function Header() {
  return (
    <header className="bg-white shadow-md p-4 flex items-center gap-4">
      <img
        src="../../assets/Election_hub.png"
        alt="Election Hub Logo"
        className="h-12 w-auto"
      />
      <div>
        <h1 className="text-2xl font-bold text-primary">Election Hub</h1>
        <p className="text-sm text-gray-600 italic">
          where democracy meets precision
        </p>
      </div>
    </header>
  );
}
