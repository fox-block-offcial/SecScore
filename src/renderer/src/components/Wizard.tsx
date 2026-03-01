import React, { useState } from 'react'
import { Modal, message, Typography } from 'antd'
import { ThemeQuickSettings } from './ThemeQuickSettings'

interface wizardProps {
  visible: boolean
  onComplete: () => void
}

export const Wizard: React.FC<wizardProps> = ({ visible, onComplete }) => {
  const [loading, setLoading] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()

  const handleFinish = async () => {
    setLoading(true)
    try {
      if (!(window as any).api) throw new Error('api not ready')
      const res = await (window as any).api.setSetting('is_wizard_completed', true)
      if (!res?.success) throw new Error(res?.message || 'failed')

      messageApi.success('配置完成！')
      onComplete()
    } catch {
      messageApi.error('配置保存失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="欢迎使用 SecScore 积分管理"
      open={visible}
      onOk={handleFinish}
      onCancel={() => {}}
      confirmLoading={loading}
      okText="开启积分之旅"
      cancelButtonProps={{ style: { display: 'none' } }}
      closable={false}
      mask={{ closable: false }}
      keyboard={false}
      width={500}
    >
      {contextHolder}
      <Typography.Paragraph style={{ marginBottom: '24px', color: 'var(--ss-text-secondary)' }}>
        感谢选择 SecScore。在开始之前，请花一分钟完成基础配置。
      </Typography.Paragraph>

      <ThemeQuickSettings compact />
    </Modal>
  )
}
