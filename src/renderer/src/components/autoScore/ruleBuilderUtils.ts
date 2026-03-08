import type { RuleGroupType, Field, Operator } from 'react-querybuilder'

export interface AutoScoreTrigger {
  event: string
  value?: string
  relation?: 'AND' | 'OR'
}

export interface AutoScoreAction {
  event: string
  value?: string
  reason?: string
}

export interface AutoScoreRuleData {
  triggers: AutoScoreTrigger[]
  actions: AutoScoreAction[]
}

// i18n key definitions for triggers and actions
export const TRIGGER_TYPE_KEYS = {
  interval_time_passed: {
    labelKey: 'autoScore.triggerIntervalTime',
    descriptionKey: 'triggers.intervalTime.description'
  },
  student_has_tag: {
    labelKey: 'autoScore.triggerStudentTag',
    descriptionKey: 'triggers.studentTag.description'
  }
}

export const ACTION_TYPE_KEYS = {
  add_score: {
    labelKey: 'autoScore.actionAddScore',
    descriptionKey: 'actions.addScore.description'
  },
  add_tag: {
    labelKey: 'autoScore.actionAddTag',
    descriptionKey: 'actions.addTag.description'
  }
}

// Function to get fields with i18n support
export const getFields = (t: (key: string) => string): Field[] => [
  {
    name: 'interval_time_passed',
    label: t('autoScore.triggerIntervalTime'),
    placeholder: t('autoScore.intervalMinutesPlaceholder')
  },
  {
    name: 'student_has_tag',
    label: t('autoScore.triggerStudentTag'),
    placeholder: t('autoScore.tagNamesPlaceholder')
  }
]

export const operators: Operator[] = [
  { name: '=', label: '=' },
  { name: 'contains', label: 'contains' }
]

export const defaultQuery: RuleGroupType = {
  combinator: 'and',
  rules: [{ field: 'interval_time_passed', operator: '=', value: '1440' }]
}

export function queryToAutoScoreRule(query: RuleGroupType): AutoScoreRuleData {
  const triggers: AutoScoreTrigger[] = []

  const processRuleGroup = (group: RuleGroupType, relation: 'AND' | 'OR' = 'AND') => {
    group.rules.forEach((rule, index) => {
      if ('rules' in rule) {
        processRuleGroup(rule, group.combinator === 'and' ? 'AND' : 'OR')
      } else {
        const trigger: AutoScoreTrigger = {
          event: rule.field,
          value: rule.value as string
        }

        if (index > 0) {
          trigger.relation = relation
        }

        triggers.push(trigger)
      }
    })
  }

  processRuleGroup(query)

  return {
    triggers,
    actions: []
  }
}

export function autoScoreRuleToQuery(ruleData: AutoScoreRuleData): RuleGroupType {
  const rules: any[] = []
  let currentCombinator: 'and' | 'or' = 'and'

  ruleData.triggers.forEach((trigger, index) => {
    if (index === 0) {
      currentCombinator = 'and'
    } else if (trigger.relation === 'OR') {
      currentCombinator = 'or'
    }

    rules.push({
      field: trigger.event,
      operator: '=',
      value: trigger.value || ''
    })
  })

  return {
    combinator: currentCombinator,
    rules: rules.length > 0 ? rules : defaultQuery.rules
  }
}
