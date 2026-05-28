interface ErrorBoxProps {
  message?: string;
}

export function ErrorBox({ message = 'Could not load data.' }: ErrorBoxProps) {
  return (
    <p className="text-sm text-ink-500 dark:text-ink-400 py-4 font-sans">{message}</p>
  );
}
