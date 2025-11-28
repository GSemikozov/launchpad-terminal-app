import classNames from 'classnames';
import type { ReactNode, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

export function Table({ className, children, ...props }: TableProps) {
  return (
    <div className='overflow-x-auto rounded-2xl border border-dark-border'>
      <table className={classNames('w-full text-left text-sm', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export interface TableHeaderProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export function TableHeader({ className, children, ...props }: TableHeaderProps) {
  return (
    <th
      className={classNames(
        'border-b border-dark-border bg-dark-card px-4 py-3 font-semibold text-gray-300',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export function TableCell({ className, children, ...props }: TableCellProps) {
  return (
    <td
      className={classNames('border-b border-dark-border px-4 py-3 text-white', className)}
      {...props}
    >
      {children}
    </td>
  );
}

export interface TableRowProps extends TableHTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  hover?: boolean;
}

export function TableRow({ className, children, hover = true, ...props }: TableRowProps) {
  return (
    <tr
      className={classNames(
        'transition-colors',
        hover && 'hover:bg-dark-card/50 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}
