import type { ReactNode } from 'react'
import { Search, Check, X, Building2, Receipt, BarChart3, IdCard, CreditCard, Users } from 'lucide-react'
import { useSite } from '../../i18n/useContent'

export type MockKind = 'search' | 'memberships' | 'billing' | 'access' | 'cash' | 'reports' | 'branches'

// Illustrative UI previews drawn with HTML/SVG, in the same style as the home dashboard mockup.

function Frame({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-dashboard overflow-hidden w-full max-w-[440px] mx-auto" aria-hidden="true">
      <div className="px-5 py-3.5 border-b border-border-custom flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg gradient-cta flex items-center justify-center text-white">{icon}</div>
          <span className="font-sora font-semibold text-sm text-deep-blue">{title}</span>
        </div>
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-border-custom" />
          <span className="w-2 h-2 rounded-full bg-border-custom" />
          <span className="w-2 h-2 rounded-full bg-wellness" />
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

type Status = 'ok' | 'grace' | 'expired'

function StatusPill({ status }: { status: Status }) {
  const m = useSite().mock
  const map = {
    ok: { label: m.upToDate, cls: 'bg-wellness-light text-wellness-dark' },
    grace: { label: m.grace, cls: 'bg-amber-50 text-amber-700' },
    expired: { label: m.expired, cls: 'bg-red-50 text-red-600' },
  }[status]
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-inter font-semibold whitespace-nowrap ${map.cls}`}>{map.label}</span>
}

function Avatar({ name }: { name: string }) {
  const letters = name.split(' ').map((p) => p[0]).join('').slice(0, 2)
  return <span className="w-8 h-8 rounded-full bg-light-gray text-deep-blue font-sora font-semibold text-[11px] flex items-center justify-center flex-shrink-0">{letters}</span>
}

const MEMBERS: { name: string; id: string; status: Status; days: number }[] = [
  { name: 'Ana Morales', id: 'V-18.456.789', status: 'ok', days: 21 },
  { name: 'Luis Pérez', id: 'V-20.113.402', status: 'grace', days: 2 },
  { name: 'Sofía Díaz', id: 'V-16.987.230', status: 'expired', days: 0 },
  { name: 'Diego Rojas', id: 'V-24.551.018', status: 'ok', days: 14 },
]

function SearchMock() {
  const m = useSite().mock
  const member = MEMBERS[0]
  return (
    <Frame title={m.member} icon={<Search className="w-3.5 h-3.5" />}>
      <div className="flex items-center gap-2 border-[1.5px] border-wellness rounded-[10px] px-3 py-2.5 ring-[3px] ring-wellness/10">
        <Search className="w-4 h-4 text-text-light" />
        <span className="font-inter text-sm text-text-primary">18.456</span>
        <span className="w-px h-4 bg-deep-blue animate-pulse" />
        <span className="ml-auto font-inter text-[11px] text-text-light">{m.searchPlaceholder}</span>
      </div>
      <div className="mt-4 rounded-lg border border-border-custom p-4">
        <div className="flex items-center gap-3">
          <Avatar name={member.name} />
          <div className="min-w-0">
            <div className="font-sora font-semibold text-sm text-deep-blue">{member.name}</div>
            <div className="font-inter text-xs text-text-secondary">{member.id}</div>
          </div>
          <span className="ml-auto"><StatusPill status={member.status} /></span>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-light-gray rounded-lg p-2.5">
            <div className="font-inter text-[10px] text-text-light">{m.plan}</div>
            <div className="font-sora font-semibold text-xs text-deep-blue">{m.monthly}</div>
          </div>
          <div className="bg-light-gray rounded-lg p-2.5">
            <div className="font-inter text-[10px] text-text-light">{m.expiresIn}</div>
            <div className="font-sora font-semibold text-xs text-deep-blue">{member.days} {m.days}</div>
          </div>
        </div>
      </div>
    </Frame>
  )
}

function MembershipsMock() {
  const m = useSite().mock
  return (
    <Frame title={m.membershipsTitle} icon={<Users className="w-3.5 h-3.5" />}>
      <div className="flex gap-2 mb-4">
        {(['ok', 'grace', 'expired'] as Status[]).map((st, i) => (
          <div key={st} className="flex-1 bg-light-gray rounded-lg p-2.5 text-center">
            <div className={`font-sora font-bold text-lg ${['text-wellness', 'text-amber-600', 'text-red-500'][i]}`}>{['186', '12', '9'][i]}</div>
            <StatusPill status={st} />
          </div>
        ))}
      </div>
      <ul className="flex flex-col divide-y divide-border-custom">
        {MEMBERS.map((mem) => (
          <li key={mem.id} className="flex items-center gap-3 py-2.5">
            <Avatar name={mem.name} />
            <div className="min-w-0 flex-1">
              <div className="font-inter text-sm font-medium text-text-primary truncate">{mem.name}</div>
              <div className="font-inter text-[11px] text-text-light">{mem.status === 'expired' ? m.expired : `${m.expiresIn} ${mem.days} ${m.days}`}</div>
            </div>
            <StatusPill status={mem.status} />
          </li>
        ))}
      </ul>
    </Frame>
  )
}

function BillingMock() {
  const m = useSite().mock
  return (
    <Frame title={m.paymentTitle} icon={<CreditCard className="w-3.5 h-3.5" />}>
      <div className="flex items-center gap-3 pb-4 border-b border-border-custom">
        <Avatar name={MEMBERS[1].name} />
        <div>
          <div className="font-sora font-semibold text-sm text-deep-blue">{MEMBERS[1].name}</div>
          <div className="font-inter text-xs text-text-secondary">{m.plan}: {m.monthly}</div>
        </div>
      </div>
      <div className="mt-4">
        <div className="font-inter text-[11px] text-text-light mb-1">{m.amount}</div>
        <div className="font-sora font-bold text-2xl text-deep-blue">$25,00</div>
      </div>
      <div className="mt-4">
        <div className="font-inter text-[11px] text-text-light mb-2">{m.method}</div>
        <div className="flex flex-wrap gap-2">
          {[m.cash, m.transfer, m.mobilePay].map((label, i) => (
            <span key={label} className={`px-3 py-1.5 rounded-lg font-inter text-xs font-medium border ${i === 2 ? 'border-wellness bg-wellness-light text-wellness-dark' : 'border-border-custom text-text-secondary'}`}>
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-5 gradient-cta rounded-[10px] py-2.5 flex items-center justify-center gap-2 text-white font-inter text-sm font-semibold">
        <Check className="w-4 h-4" strokeWidth={3} />
        {m.paymentDone}
      </div>
    </Frame>
  )
}

function AccessMock() {
  const m = useSite().mock
  return (
    <Frame title={m.accessTitle} icon={<IdCard className="w-3.5 h-3.5" />}>
      <div className="font-inter text-[11px] text-text-light mb-1.5">{m.clientId}</div>
      <div className="flex items-center gap-2 border-[1.5px] border-border-custom rounded-[10px] px-3 py-2.5">
        <IdCard className="w-4 h-4 text-text-light" />
        <span className="font-sora font-semibold text-sm tracking-wider text-deep-blue">18456789</span>
      </div>
      <div className="mt-4 rounded-xl bg-wellness-light border border-wellness/30 p-4 flex items-center gap-3">
        <span className="w-11 h-11 rounded-full bg-wellness flex items-center justify-center text-white"><Check className="w-6 h-6" strokeWidth={3} /></span>
        <div>
          <div className="font-sora font-semibold text-base text-wellness-dark">{m.accessAllowed}</div>
          <div className="font-inter text-xs text-text-secondary">{MEMBERS[0].name} · {m.checkinSaved}</div>
        </div>
      </div>
      <div className="mt-3 rounded-xl bg-red-50 border border-red-100 p-3 flex items-center gap-3 opacity-80">
        <span className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white"><X className="w-4 h-4" strokeWidth={3} /></span>
        <div>
          <div className="font-sora font-semibold text-sm text-red-600">{m.accessDenied}</div>
          <div className="font-inter text-[11px] text-text-secondary">{MEMBERS[2].name}</div>
        </div>
      </div>
    </Frame>
  )
}

function CashMock() {
  const m = useSite().mock
  const rows = [
    { label: m.cash, value: '$410,00' },
    { label: m.transfer, value: '$575,00' },
    { label: m.mobilePay, value: '$290,00' },
  ]
  return (
    <Frame title={m.cashTitle} icon={<Receipt className="w-3.5 h-3.5" />}>
      <ul className="flex flex-col gap-2.5">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center justify-between bg-light-gray rounded-lg px-3 py-2.5">
            <span className="font-inter text-sm text-text-primary">{r.label}</span>
            <span className="font-sora font-semibold text-sm text-deep-blue">{r.value}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-4 border-t border-border-custom flex items-center justify-between">
        <span className="font-inter text-sm text-text-secondary">{m.total}</span>
        <span className="font-sora font-bold text-xl text-deep-blue">$1.275,00</span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="font-inter text-sm text-text-secondary">{m.difference}</span>
        <span className="inline-flex items-center gap-1 font-sora font-semibold text-sm text-wellness"><Check className="w-4 h-4" strokeWidth={3} />$0,00</span>
      </div>
    </Frame>
  )
}

function ReportsMock() {
  const m = useSite().mock
  const bars = [52, 61, 58, 70, 76, 88]
  return (
    <Frame title={m.reportsTitle} icon={<BarChart3 className="w-3.5 h-3.5" />}>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-light-gray rounded-lg p-3">
          <div className="font-inter text-[10px] text-text-light">{m.activeMembers}</div>
          <div className="font-sora font-bold text-lg text-deep-blue">1.248</div>
        </div>
        <div className="bg-light-gray rounded-lg p-3">
          <div className="font-inter text-[10px] text-text-light">{m.checkins}</div>
          <div className="font-sora font-bold text-lg text-wellness">3.902</div>
        </div>
      </div>
      <div className="flex items-end gap-3 h-[120px]">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <div className={`w-full rounded-t-md ${i === bars.length - 1 ? 'gradient-cta' : 'bg-wellness/25'}`} style={{ height: `${h}%` }} />
            <span className="font-inter text-[10px] text-text-light">{m.months[i]}</span>
          </div>
        ))}
      </div>
    </Frame>
  )
}

function BranchesMock() {
  const m = useSite().mock
  const values = [
    { revenue: '$8.420', checkins: '1.512', share: 46 },
    { revenue: '$5.910', checkins: '1.104', share: 32 },
    { revenue: '$4.030', checkins: '786', share: 22 },
  ]
  return (
    <Frame title={m.branchesTitle} icon={<Building2 className="w-3.5 h-3.5" />}>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-wellness-light text-wellness-dark font-inter text-xs font-semibold mb-4">
        <Building2 className="w-3.5 h-3.5" />
        {m.allBranches}
      </div>
      <ul className="flex flex-col gap-3">
        {m.branchNames.map((name, i) => (
          <li key={name} className="rounded-lg border border-border-custom p-3">
            <div className="flex items-center justify-between">
              <span className="font-sora font-semibold text-sm text-deep-blue">{name}</span>
              <span className="font-sora font-semibold text-sm text-deep-blue">{values[i].revenue}</span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex-1 h-1.5 rounded-full bg-light-gray overflow-hidden">
                <div className="h-full gradient-cta rounded-full" style={{ width: `${values[i].share * 2}%` }} />
              </div>
              <span className="font-inter text-[11px] text-text-light whitespace-nowrap">{values[i].checkins} {m.checkins.toLowerCase()}</span>
            </div>
          </li>
        ))}
      </ul>
    </Frame>
  )
}

const MOCKS: Record<MockKind, () => ReactNode> = {
  search: SearchMock,
  memberships: MembershipsMock,
  billing: BillingMock,
  access: AccessMock,
  cash: CashMock,
  reports: ReportsMock,
  branches: BranchesMock,
}

export default function Mockup({ kind }: { kind: MockKind }) {
  const Component = MOCKS[kind]
  return <Component />
}
