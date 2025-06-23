
import  TabelApproval  from "src/components/tables/TabelApproval"


const Dashboard = () => {
  return (
    <div className="grid grid-cols-4 gap-30">
    <div className="lg:col-span-4 col-span-16">
      <div className="grid grid-cols-4 h-full items-stretch">
      </div>
    </div>
    <div className="lg:col-span-8 col-span-12">
      <TabelApproval />
    </div>
  </div>
  )
}

export default Dashboard