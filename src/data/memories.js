import { catalog } from './catalog'
import { photos } from '../lib/photos'
export const photoPath = (name) =>
  !name ? '' : /^(\/|https:\/\/)/.test(name) ? name : '/images/fan-photos/' + name
export const memories = catalog.works.map((w) => {
  const roles = catalog.work_roles.filter((r) => r.work_id === w.id)
  return {
    id: w.id,
    era: w.id,
    title: w.title,
    year: w.year_label,
    label: w.era_label,
    roles: roles.map((r) => r.role_name).join(' & '),
    image: w.image,
    text: w.description,
    summary: w.description,
    people: roles.map((r) => r.artist_id),
    date: null,
    type: 'collection',
    images: photos.filter((p) => p.src === w.image),
    source: w.source_url,
    verified: false,
    tags: [w.kind, 'Editorial collection'],
  }
})
export const findMemory = (id) => memories.find((m) => m.id === id)
export const memoriesForPerson = (person) =>
  memories.filter((m) => person === 'duo' || m.people.includes(person))
export const memoryForPhoto = (file) => memories.find((m) => m.images.some((p) => p.file === file))
