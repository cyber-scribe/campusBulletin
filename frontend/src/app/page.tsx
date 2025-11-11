"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import API from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "staff" | "student">("student");
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const { login, isAuthenticated, isLoading, isAdmin, isStaff, isStudent } = useAuth();
  const router = useRouter();

  // Registration form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    studentId: ""
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState("");
  const [isLoadingReg, setIsLoadingReg] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      if (isAdmin) router.push("/admin/dashboard");
      else if (isStaff) router.push("/staff/dashboard");
      else if (isStudent) router.push("/student/dashboard");
    }
  }, [isAuthenticated, isLoading, isAdmin, isStaff, isStudent, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password, role);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoadingReg(true);

    try {
      await API.post("/auth/student/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        studentId: formData.studentId
      });

      setSuccess("Registration successful! You can now login.");
      setTimeout(() => {
        setIsRegisterMode(false);
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          studentId: ""
        });
        setSuccess("");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoadingReg(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError("");
    setSuccess("");
    setEmail("");
    setPassword("");
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      studentId: ""
    });
  };

  return (
    <div className="flex flex-row min-h-screen min-h-[100dvh]">
      {/* Left Panel */}
      <div
        className="flex w-1/2 justify-center items-center text-white text-5xl font-extrabold tracking-wide shadow-2xl"
        style={{
          background:
            "linear-gradient(125deg,rgb(28, 28, 31),rgb(103, 98, 158),rgb(26, 26, 67))",
        }}
      >
        <div className="drop-shadow-xl shadow-black flex-col">
        <div className="text-5xl text-center">CAMPUS BULLETIN</div>
        <div className="text-lg font-semibold text-center tracking-widest">Your go-to board for everything happening on campus
        </div></div>
      </div>

      {/* Right Panel */}
      <div className="flex w-1/2 bg-gray-50 flex-col justify-center px-8 lg:px-16">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            {isRegisterMode ? "Student Registration" : "Welcome to Campus Bulletin"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isRegisterMode ? "Create your student account" : "Sign in to access your dashboard"}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/90 backdrop-blur-md py-10 px-8 shadow-xl rounded-2xl border border-gray-100">
            {error && (
              <div className="mb-4 text-red-600 text-sm text-center font-medium">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 text-green-600 text-sm text-center font-medium">
                {success}
              </div>
            )}

            {!isRegisterMode ? (
              // Login Form
              <form className="space-y-6" onSubmit={handleSubmit}>
                              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2 block w-full rounded-xl border border-gray-300 shadow-sm py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>

              {/* Password */}
              <div>
                                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative mt-2">
                    <input
                      type={show ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="block w-full rounded-xl border border-gray-300 shadow-sm py-2 px-3 pr-12 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 transition"
                    >
                      {show ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-10-8-10-8a18.31 18.31 0 0 1 5.06-6.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 10 8 10 8a18.3 18.3 0 0 1-3.22 4.18M14.12 9.88A3 3 0 1 1 9.88 14.12M1 1l22 22" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path d="M1 12s3-8 11-8 11 8 11 8-3 8-11 8-11-8-11-8Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="mt-2 block w-full rounded-xl border border-gray-300 shadow-sm py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

                {/* Submit */}
                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 rounded-xl shadow-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-400 transition-all duration-200"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            ) : (
              // Registration Form
              <form className="space-y-6" onSubmit={handleRegisterSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleRegisterChange}
                    required
                    className="mt-2 block w-full rounded-xl border border-gray-300 shadow-sm py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleRegisterChange}
                    required
                    className="mt-2 block w-full rounded-xl border border-gray-300 shadow-sm py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Student ID (Optional)
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleRegisterChange}
                    className="mt-2 block w-full rounded-xl border border-gray-300 shadow-sm py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative mt-2">
                    <input
                      type={showPwd ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleRegisterChange}
                      required
                      minLength={6}
                      className="block w-full rounded-xl border border-gray-300 shadow-sm py-2 px-3 pr-12 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 transition"
                    >
                      {showPwd ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-10-8-10-8a18.31 18.31 0 0 1 5.06-6.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 10 8 10 8a18.3 18.3 0 0 1-3.22 4.18M14.12 9.88A3 3 0 1 1 9.88 14.12M1 1l22 22"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M1 12s3-8 11-8 11 8 11 8-3 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative mt-2">
                    <input
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleRegisterChange}
                      required
                      className="block w-full rounded-xl border border-gray-300 shadow-sm py-2 px-3 pr-12 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 transition"
                    >
                      {showConfirm ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-10-8-10-8a18.31 18.31 0 0 1 5.06-6.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 10 8 10 8a18.3 18.3 0 0 1-3.22 4.18M14.12 9.88A3 3 0 1 1 9.88 14.12M1 1l22 22"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M1 12s3-8 11-8 11 8 11 8-3 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoadingReg}
                    className="w-full flex justify-center py-3 px-4 rounded-xl shadow-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-400 transition-all duration-200 disabled:opacity-50"
                  >
                    {isLoadingReg ? "Creating Account..." : "Create Account"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            {isRegisterMode ? (
              <>
                Already have an account?{" "}
                <button
                  onClick={toggleMode}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                New student?{" "}
                <button
                  onClick={toggleMode}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Create an account
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
