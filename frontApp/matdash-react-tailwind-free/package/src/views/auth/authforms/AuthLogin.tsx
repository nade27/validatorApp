import { Button, Label, TextInput } from "flowbite-react";
import { useNavigate } from "react-router";
import React, { useState } from "react";

const AuthLogin = () => {
  const navigate = useNavigate();
  const [NIP, setNIP] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ NIP, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Login failed");
        return;
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);

      // Decode token to get role
      const base64Url = data.token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const user = JSON.parse(jsonPayload);

      if (user.role === 'Admin' || user.role === 'Supervisor') {
        navigate("/dashboardadmin");
      } else if (user.role === 'User') {
        navigate("/dashboarduser");
      } else {
        navigate("/auth/404");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="NIP" value="NIP" />
          </div>
          <TextInput
            id="NIP"
            type="text"
            sizing="md"
            required
            className="form-control form-rounded-xl"
            value={NIP}
            onChange={(e) => setNIP(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="userpwd" value="Password" />
          </div>
          <TextInput
            id="userpwd"
            type="password"
            sizing="md"
            required
            className="form-control form-rounded-xl"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex justify-between my-5">
          <div className="flex items-center gap-2">
          </div>
        </div>
        {error && (
          <div className="mb-4 text-red-600 font-semibold text-center">
            {error}
          </div>
        )}
        <Button
          type="submit"
          color={"primary"}
          className="w-full bg-primary text-white rounded-xl"
        >
          Sign in
        </Button>
      </form>
    </>
  );
};

export default AuthLogin;
