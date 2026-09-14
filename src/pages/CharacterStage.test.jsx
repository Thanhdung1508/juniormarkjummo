import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import CharacterStage from './CharacterStage'

it('chọn người, Discover mở đúng modal, đổi tab không đổi người, đóng trả lại màn chọn', async () => {
  const user = userEvent.setup()
  render(<CharacterStage />)
  await user.click(screen.getByRole('button', { name: 'Chọn Junior Panachai', exact: true }))
  await user.click(screen.getByRole('button', { name: 'Discover Junior Panachai' }))
  const modal = screen.getByRole('dialog', { name: 'Celestial File • Junior Panachai' })
  expect(modal).toBeInTheDocument()
  await user.click(within(modal).getByRole('tab', { name: 'Filmography' }))
  expect(within(modal).getByText('Jinta')).toBeInTheDocument()
  await user.keyboard('{ArrowRight}')
  expect(within(modal).getByRole('tab', { name: 'Discography' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  expect(within(modal).getByText('Discography & Audio Archive')).toBeInTheDocument()
  await user.click(within(modal).getByRole('button', { name: 'Đóng', exact: true }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Chọn Junior Panachai', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  expect(screen.getByRole('button', { name: 'Discover Junior Panachai' })).toHaveFocus()
})
