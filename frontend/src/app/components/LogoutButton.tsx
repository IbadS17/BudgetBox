"use client";

export default function LogoutButton() {
  function handleLogout() {
    localStorage.removeItem("email");
    window.location.href = "/login";
  }

  return (
    <button
      onClick={handleLogout}
      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
    >
      Logout
    </button>
  );
}
