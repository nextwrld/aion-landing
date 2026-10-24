import { Dumbbell, Flame, HeartPulse, Trophy, Landmark, Building2, type LucideIcon } from 'lucide-react'
import type { SegmentSlug } from '../../site/routes'

export const SEGMENT_ICONS: Record<SegmentSlug, LucideIcon> = {
  gimnasios: Dumbbell,
  'boxes-funcional': Flame,
  estudios: HeartPulse,
  'centros-deportivos': Trophy,
  'instituciones-deportivas': Landmark,
  multisede: Building2,
}
