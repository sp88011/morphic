import Link from 'next/link'
import HistoryContainer from './history-container'
import { ModeToggle } from './mode-toggle'
import { Button } from './ui/button'

export default function Header({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <header className="w-full p-2 flex justify-end items-center z-10 backdrop-blur lg:backdrop-blur-none bg-background/80 lg:bg-transparent">
      <div className="flex gap-0.5">
        {!isLoggedIn && (
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
        )}

        <ModeToggle />
        <HistoryContainer />
      </div>
    </header>
  )
}
