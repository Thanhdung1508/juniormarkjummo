import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { getLanguage, setLanguage, t, useLanguage, localize } from './language'
import LanguageSelect from '../components/LanguageSelect'

afterEach(() => { vi.restoreAllMocks(); setLanguage('vi'); localStorage.removeItem('juniormark-language') })

it('starts in Vietnamese and preserves original proper names and fan text', () => {
  expect(getLanguage()).toBe('vi')
  expect(t('Trang chủ', 'Home')).toBe('Trang chủ')
  expect(localize('Junior Panachai')).toBe('Junior Panachai')
  expect(localize('Ghi chú riêng của mình')).toBe('Ghi chú riêng của mình')
})

it('switches a mounted screen without losing its form and remembers the choice', async () => {
  function Page() { const { t } = useLanguage(); return <><LanguageSelect /><h1>{t('Trang chủ', 'Home')}</h1><input aria-label="draft" defaultValue="" /></> }
  render(<Page />)
  const user = userEvent.setup()
  await user.type(screen.getByRole('textbox'), 'Bản nháp')
  await user.selectOptions(screen.getByRole('combobox', { name: 'Ngôn ngữ' }), 'en')
  expect(screen.getByRole('heading')).toHaveTextContent('Home')
  expect(screen.getByRole('textbox')).toHaveValue('Bản nháp')
  expect(localStorage.getItem('juniormark-language')).toBe('en')
  expect(document.documentElement.lang).toBe('en')
  await user.selectOptions(screen.getByRole('combobox', { name: 'Language' }), 'vi')
  expect(screen.getByRole('heading')).toHaveTextContent('Trang chủ')
})

it('continues working when storage is blocked and rejects unsupported languages', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
  act(() => setLanguage('en'))
  expect(t('Lưu', 'Save')).toBe('Save')
  act(() => setLanguage('xx'))
  expect(getLanguage()).toBe('en')
})
