import Button, { type ButtonProps } from './Button';

export default function DangerButton(props: ButtonProps) {
    return <Button variant="danger" {...props} />;
}
