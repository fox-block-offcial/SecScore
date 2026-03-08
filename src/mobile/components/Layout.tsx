import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { TabBar } from 'antd-mobile'
import {
  HomeOutlined,
  PlusCircleOutlined,
  TrophyOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { useTheme } from '../App'

const tabs = [
  { key: '/', title: '主页', icon: <HomeOutlined /> },
  { key: '/score', title: '积分', icon: <PlusCircleOutlined /> },
  { key: '/leaderboard', title: '排行', icon: <TrophyOutlined /> },
  { key: '/settings', title: '设置', icon: <SettingOutlined /> }
]

export function MobileLayout(): React.JSX.Element {
  const location = useLocation()
  const navigate = useNavigate()
  const { isDark } = useTheme()

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5'
      }}
    >
      <div style={{ paddingBottom: '50px' }}>
        <Outlet />
      </div>
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: isDark ? '#2a2a2a' : '#fff',
          borderTop: `1px solid ${isDark ? '#333' : '#eee'}`
        }}
      >
        <TabBar
          activeKey={location.pathname}
          onChange={(key) => navigate(key)}
          items={tabs.map((tab) => ({
            key: tab.key,
            title: tab.title,
            icon: tab.icon
          }))}
          style={{
            '--color': isDark ? '#999' : '#666',
            '--active-color': '#1890ff',
            backgroundColor: 'transparent'
          }}
        />
      </div>
    </div>
  )
}
