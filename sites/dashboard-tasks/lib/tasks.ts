export type TaskStatus = 'Active' | 'Done' | 'Blocked'
export type TaskPriority = 'Low' | 'Med' | 'High'

export interface Task {
  id: number
  title: string
  status: TaskStatus
  priority: TaskPriority
  created: string // ISO-ish date string — note: intentionally mixed padding (e.g. '2025-1-5')
  owner: string
}

// 35 hand-crafted rows. Status/priority/owner distributions are intentionally
// uneven so filtering & sorting produce non-trivial result counts.
//
// Notes for the planted bugs:
// - DASH-001: `created` mixes zero-padded ('2025-01-10') and non-padded
//   ('2025-1-5') months/days. String sort vs Date sort then disagree.
// - DASH-004: "Apple migration" (capital A) so case-sensitive substring fails
//   on lowercase 'apple'.
export const TASKS: Task[] = [
  { id: 1,  title: 'Apple migration',                   status: 'Active',  priority: 'High', created: '2025-01-10', owner: 'Alice'   },
  { id: 2,  title: 'Refactor billing module',           status: 'Done',    priority: 'Med',  created: '2024-11-22', owner: 'Bob'     },
  { id: 3,  title: 'Investigate flaky login test',      status: 'Blocked', priority: 'High', created: '2025-1-5',   owner: 'Carol'   },
  { id: 4,  title: 'Write onboarding docs',             status: 'Active',  priority: 'Low',  created: '2026-02-14', owner: 'Dmitry'  },
  { id: 5,  title: 'Upgrade Postgres to 16',            status: 'Done',    priority: 'High', created: '2024-09-03', owner: 'Eve'     },
  { id: 6,  title: 'Build invoice PDF exporter',        status: 'Active',  priority: 'Med',  created: '2025-03-12', owner: 'Frank'   },
  { id: 7,  title: 'Fix mobile nav overflow',           status: 'Done',    priority: 'Low',  created: '2025-04-08', owner: 'Alice'   },
  { id: 8,  title: 'Audit third-party scripts',         status: 'Blocked', priority: 'Med',  created: '2024-12-19', owner: 'Bob'     },
  { id: 9,  title: 'Rotate API keys',                   status: 'Done',    priority: 'High', created: '2025-2-9',   owner: 'Carol'   },
  { id: 10, title: 'Design dark mode tokens',           status: 'Active',  priority: 'Low',  created: '2026-01-21', owner: 'Dmitry'  },
  { id: 11, title: 'Implement CSV import',              status: 'Active',  priority: 'Med',  created: '2025-06-30', owner: 'Eve'     },
  { id: 12, title: 'Add 2FA to admin panel',            status: 'Done',    priority: 'High', created: '2024-10-11', owner: 'Frank'   },
  { id: 13, title: 'Update privacy policy page',        status: 'Active',  priority: 'Low',  created: '2026-03-02', owner: 'Alice'   },
  { id: 14, title: 'Migrate logs to Loki',              status: 'Blocked', priority: 'Med',  created: '2025-07-18', owner: 'Bob'     },
  { id: 15, title: 'Re-encode product thumbnails',      status: 'Done',    priority: 'Low',  created: '2025-3-7',   owner: 'Carol'   },
  { id: 16, title: 'Set up nightly DB backups',         status: 'Active',  priority: 'High', created: '2024-08-25', owner: 'Dmitry'  },
  { id: 17, title: 'Polish empty-state illustrations',  status: 'Done',    priority: 'Low',  created: '2025-09-04', owner: 'Eve'     },
  { id: 18, title: 'Switch CI to self-hosted runners',  status: 'Blocked', priority: 'High', created: '2025-05-16', owner: 'Frank'   },
  { id: 19, title: 'Sunset legacy /v1 API',             status: 'Active',  priority: 'Med',  created: '2026-04-19', owner: 'Alice'   },
  { id: 20, title: 'Add Sentry release tagging',        status: 'Done',    priority: 'Med',  created: '2024-12-01', owner: 'Bob'     },
  { id: 21, title: 'Replace Moment.js with date-fns',   status: 'Active',  priority: 'Low',  created: '2025-08-22', owner: 'Carol'   },
  { id: 22, title: 'Negotiate CDN renewal',             status: 'Blocked', priority: 'Med',  created: '2024-11-05', owner: 'Dmitry'  },
  { id: 23, title: 'Index slow analytics queries',      status: 'Done',    priority: 'High', created: '2025-4-2',   owner: 'Eve'     },
  { id: 24, title: 'Ship referral program v1',          status: 'Active',  priority: 'High', created: '2026-05-07', owner: 'Frank'   },
  { id: 25, title: 'Write postmortem for incident 412', status: 'Done',    priority: 'Med',  created: '2025-10-29', owner: 'Alice'   },
  { id: 26, title: 'Triage backlog of UX feedback',     status: 'Active',  priority: 'Low',  created: '2026-02-28', owner: 'Bob'     },
  { id: 27, title: 'Procure new staging hardware',      status: 'Blocked', priority: 'Med',  created: '2024-07-14', owner: 'Carol'   },
  { id: 28, title: 'Convert SCSS files to plain CSS',   status: 'Done',    priority: 'Low',  created: '2025-11-11', owner: 'Dmitry'  },
  { id: 29, title: 'Add accessibility audit to CI',     status: 'Active',  priority: 'Med',  created: '2026-01-08', owner: 'Eve'     },
  { id: 30, title: 'Tune autoscaling thresholds',       status: 'Done',    priority: 'High', created: '2025-12-20', owner: 'Frank'   },
  { id: 31, title: 'Draft Q3 OKRs',                     status: 'Active',  priority: 'Med',  created: '2025-06-06', owner: 'Alice'   },
  { id: 32, title: 'Move secrets to Vault',             status: 'Blocked', priority: 'High', created: '2024-09-17', owner: 'Bob'     },
  { id: 33, title: 'Profile checkout flow latency',     status: 'Done',    priority: 'Med',  created: '2025-5-3',   owner: 'Carol'   },
  { id: 34, title: 'Refresh marketing landing copy',    status: 'Active',  priority: 'Low',  created: '2026-04-30', owner: 'Dmitry'  },
  { id: 35, title: 'Decommission old monitoring stack', status: 'Done',    priority: 'Low',  created: '2025-08-13', owner: 'Eve'     },
]
