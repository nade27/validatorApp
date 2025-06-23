import { useEffect, useState } from "react";
import { Table, Button, Modal } from "flowbite-react";

const TabelApproval = () => {
  const [validasiData, setValidasiData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // New states for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    fetchValidasiData();
  }, []);

  const fetchValidasiData = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/data/validasi", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const resData = await response.json();
        setError(resData.message || "Failed to fetch validation data");
        setValidasiData([]);
      } else {
        const json = await response.json();
        // Extract data array from response object
        const data = json.data;
        setValidasiData(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError("An error occurred while fetching validation data.");
      setValidasiData([]);
    }
    setLoading(false);
  };

  const handleApprove = async (id: number) => {
    setActionError("");
    setActionSuccess("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/data/validasi/${id}/approve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const resData = await response.json();
        setActionError(resData.message || "Failed to approve validation");
        return;
      }
      setActionSuccess("Validation approved successfully");
      fetchValidasiData();
    } catch (err) {
      setActionError("An error occurred while approving validation.");
    }
  };

  // New function to open confirmation modal
  const confirmApprove = (id: number) => {
    setSelectedId(id);
    setShowConfirmModal(true);
  };

  // New function to handle confirmation "Ya"
  const onConfirmYes = () => {
    if (selectedId !== null) {
      handleApprove(selectedId);
    }
    setShowConfirmModal(false);
    setSelectedId(null);
  };

  // New function to handle confirmation "Tidak"
  const onConfirmNo = () => {
    setShowConfirmModal(false);
    setSelectedId(null);
  };

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <h5 className="card-title">Tabel Approval</h5>
      {error && (
        <div className="text-red-600 font-semibold text-center mb-4">{error}</div>
      )}
      {actionError && (
        <div className="text-red-600 font-semibold text-center mb-4">{actionError}</div>
      )}
      {actionSuccess && (
        <div className="text-green-600 font-semibold text-center mb-4">{actionSuccess}</div>
      )}
      <div className="overflow-x-auto">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell className="p-6">Nopol</Table.HeadCell>
            <Table.HeadCell>No KIR</Table.HeadCell>
            <Table.HeadCell>Sopir</Table.HeadCell>
            <Table.HeadCell>Perusahaa Angkutan</Table.HeadCell>
            <Table.HeadCell>Jenis Truk</Table.HeadCell>
            <Table.HeadCell>Foto STNK</Table.HeadCell>
            <Table.HeadCell>Foto ID Card</Table.HeadCell>
            <Table.HeadCell>Pemohon</Table.HeadCell>
            <Table.HeadCell>Created At</Table.HeadCell>
            <Table.HeadCell>Approved At</Table.HeadCell>
            <Table.HeadCell>Status Validasi</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y divide-border dark:divide-darkborder">
            {loading ? (
              <Table.Row>
                <Table.Cell colSpan={11} className="text-center">
                  Loading...
                </Table.Cell>
              </Table.Row>
            ) : validasiData.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={11} className="text-center">
                  No validation records found.
                </Table.Cell>
              </Table.Row>
            ) : (
              validasiData.map((item, index) => (
                <Table.Row key={index}>
                  <Table.Cell>{item.nopol}</Table.Cell>
                  <Table.Cell>{item.nokir}</Table.Cell>
                  <Table.Cell>{item.sopir}</Table.Cell>
                  <Table.Cell>{item.PA}</Table.Cell>
                  <Table.Cell>{item.jenistruk}</Table.Cell>
                  <Table.Cell>
                    {item.stnk_pic ? (
                      <a href={`http://localhost:3000/${item.stnk_pic}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        View STNK
                      </a>
                    ) : (
                      "-"
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {item.card_pic ? (
                      <a href={`http://localhost:3000/${item.card_pic}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        View ID Card
                      </a>
                    ) : (
                      "-"
                    )}
                  </Table.Cell>
                  <Table.Cell>{`${item.nama_users} (${item.nip_users})`}</Table.Cell>
                  <Table.Cell>{new Date(item.create_timestamp).toLocaleString()}</Table.Cell>
                  <Table.Cell>{item.approval_timestamp ? new Date(item.approval_timestamp).toLocaleString() : "-"}</Table.Cell>
                  <Table.Cell>{item.status_validasi}</Table.Cell>
                  <Table.Cell>
                    <Button color="success" size="sm" onClick={() => confirmApprove(item.id)}>
                      Approve
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onClose={onConfirmNo} size="md" popup>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Apakah anda yakin?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={onConfirmNo}>
                Tidak
              </Button>
              <Button color="success" onClick={onConfirmYes}>
                Ya
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TabelApproval;
