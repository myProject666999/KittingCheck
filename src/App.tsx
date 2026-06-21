import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import OrderList from '@/pages/OrderList'
import OrderCreate from '@/pages/OrderCreate'
import OrderDetail from '@/pages/OrderDetail'
import InboundEntry from '@/pages/InboundEntry'
import InboundRecords from '@/pages/InboundRecords'
import KanbanBoard from '@/pages/KanbanBoard'
import ShortageSummary from '@/pages/ShortageSummary'
import ReleaseManagement from '@/pages/ReleaseManagement'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/orders" replace />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="orders/create" element={<OrderCreate />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="inbound" element={<InboundEntry />} />
          <Route path="inbound/records" element={<InboundRecords />} />
          <Route path="kanban" element={<KanbanBoard />} />
          <Route path="kanban/shortages" element={<ShortageSummary />} />
          <Route path="release" element={<ReleaseManagement />} />
        </Route>
      </Routes>
    </Router>
  )
}
