import { FunnelIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import clsx from 'clsx';

interface FilterButtonProps {
  label: string;
  children: React.ReactNode;
  className?: string;
  buttonClassName?: string;
  showFilterIcon?: boolean;
}

export default function FilterButton({
  label,
  children,
  className = '',
  buttonClassName = '',
  showFilterIcon = true,
}: FilterButtonProps) {
  return (
    <Menu as="div" className={clsx('relative inline-block text-left', className)}>
      <div>
        <Menu.Button 
          className={clsx(
            'admin-btn admin-btn-secondary flex items-center px-2 py-1.5 text-xs rounded',
            buttonClassName
          )}
        >
          {showFilterIcon && (
            <FunnelIcon className="h-4 w-4 mr-1" aria-hidden="true" />
          )}
          <span className="max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">
            {label}
          </span>
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
          <div className="px-1 py-1 max-h-[calc(100vh-200px)] overflow-y-auto">
            {children}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}