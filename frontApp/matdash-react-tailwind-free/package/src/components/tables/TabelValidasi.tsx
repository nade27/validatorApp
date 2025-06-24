
import { useEffect, useState } from "react";
import { Table } from "flowbite-react";

interface TabelValidasiProps {
  refreshKey: any;
}

const TabelValidasi = ({ refreshKey }: TabelValidasiProps) => {
  const [validasiData, setValidasiData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        setLoading(false);
        return;
      }
      const data = await response.json();
      setValidasiData(data.data);
    } catch (err) {
      setError("An error occurred while fetching validation data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValidasiData();
  }, [refreshKey]);

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <h5 className="card-title">Tabel Validasi</h5>
      {error && (
        <div className="text-red-600 font-semibold text-center mb-4">{error}</div>
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
            <Table.HeadCell>Created At</Table.HeadCell>
            <Table.HeadCell>Approved At</Table.HeadCell>
            <Table.HeadCell>Approved By</Table.HeadCell>
            <Table.HeadCell>Status Validasi</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y divide-border dark:divide-darkborder">
            {loading ? (
              <Table.Row>
                <Table.Cell colSpan={10} className="text-center">
                  Loading...
                </Table.Cell>
              </Table.Row>
            ) : validasiData.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={10} className="text-center">
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
                  <Table.Cell>{new Date(item.create_timestamp).toLocaleString()}</Table.Cell>
                  <Table.Cell>{item.approval_timestamp ? new Date(item.approval_timestamp).toLocaleString() : "-"}</Table.Cell>
                  <Table.Cell>{item.approved_by}</Table.Cell>
                  <Table.Cell>{item.status_validasi}</Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};

export default TabelValidasi;
