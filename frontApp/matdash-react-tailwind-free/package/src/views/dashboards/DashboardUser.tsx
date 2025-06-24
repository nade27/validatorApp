
import { useState } from "react"
import TabelValidasi from "src/components/tables/TabelValidasi"
import FormValidasi from "src/components/forms/FormValidasi"


const Dashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <div className="grid grid-cols-12 gap-8">
      <div className="lg:col-span-12 col-span-12">
        <FormValidasi onSuccess={handleRefresh} />
      </div>
      <div className="lg:col-span-4 col-span-12">
        <div className="grid grid-cols-4 h-full items-stretch"></div>
      </div>
      <div className="lg:col-span-12 col-span-12">
        <TabelValidasi refreshKey={refreshKey} />
      </div>
    </div>
  );
}

export default Dashboard