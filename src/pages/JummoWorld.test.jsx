import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import JummoWorld from './JummoWorld'

it('shows Jummo rain when rain button is activated', async () => {
    const user = userEvent.setup()

    render(<JummoWorld showInfo={() => {}} openPhoto={() => {}} />)

    await user.click(screen.getByRole('button', { name: 'Kích hoạt Mưa Jummo' }))

    expect(document.querySelectorAll('.jummo-rain img')).toHaveLength(20)
})