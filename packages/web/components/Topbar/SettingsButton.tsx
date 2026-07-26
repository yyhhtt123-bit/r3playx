import Icon from '@/web/components/Icon'
import { cx } from '@emotion/css'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const SettingsButton = ({ className }: { className?: string }) => {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate('/settings')}
      className={cx(
        'app-region-no-drag glass flex h-12 w-12 items-center justify-center rounded-full text-neutral-500 transition duration-400 hover:bg-white/30 dark:text-neutral-300 dark:hover:bg-white/10',
        className
      )}
    >
      <Icon name='settings' className='h-5 w-5 ' />
    </button>
  )
}

export default SettingsButton
