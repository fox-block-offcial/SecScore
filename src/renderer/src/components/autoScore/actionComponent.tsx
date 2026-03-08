import { Space, Input, InputNumber, Select, Button } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import type { AutoScoreAction } from './ruleBuilderUtils'

interface ActionComponentProps {
  actions: AutoScoreAction[]
  onAdd: () => void
  onRemove: (index: number) => void
  onChange: (index: number, field: keyof AutoScoreAction, value: any) => void
}

const ACTION_DEFINITIONS = [
  { eventName: 'add_score', labelKey: 'autoScore.actionAddScore' },
  { eventName: 'add_tag', labelKey: 'autoScore.actionAddTag' }
]

export const ActionComponent: React.FC<ActionComponentProps> = ({
  actions,
  onAdd,
  onRemove,
  onChange
}) => {
  const { t } = useTranslation()

  const handleActionChange = (index: number, field: keyof AutoScoreAction, value: any) => {
    onChange(index, field, value)
  }

  return (
    <div>
      <Space orientation="vertical" style={{ width: '100%' }}>
        {actions.map((action, index) => (
          <div
            key={index}
            style={{
              padding: '12px',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              backgroundColor: 'var(--ss-card-bg)'
            }}
          >
            <Space style={{ width: '100%' }} wrap>
              <Select
                value={action.event}
                onChange={(value) => handleActionChange(index, 'event', value)}
                style={{ width: 150 }}
                options={ACTION_DEFINITIONS.map((d) => ({
                  label: t(d.labelKey),
                  value: d.eventName
                }))}
              />

              {action.event === 'add_score' && (
                <InputNumber
                  value={action.value ? parseInt(action.value) : 0}
                  onChange={(value) => handleActionChange(index, 'value', String(value || 0))}
                  placeholder={t('autoScore.scoreLabel')}
                  min={-100}
                  max={100}
                  style={{ width: 120 }}
                />
              )}

              {action.event === 'add_tag' && (
                <Input
                  value={action.value}
                  onChange={(e) => handleActionChange(index, 'value', e.target.value)}
                  placeholder={t('autoScore.tagNameLabel')}
                  style={{ width: 200 }}
                />
              )}

              <Input
                value={action.reason}
                onChange={(e) => handleActionChange(index, 'reason', e.target.value)}
                placeholder={t('autoScore.operationNoteLabel')}
                style={{ flex: 1, minWidth: 200 }}
              />

              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onRemove(index)}
              />
            </Space>
          </div>
        ))}

        <Button type="dashed" icon={<PlusOutlined />} onClick={onAdd} block>
          {t('autoScore.addOperation')}
        </Button>
      </Space>
    </div>
  )
}

export default ActionComponent
