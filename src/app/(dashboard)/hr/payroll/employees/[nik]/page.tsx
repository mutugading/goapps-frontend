import EmployeeDetailClient from "./employee-detail-client"

export default async function PayrollEmployeeDetailPage({ params }: { params: Promise<{ nik: string }> }) {
  const { nik } = await params
  return <EmployeeDetailClient nik={decodeURIComponent(nik)} />
}
