import React, { useState, useEffect } from "react";
import { Label, TextInput, Button } from "flowbite-react";
import { jwtDecode } from "jwt-decode";

interface UserToken {
  nama: string;
  nip: string;
}

const FormValidasi = () => {
  const [nopol, setNopol] = useState("");
  const [PA, setPA] = useState("");
  const [checkData, setCheckData] = useState<any>(null);
  const [checked, setChecked] = useState(false);
  const [stnkPic, setStnkPic] = useState<File | null>(null);
  const [cardPic, setCardPic] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState<UserToken | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUser({ nama: decoded.nama, nip: decoded.NIP });
      } catch {
        setUser(null);
      }
    }
  }, []);

  const token = localStorage.getItem("token");

  const handleCheck = async () => {
    setError("");
    setSuccess("");
    setCheckData(null);
    setChecked(false);

    if (!token) {
      setError("User not authenticated.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/data/ceknopolPA", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nopol, PA }),
      });

      if (!response.ok) {
        const resData = await response.json();
        setError(resData.message || "Check failed");
        return;
      }

      const data = await response.json();
      setCheckData(data);
      setChecked(true);
      setSuccess("Mobil terdaftar di database kendaraan! Silakan ajukan approval validasi ke atasan.");
    } catch (err) {
      setError("An error occurred during check. Please try again.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (e.target.id === "stnk_pic") {
        setStnkPic(file);
      } else if (e.target.id === "card_pic") {
        setCardPic(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!checked) {
      setError("Please perform the check first.");
      return;
    }

    if (!token) {
      setError("User not authenticated.");
      return;
    }

    if (!stnkPic || !cardPic) {
      setError("Please upload both STNK and Card pictures.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("id_data_entries", checkData.data[0].id);
      formData.append("nama_users", user?.nama || "");
      formData.append("nip_users", user?.nip || "");
      formData.append("stnk_pic", stnkPic);
      formData.append("card_pic", cardPic);

      const response = await fetch("http://localhost:3000/api/data/validasi", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const resData = await response.json();
        setError(resData.message || "Pengajuan validasi gagal");
        return;
      }

      setSuccess("Pengajuan validasi BERHASIL! Silakan tunggu approval dari atasan.");
      setNopol("");
      setPA("");
      setCheckData(null);
      setChecked(false);
      setStnkPic(null);
      setCardPic(null);
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <h5 className="card-title">Form Validasi</h5>
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="nopol" value="Nopol" />
          </div>
          <TextInput
            id="nopol"
            type="text"
            placeholder="Enter Nopol"
            required
            className="form-control form-rounded-xl"
            value={nopol}
            onChange={(e) => setNopol(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="PA" value="PA" />
          </div>
          <TextInput
            id="PA"
            type="text"
            placeholder="Enter PA"
            required
            className="form-control form-rounded-xl"
            value={PA}
            onChange={(e) => setPA(e.target.value)}
          />
        </div>
        
        {checkData && checkData.data && checkData.data.length > 0 && (
          <div className="mt-4 p-4 border rounded bg-gray-50 dark:bg-gray-800">
            <h6 className="font-semibold mb-2">Check Data Result:</h6>
            <ul className="text-sm list-disc list-inside">
              <li><strong>Nopol:</strong> {checkData.data[0].nopol}</li>
              <li><strong>No Kir:</strong> {checkData.data[0].nokir}</li>
              <li><strong>Sopir:</strong> {checkData.data[0].sopir}</li>
              <li><strong>PA:</strong> {checkData.data[0].PA}</li>
              <li><strong>Jenis Truk:</strong> {checkData.data[0].jenistruk}</li>
              <li><strong>P Box:</strong> {checkData.data[0].pbox}</li>
              <li><strong>L Box:</strong> {checkData.data[0].lbox}</li>
              <li><strong>T Box:</strong> {checkData.data[0].tbox}</li>
              <li><strong>Vol Box:</strong> {checkData.data[0].volbox}</li>
              <li><strong>Tonase:</strong> {checkData.data[0].tonase}</li>
            </ul>
          </div>
        )}
        
        <div className="mt-4">
          <div>
            <Label htmlFor="stnk_pic" value="STNK Picture  " />
            <input
              id="stnk_pic"
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setStnkPic(e.target.files[0]);
                }
              }}
              required
              className="form-control form-rounded-xl"
            />
          </div>
          <div className="mt-4">
            <Label htmlFor="card_pic" value="Card Picture  " />
            <input
              id="card_pic"
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setCardPic(e.target.files[0]);
                }
              }}
              required
              className="form-control form-rounded-xl"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button color={"info"} type="button" onClick={handleCheck}>
            Check
          </Button>
          <Button color={"primary"} type="submit" disabled={!checked}>
            Submit
          </Button>
          <Button
            color={"error"}
            type="button"
            onClick={() => {
              setNopol("");
              setPA("");
              setError("");
              setSuccess("");
              setCheckData(null);
              setChecked(false);
              setStnkPic(null);
              setCardPic(null);
            }}
          >
            Cancel
          </Button>
        </div>
        {error && (
          <div className="text-red-600 font-semibold text-center mt-4">
            {error}
          </div>
        )}
        {success && (
          <div className="text-green-600 font-semibold text-center mt-4">
            {success}
          </div>
        )}
      </form>
    </div>
  );
};

export default FormValidasi;
