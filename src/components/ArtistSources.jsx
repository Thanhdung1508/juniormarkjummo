import { catalog } from '../data/catalog'
import { t } from '../i18n/language'

// Đọc liên kết đã biên tập từ database; không suy đoán tài khoản từ tên nghệ sĩ.
export default function ArtistSources({ artist }) {
  const links = (catalog.artist_social_links || []).filter((link) => link.artist_id === artist.id)
  return <div className="profile-sources">
    {artist.source_url && <a href={artist.source_url} target="_blank" rel="noreferrer">{t('Nguồn GMMTV', 'GMMTV source')} ↗</a>}
    {links.filter((link) => /^https:\/\//.test(link.url)).map((link) => <a key={link.platform} href={link.url} target="_blank" rel="noreferrer">{{ instagram: 'Instagram', twitter: 'X', tiktok: 'TikTok', youtube: 'YouTube', facebook: 'Facebook', website: t('Trang chính thức', 'Official website') }[link.platform] || link.platform} ↗</a>)}
  </div>
}
