import React, { useState, useEffect } from 'react';
import { Label, TextInput, Button } from 'flowbite-react';
import { jwtDecode } from 'jwt-decode';
import CameraCapture from './CameraCapture';
import Modal from '../shared/Modal';

interface UserToken {
  nama: string;
  nip: string;
}

interface FormValidasiProps {
  onSuccess: () => void;
}

const FormValidasi: React.FC<FormValidasiProps> = ({ onSuccess }) => {
  const [nopol, setNopol] = useState('');
  const [PA, setPA] = useState('');
  const [checkData, setCheckData] = useState<any>(null);
  const [checked, setChecked] = useState(false);
  // const [stnkPic, setStnkPic] = useState<File | null>(null);
  // const [cardPic, setCardPic] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<UserToken | null>(null);

  const [isStnkModalOpen, setIsStnkModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUser({ nama: decoded.nama, nip: decoded.nip });
      } catch {
        setUser(null);
      }
    }
  }, []);

  const token = localStorage.getItem('token');

  const handleCheck = async () => {
    setError('');
    setSuccess('');
    setCheckData(null);
    setChecked(false);

    if (!token) {
      setError('User not authenticated.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/data/ceknopolPA', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nopol, PA }),
      });

      if (!response.ok) {
        const resData = await response.json();
        setError(resData.message || 'Check failed');
        return;
      }

      const data = await response.json();
      setCheckData(data);
      setChecked(true);
      setSuccess(
        'Mobil TERDAFTAR di database kendaraan! Silakan ajukan approval validasi ke atasan.',
      );
    } catch (err) {
      setError('An error occurred during check. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!checked) {
      setError('Please perform the check first.');
      return;
    }

    if (!token) {
      setError('User not authenticated.');
      return;
    }

    // if (!stnkPic || !cardPic) {
    //   setError('Please upload both STNK and Card pictures.');
    //   return;
    // }

    try {
      const formData = new FormData();
      formData.append('id_data_entries', checkData.data[0].id);
      formData.append('nama_users', user?.nama || '');
      formData.append('nip_users', user?.nip || '');
      // formData.append('stnk_pic', stnkPic);
      // formData.append('card_pic', cardPic);

      const response = await fetch('http://localhost:3000/api/data/validasi', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const resData = await response.json();
        setError(resData.message || 'Pengajuan validasi gagal');
        return;
      }

      setSuccess('Pengajuan validasi BERHASIL! Silakan tunggu approval dari atasan.');
      setNopol('');
      setPA('');
      setCheckData(null);
      setChecked(false);
      // setStnkPic(null);
      // setCardPic(null);
      onSuccess(); // Call the success callback to refresh the table
    } catch (err) {
      setError('An error occurred. Please try again.');
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
          <div className="mt-4 p-4 border rounded bg-gray-50 dark:bg-gray-800 overflow-x-auto">
            <h6 className="font-semibold mb-2">Check Data Result:</h6>
            <table className="min-w-full text-sm text-left border border-gray-300 dark:border-gray-600">
              <tbody>
                <tr className="border-b dark:border-gray-700">
                  <td className="font-semibold p-2">Nopol</td>
                  <td className="p-2">{checkData.data[0].nopol}</td>
                </tr>
                <tr className="border-b dark:border-gray-700">
                  <td className="font-semibold p-2">No Kir</td>
                  <td className="p-2">{checkData.data[0].nokir}</td>
                </tr>
                <tr className="border-b dark:border-gray-700">
                  <td className="font-semibold p-2">Sopir</td>
                  <td className="p-2">{checkData.data[0].sopir}</td>
                </tr>
                <tr className="border-b dark:border-gray-700">
                  <td className="font-semibold p-2">PA</td>
                  <td className="p-2">{checkData.data[0].PA}</td>
                </tr>
                <tr className="border-b dark:border-gray-700">
                  <td className="font-semibold p-2">Jenis Truk</td>
                  <td className="p-2">{checkData.data[0].jenistruk}</td>
                </tr>
                <tr className="border-b dark:border-gray-700">
                  <td className="font-semibold p-2">P Box</td>
                  <td className="p-2">{checkData.data[0].pbox}</td>
                </tr>
                <tr className="border-b dark:border-gray-700">
                  <td className="font-semibold p-2">L Box</td>
                  <td className="p-2">{checkData.data[0].lbox}</td>
                </tr>
                <tr className="border-b dark:border-gray-700">
                  <td className="font-semibold p-2">T Box</td>
                  <td className="p-2">{checkData.data[0].tbox}</td>
                </tr>
                <tr className="border-b dark:border-gray-700">
                  <td className="font-semibold p-2">Vol Box</td>
                  <td className="p-2">{checkData.data[0].volbox}</td>
                </tr>
                <tr>
                  <td className="font-semibold p-2">Tonase</td>
                  <td className="p-2">{checkData.data[0].tonase}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* <div className="mt-4">
          <div className="flex items-center gap-4 mt-2">
            <Button color={'info'} type="button" onClick={() => setIsStnkModalOpen(true)}>
              Ambil Gambar STNK
            </Button>
            {stnkPic && (
              <span className="text-sm text-gray-700 dark:text-gray-300">📎 {stnkPic.name}</span>
            )}
          </div>
          <Modal
            isOpen={isStnkModalOpen}
            onClose={() => setIsStnkModalOpen(false)}
            title="Ambil Gambar STNK"
          >
            <CameraCapture
              label="STNK Picture"
              isOpen={isStnkModalOpen}
              onClose={() => setIsStnkModalOpen(false)}
              onCapture={(file) => setStnkPic(file)}
            />
          </Modal>

          <div className="mt-4">
            <div className="flex items-center gap-4 mt-4">
              <Button color={'info'} type="button" onClick={() => setIsCardModalOpen(true)}>
                Ambil Gambar Card
              </Button>
              {cardPic && (
                <span className="text-sm text-gray-700 dark:text-gray-300">📎 {cardPic.name}</span>
              )}
            </div>
            <Modal
              isOpen={isCardModalOpen}
              onClose={() => setIsCardModalOpen(false)}
              title="Ambil Gambar Card"
            >
              <CameraCapture
                label="Card Picture"
                isOpen={isCardModalOpen}
                onClose={() => setIsCardModalOpen(false)}
                onCapture={(file) => setCardPic(file)}
              />
            </Modal>
          </div>
        </div> */}
        <div className="flex gap-3 mt-6">
          <Button color={'info'} type="button" onClick={handleCheck}>
            Check
          </Button>
          <Button color={'primary'} type="submit" disabled={!checked}>
            Submit
          </Button>
          <Button
            color={'error'}
            type="button"
            onClick={() => {
              setNopol('');
              setPA('');
              setError('');
              setSuccess('');
              setCheckData(null);
              setChecked(false);
              // setStnkPic(null);
              // setCardPic(null);
            }}
          >
            Cancel
          </Button>
        </div>
        {error && <div className="text-red-600 font-semibold text-center mt-4">{error}</div>}
        {success && <div className="text-green-600 font-semibold text-center mt-4">{success}</div>}
      </form>
    </div>
  );
};

export default FormValidasi;
